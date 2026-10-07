import { get } from './state.js';
import { sfx, musicStart, toggleSound } from './audio.js';
import menu from './screens/menu.js';
import simulador from './screens/simulador.js';
import { codice, examen } from './screens/pronto.js';

const ROUTES = { menu, simulador, codice, examen };
const app = document.getElementById('app');
let cleanup = null;

function render() {
  const name = location.hash.slice(1) || 'menu';
  if (cleanup) cleanup();
  app.innerHTML = '';
  const view = document.createElement('section'); view.className = 'fade-in'; app.appendChild(view);
  cleanup = (ROUTES[name] || menu)(view) || null;
  window.scrollTo(0, 0);
}
export const go = (r) => { sfx.click(); location.hash = r; };
window.addEventListener('hashchange', render);

const scoreEl = document.getElementById('hud-score');
const paintScore = () => (scoreEl.textContent = '★ ' + get().score);
document.addEventListener('state', paintScore);
paintScore();

document.getElementById('btn-home').onclick = () => go('menu');
const soundBtn = document.getElementById('btn-sound');
soundBtn.style.opacity = get().sound ? 1 : 0.4;
soundBtn.onclick = () => { soundBtn.style.opacity = toggleSound() ? 1 : 0.4; };
// La música arranca con el primer toque (regla de los navegadores móviles).
document.addEventListener('pointerdown', () => musicStart(), { once: true });
render();
