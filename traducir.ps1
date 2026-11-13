# ============================================================
# traducir.ps1
# Escanea index.html, toma los textos con data-lang (en espanol),
# traduce al ingles los que cambiaron o son nuevos, y actualiza
# el objeto `translations` de script.js automaticamente.
#
# Uso: doble clic o:  powershell -File traducir.ps1
# Requiere internet. Traduccion gratis (API publica de Google).
# ============================================================

$ErrorActionPreference = 'Stop'

$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$htmlPath = Join-Path $dir 'index.html'
$jsPath   = Join-Path $dir 'script.js'

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$html = [System.IO.File]::ReadAllText($htmlPath, [System.Text.Encoding]::UTF8)
$js   = [System.IO.File]::ReadAllText($jsPath,   [System.Text.Encoding]::UTF8)

# ---------- 1) Extraer entradas actuales de `translations` en script.js ----------
$inicio = $js.IndexOf('const translations = {')
if ($inicio -lt 0) { Write-Host 'ERROR: no encontre "const translations" en script.js' -ForegroundColor Red; exit 1 }

$fin = $js.IndexOf('};', $inicio)
if ($fin -lt 0) { Write-Host 'ERROR: no encontre el cierre del objeto translations' -ForegroundColor Red; exit 1 }

$cuerpoActual = $js.Substring($inicio, $fin - $inicio + 2)  # incluye "};"

$antes = $js.Substring(0, $inicio)
$despues = $js.Substring($fin + 2)

# Parsear entradas existentes: 'key': { es: '...', en: '...' }
$regexEntrada = [regex]"(?s)'([^']+)':\s*\{(.*?)\},?"
$regexCampo = [regex]"(?s)(?:es|en):\s*'((?:[^'\\]|\\.)*)'"

function Desescapar([string]$s) {
    if ($null -eq $s) { return '' }
    $apost = [char]39
    $bslash = [char]92
    # reemplazar \' por '  (en ese orden, primero el backslash+apostrofe)
    $s = $s.Replace("$bslash$apost", "$apost")
    # reemplazar \\ por \
    $s = $s.Replace("$bslash$bslash", "$bslash")
    return $s
}

$existentes = @{}   # key -> @{ es=...; en=... }
$ordenKeys = @()

foreach ($m in $regexEntrada.Matches($cuerpoActual)) {
    $key = $m.Groups[1].Value
    $bloque = $m.Groups[2].Value
    $campos = $regexCampo.Matches($bloque)
    $es = ''; $en = ''
    foreach ($c in $campos) {
        $val = Desescapar $c.Groups[1].Value
        if ($c.Value -match '^es:') { $es = $val } else { $en = $val }
    }
    $existentes[$key] = @{ es = $es; en = $en }
    $ordenKeys += $key
}

# ---------- 2) Extraer textos espanol de index.html (elementos con data-lang) ----------
# Captura el elemento completo y su contenido interno.
$regexHtml = [regex]'<([a-zA-Z][a-zA-Z0-9]*)[^>]*data-lang="([^"]+)"[^>]*>([\s\S]*?)</\1>'

function Normalizar([string]$s) {
    if ($null -eq $s) { return '' }
    $s = $s -replace '\s+', ' '   # colapsar espacios, saltos de linea y tabs
    return $s.Trim()
}

$delHtml = @{}   # key -> texto espanol (innerHTML) normalizado

foreach ($m in $regexHtml.Matches($html)) {
    $key = $m.Groups[2].Value
    $inner = Normalizar $m.Groups[3].Value
    if (-not $delHtml.ContainsKey($key)) {
        $delHtml[$key] = $inner
    }
}

# ---------- 3) Traducir lo que cambio o es nuevo ----------
function Escapar([string]$s) {
    if ($null -eq $s) { return "''" }
    $apost = [char]39
    $bslash = [char]92
    # escapar backslashes primero y despues apostrofes
    $s = $s.Replace("$bslash", "$bslash$bslash")
    $s = $s.Replace("$apost", "$bslash$apost")
    return "'" + $s + "'"
}

function Traducir([string]$texto) {
    $q = [System.Uri]::EscapeDataString($texto)
    $url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=en&dt=t&q=$q"
    $r = Invoke-RestMethod -Uri $url -TimeoutSec 30
    # Google devuelve la traduccion en varios segmentos; hay que unirlos todos
    $completa = ($r[0] | ForEach-Object { [string]$_[0] }) -join ''
    return $completa
}

$traducidas = 0
$nuevas = 0

foreach ($key in $delHtml.Keys) {
    $esHtml = $delHtml[$key]

    if ($existentes.ContainsKey($key)) {
        $esActual = Normalizar ($existentes[$key].es)
        if ($esActual -eq $esHtml) {
            continue   # no cambio el espanol, mantener el ingles
        }
        # El espanol cambio: actualizar es y retraducir en
        Write-Host "Traduciendo: $key (cambio en espanol)" -ForegroundColor Yellow
        $nuevoEn = Traducir $esHtml
        $existentes[$key].es = $esHtml
        $existentes[$key].en = $nuevoEn
        $traducidas++
        Start-Sleep -Milliseconds 400   # pausa para no saturar la API
    }
    else {
        # Nueva clave: agregar
        Write-Host "Traduciendo: $key (nueva)" -ForegroundColor Yellow
        $nuevoEn = Traducir $esHtml
        $existentes[$key] = @{ es = $esHtml; en = $nuevoEn }
        $ordenKeys += $key
        $nuevas++
        Start-Sleep -Milliseconds 400
    }
}

# ---------- 4) Reconstruir el objeto translations ----------
$lineas = New-Object System.Collections.Generic.List[string]
$lineas.Add('const translations = {')
foreach ($key in $ordenKeys) {
    $e = $existentes[$key]
    $lineas.Add("    '$key': { es: $(Escapar $e.es), en: $(Escapar $e.en) },")
}
$lineas.Add('};')

$nuevoBloque = $lineas -join "`n"

$jsNuevo = $antes + $nuevoBloque + $despues

# Backup por seguridad
$backup = "$jsPath.bak"
[System.IO.File]::WriteAllText($backup, $js, $utf8NoBom)

[System.IO.File]::WriteAllText($jsPath, $jsNuevo, $utf8NoBom)

Write-Host ''
Write-Host "Listo. $traducidas retraducidas, $nuevas nuevas. Backup en script.js.bak" -ForegroundColor Green
