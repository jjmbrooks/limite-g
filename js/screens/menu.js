// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Menú principal (rediseño M12): una sola acción principal («Continuar» con el siguiente paso real de la historia),
// la ruta de aprendizaje por actos (qué física se aprende en cada uno) y accesos secundarios en mosaico con su estado.
import { go } from '../nav.js';
import { get } from '../state.js';
import { currentAct, nextStep, nodeRoute, isDone, isUnlocked } from '../progress.js';
import { ACTS } from '../data/actos.js';
import { CODICE } from '../data/codice.js';
import { EXAMENES } from '../data/examenes.js';
import { LOGROS } from '../data/logros.js';
import { PLANETS } from '../data/planets.js';
import { OBJECTS } from '../data/objects.js';
import { artCanvas } from '../gfx/imagenes.js';
import { planetCanvas } from '../gfx/pixel.js';
import { PARABOLA, CAPSULA, OBJ_SPRITES } from '../gfx/sprites.js';
import { ico, montarIconos, icono } from '../gfx/iconos.js';

// Qué se aprende en cada acto (en palabras de alumno) — la «ruta» del menú.
const RUTA = [
  { n: 1, name: 'Sin aire', learn: 'Ep = m·g·h · Ec = ½·m·v² · caída libre' },
  { n: 2, name: 'Con aire', learn: 'Arrastre · velocidad terminal · paracaídas' },
  { n: 3, name: 'Impacto', learn: 'F·d = Ec · suelos y fundas' },
  { n: 4, name: 'Estación Entropía', learn: 'Todo junto contra Dr. Caos' },
];
const KIND = { mision: 'MISIÓN', codice: 'CÓDICE', examen: 'EXAMEN' };

export default function menu(el) {
  const s = get(), act = Math.min(3, currentAct()), step = nextStep(), n = step.node;
  const actOpen = (a) => a.n === 1 || isUnlocked(a.map[0]);
  const actDone = (a) => a.map.every((x) => isDone(x.id));
  const cards = CODICE[act] || [], seen = cards.filter((c) => s.codice.includes(c.id)).length;
  const ex = EXAMENES[act], exS = s[ex.key] || { best: 0, passed: false };
  const pct = Math.round((100 * step.done) / step.total);
  const nombre = (t) => t.replace(/^(ACTO \d|FINAL) · /, '');

  // Tarjeta principal: primera vez → historia; después → el siguiente paso con su icono y por qué importa.
  const hero = !s.seenIntro
    ? `<div class="next-card first"><h2>Eres Nova, mensajera interplanetaria</h2>
        <p>Entrega paquetes en otros planetas sin que se rompan. Para lograrlo necesitas la física de la energía.</p>
        <button class="btn big" data-go="historia">▶ COMENZAR</button></div>`
    : n
      ? `<div class="next-card"><div class="next-meta"><span>${step.act.title}</span><span>${step.done}/${step.total}</span></div>
        <div class="progress" role="progressbar" aria-label="Avance del acto" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
        <div class="next-row"><span class="next-ico" aria-hidden="true"></span><div><h2>${n.title}</h2><small>Siguiente ${(KIND[n.type] || '').toLowerCase()}</small></div></div>
        <p class="next-brief">${n.brief || ''}</p>
        <button class="btn big" data-route="${nodeRoute(n)}">▶ CONTINUAR</button>
        <button class="linkish" data-go="historia">Ver el mapa completo</button></div>`
      : `<div class="next-card"><h2>¡Derrotaste a Dr. Caos!</h2>
        <p class="next-brief">Repite misiones por 3 ★ o experimenta en el laboratorio.</p>
        <button class="btn big" data-go="historia">▶ MAPA DE MISIONES</button></div>`;

  el.innerHTML = `
    <div class="menu-top">
      <div class="logo"><h1>LÍMITE G</h1><p class="tag">Red Postal Interplanetaria · 2187</p></div>
      <div class="hero" aria-hidden="true"><span class="hero-ship"></span><span class="hero-cap"></span></div>
    </div>
    <div class="status-strip"><span>Rango <b>${s.rank}</b></span><span>★ <b>${s.score}</b></span><span>Insignias <b>${(s.logros || []).length}/${LOGROS.length}</b></span></div>
    ${hero}
    <h2 class="sec">TU RUTA DE APRENDIZAJE</h2>
    <ol class="ruta">${RUTA.map((r) => {
      const a = ACTS.find((x) => x.n === r.n), on = actOpen(a), done = actDone(a), cur = on && !done && a.n === step.act.n;
      return `<li class="${done ? 'done' : cur ? 'cur' : on ? 'open' : 'locked'}"><span class="ruta-n">${done ? '✓' : on ? r.n === 4 ? 'F' : r.n : ico('candado', 'ruta-lock')}</span>
        <span><b>${r.n === 4 ? 'Final' : 'Acto ' + r.n}: ${r.name}</b><small>${r.learn}</small>${on ? '' : '<small class="ruta-lockmsg">Bloqueado: termina el acto anterior</small>'}</span></li>`;
    }).join('')}</ol>
    <h2 class="sec">PRACTICA Y REPASA</h2>
    <div class="tiles">
      <button class="tile" data-go="simulador">${ico('lab', 'tile-ico')}<b>Laboratorio</b><small>Prueba alturas y planetas sin riesgo</small></button>
      <button class="tile teal" data-go="${act > 1 ? 'codice/' + act : 'codice'}">${ico('codice', 'tile-ico')}<b>Códice</b><small>Teoría · ${seen}/${cards.length} fragmentos</small></button>
      <button class="tile" data-go="${act > 1 ? 'examen/' + act : 'examen'}">${ico('examen', 'tile-ico')}<b>Examen</b><small>${exS.passed ? 'Aprobado ✓ · repasa' : `Licencia de ${ex.rank} · mejor ${exS.best}/${ex.n}`}</small></button>
      <button class="tile" data-go="logros">${ico('logro', 'tile-ico')}<b>Logros</b><small>${(s.logros || []).length} de ${LOGROS.length} insignias</small></button>
    </div>
    <p class="menu-foot"><button class="linkish" data-go="creditos">♪ Créditos</button>${s.seenIntro ? ' · <button class="linkish" data-go="historia/intro">↺ Prólogo</button>' : ''}</p>`;

  montarIconos(el);
  el.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => go(b.dataset.go)));
  el.querySelectorAll('[data-route]').forEach((b) => (b.onclick = () => go(b.dataset.route)));
  el.querySelector('.hero-ship').replaceWith(artCanvas('nave', PARABOLA, { w: 72, h: 27, cls: 'px hero-ship', label: 'Nave Parábola' }));
  el.querySelector('.hero-cap').replaceWith(artCanvas('capsula', CAPSULA, { w: 22, cls: 'px hero-cap', label: 'Cápsula de entrega' }));
  const nIco = el.querySelector('.next-ico');
  if (nIco && n) {
    if (n.type === 'mision') {
      nIco.appendChild(planetCanvas(PLANETS.find((p) => p.id === n.planet), 16, 'px node-px'));
      const o = OBJECTS.find((x) => x.id === n.obj); if (o) nIco.appendChild(artCanvas('obj-' + o.id, OBJ_SPRITES[o.id], { cls: 'px node-obj' }));
    } else nIco.appendChild(icono(n.type === 'codice' ? 'codice' : 'examen', { cls: 'px ico-px next-px' }));
  }
}
