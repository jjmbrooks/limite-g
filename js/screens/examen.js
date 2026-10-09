// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Examen de licencia por acto (#examen = Acto 1 → Piloto, #examen/2 = Acto 2 → Capitana): 8 preguntas al azar,
// retroalimentación explicada e interferencias de Dr. Caos (señal con glitch o reloj acelerado).
import { makeExam } from '../data/preguntas.js';
import { EXAMENES } from '../data/examenes.js';
import { CODICE } from '../data/codice.js';
import { isDone, higherRank } from '../progress.js';
import { portrait } from '../ui/speakers.js';
import { get, set, addScore } from '../state.js';
import { sfx } from '../audio.js';
import { go } from '../nav.js';

const CLOCK = 25; // segundos en una pregunta con reloj de Caos
const GLITCH = '▓▒░█#@%&?¡!';
const scramble = (s, k) => [...s].map((ch, i) => (ch === ' ' || (i * 7919 + k) % 10 < 4 ? ch : GLITCH[(i + k) % GLITCH.length])).join('');
const TAUNTS = ['¿Interferencia? No, solo la entropía haciendo su trabajo.', 'Tic, tac… las licencias no son para cadetes lentos.',
  'Reescribí tu pregunta. ¿Puedes leer el universo cuando se desordena?', 'Mi reloj corre más rápido que tus cálculos.'];

export default function examen(el, arg) {
  const E = EXAMENES[+arg] || EXAMENES[1], N = E.n, PASS = E.pass, cx = CODICE[E.act];
  let qs = [], k = 0, hits = 0, timer = 0, glitchT = 0, locked = false;
  const $ = (s) => el.querySelector(s);
  const say = (who, text) => `<div class="panel dialog"><span class="slot" data-who="${who}"></span><div><p>${text}</p></div></div>`;
  const portraits = () => el.querySelectorAll('.slot').forEach((s) => s.replaceWith(portrait(s.dataset.who, 'sm')));
  const stopTimers = () => { clearInterval(timer); clearInterval(glitchT); };

  function intro() {
    if (!E.requires.every(isDone)) {
      el.innerHTML = `<h1 style="font-size:15px">EXAMEN</h1>${say('gal', `La ${E.title} se abre al terminar el Acto ${E.act - 1}.`)}<button class="btn" data-map>▶ Ir al mapa de misiones</button>`;
      portraits(); $('[data-map]').onclick = () => go('historia'); return;
    }
    const ex = get()[E.key], codiceOk = cx.every((c) => get().codice.includes(c.id));
    el.innerHTML = `<h1 style="font-size:15px">EXAMEN</h1>
      <p class="tag">${E.title} · Acto ${E.act} · Rango actual: <b style="color:var(--yellow)">${get().rank}</b></p>
      ${say('gal', `Responde ${N} preguntas de cálculo y concepto. Con <b>${PASS} aciertos</b> o más obtienes la licencia de <b>${E.rank}</b>. Ten lápiz y calculadora a la mano.`)}
      ${say('caos', '¿Licencia? Voy a meter <b>interferencias</b> en tu señal. Veremos si tu física aguanta el caos.')}
      ${!codiceOk ? '<p class="muted" style="text-align:center">Consejo de GAL-1: repasa el Códice antes de empezar.</p>' : ''}
      <div class="readout"><div>Mejor resultado<b>${ex.best} / ${N}</b></div><div>Intentos<b>${ex.attempts}</b></div></div>
      <button class="btn" data-start>▶ Comenzar examen</button>
      ${!codiceOk ? '<button class="btn teal" data-go="codice">◆ Repasar el Códice</button>' : ''}`;
    portraits();
    $('[data-start]').onclick = start;
    $('[data-go]')?.addEventListener('click', () => go(E.codice));
  }

  function start() {
    sfx.click();
    qs = makeExam(N, Math.random, E.bank);
    // 2 o 3 interferencias de Caos en posiciones al azar (nunca la primera pregunta).
    const slots = [1, 2, 3, 4, 5, 6, 7].sort(() => Math.random() - 0.5).slice(0, 2 + (Math.random() < 0.5 ? 1 : 0));
    slots.forEach((s, j) => (qs[s].interf = j % 2 ? 'reloj' : 'glitch'));
    k = 0; hits = 0; ask();
  }

  function ask() {
    stopTimers(); locked = false;
    const q = qs[k];
    el.innerHTML = `<h1 style="font-size:13px">PREGUNTA ${k + 1} / ${N}</h1>
      <div class="progress" aria-hidden="true">${qs.map((_, j) => `<i class="${j < k ? 'done' : j === k ? 'now' : ''}"></i>`).join('')}</div>
      ${q.interf ? `<div class="panel dialog interf"><span class="slot" data-who="caos"></span><div><h2 style="color:var(--magenta)">¡INTERFERENCIA!</h2><p>"${TAUNTS[(k + q.id.length) % TAUNTS.length]}"</p></div></div>` : ''}
      ${q.interf === 'reloj' ? `<div class="clock" role="timer" aria-live="off">⏱ <b id="clock">${CLOCK}</b> s</div>` : ''}
      <div class="panel question ${q.interf === 'glitch' ? 'glitch' : ''}"><span class="qtype">${q.tipo === 'calculo' ? 'CÁLCULO' : 'CONCEPTO'}</span>
        <p id="qtext">${q.interf === 'glitch' ? scramble(q.q, 1) : q.q}</p></div>
      ${q.interf === 'glitch' ? '<button class="btn teal" data-clean>◎ Limpiar señal<small>Toca para quitar la interferencia.</small></button>' : ''}
      <div class="opts" role="group" aria-label="Opciones">${q.opciones.map((o, j) => `<button class="btn ghost opt" data-i="${j}" ${q.interf === 'glitch' ? 'disabled' : ''}>${'ABCD'[j]}) ${o}</button>`).join('')}</div>
      <div id="fb" aria-live="polite"></div>`;
    portraits();
    el.querySelectorAll('.opt').forEach((b) => (b.onclick = () => answer(+b.dataset.i)));
    if (q.interf === 'glitch') {
      let f = 2;
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) glitchT = setInterval(() => { $('#qtext').textContent = scramble(q.q, f++); }, 180);
      $('[data-clean]').onclick = () => {
        clearInterval(glitchT); sfx.click();
        $('#qtext').textContent = q.q; $('.question').classList.remove('glitch'); $('[data-clean]').remove();
        el.querySelectorAll('.opt').forEach((b) => (b.disabled = false));
      };
    }
    if (q.interf === 'reloj') {
      let left = CLOCK;
      timer = setInterval(() => {
        left--; const c = $('#clock'); if (c) c.textContent = left;
        if (left <= 5) $('.clock')?.classList.add('hurry');
        if (left <= 0) answer(-1);
      }, 1000);
    }
  }

  function answer(i) {
    if (locked) return; locked = true; stopTimers();
    const q = qs[k], ok = i === q.correcta;
    if (ok) { hits++; sfx.win(); } else sfx.crash();
    el.querySelectorAll('.opt').forEach((b, j) => { b.disabled = true; if (j === q.correcta) { b.classList.add('right'); b.insertAdjacentHTML('afterbegin', '<span class="mark" aria-label="Correcta">✓ </span>'); } else if (j === i) { b.classList.add('wrong'); b.insertAdjacentHTML('afterbegin', '<span class="mark" aria-label="Tu respuesta, incorrecta">✗ </span>'); } });
    $('#fb').innerHTML = `<div class="verdict ${ok ? 'ok' : 'ko'}">${ok ? '¡CORRECTO!' : i === -1 ? '¡TIEMPO!' : 'INCORRECTO'}</div>
      <div class="panel dialog"><span class="slot" data-who="gal"></span><div><h2 style="color:var(--yellow)">GAL-1</h2><p>${q.explica}</p></div></div>
      <button class="btn" data-next>${k < N - 1 ? '▶ Siguiente pregunta' : '★ Ver resultado'}</button>`;
    portraits();
    $('[data-next]').onclick = () => { sfx.click(); k++; if (k < N) ask(); else finish(); };
    $('[data-next]').focus({ preventScroll: true });
    $('#fb').scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function finish() {
    const ex = get()[E.key], passed = hits >= PASS, first = passed && !ex.passed;
    set({ [E.key]: { best: Math.max(ex.best, hits), attempts: ex.attempts + 1, passed: ex.passed || passed } });
    if (first) { set({ rank: higherRank(get().rank, E.rank) }); addScore(5); }
    passed ? sfx.win() : sfx.crash();
    el.innerHTML = `<h1 style="font-size:15px">RESULTADO</h1>
      <div class="score-big ${passed ? 'ok' : 'ko'}">${hits} / ${N}</div>
      ${passed ? say('gal', first ? `¡Licencia aprobada! Desde hoy eres <b>${E.rank}</b> de la Red Postal. +5 ★` : `Aprobado otra vez. Tu licencia de ${E.rank} sigue vigente.`)
        : say('caos', `Solo ${hits}. Necesitabas ${PASS}. La entropía gana… por ahora.`)}
      ${passed ? say('nova', 'La energía no se destruye; se transforma en el impacto perfecto. ¡Vamos por las entregas!') : say('nova', 'Repasemos el Códice y lo intentamos de nuevo. Cada error es un dato.')}
      <button class="btn" data-again>↻ ${passed ? 'Repetir examen' : 'Intentar de nuevo'}</button>
      <button class="btn teal" data-go="${passed ? 'historia' : E.codice}">${passed ? '▶ Ir al mapa de misiones' : '◆ Repasar el Códice'}</button>`;
    portraits();
    $('[data-again]').onclick = start;
    $('[data-go]').onclick = (e) => go(e.currentTarget.dataset.go);
  }

  intro();
  return stopTimers;
}
