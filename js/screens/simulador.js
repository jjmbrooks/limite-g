// Simulador del Acto 1 (sin aire). M11: escena a pantalla completa; la altura se arrastra sobre la escena.
import { PLANETS } from '../data/planets.js';
import { OBJECTS } from '../data/objects.js';
import { stateAt, tFall, vImpact, ep, fmt } from '../physics.js';
import { sfx, fallStart, fallSpeed, fallStop } from '../audio.js';
import { get, set, addScore } from '../state.js';
import { planetCanvas } from '../gfx/pixel.js';
import { OBJ_SPRITES, CRACK, GAL1 } from '../gfx/sprites.js';
import { starsFor } from '../data/historia.js';
import { missionById, missionRoute, isDone } from '../progress.js';
import { playScene } from '../ui/dialogo.js';
import { go } from '../nav.js';
import { artCanvas, drawArt } from '../gfx/imagenes.js';
import { createScene, gameShell, wireShell } from '../ui/escena.js';
import { playVideo } from '../ui/video.js';
import { VIDEOS } from '../data/videos.js';

const H_MIN = 0.1, H_MAX = 50, P = 16; // P: tamaño del paquete en la escena (px lógicos)

// Simulador libre (#simulador) o misión de altura exacta (#simulador/m1).
export default function simulador(el, arg) {
  const mission = arg ? missionById(arg) : null;
  if (mission && mission.mode !== 'vacio') { go(missionRoute(mission)); return; }
  const sab = new Set(mission?.sabotage || []);
  let obj = mission ? OBJECTS.find((o) => o.id === mission.obj) : OBJECTS[0];
  let pl = mission ? PLANETS.find((p) => p.id === mission.planet) : PLANETS[2];
  let alive = true, h0 = mission ? 1 : 2, running = false, raf = 0, parts = [], broken = false, stopScene = null, cur = null, landed = false;

  const tabs = `<div class="tabs" role="tablist"><a href="#simulador" role="tab" aria-selected="true" class="on">Sin aire</a>${isDone('m4') ? '<a href="#aire" role="tab">Con aire</a>' : '<span class="tab-off" title="Completa el Acto 1">⊘ Aire</span>'}${isDone('m8') ? '<a href="#impacto" role="tab">Impacto</a>' : '<span class="tab-off" title="Completa el Acto 2">⊘ Impacto</span>'}</div>`;
  const head = mission ? `<div class="g-title">MISIÓN: ${mission.title.toUpperCase()}</div>
    <div class="g-obj">Ventana: <b>${fmt(obj.limit * mission.lo, 2)} J – ${fmt(obj.limit * mission.hi, 2)} J</b> · ⚙ objetivo</div>` : tabs;
  el.innerHTML = gameShell({
    head,
    top: `<div class="g-read">
        <div>Altura<b id="r-h">0 m</b></div><div>Veloc.<b id="r-v">0 m/s</b></div>
        <div>Tiempo<b id="r-t">0 s</b></div><div>Límite G<b id="r-l">0 J</b></div></div>
      <div class="bars mini">
        <span>Ep</span><div class="bar ep"><i id="b-ep"></i></div><span id="v-ep">0 J</span>
        <span>Ec</span><div class="bar ec"><i id="b-ec"></i></div><span id="v-ec">0 J</span></div>
      ${sab.has('regla') ? `<label class="g-hnum" for="hnum"><span>Altura (m) <em>· regla borrada por Caos</em></span>
        <input type="text" inputmode="decimal" id="hnum" class="num" autocomplete="off" placeholder="p. ej. 2.5"></label>` : ''}`,
    sheet: `${mission ? `<div class="panel mission"><h2>OBJETIVO</h2><p>${mission.brief}</p>
        <p class="muted">Ventana: <b style="color:var(--yellow)">${fmt(obj.limit * mission.lo, 2)} J – ${fmt(obj.limit * mission.hi, 2)} J</b></p></div>`
        : '<div class="say"><span class="slot-gal"></span><p>GAL-1: "Prueba con un dummy antes de arriesgar el paquete real."</p></div><h2>PAQUETE</h2><div class="row" id="objs"></div><h2 style="margin-top:12px">PLANETA</h2><div class="row" id="pls"></div>'}
      <div class="panel muted" id="hint"></div>`,
  });

  const $ = (s) => el.querySelector(s);
  const ui = wireShell(el);
  $('.slot-gal')?.replaceWith(artCanvas('retrato-gal', GAL1, { w: 64, cls: 'avatar sm gal', label: 'GAL-1' }));
  const sc = createScene($('.stage'), {
    planet: pl, h0, hMin: 0.2, hMax: H_MAX, hideRuler: sab.has('regla'), fixed: sab.has('regla'),
    onHeight: (v) => { if (running) return; h0 = v; reset(); }, paint,
  });

  const chips = (box, list, curr, pick) => {
    box.innerHTML = list.map((o) => `<button class="chip ${o === curr ? 'on' : ''}" data-id="${o.id}" aria-pressed="${o === curr}"><span class="ico"></span>${o.name}${o.g ? `<small>g = ${o.g}</small>` : ''}</button>`).join('');
    box.querySelectorAll('.chip').forEach((b) => {
      const it = list.find((o) => o.id === b.dataset.id);
      b.querySelector('.ico').appendChild(it.g ? planetCanvas(it, 16, 'px chip-px') : artCanvas('obj-' + it.id, OBJ_SPRITES[it.id], { cls: 'px chip-px' }));
      b.onclick = () => { if (running) return; sfx.click(); pick(it); };
    });
  };
  function refreshUI() {
    if (!mission) {
      chips($('#objs'), OBJECTS, obj, (o) => { obj = o; reset(); });
      chips($('#pls'), PLANETS.filter((p) => p.act === 1), pl, (p) => { pl = p; sc.setPlanet(p); reset(); });
    }
    const gTxt = sab.has('g') ? '<b style="color:var(--magenta)">g = ¿? (dato borrado por Caos)</b>' : `g = ${pl.g} m/s²`;
    $('#hint').innerHTML = `<b style="color:var(--yellow)">${obj.name}</b>: m = ${obj.m} kg · aguanta hasta ${obj.limit} J.<br>
      En ${pl.name} (${gTxt})${pl.note ? ', ' + pl.note : ''}. ${mission ? 'Pista: h = E / (m·g).' : '¿Desde qué altura sobrevive? Pista: Ep = m·g·h.'}
      ${sab.has('regla') ? '' : '<br><span style="color:var(--teal)">⇕ Arrastra la escena hacia arriba o abajo para cambiar la altura.</span>'}`;
  }
  $('#hnum')?.addEventListener('input', (e) => {
    if (running) return;
    const v = parseFloat(e.target.value.replace(',', '.'));
    e.target.classList.toggle('bad', !(v >= H_MIN && v <= H_MAX));
    if (v >= H_MIN && v <= H_MAX) { h0 = v; sc.setHeight(v, { silent: true }); reset(); }
  });

  function reset() {
    cancelAnimationFrame(raf); fallStop(); running = false; broken = false; landed = false; parts = [];
    sc.lock(false); sc.halt(false);
    $('#verdict').textContent = ''; $('#verdict').className = 'verdict'; $('#after').innerHTML = ''; ui.result(false);
    refreshUI(); show(0);
  }

  function show(t) {
    const s = stateAt(obj.m, pl.g, h0, t);
    const pct = (x) => (s.total ? (100 * x) / s.total : 0) + '%';
    $('#b-ep').style.width = pct(s.ep); $('#b-ec').style.width = pct(s.ec);
    const hide = sab.has('g') && !running && t === 0; // con g borrada no se regala la Ep antes de soltar
    const hideH = sab.has('regla') && !running; // con la regla borrada no se muestra la altura antes de soltar
    $('#v-ep').textContent = hide || hideH ? '¿? J' : fmt(s.ep, 2) + ' J'; $('#v-ec').textContent = fmt(s.ec, 2) + ' J';
    $('#r-h').textContent = hideH ? '¿? m' : fmt(s.h, 2) + ' m'; $('#r-v').textContent = fmt(s.v, 2) + ' m/s';
    $('#r-t').textContent = fmt(t, 2) + ' s'; $('#r-l').textContent = obj.limit + ' J';
    cur = s; return s;
  }

  // Dibujo del paquete (lo llama la escena en cada cuadro, después del fondo y la nave).
  function paint(g, S) {
    if (!cur) return;
    if (running || landed) S.focus(cur.h); // la cámara sigue al paquete hasta el suelo
    const sh = S.ship(), x = Math.round(sh.cx - P / 2);
    const y = running || landed ? Math.round(S.yOf(cur.h)) - P : sh.y - 3;
    if (cur.h > 0 && (running || landed)) { const k = Math.max(0, 1 - cur.h / h0), sw = 4 + Math.round(k * 12); g.fillStyle = '#00000066'; g.fillRect(sh.cx - sw / 2, S.GROUND, sw, 2); }
    if (cur.v > 2 && cur.h > 0) { g.fillStyle = '#ffffff55'; for (let k = 1; k < 4; k++) g.fillRect(sh.cx - 1, y - k * 6, 2, 3); }
    drawArt(g, 'obj-' + obj.id, OBJ_SPRITES[obj.id], x, y, P, P);
    if (broken) { g.fillStyle = '#0a0d22'; CRACK.forEach(([a, b]) => g.fillRect(x + a * 2, y + b * 2, 2, 2)); }
    parts.forEach((p) => { g.fillStyle = p.c; g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); });
  }

  function drop() {
    if (running) return;
    if ($('#hnum') && !($('#hnum').value.trim())) { $('#hnum').classList.add('bad'); $('#hnum').focus(); return; }
    reset(); running = true; sc.lock(true); ui.sheet(false); sfx.launch(); fallStart();
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
      parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; }); parts = parts.filter((p) => p.y < sc.GROUND + 6);
      if (parts.length) raf = requestAnimationFrame(step); else running = false;
    };
    raf = requestAnimationFrame(step);
  }
  function land() {
    const E = ep(obj.m, pl.g, h0), v = vImpact(pl.g, h0), ratio = E / obj.limit;
    broken = ratio > 1; landed = true; sc.halt(true);
    const n = broken ? 26 : 8, col = broken ? obj.color : pl.ground, cx = sc.ship().cx;
    for (let i = 0; i < n; i++) parts.push({ x: cx, y: sc.GROUND, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * (broken ? 3 : 1.5), c: col });
    $('#r-v').textContent = fmt(v, 2) + ' m/s';
    ui.result(true);
    if (mission) return missionResult(E, ratio);
    const vd = $('#verdict');
    if (broken) { sfx.crash(); vd.className = 'verdict ko'; vd.innerHTML = `¡CRASH! ${fmt(E, 1)} J > ${obj.limit} J<br><span class="cmp">Dr. Caos: "¿Lo ves? Todo lo que cae, se destruye."</span>`; return; }
    sfx.thud(); setTimeout(sfx.win, 250);
    const key = obj.id + '@' + pl.id, combos = { ...get().combos };
    let pts = 0, msg = '';
    if (!combos[key]) { pts += 1; msg = '+1 ★ entrega nueva'; }
    if (ratio >= 0.8 && !(combos[key] >= 2)) { pts += 3; msg += (msg ? ' · ' : '') + '+3 ★ ¡al límite!'; combos[key] = 2; }
    else combos[key] = combos[key] || 1;
    set({ combos }); if (pts) addScore(pts);
    vd.className = 'verdict ok';
    vd.innerHTML = `¡ENTREGADO! ${fmt(E, 1)} J ≤ ${obj.limit} J<br><span class="cmp" style="color:var(--yellow)">${msg || 'Usó el ' + Math.round(ratio * 100) + '% de su Límite G'}</span>`;
  }

  function missionResult(E, ratio) {
    const vd = $('#verdict'), pctTxt = Math.round(ratio * 100) + ' % del Límite G';
    const ok = ratio >= mission.lo && ratio <= mission.hi;
    if (!ok) {
      broken ? sfx.crash() : sfx.thud();
      vd.className = 'verdict ko';
      vd.innerHTML = broken
        ? `¡CRASH! ${fmt(E, 2)} J > ${obj.limit} J<br><span class="cmp">Dr. Caos: "Confeti interplanetario. ¡Ja!"</span>`
        : `MUY BAJO: ${fmt(E, 2)} J (${pctTxt})<br><span class="cmp">GAL-1: "Llegó entero, pero gastamos combustible de más. Sube un poco."</span>`;
      return;
    }
    sfx.thud(); setTimeout(sfx.win, 250);
    const stars = starsFor(ratio), prev = get().missions[mission.id] || 0;
    if (stars > prev) set({ missions: { ...get().missions, [mission.id]: stars } });
    if (!prev) addScore(5);
    vd.className = 'verdict ok';
    vd.innerHTML = `¡ENTREGA PERFECTA! ${fmt(E, 2)} J<br><span class="cmp" style="color:var(--yellow)">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)} · ${pctTxt}${prev ? '' : ' · +5 ★'}</span>`;
    const after = () => {
      $('#after').innerHTML = `<button class="btn" data-map>▶ Volver al mapa</button>${stars < 3 ? '<button class="btn ghost" data-retry>↻ Reintentar por 3 ★ (≥ 95 %)</button>' : ''}`;
      $('[data-map]').onclick = () => go('historia');
      $('[data-retry]')?.addEventListener('click', () => reset());
    };
    // M11: cinemática opcional de la primera entrega (p. ej. Marte), luego el diálogo de cierre.
    const video = !prev && Object.keys(VIDEOS).find((k) => VIDEOS[k].mission === mission.id);
    const post = () => (!prev && mission.post?.length ? (stopScene = playScene($('#scene'), mission.post, after)) : after());
    setTimeout(() => (video ? playVideo(video, () => alive && post()) : post()), prev ? 0 : 700);
  }

  $('#drop').onclick = drop;
  reset();
  if (mission?.pre?.length) stopScene = playScene($('#scene'), mission.pre);
  return () => { alive = false; cancelAnimationFrame(raf); fallStop(); sc.destroy(); stopScene && stopScene(); };
}
