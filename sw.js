// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Service worker: juego offline. Precarga todos los archivos de runtime con rutas relativas
// (funciona en / y bajo /limite-g/ de GitHub Pages) y responde primero desde la caché.
// AL PUBLICAR CAMBIOS: sube VERSION (p. ej. 'm10-2') para que los teléfonos descarguen la versión nueva.
// La lista PRECACHE la verifica scripts/qa.sh; `node scripts/qa/sw-precache.mjs --fix` la regenera.
const VERSION = 'm10-1';
const CACHE = 'limiteg-' + VERSION;

// <precache>
const PRECACHE = [
  './',
  'assets/fuentes/press-start-2p-latin.woff2',
  'assets/fuentes/vt323-latin.woff2',
  'assets/iconos/icon-192.png',
  'assets/iconos/icon-512.png',
  'assets/iconos/maskable-512.png',
  'css/style.css',
  'js/audio.js',
  'js/data/actos.js',
  'js/data/codice.js',
  'js/data/examenes.js',
  'js/data/historia.js',
  'js/data/historia2.js',
  'js/data/historia3.js',
  'js/data/historia4.js',
  'js/data/impacto.js',
  'js/data/logros.js',
  'js/data/objects.js',
  'js/data/paracaidas.js',
  'js/data/planets.js',
  'js/data/preguntas.js',
  'js/data/preguntas2.js',
  'js/data/preguntas3.js',
  'js/gfx/palette.js',
  'js/gfx/pixel.js',
  'js/gfx/scenery.js',
  'js/gfx/sprites.js',
  'js/gfx/starfield.js',
  'js/main.js',
  'js/nav.js',
  'js/physics.js',
  'js/progress.js',
  'js/screens/aire.js',
  'js/screens/codice.js',
  'js/screens/examen.js',
  'js/screens/historia.js',
  'js/screens/impacto.js',
  'js/screens/logros.js',
  'js/screens/menu.js',
  'js/screens/simulador.js',
  'js/state.js',
  'js/ui/anims-aire.js',
  'js/ui/anims-impacto.js',
  'js/ui/anims.js',
  'js/ui/dialogo.js',
  'js/ui/grafica.js',
  'js/ui/speakers.js',
  'js/ui/tarjeta.js',
  'js/ui/toast.js',
  'manifest.webmanifest',
  'index.html',
];
// </precache>

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('limiteg-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Navegación (cualquier #ruta): siempre index.html desde la caché.
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('./', { cacheName: CACHE }).then((hit) => hit || fetch(req)).catch(() => caches.match('./')));
    return;
  }
  e.respondWith(caches.match(req, { cacheName: CACHE, ignoreSearch: true }).then((hit) => hit || fetch(req)));
});
