// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Códice Gravitacional: tarjetas deslizables con mini-animación, fórmula y ejemplo resuelto.
import { CODICE } from '../data/codice.js';
import { ANIMS as A1, STILL as S1, AW, AH } from '../ui/anims.js';
import { ANIMS_AIRE, STILL_AIRE } from '../ui/anims-aire.js';
import { ANIMS_IMPACTO, STILL_IMPACTO } from '../ui/anims-impacto.js';
import { isDone } from '../progress.js';
import { SPEAKERS, portrait } from '../ui/speakers.js';
import { get, set, addScore } from '../state.js';
import { sfx } from '../audio.js';
import { go } from '../nav.js';

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
const ANIMS = { ...A1, ...ANIMS_AIRE, ...ANIMS_IMPACTO }, STILL = { ...S1, ...STILL_AIRE, ...STILL_IMPACTO };
// Qué nodo desbloquea el Códice de cada acto y adónde invita al terminar.
const GATE = { 1: null, 2: 'm4', 3: 'm8' };
const DONE_MSG = {
  1: { text: '¡Memoria del Acto 1 restaurada! Ya puedes presentar el examen de licencia.', btn: '✎ Ir al examen de licencia', go: 'examen' },
  2: { text: '¡Memoria del aire restaurada! Ya conozco el arrastre, la velocidad terminal y los paracaídas.', btn: '▶ Ir al mapa de misiones', go: 'historia' },
  3: { text: '¡Memoria del impacto restaurada! F · d = Ec: ya sé diseñar fundas para cualquier suelo.', btn: '▶ Ir al mapa de misiones', go: 'historia' },
};

export default function codice(el, arg) {
  const act = CODICE[+arg] ? +arg : 1, cards = CODICE[act];
  if (GATE[act] && !isDone(GATE[act])) {
    el.innerHTML = `<h1 style="font-size:15px">CÓDICE</h1><div class="panel dialog"><span class="slot"></span><div><h2 style="color:var(--yellow)">GAL-1</h2>
      <p>"Ese fragmento está cifrado. Termina el Acto ${act - 1} para recuperarlo."</p></div></div><button class="btn" data-go>▶ Ir al mapa de misiones</button>`;
    el.querySelector('.slot').replaceWith(portrait('gal', 'sm'));
    el.querySelector('[data-go]').onclick = () => go('historia');
    return;
  }
  let i = Math.max(0, cards.findIndex((c) => !get().codice.includes(c.id)));
  let raf = 0, t0 = performance.now();

  el.innerHTML = `
    <h1 style="font-size:15px">CÓDICE</h1>
    <p class="tag">ACTO ${act}${Object.keys(CODICE).filter((k) => +k !== act && (!GATE[k] || isDone(GATE[k]))).map((k) => ` · <a href="#codice${k > 1 ? '/' + k : ''}">Acto ${k}</a>`).join('')}</p>
    <p class="tag">Fragmentos recuperados: <b id="cx-count" style="color:var(--yellow)"></b></p>
    <div class="deck" tabindex="0" aria-roledescription="carrusel" aria-label="Tarjetas del Códice Gravitacional">
      <div class="track">${cards.map((c, k) => `
        <article class="card" aria-roledescription="tarjeta" aria-label="${k + 1} de ${cards.length}: ${c.title}">
          <div class="card-head"><span class="slot" data-who="${c.speaker}"></span>
            <div><h2 style="color:${SPEAKERS[c.speaker].color}">${SPEAKERS[c.speaker].name}</h2><p class="quote">"${c.quote}"</p></div></div>
          <h3>${k + 1}. ${c.title}</h3>
          <div class="anim"><canvas width="${AW}" height="${AH}" data-anim="${c.anim}"></canvas></div>
          <p class="formula">${c.formula}</p>
          <p>${c.text}</p>
          <details class="example"><summary>Ejemplo: ${c.example.q}</summary>
            <ol>${c.example.steps.map((s) => `<li>${s}</li>`).join('')}</ol></details>
        </article>`).join('')}
      </div>
    </div>
    <div class="deck-nav">
      <button class="icon-btn big" data-prev aria-label="Tarjeta anterior">◀</button>
      <div class="dots">${cards.map((c, k) => `<button class="dot" data-dot="${k}" aria-label="Ir a la tarjeta ${k + 1}"></button>`).join('')}</div>
      <button class="icon-btn big" data-next aria-label="Tarjeta siguiente">▶</button>
    </div>
    <div id="cx-done"></div>`;

  const $ = (s) => el.querySelector(s);
  el.querySelectorAll('.slot').forEach((s) => s.replaceWith(portrait(s.dataset.who, 'sm')));
  const track = $('.track'), deck = $('.deck');
  const canv = [...el.querySelectorAll('canvas[data-anim]')].map((c) => { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return { c, g, fn: ANIMS[c.dataset.anim], key: c.dataset.anim }; });

  function show(k, user = true) {
    i = Math.max(0, Math.min(cards.length - 1, k));
    track.style.transform = `translateX(${-i * 100}%)`;
    el.querySelectorAll('.card').forEach((c, n) => { c.setAttribute('aria-hidden', String(n !== i)); c.inert = n !== i; });
    el.querySelectorAll('.dot').forEach((d, n) => { d.classList.toggle('on', n === i); d.classList.toggle('seen', get().codice.includes(cards[n].id)); });
    $('[data-prev]').disabled = i === 0; $('[data-next]').disabled = i === cards.length - 1;
    if (user) sfx.click();
    markSeen(cards[i].id);
    t0 = performance.now();
    canv.forEach((a) => a.fn(a.g, STILL[a.key])); // cuadro fijo en todas; la activa se anima
  }
  function markSeen(id) {
    const seen = get().codice;
    if (!seen.includes(id)) { set({ codice: [...seen, id] }); addScore(1); }
    const n = cards.filter((c) => get().codice.includes(c.id)).length;
    $('#cx-count').textContent = `${n} / ${cards.length}`;
    if (n === cards.length && !$('#cx-done').innerHTML) {
      $('#cx-done').innerHTML = `<div class="panel dialog fade-in"><span class="slot2"></span><div><h2 style="color:var(--yellow)">GAL-1</h2>
        <p>"${DONE_MSG[act].text}"</p></div></div>
        <button class="btn" data-go>${DONE_MSG[act].btn}</button>`;
      $('.slot2').replaceWith(portrait('gal', 'sm'));
      $('[data-go]').onclick = () => go(DONE_MSG[act].go);
    }
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const a = canv[i]; a.fn(a.g, (now - t0) / 1000);
  }

  $('[data-prev]').onclick = () => show(i - 1);
  $('[data-next]').onclick = () => show(i + 1);
  el.querySelectorAll('[data-dot]').forEach((d) => (d.onclick = () => show(+d.dataset.dot)));
  deck.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1); });
  // Deslizar con el dedo (solo gestos horizontales; el vertical sigue haciendo scroll).
  let sx = null, sy = 0, dx = 0;
  deck.addEventListener('pointerdown', (e) => { if (e.target.closest('summary')) return; sx = e.clientX; sy = e.clientY; dx = 0; });
  deck.addEventListener('pointermove', (e) => {
    if (sx === null) return; dx = e.clientX - sx;
    if (Math.abs(dx) > Math.abs(e.clientY - sy) && !REDUCE.matches) track.style.transform = `translateX(calc(${-i * 100}% + ${dx}px))`;
  });
  const end = () => { if (sx === null) return; sx = null; if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1)); else show(i, false); };
  deck.addEventListener('pointerup', end); deck.addEventListener('pointercancel', end); deck.addEventListener('pointerleave', end);

  show(i, false);
  if (!REDUCE.matches) raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
