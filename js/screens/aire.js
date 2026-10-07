// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Simulador del Acto 2 (con aire): arrastre F = ½·ρ·Cd·A·v², velocidad terminal y paracaídas.
// #aire = simulador libre · #aire/m5 = misión. La caída se integra con paso fijo (js/physics.js → createFall)
// y se reproduce con «avance rápido» adaptativo para que una caída de minutos se vea en pocos segundos.
import { PLANETS } from '../data/planets.js';
import { OBJECTS } from '../data/objects.js';
import { CHUTES, OPEN_TIME, cdA } from '../data/paracaidas.js';
import { starsAir } from '../data/historia2.js';
import { createFall, vTerminal, ec, fmt } from '../physics.js';
import { sfx, fallStart, fallSpeed, fallStop } from '../audio.js';
import { get, set, addScore } from '../state.js';
import { draw as drawPx, pxCanvas, planetCanvas } from '../gfx/pixel.js';
import { PARABOLA, OBJ_SPRITES, CRACK, GAL1, PARACAIDAS, PARACAIDAS_MEDIO } from '../gfx/sprites.js';
import { background } from '../gfx/scenery.js';
import { drawVt, GW, GH } from '../ui/grafica.js';
import { missionById, isDone } from '../progress.js';
import { playScene } from '../ui/dialogo.js';
import { go } from '../nav.js';

const W = 120, H = 160, GROUND = 146, TOP = 14;
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
const FREE_PLANETS = PLANETS.filter((p) => p.act === 2 || p.id === 'luna'); // la Luna, para ver que sin aire el paracaídas no sirve
const REAL_SECONDS = 4; // duración aproximada en pantalla del tramo que falta

export default function aire(el, arg) {
  const mission = arg ? missionById(arg) : null;
  if (mission && mission.mode !== 'aire') { go('simulador/' + mission.id); return; }
  if (!mission && !isDone('m4')) return locked(el);
  const sab = new Set(mission?.sabotage || []);
  let obj = OBJECTS.find((o) => o.id === (mission?.obj || 'cel'));
  let pl = PLANETS.find((p) => p.id === (mission?.planet || 'tierra-aire'));
  let h0 = mission?.h0 || 100, chute = CHUTES[0], openAt = 0;
  let fall = null, running = false, raf = 0, last = 0, parts = [], broken = false, stopScene = null, pts = [], vPeak = 0, flash = 0;

  el.innerHTML = `
    <h1 style="font-size:15px">${mission ? 'MISIÓN: ' + mission.title.toUpperCase() : 'SIMULADOR · CON AIRE'}</h1>
    ${mission ? '' : '<div class="tabs" role="tablist"><a href="#simulador" role="tab">Sin aire</a><a href="#aire" role="tab" aria-selected="true" class="on">Con aire</a>' + (isDone('m8') ? '<a href="#impacto" role="tab">Impacto</a>' : '<span class="tab-off">⊘ Impacto</span>') + '</div>'}
    <div id="scene"></div>
    ${mission ? `<div class="panel mission"><h2>OBJETIVO</h2><p>${mission.brief}</p>
      <p class="muted">≤ <b style="color:var(--yellow)">${obj.limit} J</b> y ≤ <b style="color:var(--yellow)">${mission.tMax} s</b> · ★★★ en ≤ ${mission.t3} s · ★★ en ≤ ${mission.t2} s</p></div>`
      : '<div class="say"><span class="slot-gal"></span><p>GAL-1: "Con aire la energía ya no se conserva en el paquete. Mira la barra del aire y la gráfica."</p></div>'}
    <div class="stage"><canvas width="${W}" height="${H}" role="img" aria-label="Escenario de la caída con aire"></canvas></div>
    <div class="bars bars3">
      <span>Ep</span><div class="bar ep"><i id="b-ep"></i></div><span id="v-ep">0 J</span>
      <span>Ec</span><div class="bar ec"><i id="b-ec"></i></div><span id="v-ec">0 J</span>
      <span>Aire</span><div class="bar air"><i id="b-air"></i></div><span id="v-air">0 J</span>
    </div>
    <div class="readout">
      <div>Altura<b id="r-h">0 m</b></div><div>Velocidad<b id="r-v">0 m/s</b></div>
      <div>Tiempo<b id="r-t">0 s</b></div><div>V. terminal<b id="r-vt">–</b></div>
    </div>
    <div class="graph"><canvas width="${GW}" height="${GH}" role="img" aria-label="Gráfica de velocidad contra tiempo"></canvas>
      <p class="legend"><span><i class="lg-air"></i>con aire</span><span><i class="lg-vac"></i>sin aire</span><span><i class="lg-vt"></i>v terminal</span><span><i class="lg-max"></i>v máx. segura</span></p></div>
    <div id="verdict" class="verdict" aria-live="polite"></div>
    <div id="after"></div>
    <button class="btn" id="drop">▼ SOLTAR</button>
    <div class="panel">
      ${mission ? '' : '<h2>PAQUETE</h2><div class="row" id="objs"></div><h2 style="margin-top:12px">PLANETA</h2><div class="row" id="pls"></div>'}
      ${mission ? `<p class="lbl"><span>Altura de vuelo</span><span>${h0} m (fija)</span></p>`
        : `<label class="lbl" for="h"><span>Altura</span><span id="h-lbl"></span></label><input type="range" id="h" min="5" max="1000" step="5">`}
      <h2 style="margin-top:12px">PARACAÍDAS</h2><div class="row" id="chutes"></div>
      ${sab.has('tormenta') ? '<p class="lbl"><span>Apertura automática</span><span style="color:var(--magenta)">frita por la tormenta: usa ☂ ABRIR</span></p>'
        : '<label class="lbl" for="open"><span>Apertura automática</span><span id="open-lbl"></span></label><input type="range" id="open" min="0" step="1">'}
    </div>
    <div class="panel muted" id="hint"></div>`;

  const $ = (s) => el.querySelector(s);
  const cv = $('.stage canvas'), g = cv.getContext('2d');
  const gcv = $('.graph canvas'), gg = gcv.getContext('2d');
  g.imageSmoothingEnabled = false; gg.imageSmoothingEnabled = false;
  $('.slot-gal')?.replaceWith(pxCanvas(GAL1, { cls: 'avatar sm gal', label: 'GAL-1' }));

  const rho = () => pl.air || 0;
  const vtOf = (extra = 0) => vTerminal(obj.m, pl.g, rho(), obj.Cd * obj.A + extra);
  const vSafe = () => Math.sqrt((2 * obj.limit) / obj.m);
  const showVt = (v) => (sab.has('rho') ? '¿?' : Number.isFinite(v) ? fmt(v, 1) + ' m/s' : '∞ (sin aire)');

  function chips(box, list, cur, pick, ico) {
    box.innerHTML = list.map((o) => `<button class="chip ${o === cur ? 'on' : ''}" data-id="${o.id}" aria-pressed="${o === cur}">${ico ? '<span class="ico"></span>' : ''}${o.name}${o.g ? `<small>ρ = ${o.air || 0}</small>` : o.A ? `<small>A = ${o.A} m²</small>` : ''}</button>`).join('');
    box.querySelectorAll('.chip').forEach((b) => {
      const it = list.find((o) => o.id === b.dataset.id);
      if (ico) b.querySelector('.ico').appendChild(ico(it));
      b.onclick = () => { if (running) return; sfx.click(); pick(it); };
    });
  }
  function refreshUI() {
    if (!mission) {
      chips($('#objs'), OBJECTS, obj, (o) => { obj = o; reset(); }, (o) => pxCanvas(OBJ_SPRITES[o.id], { cls: 'px chip-px' }));
      chips($('#pls'), FREE_PLANETS, pl, (p) => { pl = p; reset(); }, (p) => planetCanvas(p, 16, 'px chip-px'));
      $('#h').value = h0; $('#h-lbl').textContent = h0 + ' m';
    }
    chips($('#chutes'), CHUTES, chute, (c) => { chute = c; reset(); });
    const op = $('#open');
    if (op) {
      op.max = h0; op.disabled = !chute.A; if (openAt > h0) openAt = 0; op.value = openAt;
      $('#open-lbl').textContent = !chute.A ? '—' : openAt > 0 ? `a ${openAt} m` : 'manual (☂ ABRIR)';
    }
    const vt0 = vtOf(), vt1 = chute.A ? vtOf(cdA(chute)) : null;
    $('#hint').innerHTML = `<b style="color:var(--yellow)">${obj.name}</b>: m = ${obj.m} kg · Cd·A = ${fmt(obj.Cd * obj.A, 4)} m² · aguanta ${obj.limit} J
      → v máx. segura = √(2·${obj.limit}/${obj.m}) = <b>${fmt(vSafe(), 2)} m/s</b>.<br>
      ${pl.name}: g = ${pl.g} m/s² · ρ = ${sab.has('rho') ? '<b style="color:var(--magenta)">¿? (dato borrado por Caos)</b>' : (pl.air || 0) + ' kg/m³'}${pl.note ? ' · ' + pl.note : ''}.<br>
      vt sin paracaídas: <b>${showVt(vt0)}</b>${vt1 !== null ? ` · con ${chute.name.toLowerCase()} (Cd·A = ${fmt(cdA(chute), 2)} m²): <b>${showVt(vt1)}</b>` : ''}.
      Pista: vt = √(2mg / (ρ·Cd·A)).`;
  }
  $('#h')?.addEventListener('input', (e) => { if (running) return; h0 = +e.target.value; reset(); });
  $('#open')?.addEventListener('input', (e) => { if (running) return; openAt = +e.target.value; refreshUI(); });

  function newFall() {
    return createFall({ m: obj.m, g: pl.g, h0, rho: rho(), CdA: obj.Cd * obj.A, chuteCdA: cdA(chute),
      openAt: sab.has('tormenta') ? 0 : openAt, openTime: OPEN_TIME });
  }
  function reset() {
    cancelAnimationFrame(raf); fallStop(); running = false; broken = false; parts = []; pts = [[0, 0]]; vPeak = 0;
    fall = newFall();
    $('#verdict').textContent = ''; $('#verdict').className = 'verdict'; $('#after').innerHTML = '';
    $('#drop').textContent = '▼ SOLTAR'; $('#drop').classList.remove('teal');
    refreshUI(); show();
  }

  function show() {
    const s = fall.s, E0 = fall.E0, ep = obj.m * pl.g * s.h, k = ec(obj.m, s.v);
    const pct = (x) => Math.max(0, Math.min(100, (100 * x) / E0)) + '%';
    $('#b-ep').style.width = pct(ep); $('#b-ec').style.width = pct(k); $('#b-air').style.width = pct(s.lost);
    $('#v-ep').textContent = fmt(ep, 1) + ' J'; $('#v-ec').textContent = fmt(k, 1) + ' J'; $('#v-air').textContent = fmt(Math.max(0, s.lost), 1) + ' J';
    $('#r-h').textContent = fmt(s.h, 1) + ' m'; $('#r-v').textContent = fmt(s.v, 2) + ' m/s';
    $('#r-t').textContent = fmt(s.t, 1) + ' s'; $('#r-vt').textContent = showVt(fall.vt());
    drawStage(s); drawGraph(s);
  }

  function drawGraph(s) {
    const T0 = Math.sqrt((2 * h0) / pl.g), V0 = Math.sqrt(2 * pl.g * h0);
    drawVt(gg, {
      tMax: Math.max(T0, s.t) * 1.05, vMax: Math.max(V0, vPeak) * 1.05,
      curves: [{ pts: [[0, 0], [T0, V0]], color: '#2de2c8', dash: true }, { pts, color: '#ff8a1f' }],
      lines: [{ v: sab.has('rho') ? 0 : fall.vt(), color: '#ff3fa4', label: sab.has('rho') ? '' : 'vt' }, { v: vSafe(), color: '#ffe66d', label: 'máx' }],
    });
  }

  function drawStage(s) {
    g.drawImage(background(pl, W, H, GROUND), 0, 0);
    const yOf = (h) => GROUND - (h / h0) * (GROUND - TOP);
    g.fillStyle = '#ffffff88';
    for (let k = 0; k <= 5; k++) { const y = Math.round(yOf((h0 * k) / 5)); g.fillRect(2, y, k % 5 ? 3 : 6, 1); }
    if (openAt > 0 && chute.A && !sab.has('tormenta')) { g.fillStyle = '#ff3fa4'; const y = Math.round(yOf(openAt)); for (let x = 2; x < W - 2; x += 4) g.fillRect(x, y, 2, 1); }
    const bob = REDUCE.matches ? 0 : Math.round(Math.sin(performance.now() / 400));
    drawPx(g, PARABOLA, 48, 1 + bob);
    const x = 56, y = Math.round(yOf(s.h)) - 4;
    if (s.v > 2 && s.h > 0) { g.fillStyle = '#ffffff55'; for (let k = 1; k < Math.min(5, 1 + s.v / 8); k++) g.fillRect(x + 3, y - k * 4, 2, 2); }
    if (s.chute >= 0 && !s.landed) drawPx(g, s.chute < OPEN_TIME ? PARACAIDAS_MEDIO : PARACAIDAS, x - 2, y - 8);
    drawPx(g, OBJ_SPRITES[obj.id], x, y);
    if (broken) { g.fillStyle = '#0a0d22'; CRACK.forEach(([a, b]) => g.fillRect(x + a, y + b, 1, 1)); }
    if (sab.has('tormenta')) storm();
    parts.forEach((p) => { g.fillStyle = p.c; g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); });
  }
  function storm() { // lluvia diagonal y relámpagos (sin destellos con movimiento reducido)
    const t = REDUCE.matches ? 0 : performance.now() / 60;
    g.fillStyle = '#9fc8ff66';
    for (let i = 0; i < 40; i++) { const x = (i * 29 + t * 2) % W, y = (i * 47 + t * 5) % GROUND; g.fillRect(Math.round(x), Math.round(y), 1, 3); }
    if (!REDUCE.matches && running && Math.random() < 0.01) flash = 3;
    if (flash > 0) { flash--; g.fillStyle = '#ffffff55'; g.fillRect(0, 0, W, GROUND); }
  }

  function drop() {
    if (running) { // durante la caída el botón abre el paracaídas
      if (chute.A && fall.s.chute < 0) { fall.deploy(); sfx.launch(); $('#drop').textContent = '☂ PARACAÍDAS ABIERTO'; }
      return;
    }
    reset(); running = true; sfx.launch(); fallStart();
    if (chute.A) { $('#drop').textContent = '☂ ABRIR PARACAÍDAS'; $('#drop').classList.add('teal'); }
    last = performance.now();
    let nextPt = 0;
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const s = fall.s, vtNow = fall.vt();
      const ref = Math.max(s.v, 0.3 * Math.min(vtNow, Math.sqrt(2 * pl.g * Math.max(s.h, 0.01))), 0.05);
      const warp = Math.max(1, Math.min(300, s.h / ref / REAL_SECONDS));
      const target = s.t + dt * warp;
      while (!s.landed && s.t < target) {
        fall.step();
        if (s.t >= nextPt || s.landed) { pts.push([s.t, s.v]); vPeak = Math.max(vPeak, s.v); nextPt = s.t + Math.max(1 / 30, s.t / 400); }
      }
      if (chute.A && s.chute >= 0) $('#drop').textContent = '☂ PARACAÍDAS ABIERTO';
      fallSpeed(s.v); show();
      $('#r-t').textContent = fmt(s.t, 1) + ' s' + (warp > 1.5 && !s.landed ? ` »×${Math.round(warp)}` : '');
      if (!s.landed) { raf = requestAnimationFrame(loop); return; }
      fallStop(); land(); anim();
    };
    raf = requestAnimationFrame(loop);
  }
  function anim() {
    const step = () => {
      parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; }); parts = parts.filter((p) => p.y < GROUND + 6);
      drawStage(fall.s); if (parts.length) raf = requestAnimationFrame(step); else running = false;
    };
    raf = requestAnimationFrame(step);
  }

  function land() {
    const s = fall.s, E = ec(obj.m, s.v), ratio = E / obj.limit;
    broken = ratio > 1; running = true;
    $('#drop').textContent = '▼ SOLTAR'; $('#drop').classList.remove('teal');
    const n = broken ? 26 : 8, col = broken ? obj.color : pl.ground;
    for (let i = 0; i < n; i++) parts.push({ x: 60, y: GROUND, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * (broken ? 3 : 1.5), c: col });
    const V0 = Math.sqrt(2 * pl.g * h0), E0 = fall.E0;
    const cmp = `<span class="cmp">Sin aire: ${fmt(V0, 1)} m/s y ${fmt(E0, 1)} J${E0 > obj.limit ? ' (se rompía)' : ''}. Con aire: ${fmt(s.v, 1)} m/s; el aire se llevó ${Math.round((100 * s.lost) / E0)} % de la energía.</span>`;
    if (mission) return missionResult(E, s.t, cmp);
    const vd = $('#verdict');
    if (broken) { sfx.crash(); vd.className = 'verdict ko'; vd.innerHTML = `¡CRASH! ${fmt(E, 1)} J > ${obj.limit} J<br>${cmp}`; return; }
    sfx.thud(); setTimeout(sfx.win, 250);
    const key = 'aire:' + obj.id + '@' + pl.id, combos = { ...get().combos };
    const isNew = !combos[key];
    if (isNew) { combos[key] = 1; set({ combos }); addScore(1); }
    vd.className = 'verdict ok';
    vd.innerHTML = `¡ENTREGADO! ${fmt(E, 2)} J ≤ ${obj.limit} J en ${fmt(s.t, 1)} s${isNew ? ' · +1 ★' : ''}<br>${cmp}`;
  }

  function missionResult(E, t, cmp) {
    const vd = $('#verdict'), stars = starsAir(mission, E, obj.limit, t);
    if (!stars) {
      broken ? sfx.crash() : sfx.thud();
      vd.className = 'verdict ko';
      vd.innerHTML = broken
        ? `¡CRASH! ${fmt(E, 2)} J > ${obj.limit} J<br><span class="muted cmp">Dr. Caos: "El aire es mío, cadete."</span>${cmp}`
        : `MUY TARDE: ${fmt(t, 1)} s > ${mission.tMax} s<br><span class="muted cmp">GAL-1: "Llegó entero, pero la colonia no podía esperar. Abre más abajo."</span>`;
      return;
    }
    sfx.thud(); setTimeout(sfx.win, 250);
    const prev = get().missions[mission.id] || 0;
    if (stars > prev) set({ missions: { ...get().missions, [mission.id]: stars } });
    if (!prev) addScore(5);
    vd.className = 'verdict ok';
    vd.innerHTML = `¡ENTREGA PERFECTA! ${fmt(E, 2)} J en ${fmt(t, 1)} s<br><span class="cmp" style="color:var(--yellow)">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}${prev ? '' : ' · +5 ★'}</span>${cmp}`;
    const after = () => {
      $('#after').innerHTML = `<button class="btn" data-map>▶ Volver al mapa</button>${stars < 3 ? `<button class="btn ghost" data-retry>↻ Reintentar por 3 ★ (≤ ${mission.t3} s)</button>` : ''}`;
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

function locked(el) {
  el.innerHTML = `<h1 style="font-size:15px">SIMULADOR · CON AIRE</h1>
    <div class="panel dialog"><span class="slot"></span><div><h2 style="color:var(--yellow)">GAL-1</h2>
    <p>"Mis sensores de atmósfera se calibran al completar el Acto 1. Termina la misión de Júpiter."</p></div></div>
    <button class="btn" data-map>▶ Ir al mapa de misiones</button><button class="btn ghost" data-sim>◎ Simulador sin aire</button>`;
  el.querySelector('.slot').replaceWith(pxCanvas(GAL1, { cls: 'avatar sm gal', label: 'GAL-1' }));
  el.querySelector('[data-map]').onclick = () => go('historia');
  el.querySelector('[data-sim]').onclick = () => go('simulador');
}
