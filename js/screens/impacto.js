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
import { sprite, planetCanvas } from '../gfx/pixel.js';
import { OBJ_SPRITES, CRACK, GAL1 } from '../gfx/sprites.js';
import { missionById, isDone } from '../progress.js';
import { playScene } from '../ui/dialogo.js';
import { go } from '../nav.js';
import { artCanvas, drawArt, ready } from '../gfx/imagenes.js';
import { createScene, gameShell, wireShell } from '../ui/escena.js';

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

  const tabs = '<div class="tabs" role="tablist"><a href="#simulador" role="tab">Sin aire</a><a href="#aire" role="tab">Con aire</a><a href="#impacto" role="tab" aria-selected="true" class="on">Impacto</a></div>';
  el.innerHTML = gameShell({
    head: mission ? `<div class="g-title">MISIÓN: ${mission.title.toUpperCase()}</div>
      <div class="g-obj">F media ≤ <b>F máx</b> · ★★★ funda ≤ ${Math.round(mission.c3 * 100)} % · h = ${h0} m · ⚙ objetivo</div>` : tabs,
    top: `<div class="g-read">
        <div>Ec imp.<b id="r-e">0 J</b></div><div>Frenado<b id="r-d">0 cm</b></div>
        <div>F media<b id="r-f">–</b></div><div>F máx<b id="r-m">0 N</b></div></div>
      <div class="fmeter mini" aria-hidden="true"><span>F</span><div class="bar fm"><i id="b-f"></i><b class="fm-max"></b></div><span id="v-f">–</span></div>`,
    result: `<div class="zoom"><canvas width="${ZW}" height="${ZH}" role="img" aria-label="Zoom del impacto: funda y suelo"></canvas><p class="legend">ZOOM DEL IMPACTO · 1 cm = 2 px</p></div>`,
    sheet: `${mission ? `<div class="panel mission"><h2>OBJETIVO</h2><p>${mission.brief}</p>
        <p class="muted">F media ≤ <b style="color:var(--yellow)">F máx</b> · ★★★ con funda ≤ ${Math.round(mission.c3 * 100)} % de la masa del paquete · ★★ ≤ ${Math.round(mission.c2 * 100)} %</p>
        <p class="lbl"><span>Altura de vuelo</span><span>${h0} m (fija)</span></p></div>`
        : '<div class="say"><span class="slot-gal"></span><p>GAL-1: "F · d = Ec. Diseña la funda y elige el suelo: más distancia de frenado, menos fuerza."</p></div><h2>PAQUETE</h2><div class="row" id="objs"></div><h2 style="margin-top:12px">LUNA / PLANETA</h2><div class="row" id="pls"></div>'}
      <h2 style="margin-top:12px">SUELO${sab.has('suelo') ? ' <span style="color:var(--magenta)">· lo elige Caos al soltar</span>' : ''}</h2><div class="row" id="soils"></div>
      <h2 style="margin-top:12px">FUNDA</h2><div class="row" id="fundas"></div>
      <label class="lbl" for="t"><span>Grosor de la funda</span><span id="t-lbl"></span></label>
      <input type="range" id="t" min="0" max="${T_MAX * 100}" step="0.1">
      <div class="panel muted" id="hint"></div>`,
  });

  const $ = (q) => el.querySelector(q);
  const ui = wireShell(el);
  const zg = $('.zoom canvas').getContext('2d');
  zg.imageSmoothingEnabled = false;
  $('.slot-gal')?.replaceWith(artCanvas('retrato-gal', GAL1, { w: 64, cls: 'avatar sm gal', label: 'GAL-1' }));
  const sc = createScene($('.stage'), {
    planet: pl, h0, hMin: 1, hMax: 500, fixed: !!mission,
    onHeight: (v) => { if (running) return; h0 = v; reset(); }, paint: drawStage,
  });
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
      chips($('#objs'), OBJECTS, obj, (o) => { obj = o; reset(); }, (o) => artCanvas('obj-' + o.id, OBJ_SPRITES[o.id], { cls: 'px chip-px' }));
      chips($('#pls'), FREE_PLANETS, pl, (p) => { pl = p; sc.setPlanet(p); reset(); }, (p) => planetCanvas(p, 16, 'px chip-px'), (p) => 'g = ' + p.g);
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
  $('#t').addEventListener('input', (e) => { if (running) return; t = +e.target.value / 100; reset(); });

  function reset() {
    cancelAnimationFrame(raf); fallStop(); running = false; broken = false; parts = []; squash = 0; fallH = h0;
    actual = sab.has('suelo') ? null : soil;
    $('#verdict').textContent = ''; $('#verdict').className = 'verdict'; $('#after').innerHTML = ''; ui.result(false);
    sc.lock(false); sc.halt(false);
    refreshUI(); readouts(null); drawZoom();
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

  // Lo que va encima del fondo y la nave (lo llama la escena en cada cuadro).
  function drawStage(g, S) {
    const sl = actual || { color: '#3c4466' }, sh = S.ship(), P = 16, x = Math.round(sh.cx - P / 2);
    g.fillStyle = '#0a0d22'; g.fillRect(sh.cx - 34, S.GROUND - 1, 68, 6);
    g.fillStyle = sl.color; g.fillRect(sh.cx - 33, S.GROUND, 66, 4); // plataforma de aterrizaje
    g.fillStyle = '#ffffff44'; g.fillRect(sh.cx - 33, S.GROUND, 66, 1);
    const moving = running || fallH < h0;
    const y = moving ? Math.round(S.yOf(fallH)) - P : sh.y - 3, th = funda.rho ? Math.min(4, 1 + Math.round(t * 30)) : 0;
    if (th) { g.fillStyle = '#0a0d22'; g.fillRect(x - th - 1, y - th - 1, P + 2 * th + 2, P + 2 * th + 2); g.fillStyle = funda.color; g.fillRect(x - th, y - th, P + 2 * th, P + 2 * th); }
    drawArt(g, 'obj-' + obj.id, OBJ_SPRITES[obj.id], x, y, P, P);
    if (broken) { g.fillStyle = '#0a0d22'; CRACK.forEach(([a, b]) => g.fillRect(x + a * 2, y + b * 2, 2, 2)); }
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
    zg.drawImage(ready('obj-' + obj.id) || sprite(OBJ_SPRITES[obj.id]), Math.round(cx - pw / 2), top + tp, pw, pw);
    if (broken) { zg.fillStyle = '#0a0d22'; CRACK.forEach(([a, b]) => zg.fillRect(cx - pw / 2 + a * 2, top + tp + b * 2, 2, 2)); }
    // Cota de d (total, a escala) a la derecha
    const dpx = Math.max(1, Math.round(r.d * 100 * S));
    zg.fillStyle = '#ffe66d'; zg.fillRect(78, ZG - dpx, 1, dpx); zg.fillRect(76, ZG - dpx, 5, 1); zg.fillRect(76, ZG - 1, 5, 1);
    zg.font = '8px monospace'; zg.textBaseline = 'top'; zg.fillText('d=' + fmt(r.d * 100, 1) + 'cm', 82, Math.max(2, ZG - dpx / 2 - 4));
    zg.fillStyle = '#e9f0ff'; zg.fillText(actual ? sl.name : '¿suelo?', 2, ZG + 8);
  }

  function drop() {
    if (running) return;
    reset(); running = true; sc.lock(true); ui.sheet(false); sfx.launch(); fallStart();
    if (sab.has('suelo')) { actual = soils[Math.floor(Math.random() * soils.length)]; }
    const T = tFall(pl.g, h0), scale = Math.max(1, T / 2.5), start = performance.now();
    const loop = (now) => {
      const tt = Math.min(((now - start) / 1000) * scale, T), s = stateAt(obj.m, pl.g, h0, tt);
      fallH = s.h; fallSpeed(s.v); drawZoom();
      if (tt < T) { raf = requestAnimationFrame(loop); return; }
      fallStop(); hit();
    };
    raf = requestAnimationFrame(loop);
  }
  function hit() { // animación del frenado en el zoom, luego el veredicto
    const r = calc(actual); broken = r.F > FM(); sc.halt(true); ui.result(true);
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
      parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; }); parts = parts.filter((p) => p.y < sc.GROUND + 6);
      if (parts.length) raf = requestAnimationFrame(step); else running = false;
    };
    raf = requestAnimationFrame(step);
  }

  function land(r) {
    const n = broken ? 26 : 8, col = broken ? obj.color : actual.color, cx = sc.ship().cx;
    sc.halt(true); ui.result(true);
    for (let i = 0; i < n; i++) parts.push({ x: cx, y: sc.GROUND, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * (broken ? 3 : 1.5), c: col });
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
    if (!prev && mission.post?.length) setTimeout(() => { stopScene = playScene($('#scene'), mission.post, after); }, 700);
    else after();
  }

  $('#drop').onclick = drop;
  reset();
  if (mission?.pre?.length) stopScene = playScene($('#scene'), mission.pre);
  return () => { cancelAnimationFrame(raf); fallStop(); sc.destroy(); stopScene && stopScene(); };
}

function locked(el) {
  el.innerHTML = `<h1 style="font-size:15px">SIMULADOR · IMPACTO</h1>
    <div class="panel dialog"><span class="slot"></span><div><h2 style="color:var(--yellow)">GAL-1</h2>
    <p>"Los sensores de impacto se activan al completar el Acto 2. Termina la tormenta sobre la Tierra."</p></div></div>
    <button class="btn" data-map>▶ Ir al mapa de misiones</button>`;
  el.querySelector('.slot').replaceWith(artCanvas('retrato-gal', GAL1, { w: 64, cls: 'avatar sm gal', label: 'GAL-1' }));
  el.querySelector('[data-map]').onclick = () => go('historia');
}
