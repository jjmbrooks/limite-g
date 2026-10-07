import { PLANETS } from '../data/planets.js';
import { OBJECTS } from '../data/objects.js';
import { stateAt, tFall, vImpact, ep, fmt } from '../physics.js';
import { sfx, fallStart, fallSpeed, fallStop } from '../audio.js';
import { get, set, addScore } from '../state.js';
import { draw as drawPx, pxCanvas, planetCanvas } from '../gfx/pixel.js';
import { PARABOLA, OBJ_SPRITES, CRACK, GAL1 } from '../gfx/sprites.js';
import { background } from '../gfx/scenery.js';
import { starsFor } from '../data/historia.js';
import { missionById, missionRoute, isDone } from '../progress.js';
import { playScene } from '../ui/dialogo.js';
import { go } from '../nav.js';

const W = 120, H = 160, GROUND = 146, TOP = 14; // resolución lógica pixel art
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
const H_MIN = 0.1, H_MAX = 50;

// Simulador libre (#simulador) o misión de altura exacta (#simulador/m1).
export default function simulador(el, arg) {
  const mission = arg ? missionById(arg) : null;
  if (mission && mission.mode !== 'vacio') { go(missionRoute(mission)); return; }
  const sab = new Set(mission?.sabotage || []);
  let obj = mission ? OBJECTS.find((o) => o.id === mission.obj) : OBJECTS[0];
  let pl = mission ? PLANETS.find((p) => p.id === mission.planet) : PLANETS[2];
  let h0 = mission ? 1 : 2, running = false, raf = 0, parts = [], broken = false, stopScene = null;

  el.innerHTML = `
    <h1 style="font-size:15px">${mission ? 'MISIÓN: ' + mission.title.toUpperCase() : 'SIMULADOR'}</h1>
    ${mission ? '' : `<div class="tabs" role="tablist"><a href="#simulador" role="tab" aria-selected="true" class="on">Sin aire</a>${isDone('m4') ? '<a href="#aire" role="tab">Con aire</a>' : '<span class="tab-off" title="Completa el Acto 1">⊘ Con aire</span>'}${isDone('m8') ? '<a href="#impacto" role="tab">Impacto</a>' : '<span class="tab-off" title="Completa el Acto 2">⊘ Impacto</span>'}</div>`}
    <div id="scene"></div>
    ${mission ? `<div class="panel mission"><h2>OBJETIVO</h2><p>${mission.brief}</p>
      <p class="muted">Ventana: <b style="color:var(--yellow)">${fmt(obj.limit * mission.lo, 2)} J – ${fmt(obj.limit * mission.hi, 2)} J</b></p></div>`
      : '<div class="say"><span class="slot-gal"></span><p>GAL-1: "Prueba con un dummy antes de arriesgar el paquete real."</p></div>'}
    <div class="stage"><canvas width="${W}" height="${H}" role="img" aria-label="Escenario de la caída"></canvas></div>
    <div class="bars">
      <span>Ep</span><div class="bar ep"><i id="b-ep"></i></div><span id="v-ep">0 J</span>
      <span>Ec</span><div class="bar ec"><i id="b-ec"></i></div><span id="v-ec">0 J</span>
    </div>
    <div class="readout">
      <div>Altura<b id="r-h">0 m</b></div><div>Velocidad<b id="r-v">0 m/s</b></div>
      <div>Tiempo<b id="r-t">0 s</b></div><div>Límite G<b id="r-l">0 J</b></div>
    </div>
    <div id="verdict" class="verdict" aria-live="polite"></div>
    <div id="after"></div>
    <button class="btn" id="drop">▼ SOLTAR</button>
    <div class="panel">
      ${mission ? '' : '<h2>PAQUETE</h2><div class="row" id="objs"></div><h2 style="margin-top:12px">PLANETA</h2><div class="row" id="pls"></div>'}
      ${sab.has('regla')
        ? `<label class="lbl" for="hnum"><span>Altura (m) <span style="color:var(--magenta)">· regla borrada por Caos</span></span></label>
           <input type="text" inputmode="decimal" id="hnum" class="num" autocomplete="off" placeholder="Escribe la altura, p. ej. 2.5">`
        : `<label class="lbl" for="h"><span>Altura</span><span id="h-lbl"></span></label>
           <input type="range" id="h" min="0.2" max="${H_MAX}" step="0.1">`}
    </div>
    <div class="panel muted" id="hint"></div>`;

  const $ = (s) => el.querySelector(s);
  const cv = $('.stage canvas'), g = cv.getContext('2d');
  g.imageSmoothingEnabled = false;
  $('.slot-gal')?.replaceWith(pxCanvas(GAL1, { cls: 'avatar sm gal', label: 'GAL-1' }));

  const chips = (box, list, cur, pick) => {
    box.innerHTML = list.map((o) => `<button class="chip ${o === cur ? 'on' : ''}" data-id="${o.id}" aria-pressed="${o === cur}"><span class="ico"></span>${o.name}${o.g ? `<small>g = ${o.g}</small>` : ''}</button>`).join('');
    box.querySelectorAll('.chip').forEach((b) => {
      const it = list.find((o) => o.id === b.dataset.id);
      b.querySelector('.ico').appendChild(it.g ? planetCanvas(it, 16, 'px chip-px') : pxCanvas(OBJ_SPRITES[it.id], { cls: 'px chip-px' }));
      b.onclick = () => { if (running) return; sfx.click(); pick(it); };
    });
  };
  function refreshUI() {
    if (!mission) {
      chips($('#objs'), OBJECTS, obj, (o) => { obj = o; reset(); });
      chips($('#pls'), PLANETS.filter((p) => p.act === 1), pl, (p) => { pl = p; reset(); });
    }
    if ($('#h')) { $('#h').value = h0; $('#h-lbl').textContent = fmt(h0, 1) + ' m'; }
    const gTxt = sab.has('g') ? '<b style="color:var(--magenta)">g = ¿? (dato borrado por Caos)</b>' : `g = ${pl.g} m/s²`;
    $('#hint').innerHTML = `<b style="color:var(--yellow)">${obj.name}</b>: m = ${obj.m} kg · aguanta hasta ${obj.limit} J.<br>
      En ${pl.name} (${gTxt})${pl.note ? ', ' + pl.note : ''}. ${mission ? 'Pista: h = E / (m·g).' : '¿Desde qué altura sobrevive? Pista: Ep = m·g·h.'}`;
  }
  $('#h')?.addEventListener('input', (e) => { if (running) return; h0 = +e.target.value; reset(); });
  $('#hnum')?.addEventListener('input', (e) => {
    if (running) return;
    const v = parseFloat(e.target.value.replace(',', '.'));
    e.target.classList.toggle('bad', !(v >= H_MIN && v <= H_MAX));
    if (v >= H_MIN && v <= H_MAX) { h0 = v; reset(); }
  });

  function reset() {
    cancelAnimationFrame(raf); fallStop(); running = false; broken = false; parts = [];
    $('#verdict').textContent = ''; $('#verdict').className = 'verdict'; $('#after').innerHTML = '';
    refreshUI(); show(0);
  }

  function show(t) {
    const s = stateAt(obj.m, pl.g, h0, t);
    const pct = (x) => (s.total ? (100 * x) / s.total : 0) + '%';
    $('#b-ep').style.width = pct(s.ep); $('#b-ec').style.width = pct(s.ec);
    const hide = sab.has('g') && !running && t === 0; // con g borrada no se regala la Ep antes de soltar
    $('#v-ep').textContent = hide ? '¿? J' : fmt(s.ep, 2) + ' J'; $('#v-ec').textContent = fmt(s.ec, 2) + ' J';
    $('#r-h').textContent = fmt(s.h, 2) + ' m'; $('#r-v').textContent = fmt(s.v, 2) + ' m/s';
    $('#r-t').textContent = fmt(t, 2) + ' s'; $('#r-l').textContent = obj.limit + ' J';
    draw(s); return s;
  }

  function draw(s) {
    g.drawImage(background(pl, W, H, GROUND), 0, 0);
    const yOf = (h) => GROUND - (h / h0) * (GROUND - TOP);
    if (!sab.has('regla')) { // regla de altura
      g.fillStyle = '#ffffff88';
      for (let k = 0; k <= 5; k++) { const y = Math.round(yOf((h0 * k) / 5)); g.fillRect(2, y, k % 5 ? 3 : 6, 1); }
    } else { g.fillStyle = '#ff3fa4'; for (let y = TOP; y < GROUND; y += 6) g.fillRect(2 + ((y / 6) % 2), y, 2, 2); }
    const bob = REDUCE.matches ? 0 : Math.round(Math.sin(performance.now() / 400));
    drawPx(g, PARABOLA, 48, 1 + bob);
    const y = Math.round(yOf(s.h)) - 4, x = 56;
    if (s.h > 0) { const k = 1 - s.h / h0, sw = 2 + Math.round(k * 8); g.fillStyle = '#00000066'; g.fillRect(60 - sw / 2, GROUND + 4, sw, 1); }
    if (s.v > 2 && s.h > 0) { g.fillStyle = '#ffffff55'; for (let k = 1; k < 4; k++) g.fillRect(x + 3, y - k * 4, 2, 2); }
    drawPx(g, OBJ_SPRITES[obj.id], x, y);
    if (broken) { g.fillStyle = '#0a0d22'; CRACK.forEach(([a, b]) => g.fillRect(x + a, y + b, 1, 1)); }
    parts.forEach((p) => { g.fillStyle = p.c; g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); });
  }

  function drop() {
    if (running) return;
    if ($('#hnum') && !($('#hnum').value.trim())) { $('#hnum').classList.add('bad'); $('#hnum').focus(); return; }
    reset(); running = true; sfx.launch(); fallStart();
    const T = tFall(pl.g, h0), start = performance.now();
    const loop = (now) => {
      const t = Math.min((now - start) / 1000, T); const s = show(t); fallSpeed(s.v);
      if (t < T) { raf = requestAnimationFrame(loop); return; }
      fallStop(); land(); anim();
    };
    raf = requestAnimationFrame(loop);
  }
  function anim() { // partículas tras el impacto
    const step = () => {
      parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; }); parts = parts.filter((p) => p.y < GROUND + 6);
      draw(stateAt(obj.m, pl.g, h0, 999)); if (parts.length) raf = requestAnimationFrame(step); else running = false;
    };
    raf = requestAnimationFrame(step);
  }
  function land() {
    const E = ep(obj.m, pl.g, h0), v = vImpact(pl.g, h0), ratio = E / obj.limit;
    broken = ratio > 1;
    const n = broken ? 26 : 8, col = broken ? obj.color : pl.ground;
    for (let i = 0; i < n; i++) parts.push({ x: 60, y: GROUND, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * (broken ? 3 : 1.5), c: col });
    $('#r-v').textContent = fmt(v, 2) + ' m/s';
    if (mission) return missionResult(E, ratio);
    const vd = $('#verdict');
    if (broken) { sfx.crash(); vd.className = 'verdict ko'; vd.innerHTML = `¡CRASH! ${fmt(E, 1)} J > ${obj.limit} J<br><span class="muted" style="font-family:VT323;font-size:20px">Dr. Caos: "¿Lo ves? Todo lo que cae, se destruye."</span>`; return; }
    sfx.thud(); setTimeout(sfx.win, 250);
    const key = obj.id + '@' + pl.id, combos = { ...get().combos };
    let pts = 0, msg = '';
    if (!combos[key]) { pts += 1; msg = '+1 ★ entrega nueva'; }
    if (ratio >= 0.8 && !(combos[key] >= 2)) { pts += 3; msg += (msg ? ' · ' : '') + '+3 ★ ¡al límite!'; combos[key] = 2; }
    else combos[key] = combos[key] || 1;
    set({ combos }); if (pts) addScore(pts);
    vd.className = 'verdict ok';
    vd.innerHTML = `¡ENTREGADO! ${fmt(E, 1)} J ≤ ${obj.limit} J<br><span style="font-family:VT323;font-size:20px;color:var(--yellow)">${msg || 'Usó el ' + Math.round(ratio * 100) + '% de su Límite G'}</span>`;
  }

  function missionResult(E, ratio) {
    const vd = $('#verdict'), pctTxt = Math.round(ratio * 100) + ' % del Límite G';
    const ok = ratio >= mission.lo && ratio <= mission.hi;
    if (!ok) {
      broken ? sfx.crash() : sfx.thud();
      vd.className = 'verdict ko';
      vd.innerHTML = broken
        ? `¡CRASH! ${fmt(E, 2)} J > ${obj.limit} J<br><span class="muted" style="font-family:VT323;font-size:20px">Dr. Caos: "Confeti interplanetario. ¡Ja!"</span>`
        : `MUY BAJO: ${fmt(E, 2)} J (${pctTxt})<br><span class="muted" style="font-family:VT323;font-size:20px">GAL-1: "Llegó entero, pero gastamos combustible de más. Sube un poco."</span>`;
      return;
    }
    sfx.thud(); setTimeout(sfx.win, 250);
    const stars = starsFor(ratio), prev = get().missions[mission.id] || 0;
    if (stars > prev) set({ missions: { ...get().missions, [mission.id]: stars } });
    if (!prev) addScore(5);
    vd.className = 'verdict ok';
    vd.innerHTML = `¡ENTREGA PERFECTA! ${fmt(E, 2)} J<br><span style="font-family:VT323;font-size:22px;color:var(--yellow)">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)} · ${pctTxt}${prev ? '' : ' · +5 ★'}</span>`;
    const after = () => {
      $('#after').innerHTML = `<button class="btn" data-map>▶ Volver al mapa</button>${stars < 3 ? '<button class="btn ghost" data-retry>↻ Reintentar por 3 ★ (≥ 95 %)</button>' : ''}`;
      $('[data-map]').onclick = () => go('historia');
      $('[data-retry]')?.addEventListener('click', () => reset());
    };
    if (!prev && mission.post?.length) setTimeout(() => { stopScene = playScene($('#scene'), mission.post, after); $('#scene').scrollIntoView({ block: 'nearest' }); }, 700);
    else after();
  }

  $('#drop').onclick = drop;
  reset();
  if (mission?.pre?.length) stopScene = playScene($('#scene'), mission.pre);
  return () => { cancelAnimationFrame(raf); fallStop(); stopScene && stopScene(); };
}
