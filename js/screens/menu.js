import { go } from '../nav.js';
import { get } from '../state.js';
import { currentAct } from '../progress.js';
import { pxCanvas } from '../gfx/pixel.js';
import { NOVA, CAOS, PARABOLA, CAPSULA } from '../gfx/sprites.js';

export default function menu(el) {
  const s = get(), act = Math.min(3, currentAct()); // el Final no tiene Códice ni Examen propios
  el.innerHTML = `
    <h1>LÍMITE G</h1>
    <p class="tag">Red Postal Interplanetaria · Año 2187</p>
    <div class="hero" aria-hidden="true"><span class="hero-ship"></span><span class="hero-cap"></span></div>
    <div class="panel dialog">
      <span class="slot-nova"></span>
      <div><h2>NOVA</h2><p>"La energía no se destruye; se transforma en el impacto perfecto."</p></div>
    </div>
    <p class="muted" style="text-align:center">Rango: <b style="color:var(--yellow)">${s.rank}</b></p>
    <button class="btn" data-go="historia">▶ ${s.seenIntro ? 'Mapa de misiones' : 'Comenzar la historia'}<small>${s.seenIntro ? (currentAct() > 3 ? 'Final: Estación Entropía.' : `Continúa tus entregas del Acto ${act}.`) : 'Conoce a Nova, GAL-1 y Dr. Caos.'}</small></button>
    <button class="btn ghost" data-go="simulador">◎ Simulador libre<small>Lanza dummies: objeto, altura y planeta.</small></button>
    <button class="btn teal" data-go="${act > 1 ? 'codice/' + act : 'codice'}">◆ Códice Gravitacional<small>Recupera la memoria de GAL-1.</small></button>
    <button class="btn ghost" data-go="${act > 1 ? 'examen/' + act : 'examen'}">✎ Examen de licencia<small>${['Sube de Cadete a Piloto.', 'Acto 2: sube a Capitana.', 'Acto 3: sube a Comandante.'][act - 1] || ''}</small></button>
    <button class="btn ghost" data-go="logros">★ Logros<small>${(s.logros || []).length} insignias desbloqueadas.</small></button>
    <div class="panel dialog">
      <span class="slot-caos"></span>
      <div><h2 style="color:var(--magenta)">DR. CAOS</h2><p>"La entropía siempre gana: todo lo que cae, se destruye."</p></div>
    </div>`;
  el.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => go(b.dataset.go)));
  el.querySelector('.slot-nova').replaceWith(pxCanvas(NOVA, { cls: 'avatar', label: 'Nova' }));
  el.querySelector('.slot-caos').replaceWith(pxCanvas(CAOS, { cls: 'avatar caos', label: 'Dr. Caos' }));
  el.querySelector('.hero-ship').replaceWith(pxCanvas(PARABOLA, { cls: 'px hero-ship', label: 'Nave Parábola' }));
  el.querySelector('.hero-cap').replaceWith(pxCanvas(CAPSULA, { cls: 'px hero-cap', label: 'Cápsula de entrega' }));
}
