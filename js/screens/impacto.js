// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Simulador del Acto 3 (impacto): F_media · d = Ec. El jugador elige suelo y diseña la funda (material + grosor).
// #impacto = simulador libre · #impacto/m9 = misión. Caída sin aire (js/physics.js → stateAt) y zoom del frenado.
import { PLANETS } from '../data/planets.js';
import { OBJECTS } from '../data/objects.js';
import { SUELOS, FUNDAS, T_MAX, sideOf } from '../data/impacto.js';
import { starsImpact } from '../data/historia3.js';
import { stateAt, tFall, impact, fMax, D_PAQUETE, fmt } from '../physics.js';
import { sfx, fallStart, fallSpeed, fallStop } from '../audio.js';
import { get, set, addScore } from '../state.js';
import { draw as drawPx, sprite, pxCanvas, planetCanvas } from '../gfx/pixel.js';
import { PARABOLA, OBJ_SPRITES, CRACK, GAL1 } from '../gfx/sprites.js';
import { background } from '../gfx/scenery.js';
import { missionById, isDone } from '../progress.js';
import { playScene } from '../ui/dialogo.js';
import { go } from '../nav.js';

const W = 120, H = 160, GROUND = 146, TOP = 14;
const ZW = 120, ZH = 84, ZG = 62, S = 2; // zoom: suelo en y = 62, 2 px por centímetro
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
const FREE_PLANETS = PLANETS.filter((p) => p.act === 3 || p.id === 'tierra');
const cm = (m) => fmt(m * 100, 1) + ' cm';

export default function impacto(el, arg) {
  const mission = arg ? missionById(arg) : null;
  if (mission && mission.mode !== 'impacto') { go('simulador/' + mission.id); return; }
  if (!mission && !isDone('m8')) return locked(el);
  const sab = new Set(mission?.sabotage || []);
  const soils = mission ? SUELOS.filter((s) => mission.soils.includes(s.id)) : SUELOS;
  let obj = OBJECTS.find((o) => o.id === (mission?.obj || 'huevo'));
  let pl = PLANETS.find((p) => p.id === (mission?.planet || 'europa'));
  let h0 = mission?.h0 || 20, soil = soils[0], funda = FUNDAS[0], t = 0, actual = soil;
  let running = false, raf = 0, parts = [], broken = false, stopScene = null, squash = 0, fallH = h0;

  el.innerHTML = `
    <h1 style="font-size:15px">${mission ? 'MISIÓN: ' + mission.title.toUpperCase() : 'SIMULADOR · IMPACTO'}</h1>
    ${mission ? '' : '<div class="tabs" role="tablist"><a href="#simulador" role="tab">Sin aire</a><a href="#aire" role="tab">Con aire</a><a href="#impacto" role="tab" aria-selected="true" class="on">Impacto</a></div>'}
    <div id="scene"></div>
    ${mission ? `<div class="panel mission"><h2>OBJETIVO</h2><p>${mission.brief}</p>
      <p class="muted">F media ≤ <b style="color:var(--yellow)">F máx</b> · ★★★ con funda ≤ ${Math.round(mission.c3 * 100)} % de la masa del paquete · ★★ ≤ ${Math.round(mission.c2 * 100)} %</p></div>`
      : '<div class="say"><span class="slot-gal"></span><p>GAL-1: "F · d = Ec. Diseña la funda y elige el suelo: más distancia de frenado, menos fuerza."</p></div>'}
    <div class="stage"><canvas width="${W}" height="${H}" role="img" aria-label="Escenario de la caída"></canvas></div>
    <div class="zoom"><canvas width="${ZW}" height="${ZH}" role="img" aria-label="Zoom del impacto: funda y suelo"></canvas><p class="legend">ZOOM DEL IMPACTO · 1 cm = 2 px</p></div>
    <div class="fmeter" aria-hidden="true"><span>F</span><div class="bar fm"><i id="b-f"></i><b class="fm-max"></b></div><span id="v-f">–</span></div>
    <div class="readout">
      <div>Ec impacto<b id="r-e">0 J</b></div><div>Frenado d<b id="r-d">0 cm</b></div>
      <div>F media<b id="r-f">–</b></div><div>F máx<b id="r-m">0 N</b></div>
    </div>
    <div id="verdict" class="verdict" aria-live="polite"></div>
    <div id="after"></div>
    <button class="btn" id="drop">▼ SOLTAR</button>
    <div class="panel">
      ${mission ? `<p class="lbl"><span>Altura de vuelo</span><span>${h0} m (fija)</span></p>`
        : '<h2>PAQUETE</h2><div class="row" id="objs"></div><h2 style="margin-top:12px">LUNA / PLANETA</h2><div class="row" id="pls"></div><label class="lbl" for="h"><span>Altura</span><span id="h-lbl"></span></label><input type="range" id="h" min="1" max="500" step="1">'}
      <h2 style="margin-top:12px">SUELO${sab.has('suelo') ? ' <span style="color:var(--magenta)">· lo elige Caos al soltar</span>' : ''}</h2><div class="row" id="soils"></div>
      <h2 style="margin-top:12px">FUNDA</h2><div class="row" id="fundas"></div>
      <label class="lbl" for="t"><span>Grosor de la funda</span><span id="t-lbl"></span></label>
      <input type="range" id="t" min="0" max="${T_MAX * 100}" step="0.1">
    </div>
    <div class="panel muted" id="hint"></div>`;

  const $ = (q) => el.querySelector(q);
  const cv = $('.stage canvas'), g = cv.getContext('2d'), zg = $('.zoom canvas').getContext('2d');
  g.imageSmoothingEnabled = false; zg.imageSmoothingEnabled = false;
  $('.slot-gal')?.replaceWith(pxCanvas(GAL1, { cls: 'avatar sm gal', label: 'GAL-1' }));
  const FM = () => fMax(obj.limit);
  const calc = (s = soil) => impact({ m: obj.m, g: pl.g, h: h0, side: sideOf(obj), soilD: s.d, mat: funda.rho ? funda : null, t: funda.rho ? t : 0 });
  const worst = () => SUELOS.reduce((a, b) => (b.d < a.d ? b : a));

  function chips(box, list, cur, pick, ico, sub) {
    box.innerHTML = list.map((o) => `<button class="chip ${o === cur ? 'on' : ''}" data-id="${o.id}" aria-pressed="${o === cur}">${ico ? '<span class="ico"></span>' : ''}${o.name}${sub ? `<small>${sub(o)}</small>` : ''}</button>`).join('');
    box.querySelectorAll('.chip').forEach((b) => {
      const it = list.find((o) => o.id === b.dataset.id);
      if (ico) b.querySelector('.ico').appendChild(ico(it));
      if (sab.has('suelo') && box.id === 'soils') b.disabled = true;
      b.onclick = () => { if (running) return; sfx.click(); pick(it); };
    });
  }
  function refreshUI() {
    if (!mission) {
      chips($('#objs'), OBJECTS, obj, (o) => { obj = o; reset(); }, (o) => pxCanvas(OBJ_SPRITES[o.id], { cls: 'px chip-px' }));
      chips($('#pls'), FREE_PLANETS, pl, (p) => { pl = p; reset(); }, (p) => planetCanvas(p, 16, 'px chip-px'), (p) => 'g = ' + p.g);
      $('#h').value = h0; $('#h-lbl').textContent = h0 + ' m';
    }
    chips($('#soils'), soils, sab.has('suelo') ? null : soil, (s) => { soil = s; reset(); }, null, (s) => 'se hunde ' + cm(s.d));
    chips($('#fundas'), FUNDAS, funda, (f) => { funda = f; if (f.rho && !t) t = 0.02; reset(); }, null, (f) => (f.rho ? `${f.rho} kg/m³ · k ${f.k}` : 'sin protección'));
    $('#t').value = t * 100; $('#t').disabled = !funda.rho;
    $('#t-lbl').textContent = funda.rho ? cm(t) : '—';
    const r = calc(sab.has('suelo') ? worst() : soil);
    $('#hint').innerHTML = `<b style="color:var(--yellow)">${obj.name}</b>: m = ${obj.m} kg · aguanta ${obj.limit} J sobre concreto (se deforma ${cm(D_PAQUETE)})
      → F máx = ${obj.limit} / ${D_PAQUETE} = <b>${fmt(FM(), 0)} N</b>.<br>
      Funda: ${funda.rho ? `${funda.name.toLowerCase()} de ${cm(t)} → se comprime ${funda.k} × ${cm(t)} = ${cm(r.dCase)} y pesa <b>${fmt(r.mc * 1000, 1)} g</b> (${Math.round((100 * r.mc) / obj.m)} % del paquete)` : 'ninguna'}.<br>
      ${pl.name}: g = ${pl.g} m/s²${pl.note ? ', ' + pl.note : ''}. Ec = (m + m funda)·g·h = ${fmt(r.mTot, 3)} × ${pl.g} × ${h0} = <b>${fmt(r.E, 2)} J</b>.<br>
      d = 0.2 cm + suelo + funda${sab.has('suelo') ? ' (peor caso: concreto)' : ''} = <b>${cm(r.d)}</b>. Pista: F = Ec / d.`;
  }
  $('#h')?.addEventListener('input', (e) => { if (running) return; h0 = +e.target.value; reset(); });
  $('#t').addEventListener('input', (e) => { if (running) return; t = +e.target.value / 100; reset(); });

  function reset() {
    cancelAnimationFrame(raf); fallStop(); running = false; broken = false; parts = []; squash = 0; fallH = h0;
    actual = sab.has('suelo') ? null : soil;
    $('#verdict').textContent = ''; $('#verdict').className = 'verdict'; $('#after').innerHTML = '';
    refreshUI(); readouts(null); drawStage(); drawZoom();
  }
  // Valores: antes de soltar en misión no se regala la fuerza (se calcula con lápiz); en libre se ve todo.
  function readouts(r) {
    const pre = calc(actual || worst());
    const show = r || (!mission ? pre : null);
    $('#r-e').textContent = fmt(pre.E, 2) + ' J'; $('#r-d').textContent = cm(pre.d) + (actual ? '' : ' *');
    $('#r-m').textContent = fmt(FM(), 0) + ' N';
    $('#r-f').textContent = show ? fmt(show.F, 0) + ' N' : '¿?';
    const q = show ? show.F / FM() : 0;
    $('#b-f').style.width = Math.min(100, (q / 1.5) * 100) + '%'; $('#b-f').classList.toggle('over', q > 1);
    $('#v-f').textContent = show ? Math.round(q * 100) + ' %' : '–';
  }

  function drawStage() {
    g.drawImage(background(pl, W, H, GROUND), 0, 0);
    const sl = actual || { color: '#3c4466' };
    g.fillStyle = sl.color; g.fillRect(40, GROUND + 3, 40, 3); // plataforma de aterrizaje
    const yOf = (h) => GROUND - (h / h0) * (GROUND - TOP);
    g.fillStyle = '#ffffff88';
    for (let k = 0; k <= 5; k++) { const y = Math.round(yOf((h0 * k) / 5)); g.fillRect(2, y, k % 5 ? 3 : 6, 1); }
    drawPx(g, PARABOLA, 48, 1 + (REDUCE.matches ? 0 : Math.round(Math.sin(performance.now() / 400))));
    const x = 56, y = Math.round(yOf(fallH)) - 4, th = funda.rho ? Math.min(3, 1 + Math.round(t * 25)) : 0;
    if (th) { g.fillStyle = funda.color; g.fillRect(x - th, y - th, 8 + 2 * th, 8 + 2 * th); }
    drawPx(g, OBJ_SPRITES[obj.id], x, y);
    if (broken) { g.fillStyle = '#0a0d22'; CRACK.forEach(([a, b]) => g.fillRect(x + a, y + b, 1, 1)); }
    parts.forEach((p) => { g.fillStyle = p.c; g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); });
  }
  // Corte del impacto: suelo, funda (que se aplasta) y paquete, con la distancia de frenado marcada.
  function drawZoom() {
    const sl = actual || worst(), r = calc(sl);
    zg.fillStyle = '#0e1430'; zg.fillRect(0, 0, ZW, ZH);
    const tp = funda.rho ? Math.round(t * 100 * S) : 0, comp = Math.round(r.dCase * 100 * S * squash), dent = Math.round(sl.d * 100 * S * squash);
    zg.fillStyle = sl.color; zg.fillRect(0, ZG, ZW, ZH - ZG);
    zg.fillStyle = '#00000033'; for (let x = 0; x < ZW; x += 3) zg.fillRect(x, ZG + 3 + (x % 7), 1, 1);
    const pw = 16, cx = 40, boxW = pw + 2 * tp, top = ZG - (pw + 2 * tp) + comp + dent;
    if (dent) { zg.fillStyle = '#00000055'; zg.fillRect(cx - boxW / 2 - 1, ZG, boxW + 2, dent); }
    if (tp) { zg.fillStyle = funda.color; zg.fillRect(cx - boxW / 2, top, boxW, pw + 2 * tp - comp); zg.fillStyle = '#00000033'; zg.fillRect(cx - boxW / 2, top + pw + 2 * tp - comp - Math.max(1, Math.round(comp / 2)), boxW, Math.max(1, Math.round(comp / 2))); }
    zg.drawImage(sprite(OBJ_SPRITES[obj.id]), Math.round(cx - pw / 2), top + tp, pw, pw);
    if (broken) { zg.fillStyle = '#0a0d22'; CRACK.forEach(([a, b]) => zg.fillRect(cx - pw / 2 + a * 2, top + tp + b * 2, 2, 2)); }
    // Cota de d (total, a escala) a la derecha
    const dpx = Math.max(1, Math.round(r.d * 100 * S));
    zg.fillStyle = '#ffe66d'; zg.fillRect(78, ZG - dpx, 1, dpx); zg.fillRect(76, ZG - dpx, 5, 1); zg.fillRect(76, ZG - 1, 5, 1);
    zg.font = '8px monospace'; zg.textBaseline = 'top'; zg.fillText('d=' + fmt(r.d * 100, 1) + 'cm', 82, Math.max(2, ZG - dpx / 2 - 4));
    zg.fillStyle = '#e9f0ff'; zg.fillText(actual ? sl.name : '¿suelo?', 2, ZG + 8);
  }

  function drop() {
    if (running) return;
    reset(); running = true; sfx.launch(); fallStart();
    if (sab.has('suelo')) { actual = soils[Math.floor(Math.random() * soils.length)]; }
    const T = tFall(pl.g, h0), scale = Math.max(1, T / 2.5), start = performance.now();
    const loop = (now) => {
      const tt = Math.min(((now - start) / 1000) * scale, T), s = stateAt(obj.m, pl.g, h0, tt);
      fallH = s.h; fallSpeed(s.v); drawStage(); drawZoom();
      if (tt < T) { raf = requestAnimationFrame(loop); return; }
      fallStop(); hit();
    };
    raf = requestAnimationFrame(loop);
  }
  function hit() { // animación del frenado en el zoom, luego el veredicto
    const r = calc(actual); broken = r.F > FM();
    const t0 = performance.now(), dur = REDUCE.matches ? 1 : 500;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur); squash = 1 - (1 - k) * (1 - k); drawZoom();
      if (k < 1) { raf = requestAnimationFrame(step); return; }
      land(r); anim();
    };
    raf = requestAnimationFrame(step);
  }
  function anim() {
    const step = () => {
      parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; }); parts = parts.filter((p) => p.y < GROUND + 6);
      drawStage(); if (parts.length) raf = requestAnimationFrame(step); else running = false;
    };
    raf = requestAnimationFrame(step);
  }

  function land(r) {
    const n = broken ? 26 : 8, col = broken ? obj.color : actual.color;
    for (let i = 0; i < n; i++) parts.push({ x: 60, y: GROUND, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * (broken ? 3 : 1.5), c: col });
    readouts(r); drawZoom();
    const sabTxt = sab.has('suelo') ? `<span class="cmp" style="color:var(--magenta)">Dr. Caos cambió el suelo a: ${actual.name.toLowerCase()}.</span>` : '';
    const detail = `<span class="cmp">F = ${fmt(r.E, 2)} J / ${fmt(r.d, 4)} m = ${fmt(r.F, 0)} N (máx ${fmt(FM(), 0)} N) · funda ${fmt(r.mc * 1000, 1)} g</span>`;
    if (mission) return missionResult(r, sabTxt + detail);
    const vd = $('#verdict');
    if (broken) { sfx.crash(); vd.className = 'verdict ko'; vd.innerHTML = `¡CRASH! ${fmt(r.F, 0)} N > ${fmt(FM(), 0)} N<br>${detail}`; return; }
    sfx.thud(); setTimeout(sfx.win, 250);
    const key = 'impacto:' + obj.id + '@' + pl.id, combos = { ...get().combos }, isNew = !combos[key];
    if (isNew) { combos[key] = 1; set({ combos }); addScore(1); }
    vd.className = 'verdict ok';
    vd.innerHTML = `¡ENTREGADO! ${Math.round((100 * r.F) / FM())} % de F máx${isNew ? ' · +1 ★' : ''}<br>${detail}`;
  }

  function missionResult(r, detail) {
    const vd = $('#verdict'), w = calc(worst());
    const stars = starsImpact(mission, { F: r.F, Fworst: sab.has('suelo') ? w.F : r.F, Fmax: FM(), mc: r.mc, mObj: obj.m });
    if (!stars) {
      sfx.crash(); vd.className = 'verdict ko';
      vd.innerHTML = `¡CRASH! ${fmt(r.F, 0)} N > ${fmt(FM(), 0)} N<br><span class="muted cmp">Dr. Caos: "Todo lo que cae, se destruye."</span>${detail}`;
      return;
    }
    sfx.thud(); setTimeout(sfx.win, 250);
    const prev = get().missions[mission.id] || 0;
    if (stars > prev) set({ missions: { ...get().missions, [mission.id]: stars } });
    if (!prev) addScore(5);
    const luck = sab.has('suelo') && w.F > FM() ? '<span class="cmp">GAL-1: "Sobrevivió por suerte: en concreto se rompía. Diseña para el peor caso."</span>' : '';
    const heavy = stars < 3 && !luck ? `<span class="cmp">GAL-1: "Funda de ${Math.round((100 * r.mc) / obj.m)} % del paquete. Para 3 ★ busca una más ligera (≤ ${Math.round(mission.c3 * 100)} %)."</span>` : '';
    vd.className = 'verdict ok';
    vd.innerHTML = `¡ENTREGA PERFECTA!<br><span class="cmp" style="color:var(--yellow)">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}${prev ? '' : ' · +5 ★'}</span>${detail}${luck}${heavy}`;
    const after = () => {
      $('#after').innerHTML = `<button class="btn" data-map>▶ Volver al mapa</button>${stars < 3 ? '<button class="btn ghost" data-retry>↻ Reintentar por 3 ★</button>' : ''}`;
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
  el.innerHTML = `<h1 style="font-size:15px">SIMULADOR · IMPACTO</h1>
    <div class="panel dialog"><span class="slot"></span><div><h2 style="color:var(--yellow)">GAL-1</h2>
    <p>"Los sensores de impacto se activan al completar el Acto 2. Termina la tormenta sobre la Tierra."</p></div></div>
    <button class="btn" data-map>▶ Ir al mapa de misiones</button>`;
  el.querySelector('.slot').replaceWith(pxCanvas(GAL1, { cls: 'avatar sm gal', label: 'GAL-1' }));
  el.querySelector('[data-map]').onclick = () => go('historia');
}
