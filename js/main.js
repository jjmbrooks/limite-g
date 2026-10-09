import { get, set } from './state.js';
import { musicStart, musicFor, toggleSound } from './audio.js';
import { go } from './nav.js';
import { mountStarfield } from './gfx/starfield.js';
import menu from './screens/menu.js';
import simulador from './screens/simulador.js';
import codice from './screens/codice.js';
import examen from './screens/examen.js';
import historia from './screens/historia.js';
import aire from './screens/aire.js';
import impacto from './screens/impacto.js';
import logros from './screens/logros.js';
import creditos from './screens/creditos.js';
import { newLogros, LOGROS } from './data/logros.js';
import { toast } from './ui/toast.js';
import { celebrarLogro } from './ui/compartir.js';
import { sfx } from './audio.js';

const ROUTES = { menu, historia, simulador, aire, impacto, codice, examen, logros, creditos };
const app = document.getElementById('app');
let cleanup = null;

// Rutas: #pantalla o #pantalla/argumento (p. ej. #simulador/m1 abre una misión).
function render() {
  const [name, arg] = (location.hash.slice(1) || 'menu').split('/');
  musicFor(ROUTES[name] ? name : 'menu', arg);
  if (cleanup) cleanup();
  app.innerHTML = '';
  const view = document.createElement('section'); view.className = 'fade-in'; app.appendChild(view);
  cleanup = (ROUTES[name] || menu)(view, arg) || null;
  app.classList.toggle('full', !!view.querySelector('.game')); // simuladores a pantalla completa (M11)
  window.scrollTo(0, 0);
}
export { go };
window.addEventListener('hashchange', render);

// Alto real del HUD (con zona segura) para que la escena de juego llene el resto sin scroll.
const hudEl = document.querySelector('.hud');
const hudH = () => document.documentElement.style.setProperty('--hud-h', hudEl.offsetHeight + 'px');
new ResizeObserver(hudH).observe(hudEl); hudH();
const scoreEl = document.getElementById('hud-score');
const paintScore = () => (scoreEl.textContent = '★ ' + get().score);
document.addEventListener('state', paintScore);
// Logros: tras cada cambio del guardado se revisan las condiciones y se avisa de los nuevos.
document.addEventListener('state', () => {
  const nuevos = newLogros(get());
  if (!nuevos.length) return;
  set({ logros: [...(get().logros || []), ...nuevos] });
  sfx.logro();
  // Con más de dos a la vez (p. ej. una partida guardada antes de M9) se agrupan en un solo aviso para no tapar la pantalla.
  // M11: cada celebración ofrece «Compartir» (tarjeta PNG con Web Share o WhatsApp).
  if (nuevos.length > 2) { celebrarLogro(`<b>¡${nuevos.length} logros desbloqueados!</b> Míralos en ★ Logros.`); return; }
  nuevos.forEach((id) => { const l = LOGROS.find((x) => x.id === id); celebrarLogro(`<b>¡Logro desbloqueado!</b> ${l.icon} ${l.title}`); });
});
paintScore();

document.getElementById('btn-home').onclick = () => go('menu');
const soundBtn = document.getElementById('btn-sound');
const paintSound = (on) => { soundBtn.style.opacity = on ? 1 : 0.4; soundBtn.setAttribute('aria-pressed', String(on)); };
paintSound(get().sound);
soundBtn.onclick = () => paintSound(toggleSound());
// La música arranca con el primer toque (regla de los navegadores móviles).
document.addEventListener('pointerdown', () => musicStart(), { once: true });
mountStarfield(document.getElementById('stars'));
render();
document.dispatchEvent(new CustomEvent('state', { detail: get() })); // revisa logros de partidas guardadas

// PWA offline: registra el service worker (sw.js, misma carpeta: funciona bajo /limite-g/).
// Al instalarse una versión nueva se avisa para recargar.
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  const habia = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (habia) toast('<b>Nueva versión lista.</b> Recarga para usarla.', 6000); });
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { /* sin SW: se juega en línea */ }));
}
