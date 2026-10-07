import { PLANETS } from '../data/planets.js';
import { OBJECTS } from '../data/objects.js';
import { stateAt, tFall, vImpact, ep, fmt } from '../physics.js';
import { sfx, fallStart, fallSpeed, fallStop } from '../audio.js';
import { get, set, addScore } from '../state.js';

const W = 120, H = 160, GROUND = 146, TOP = 14; // resolución lógica pixel art

export default function simulador(el) {
  let obj = OBJECTS[0], pl = PLANETS[2], h0 = 2, running = false, raf = 0, parts = [], broken = false, landedAt = 0;

  el.innerHTML = `
    <h1 style="font-size:15px">SIMULADOR</h1>
    <p class="tag">GAL-1: "Prueba con un dummy antes de arriesgar el paquete real."</p>
    <div class="stage"><canvas width="${W}" height="${H}"></canvas></div>
    <div class="bars">
      <span>Ep</span><div class="bar ep"><i id="b-ep"></i></div><span id="v-ep">0 J</span>
      <span>Ec</span><div class="bar ec"><i id="b-ec"></i></div><span id="v-ec">0 J</span>
    </div>
    <div class="readout">
      <div>Altura<b id="r-h">0 m</b></div><div>Velocidad<b id="r-v">0 m/s</b></div>
      <div>Tiempo<b id="r-t">0 s</b></div><div>Límite G<b id="r-l">0 J</b></div>
    </div>
    <div id="verdict" class="verdict"></div>
    <button class="btn" id="drop">▼ SOLTAR</button>
    <div class="panel">
      <h2>PAQUETE</h2><div class="row" id="objs"></div>
      <h2 style="margin-top:12px">PLANETA</h2><div class="row" id="pls"></div>
      <label class="lbl"><span>Altura</span><span id="h-lbl"></span></label>
      <input type="range" id="h" min="0.2" max="50" step="0.1">
    </div>
    <div class="panel muted" id="hint"></div>`;

  const $ = (s) => el.querySelector(s);
  const cv = $('canvas'), g = cv.getContext('2d');
  const chips = (box, list, cur, pick) => {
    box.innerHTML = list.map((o) => `<button class="chip ${o === cur ? 'on' : ''}" data-id="${o.id}"><span class="ico">${o.icon || '●'}</span>${o.name}</button>`).join('');
    box.querySelectorAll('.chip').forEach((b) => (b.onclick = () => { if (running) return; sfx.click(); pick(list.find((o) => o.id === b.dataset.id)); }));
  };
  const planetsUI = PLANETS.map((p) => ({ ...p, icon: `g=${p.g}` }));
  function refreshUI() {
    chips($('#objs'), OBJECTS, obj, (o) => { obj = o; reset(); });
    chips($('#pls'), planetsUI, planetsUI.find((p) => p.id === pl.id), (p) => { pl = PLANETS.find((q) => q.id === p.id); reset(); });
    $('#h').value = h0; $('#h-lbl').textContent = fmt(h0, 1) + ' m';
    $('#hint').innerHTML = `<b style="color:var(--yellow)">${obj.name}</b>: m = ${obj.m} kg · aguanta hasta ${obj.limit} J.<br>
      En ${pl.name} (g = ${pl.g} m/s²)${pl.note ? ', ' + pl.note : ''}. ¿Desde qué altura sobrevive? Pista: Ep = m·g·h.`;
  }
  $('#h').oninput = (e) => { if (running) return; h0 = +e.target.value; reset(); };

  function reset() { cancelAnimationFrame(raf); fallStop(); running = false; broken = false; parts = []; $('#verdict').textContent = ''; $('#verdict').className = 'verdict'; refreshUI(); show(0); }

  function show(t) {
    const s = stateAt(obj.m, pl.g, h0, t);
    const pct = (x) => (s.total ? (100 * x) / s.total : 0) + '%';
    $('#b-ep').style.width = pct(s.ep); $('#b-ec').style.width = pct(s.ec);
    $('#v-ep').textContent = fmt(s.ep, 1) + ' J'; $('#v-ec').textContent = fmt(s.ec, 1) + ' J';
    $('#r-h').textContent = fmt(s.h, 2) + ' m'; $('#r-v').textContent = fmt(s.v, 2) + ' m/s';
    $('#r-t').textContent = fmt(t, 2) + ' s'; $('#r-l').textContent = obj.limit + ' J';
    draw(s); return s;
  }

  function draw(s) {
    const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, pl.sky[0]); grd.addColorStop(1, pl.sky[1]);
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 30; i++) { g.fillStyle = '#ffffff55'; g.fillRect((i * 37) % W, (i * 53) % 90, 1, 1); }
    // regla de altura
    const yOf = (h) => GROUND - (h / h0) * (GROUND - TOP);
    g.fillStyle = '#ffffff88';
    for (let k = 0; k <= 5; k++) { const y = Math.round(yOf((h0 * k) / 5)); g.fillRect(2, y, k % 5 ? 3 : 6, 1); }
    // nave Parábola arriba
    g.fillStyle = '#c8d0e8'; g.fillRect(48, TOP - 10, 24, 5); g.fillStyle = '#ff8a1f'; g.fillRect(44, TOP - 8, 4, 2); g.fillStyle = '#2de2c8'; g.fillRect(56, TOP - 9, 8, 2);
    // suelo
    g.fillStyle = pl.ground; g.fillRect(0, GROUND + 4, W, H - GROUND); g.fillStyle = '#00000055';
    for (let x = 0; x < W; x += 6) g.fillRect(x, GROUND + 6 + ((x / 6) % 3) * 3, 3, 1);
    // objeto (8×8) y estelas de velocidad
    const y = Math.round(yOf(s.h)) - 4, x = 56;
    if (s.v > 2 && s.h > 0) { g.fillStyle = '#ffffff44'; for (let k = 1; k < 4; k++) g.fillRect(x + 2, y - k * 4, 4, 2); }
    drawObj(x, y);
    parts.forEach((p) => { g.fillStyle = p.c; g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); });
  }
  function drawObj(x, y) {
    g.fillStyle = '#000'; g.fillRect(x - 1, y - 1, 10, 10);
    g.fillStyle = obj.color; g.fillRect(x, y, 8, 8);
    g.fillStyle = '#ffffffaa'; g.fillRect(x + 1, y + 1, 3, 1);
    if (broken) { g.fillStyle = '#000'; [[2, 2], [3, 3], [4, 3], [5, 4], [4, 5], [3, 6], [6, 2]].forEach(([a, b]) => g.fillRect(x + a, y + b, 1, 1)); }
  }

  function drop() {
    if (running) return; reset(); running = true; sfx.launch(); fallStart();
    const T = tFall(pl.g, h0), start = performance.now();
    const loop = (now) => {
      const t = Math.min((now - start) / 1000, T); const s = show(t); fallSpeed(s.v);
      if (t < T) { raf = requestAnimationFrame(loop); return; }
      fallStop(); land(); landedAt = now; anim();
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
    const vd = $('#verdict');
    if (broken) { sfx.crash(); vd.className = 'verdict ko'; vd.innerHTML = `¡CRASH! ${fmt(E, 1)} J > ${obj.limit} J<br><span class="muted" style="font-family:VT323;font-size:20px">Dr. Caos: "¿Lo ves? Todo lo que cae, se destruye."</span>`; }
    else {
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
    $('#r-v').textContent = fmt(v, 2) + ' m/s';
  }
  $('#drop').onclick = drop;
  reset();
  return () => { cancelAnimationFrame(raf); fallStop(); };
}
