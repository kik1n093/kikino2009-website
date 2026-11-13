// ============================================================
// SISTEMA DE PESTAÑAS
// ============================================================
//
// ¿Qué hace este archivo?
// Cuando hacés click en un botón de la sidebar (como "[poemas]"),
// este código:
//   1. Le saca la clase "activo" a todos los botones y paneles
//   2. Le pone la clase "activo" solo al botón clickeado y al panel correspondiente
//
// La clase "activo" en el CSS es la que hace que algo se vea o se oculte.
// ============================================================

// Splash gatefold — ocultar al entrar
const splashGate = document.getElementById('splash-gate');
const splashBtn = document.getElementById('splash-enter');
if (splashGate && splashBtn) {
    // si ya entró en esta sesión, no mostrarlo
    if (sessionStorage.getItem('splash-visto')) {
        splashGate.remove();
    } else {
        splashBtn.addEventListener('click', function() {
            splashGate.classList.add('oculto');
            sessionStorage.setItem('splash-visto', '1');
            setTimeout(function() { splashGate.remove(); }, 800);
        });
        splashGate.addEventListener('click', function(e) {
            if (e.target === splashGate) splashBtn.click();
        });
    }
}

// Agarramos todos los botones de pestaña que existen en la página
const botones = document.querySelectorAll('.tab-btn');
let tabTimer = null;
let tabActual = 'inicio';
let tabPanelTransicion = null;

// Le agregamos un "escuchador de evento" a cada botón
// Esto significa: "cuando hagan click en este botón, ejecutá esta función"
botones.forEach(function(boton) {
    boton.addEventListener('click', function() {

        const tabObjetivo = boton.getAttribute('data-tab');
        if (!tabObjetivo) return;
        if (tabObjetivo === tabActual) return;

        // Si hay una transición en curso, la cancelamos para que no se apilen
        if (tabTimer) {
            clearTimeout(tabTimer);
            tabTimer = null;
            if (tabPanelTransicion && tabPanelTransicion.id !== 'tab-' + tabObjetivo) {
                tabPanelTransicion.style.opacity = '';
                tabPanelTransicion.style.display = '';
            }
            tabPanelTransicion = null;
        }
        tabActual = tabObjetivo;

        // --- Paso 1: desactivar botones ---
        botones.forEach(function(b) {
            b.classList.remove('activo');
        });
        boton.classList.add('activo');

        // --- Paso 2: fade out del panel actual ---
        const panelActual = document.querySelector('.tab-panel.activo');
        if (panelActual && panelActual !== document.getElementById('tab-' + tabObjetivo)) {
            panelActual.style.opacity = '0';
        }

        // --- Paso 3: fade in del panel nuevo ---
        const panelObjetivo = document.getElementById('tab-' + tabObjetivo);
        if (!panelObjetivo) return;

        // Forzar display:block primero para que la transición funcione
        panelObjetivo.style.display = 'block';
        panelObjetivo.style.opacity = '0';

        tabTimer = setTimeout(function() {
            if (panelActual && panelActual !== panelObjetivo) {
                panelActual.classList.remove('activo');
                panelActual.style.opacity = '';
                panelActual.style.display = '';
            }
            panelObjetivo.classList.add('activo');
            panelObjetivo.style.opacity = '';
            panelObjetivo.style.display = '';
            tabTimer = null;
            tabPanelTransicion = null;
        }, 360);
        tabPanelTransicion = panelObjetivo;

    });
});
// ============================================================
// EASTER EGG: Pickle Rick (aparece random, poca frecuencia)
// ============================================================
//
// Math.random() devuelve un número decimal entre 0 y 1.
// Si ese número es menor a 0.1, hay un 10% de probabilidad de que se cumpla.
// Cambiá el 0.1 si querés que aparezca más o menos seguido.

const probabilidad = 0.15; // 15% de las veces

if (Math.random() < probabilidad) {
    const easterEgg = document.getElementById('easter-egg');
    if (easterEgg) {
    easterEgg.classList.add('visible');
}
}
// ============================================================
// RELOJ DIGITAL EN VIVO
// ============================================================
function actualizarReloj() {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');
    const horaStr = `${horas}:${minutos}:${segundos}`;
    const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const fechaStr = `${dias[ahora.getDay()]}, ${ahora.getDate()} de ${meses[ahora.getMonth()]} de ${ahora.getFullYear()}`;
    const elHora = document.getElementById('reloj-hora');
    const elFecha = document.getElementById('reloj-fecha');
    if (elHora) elHora.textContent = horaStr;
    if (elFecha) elFecha.textContent = fechaStr;

    // Footer: año actual automático
    const elAnio = document.getElementById('footer-anio');
    if (elAnio) elAnio.textContent = ahora.getFullYear();
}
actualizarReloj();
setInterval(actualizarReloj, 1000);
// ============================================================
// GALERÍA - IMÁGENES, FILTROS Y LIGHTBOX
// ============================================================
const imagenesGaleria = [
    // ─── DIBUJOS ───
    { src: 'img/galeria/dibujos/dibujo1.jpg', categoria: 'dibujos', alt: 'Dibujo 1' },
    { src: 'img/galeria/dibujos/dibujo2.jpg', categoria: 'dibujos', alt: 'Dibujo 2' },
    { src: 'img/galeria/dibujos/dibujo3.jpg', categoria: 'dibujos', alt: 'Dibujo 3' },
    { src: 'img/galeria/dibujos/dibujo4.jpg', categoria: 'dibujos', alt: 'Dibujo 4' },
    // ─── FOTOS ───
    { src: 'img/galeria/fotos/foto1.jpg', categoria: 'fotos', alt: 'Foto 1' },
    { src: 'img/galeria/fotos/foto2.jpg', categoria: 'fotos', alt: 'Foto 2' },
    { src: 'img/galeria/fotos/foto3.jpg', categoria: 'fotos', alt: 'Foto 3' },
    { src: 'img/galeria/fotos/foto4.jpg', categoria: 'fotos', alt: 'Foto 4' },
    { src: 'img/galeria/fotos/foto5.jpg', categoria: 'fotos', alt: 'Foto 5' },

];

// Renderizar galería
const contenedorGaleria = document.getElementById('galeria-grid');

function renderizarGaleria(categoria) {
    contenedorGaleria.innerHTML = '';
    const filtradas = categoria === 'todo'
        ? imagenesGaleria
        : imagenesGaleria.filter(img => img.categoria === categoria);
    filtradas.forEach(img => {
        const div = document.createElement('div');
        div.className = 'item-galeria';
        div.setAttribute('data-categoria', img.categoria);
        div.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
        contenedorGaleria.appendChild(div);
    });
}

// Filtros
document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('activo'));
        this.classList.add('activo');
        renderizarGaleria(this.getAttribute('data-filtro'));
    });
});

// Lightbox
const lightboxHTML = `
    <div class="lightbox-overlay" id="lightbox">
        <span class="lightbox-cerrar" id="lightbox-cerrar">✕</span>
        <img src="" alt="" id="lightbox-img">
    </div>
`;
document.body.insertAdjacentHTML('beforeend', lightboxHTML);

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

document.addEventListener('click', function(e) {
    const img = e.target.closest('.item-galeria img');
    if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('visible');
    }
});

document.getElementById('lightbox-cerrar').addEventListener('click', function() {
    lightbox.classList.remove('visible');
});

lightbox.addEventListener('click', function(e) {
    if (e.target === this) lightbox.classList.remove('visible');
});

// Iniciar galería
renderizarGaleria('todo');


// ============================================================
// ============================================================

// IDIOMA (ES/EN)

// ============================================================
// ============================================================
const translations = {
    'splash-pre': { es: '¿entrar?', en: 'enter?' },
    'splash-poema': { es: 'En la metrópolis virtual,<br>donde casi todo es corporizado y controlado,<br>hice mi propio rincón,<br>donde todos entran sin permiso y sin pedir perdón.', en: 'In a world that makes steel scream<br>and silences pens that dare to write,<br>one of each broke free and fused into me...<br>wanna see?' },
    'splash-post': { es: 'Rincón con olor a acero', en: 'The Rhythmic Pen & The Silent Steel' },
    'splash-enter': { es: 'ENTRAR', en: 'ENTER' },
    'page-title': { es: 'Rincon con olor a acero', en: 'The Rhythmic Pen & The Silent Steel' },
    'sidebar-title': { es: 'Rincon con<br>olor a acero', en: 'The Rhythmic Pen<br>& The Silent Steel' },
    'nav-inicio': { es: '[ inicio ]', en: '[ home ]' },
    'nav-sobre-mi': { es: '[ sobre mí ]', en: '[ about ]' },
    'nav-poemas': { es: '[ poemas ]', en: '[ poems ]' },
    'nav-galeria': { es: '[ galería ]', en: '[ gallery ]' },
    'nav-guestbook': { es: '[ guestbook ]', en: '[ guestbook ]' },
    'nav-shrine': { es: '[ shrine ]', en: '[ shrine ]' },
    'nav-favoritos': { es: '[ favoritos ]', en: '[ favorites ]' },
    'nav-recomiendo': { es: '[ recomiendo ]', en: '[ recommend ]' },
    'status-title': { es: '● status', en: '● status' },
    'currently-title': { es: 'Currently Feeling', en: 'Currently Feeling' },
    'currently-playing': { es: '📝 Jugando:', en: '📝 Playing:' },
    'currently-listening': { es: '🎧 Escuchando:', en: '🎧 Listening:' },
    'currently-watching': { es: '👁️ Viendo/leyendo:', en: '👁️ Watching/reading:' },
    'music-title': { es: '🎵 Reproductor', en: '🎵 Player' },
    'nowplaying-title': { es: '🎧 Escuchando ahora', en: '🎧 Now playing' },
    'nowplaying-cargando': { es: 'cargando...', en: 'loading...' },
    'nowplaying-vacio': { es: 'Todavía no escuché nada... cuando scrobblee música, aparece acá.', en: 'Nothing playing yet... when I scrobble music, it shows up here.' },
    'nowplaying-error': { es: 'No pude conectar con Last.fm.', en: 'Could not reach Last.fm.' },
    'nowplaying-ahora': { es: 'sonando ahora', en: 'playing now' },
    'nowplaying-ultima': { es: 'última escuchada', en: 'last played' },
    'links-title': { es: 'Redes', en: 'Networks' },
    'clock-title': { es: '⏰ Hora actual', en: '⏰ Current time' },
    'inicio-title': { es: '// UN ECO EN LA CIUDAD', en: '// AN ECHO IN THE CITY' },
    'inicio-p1': { es: 'Este espacio existe porque afuera el ruido es demasiado fuerte y las pantallas cambian demasiado rápido. No hay algoritmos acá. No busco retener tu atención, ni convencerte de nada. Esto es solo un fragmento de tiempo congelado, o al menos el mío.', en: 'This space exists because outside the noise is too loud and the screens change too fast. There are no algorithms here. I\'m not trying to hold your attention, nor convince you of anything. This is just a frozen fragment of time, or at least mine.' },
    'inicio-pov': { es: '👁️ <strong>Pensamiento actual:</strong> Lineas de codigo que endurecen mi pensamiento logico junto con las notas y melodias que susurran a mi alma, es lo que mantiene este santuario de carne.', en: '👁️ <strong>Current Thought:</strong> Lines of code that harden my logical thinking along with the notes and melodies that whisper to my soul, are what maintains this sanctuary of flesh.' },
    'inicio-frases': { es: '💿 <strong>Frases de Gustavo C.:</strong> <em>"Soy mi propio altar..."</em> Cuando crees que no hay quien adore a una divinidad como tu, recuerda que siempre puedes quererte un poco a ti mismo.', en: '💿 <strong>Quotes by Gustavo C.:</strong> <em>"I am my own altar..."</em> When you think that there is no one who worships a divinity like you, remember that you can always love yourself a little.' },
    'inicio-hogar': { es: '🎮 <strong> Estado virtual:</strong> Mato el tiempo antes que el tiempo me mate a mi...Las redes sociales son un asesino que trabaja con un veneno dulce pero lento.', en: '🎮 <strong> Virtual status:</strong> I kill time before time kills me...Social networks are a killer that works with a sweet but slow poison.' },
    'inicio-recientes': { es: 'Sucesos recientes en la terminal:', en: 'Recent terminal logs:' },
    'inicio-recientes-li1': { es: '<span style="color: #8fa7c7;">[•]</span> <span style="color: #d1a374;">06/09</span> Gatefold con poema + Status + Reactions + filtros + llaveros.', en: '<span style="color: #8fa7c7;">[•]</span> <span style="color: #d1a374;">09/06</span> Entry gatefold with poem + Status + Reactions + squared filters + charms.' },
    'inicio-recientes-li2': { es: '<span style="color: #8fa7c7;">[•]</span> <span style="color: #d1a374;">16/08</span> Primer altar dedicado a Gustavo Cerati y Soda Stereo (shrine.html + img/shrines).', en: '<span style="color: #8fa7c7;">[•]</span> <span style="color: #d1a374;">08/16</span> First shrine dedicated to Gustavo Cerati and Soda Stereo (shrine.html + img/shrines).' },
    'inicio-recientes-li3': { es: '<span style="color: #8fa7c7;">[•]</span> <span style="color: #d1a374;">16/08</span> Botones de like eliminados (el servicio LikeBtn dejó de funcionar).', en: '<span style="color: #8fa7c7;">[•]</span> <span style="color: #d1a374;">08/16</span> Like buttons removed (the LikeBtn service stopped working).' },
    'inicio-recientes-li4': { es: '<span style="color: #8fa7c7;">[•]</span> <span style="color: #d1a374;">08/08</span> Reproductor retro con play/pausa.', en: '<span style="color: #8fa7c7;">[•]</span> <span style="color: #d1a374;">08/08</span> Retro player with play/pause.' },
    'inicio-recientes-li5': { es: '<span style="color: #8fa7c7;">[•]</span> <span style="color: #d1a374;">08/08</span> Likes personalizados con la paleta del sitio.', en: '<span style="color: #8fa7c7;">[•]</span> <span style="color: #d1a374;">08/08</span> Likes customized with the site palette.' },
    'inicio-recientes-li6': { es: '<span style="color: #8fa7c7;">[•]</span> <span style="color: #d1a374;">03/08</span> Widget "Estoy escuchando ahora" conectado a Last.fm.', en: '<span style="color: #8fa7c7;">[•]</span> <span style="color: #d1a374;">08/03</span> "Now playing" widget connected to Last.fm.' },
    'inicio-recientes-li7': { es: '<span style="color: #8fa7c7;">[•]</span> <span style="color: #d1a374;">02/08</span> Traductor automático ES→EN + primer botón de amiga (camiqseb707).', en: '<span style="color: #8fa7c7;">[•]</span> <span style="color: #d1a374;">08/02</span> Automatic ES→EN translator + first friend button (camiqseb707).' },
    'inicio-recientes-li8': { es: '<span style="color: #8fa7c7;">[•]</span> <span style="color: #d1a374;">02/08</span> Imágenes en "Recomiendo" y "Favoritos" + pestaña con nuevas recomendaciones.', en: '<span style="color: #8fa7c7;">[•]</span> <span style="color: #d1a374;">08/02</span> Images in "Recommend" and "Favorites" + tab with new recommendations.' },
    'sobre-mi-title': { es: 'Sobre mí', en: 'About Me' },
    'sobre-mi-p1': { es: 'Soy un adolescente que aprendió tarde a cómo serlo, o al menos eso pienso. El internet actual es un asco en su mayoría, no tengo control de nada, todo es IA o plagiado, y ¿qué es más efectivo que hacerme mi propio "Rincón"? Y de paso aprendo a programar cosas básicas, aunque siempre fui más de la música, los videojuegos, la literatura y el dibujo, pero creo que no hay límite para aprender cosas que te gustan.', en: 'I\'m a teenager who learned late how to be one, or at least that\'s what I think. Today\'s internet mostly sucks, I have no control over anything, everything is AI or plagiarized. What\'s more effective than making my own "Corner", and along the way learn to code basic things. Though I was always more into music, video games, literature and drawing, I believe there\'s no limit to learning what you love.' },
    'sobre-mi-quote': { es: '"Mi mirada artistica (si es que puedo llamarme artista) trata de percibir mas alla de lo que mis ojos pueden ver y lo que mis oidos alcanzan a escuchar, tratando de sentir algo escondido en cada momento, porque me gustan los misterios y lo oculto o dificl de encontrar, y aun asi me tomo mucho encontrar alguna pista de mi mismo... El silencio es un ruido muy fuerte, puede que el más ruidoso de todos, por eso nunca me gustó estar en un silencio absoluto"', en: '"My artistic gaze (if I can call myself an artist) tries to perceive beyond what my eyes can see and what my ears can hear, trying to feel something hidden in every moment, because I like mysteries and what is hidden or difficult to find, and even so it takes me a lot to find some clue of myself... Silence is a very loud noise, perhaps the loudest of all, that is why I never liked being in absolute silence"' },
    'sobre-mi-soportes': { es: '// LOS SOPORTES DEL RINCÓN', en: '// THE PILLARS OF THE CORNER' },
    'sobre-mi-i-title': { es: 'I. El Ruido del vacío', en: 'I. The Noise of the Void' },
    'sobre-mi-i-text': { es: 'Aunque mi alma no es solo música, este lugar dentro de lineas y pixeles me deja liberar y expresar aquellos sonidos y sensaciones, en forma de textos o de codigos mal escritos. La atmósfera única de <em>Bocanada</em> y el deseo mudo de domar las cuerdas de una guitarra para que griten lo que yo no puedo decir ni susurrando. Cerati entendía que el vacío es un lugar normal, y que solo nosotros podríamos llenarlo.', en: 'Although my soul is not just music, this place within lines and pixels allows me to release and express those sounds and sensations, in the form of texts or poorly written codes. The unique atmosphere of <em>Bocanada</em> and the silent desire to tame the strings of a guitar so that they scream what I cannot say even by whispering. Cerati understood that emptiness is a normal place, and that only we could fill it.' },
    'sobre-mi-ii-title': { es: 'II. Lazos y Humo', en: 'II. Bonds & Smoke' },
    'sobre-mi-ii-text': { es: 'Me gusta decir que me parezco a personajes o a gente, pero a veces ni siquiera me parezco a mí mismo, y eso creo que me hace más "yo". Encuentro pedazos de mi propia realidad en la vida urbana de los 2000, ojalá haberlo vivido... a veces me pierdo, otras me encuentro como en las siluetas que se desvanecen bajo la luz de los faroles, y en ese grito desesperado por una libertad absoluta y salvaje que solo encuentro en la música y mis aficiones.', en: 'I like to say I resemble characters or people, but sometimes I don\'t even resemble myself, and I think that makes me more "me". I find pieces of my own reality in the urban life of the 2000s, I wish I had lived it... sometimes I get lost, other times I find myself in the silhouettes that fade under the streetlight glow, and in that desperate scream for an absolute and wild freedom that I only find in music and my hobbies.' },
    'sobre-mi-ps-title': { es: '// POST SCRIPTUM', en: '// POST SCRIPTUM' },
    'sobre-mi-ps-text': { es: 'Este sitio se llama <strong>Rincón con olor a acero</strong> porque mi lugar en este mundo es pequeño, por eso trato de hacerlo unico, y huele a acero porque me gusta el olor a la sangre, siento que es algo más que un olor, es una memoria o sintemiento que trasciende lo profundo, aunque eso seria especular sobre un gusto. Es un pasillo de recuerdos y espejos rotos, hecha de líneas de código para proteger los pensamientos que todavía siguen vivos, en un mundo donde casi todos mataron su propia mente.', en: 'This place is called <strong>Corner with the smell of steel</strong> because my place in this world is small, that\'s why I try to make it unique, and it smells like steel because I like the smell of blood, I feel that it is something more than a smell, it is a memory or feeling that transcends the depths, although that would be speculating about a taste. It is a hallway of memories and broken mirrors, made of lines of code to protect the thoughts that are still alive, in a world where almost everyone killed their own mind.' },
    'poemas-title': { es: '[ escritos y poemas ]', en: '[ writings & poems ]' },
    'poemas-aviso': { es: '<em style="color: #8fa7c7; font-size: 12px;">Los poemas están escritos en español.</em>', en: '<em style="color: #8fa7c7; font-size: 12px;">🌐 only for those who understand spanish</em>' },
    'poemas-likes': { es: '♥ si un poema te llega, deja tu like', en: '♥ if a poem moves you, leave a like' },
    'galeria-title': { es: 'Galería', en: 'Gallery' },
    'galeria-todo': { es: '[ todo ]', en: '[ all ]' },
    'galeria-dibujos': { es: '[ dibujos ]', en: '[ drawings ]' },
    'galeria-fotos': { es: '[ fotos ]', en: '[ photos ]' },
    'fav-games-title': { es: '🎮 Juegos', en: '🎮 Games' },
    'fav-music-title': { es: '🎵 Música', en: '🎵 Music' },
    'recom-title': { es: '🎯 Recomiendo', en: '🎯 I recommend' },
    'recom-intro': { es: 'Cosas que vi, leí o jugué y me dejaron algo. Sin spoilers (casi).', en: 'Things I watched, read or played that left me something. No spoilers (almost).' },
    'recom-pelis': { es: '🎬 Películas', en: '🎬 Movies' },
    'recom-series': { es: '📺 Series', en: '📺 Series' },
    'recom-mangas': { es: '📖 Mangas / Lecturas', en: '📖 Manga / Reading' },
    'recom-juegos': { es: '🎮 Juegos', en: '🎮 Games' },
    'guestbook-title': { es: 'Guestbook', en: 'Guestbook' },
    'guestbook-aviso': { es: 'Dejame un mensaje, me encanta leerlos.', en: 'Leave me a message, I love reading them.' },
    'embed-title': { es: '🔗 embed me', en: '🔗 embed me' },
    'embed-text': { es: 'Copiá este código y pegalo en tu sitio para enlazar el mío:', en: 'Copy this code and paste it on your site to link mine:' },
    'llaveros-title': { es: '🔑 llaveros', en: '🔑 charms' },
    'botones-title': { es: '⭐ links', en: '⭐ links' },
    'botones-vacio': { es: 'Pronto agregaré botones de mis amigos de Neocities.', en: 'Soon I\'ll add buttons from my Neocities friends.' },
    'visitas-title': { es: 'visitas', en: 'visits' },
    'footer-hecho': { es: 'hecho a mano desde Argentina 🇦🇷', en: 'handmade from Argentina 🇦🇷' },
    'footer-sin-ia': { es: 'sin algoritmos', en: 'no algorithms' },
};

let langActual = localStorage.getItem('neocities-lang') || 'es';

function actualizarBotonSplash() {
    const b = document.getElementById('splash-lang');
    if (b) b.textContent = langActual === 'es' ? 'EN' : 'ES';
}

function setLanguage(lang) {
    langActual = lang;
    localStorage.setItem('neocities-lang', lang);
    document.getElementById('lang-toggle').textContent = lang === 'es' ? 'EN' : 'ES';
    actualizarBotonSplash();
    document.querySelectorAll('[data-lang]').forEach(function(el) {
        const key = el.getAttribute('data-lang');
        if (translations[key] && translations[key][lang]) {
            if (key === 'page-title') {
                document.title = translations[key][lang];
            } else {
                el.innerHTML = translations[key][lang];
            }
        }
    });
}

document.getElementById('lang-toggle').addEventListener('click', function() {
    const nuevo = langActual === 'es' ? 'en' : 'es';
    setLanguage(nuevo);
});

const splashLangBtn = document.getElementById('splash-lang');
if (splashLangBtn) {
    splashLangBtn.addEventListener('click', function() {
        const nuevo = langActual === 'es' ? 'en' : 'es';
        setLanguage(nuevo);
    });
}

setLanguage(langActual);
actualizarBotonSplash();

// ============================================================
// ACORDEÓN SIDEBAR (solo en móvil)
// ============================================================
function initAcordeon() {
    if (window.innerWidth > 700) return;

    document.querySelectorAll('.caja-acordeon').forEach(function(caja) {
        const h3 = caja.querySelector('h3');
        if (!h3) return;

        h3.addEventListener('click', function() {
            const estaAbierta = caja.classList.contains('acordeon-abierta');
            document.querySelectorAll('.caja-acordeon.acordeon-abierta').forEach(function(otra) {
                otra.classList.remove('acordeon-abierta');
            });
            if (!estaAbierta) {
                caja.classList.add('acordeon-abierta');
            }
        });
    });
}

initAcordeon();
window.addEventListener('resize', function() {
    if (window.innerWidth > 700) {
        document.querySelectorAll('.caja-acordeon').forEach(function(caja) {
            caja.classList.remove('acordeon-abierta');
        });
    } else {
        initAcordeon();
    }
});

// ============================================================
// ESCUCHANDO AHORA (Last.fm)
// ============================================================
var LASTFM_USER = 'kikino1093';
var LASTFM_API = '211b8a9c31834e7f3fee0cdcce38292e';

function escaparHtml(texto) {
    return String(texto || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function pintarNowPlaying(data) {
    var contenedor = document.getElementById('now-playing');
    if (!contenedor) return;

    var track = data && data.recenttracks && data.recenttracks.track;
    if (!track || track.length === 0) {
        contenedor.innerHTML = '<div class="nowplaying-vacio" data-lang="nowplaying-vacio"></div>';
    } else {
        var t = track[0];
        var ahora = t['@attr'] && t['@attr'].nowplaying === 'true';
        var imagen = '';
        if (t.image && t.image.length) {
            var grande = t.image[t.image.length - 1];
            imagen = grande && grande['#text'] ? grande['#text'] : '';
        }
        var estado = ahora ? translations['nowplaying-ahora'][langActual]
                           : translations['nowplaying-ultima'][langActual];
        var coverHtml = imagen
            ? '<img src="' + escaparHtml(imagen) + '" alt="cover" onerror="this.onerror=null;this.src=\'https://placehold.co/56x56/141310/d1a374?text=♪\';">'
            : '<img src="https://placehold.co/56x56/141310/d1a374?text=♪" alt="cover">';
        contenedor.innerHTML =
            '<div class="nowplaying-track">'
            + coverHtml
            + '<div class="nowplaying-info">'
            + '<div class="nowplaying-estado">♪ <span>' + escaparHtml(estado) + '</span></div>'
            + '<div class="nowplaying-cancion">' + escaparHtml(t.name) + '</div>'
            + '<div class="nowplaying-artista">' + escaparHtml(t.artist['#text']) + '</div>'
            + '</div></div>';
    }
    setLanguage(langActual);
}

function cargarNowPlaying() {
    var contenedor = document.getElementById('now-playing');
    if (!contenedor) return;

    // JSONP: no depende de CORS y no lo bloquean los adblockers
    window.miNowPlaying = function(data) {
        pintarNowPlaying(data);
        window.miNowPlaying = null;
    };
    var script = document.createElement('script');
    script.src = 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks'
        + '&user=' + encodeURIComponent(LASTFM_USER)
        + '&api_key=' + encodeURIComponent(LASTFM_API)
        + '&format=json&callback=miNowPlaying&limit=1';
    script.onerror = function() {
        var cont = document.getElementById('now-playing');
        if (cont) {
            cont.innerHTML = '<div class="nowplaying-error" data-lang="nowplaying-error"></div>';
            setLanguage(langActual);
        }
        script.remove();
    };
    script.onload = function() {
        script.remove();
    };
    document.head.appendChild(script);
}

cargarNowPlaying();
setInterval(cargarNowPlaying, 30000);

// ============================================================
// REPRODUCTOR RETRO (YouTube IFrame API)
// ============================================================
var RETRO_PLAYLIST = 'OLAK5uy_kfRGNt1YJtjiaWGL1papRUWbB5GOJwNpk';
var retroPlayer = null;
var retroSonando = false;
var retroTimer = null;

function onYouTubeIframeAPIReady() {
    retroPlayer = new YT.Player('retro-yt', {
        width: '1',
        height: '1',
        playerVars: {
            listType: 'playlist',
            list: RETRO_PLAYLIST,
            loop: 1,
            playsinline: 1,
            controls: 0,
            disablekb: 1
        },
        events: {
            'onReady': retroListo,
            'onStateChange': retroCambioEstado
        }
    });
}

function retroListo() {
    retroTimer = setInterval(retroProgreso, 500);
    document.getElementById('retro-vol').addEventListener('input', function() {
        if (retroPlayer && retroPlayer.setVolume) {
            retroPlayer.setVolume(parseInt(this.value, 10));
        }
    });
}

function retroCambioEstado(e) {
    const btn = document.getElementById('retro-play');
    const eq = document.getElementById('retro-eq');
    const track = document.getElementById('retro-track');
    if (e.data === YT.PlayerState.PLAYING) {
        retroSonando = true;
        if (btn) btn.textContent = '❚❚';
        if (eq) eq.classList.add('sonando');
        try {
            const datos = retroPlayer.getVideoData();
            if (datos && datos.title && track) track.textContent = datos.title;
        } catch (err) {}
    } else {
        retroSonando = false;
        if (btn) btn.textContent = '▶';
        if (eq) eq.classList.remove('sonando');
    }
}

function retroProgreso() {
    if (!retroPlayer || !retroPlayer.getCurrentTime) return;
    const barra = document.getElementById('retro-bar-fill');
    const tiempo = document.getElementById('retro-time');
    const actual = retroPlayer.getCurrentTime();
    const total = retroPlayer.getDuration();
    if (barra && total > 0) barra.style.width = ((actual / total) * 100) + '%';
    if (tiempo) tiempo.textContent = retroFormato(actual) + ' / ' + retroFormato(total);
}

function retroFormato(seg) {
    if (!seg || isNaN(seg)) return '0:00';
    const m = Math.floor(seg / 60);
    const s = Math.floor(seg % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
}

document.getElementById('retro-play').addEventListener('click', function() {
    if (!retroPlayer) return;
    if (retroSonando) {
        retroPlayer.pauseVideo();
    } else {
        retroPlayer.playVideo();
    }
});

document.getElementById('retro-prev').addEventListener('click', function() {
    if (retroPlayer && retroPlayer.previousVideo) retroPlayer.previousVideo();
});

document.getElementById('retro-next').addEventListener('click', function() {
    if (retroPlayer && retroPlayer.nextVideo) retroPlayer.nextVideo();
});

// Cargar API de YouTube solo si no está
if (!window.YT) {
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var primero = document.getElementsByTagName('script')[0];
    primero.parentNode.insertBefore(tag, primero);
}