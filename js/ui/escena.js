// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// M11: escena de juego a pantalla completa compartida por los tres simuladores (sin aire, con aire, impacto).
// · Fondo panorámico 16-bit con paralaje por franjas (estilo SNES) que se desplaza sin fin; la nave se bambolea.
// · La altura se cambia ARRASTRANDO arriba/abajo sobre la escena (o con flechas del teclado: role="slider").
// · Regla lateral con escala que se ajusta sola (0.5 m … 2000 m) y etiqueta de altura junto a la nave.
// · Con la regla saboteada por Dr. Caos no se muestra ninguna altura (el alumno la escribe).
// La pantalla dibuja lo suyo (paquete, paracaídas, partículas…) en paint(g, sc), después del fondo y la nave.
import { drawArt, ready, load, fondoKey } from '../gfx/imagenes.js';
import { background } from '../gfx/scenery.js';
import { PARABOLA } from '../gfx/sprites.js';
import { hash } from '../gfx/pixel.js';

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
const ESCALAS = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];
export const SHIP_W = 72, SHIP_H = 27;
const nice = (h) => ESCALAS.find((s) => h <= s * 0.9) || ESCALAS[ESCALAS.length - 1];
const stepOf = (h) => (h < 10 ? 0.1 : h < 100 ? 1 : 5);
const fmtH = (h) => (h < 10 ? h.toFixed(1) : String(Math.round(h))).replace('.', '.') + ' m';

/**
 * host: elemento .stage (posición relativa). Opciones:
 *  planet, h0, hMin, hMax, fixed (altura fija de la misión), hideRuler (sabotaje), onHeight(h), paint(g, sc), label
 */
export function createScene(host, opts) {
  const o = { hMin: 0.2, hMax: 50, fixed: false, hideRuler: false, onHeight: () => {}, paint: () => {}, ...opts };
  host.insertAdjacentHTML('afterbegin', `
    <canvas class="stage-cv" aria-hidden="true"></canvas>
    <div class="h-tag" aria-hidden="true"></div>
    <div class="drag-hint" aria-hidden="true">⇕ arrastra para subir o bajar</div>`);
  const cv = host.querySelector('.stage-cv'), g = cv.getContext('2d');
  const tag = host.querySelector('.h-tag'), hint = host.querySelector('.drag-hint');
  host.tabIndex = 0;
  host.setAttribute('role', 'slider');
  host.setAttribute('aria-label', o.label || 'Altura de la nave: arrastra arriba o abajo, o usa las flechas');
  let W = 240, H = 380, GROUND = 320, TOP = 70, cssW = 1, cssH = 1;
  let pl = o.planet, h = o.h0, shown = o.h0, scale = nice(o.h0), scaleShown = scale, locked = false, scroll = 0, last = performance.now(), raf = 0;
  let bgKey = null, halted = false;

  function resize() {
    const r = host.getBoundingClientRect(); cssW = Math.max(1, r.width); cssH = Math.max(1, r.height);
    W = Math.max(200, Math.min(300, Math.round(cssW / 1.5)));
    H = Math.round((W * cssH) / cssW);
    cv.width = W; cv.height = H; g.imageSmoothingEnabled = false;
    GROUND = H - Math.round(Math.max(52, H * 0.15)); // por encima de la barra de botones
    TOP = Math.round(Math.min(96, H * 0.22)); // por debajo de las lecturas superiores
    // Si la pantalla tiene capas encima (lecturas arriba, botones abajo), la zona de vuelo queda entre ellas.
    const top = host.querySelector('.g-top'), bot = host.querySelector('.g-bottom'), ky = H / cssH;
    if (top) TOP = Math.round((top.offsetTop + top.offsetHeight + 30) * ky);
    if (bot) GROUND = Math.min(H - 20, Math.round((cssH - bot.offsetHeight - 22) * ky));
    if (GROUND - TOP < 60) TOP = GROUND - 60;
  }
  const ro = new ResizeObserver(resize); ro.observe(host); host.querySelector('.g-top') && ro.observe(host.querySelector('.g-top')); resize();

  const yOf = (hh, sc = scaleShown) => GROUND - (hh / sc) * (GROUND - TOP);
  const shipX = () => Math.round(W * 0.28);
  const bob = () => (REDUCE.matches ? 0 : Math.round(Math.sin(performance.now() / 450) * 1.5));
  // Posición de la panza de la nave (de ahí sale el paquete).
  const ship = () => ({ x: shipX(), y: Math.round(yOf(shown)), cx: shipX() + SHIP_W / 2 });

  function setPlanet(p) { pl = p; bgKey = fondoKey(p); if (bgKey) load(bgKey); }
  setPlanet(pl);
  function setHeight(v, { instant = false, silent = false } = {}) {
    h = Math.max(o.hMin, Math.min(o.hMax, Math.round(v / stepOf(v)) * stepOf(v)));
    h = +h.toFixed(2);
    if (!locked) scale = nice(h);
    if (instant) { shown = h; scaleShown = scale; }
    host.setAttribute('aria-valuenow', String(h));
    host.setAttribute('aria-valuetext', o.hideRuler ? 'altura oculta por Dr. Caos' : fmtH(h));
    if (!silent) o.onHeight(h);
  }
  host.setAttribute('aria-valuemin', String(o.hMin)); host.setAttribute('aria-valuemax', String(o.hMax));
  setHeight(h, { instant: true, silent: true });

  // Arrastre: 60 % del alto de la escena multiplica la altura ×10 (preciso cerca del suelo y rápido arriba).
  let drag = null;
  const canDrag = () => !o.fixed && !o.hideRuler && !locked;
  host.addEventListener('pointerdown', (e) => {
    if (!canDrag() || e.target.closest('button,input,a,.result,.sheet,#scene')) return;
    drag = { y: e.clientY, h }; host.setPointerCapture(e.pointerId); host.classList.add('dragging'); hint.classList.add('gone');
  });
  host.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dy = e.clientY - drag.y;
    setHeight(drag.h * Math.exp((-dy / (cssH * 0.6)) * Math.LN10));
  });
  const end = () => { drag = null; host.classList.remove('dragging'); };
  host.addEventListener('pointerup', end); host.addEventListener('pointercancel', end);
  host.addEventListener('keydown', (e) => {
    if (!canDrag() || e.target !== host) return;
    const k = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }[e.key];
    if (!k) return;
    e.preventDefault(); setHeight(h + k * stepOf(h));
  });

  // Fondo: franjas horizontales con velocidades crecientes hacia abajo (paralaje de línea, como en SNES).
  function drawBg() {
    const im = bgKey && ready(bgKey);
    if (!im) { g.drawImage(background(pl, W, H, GROUND), 0, 0); return; }
    const ih = im.height, iw = im.width, y0 = H - ih; // anclado abajo
    if (y0 > 0) { // cielo extra arriba: degradado con tramado desde el color superior del fondo
      g.drawImage(im, 0, 0, iw, 1, 0, 0, W, y0 + 1);
      g.fillStyle = 'rgba(0,0,0,.35)';
      for (let y = 0; y < y0; y += 2) { const a = 1 - y / y0; for (let x = (y / 2) % 2; x < W; x += 2) if (hash(x, y, 5) < a * 0.5) g.fillRect(x, y, 1, 1); }
      for (let i = 0; i < 30; i++) { g.fillStyle = i % 6 ? '#ffffff' : '#ffe66d'; g.globalAlpha = 0.4 + 0.5 * hash(i, 9, 2); g.fillRect(Math.floor(hash(i, 1, 4) * W), Math.floor(hash(i, 2, 4) * y0), 1, 1); }
      g.globalAlpha = 1;
    }
    const hz = Math.round(ih * 0.58), bands = [[0, hz, 0.06]];
    const N = 7; for (let k = 0; k < N; k++) { const a = hz + Math.round(((ih - hz) * k) / N), b = hz + Math.round(((ih - hz) * (k + 1)) / N); bands.push([a, b - a, 0.25 + 0.75 * ((k + 1) / N) ** 1.6]); }
    for (const [sy, sh, sp] of bands) strip(im, sy, sh, y0 + sy, scroll * sp, iw);
  }
  // Un tramo del fondo repetido: los mosaicos impares se dibujan en espejo para que la unión no se note.
  function strip(im, sy, sh, dy, off, iw) {
    const period = iw * 2; let x = -(((off % period) + period) % period);
    for (let k = 0; x < W; k++, x += iw) {
      if (x + iw <= 0) continue;
      if (k % 2 === 0) g.drawImage(im, 0, sy, iw, sh, Math.round(x), dy, iw, sh);
      else { g.save(); g.translate(Math.round(x) + iw, 0); g.scale(-1, 1); g.drawImage(im, 0, sy, iw, sh, 0, dy, iw, sh); g.restore(); }
    }
  }
  function drawRuler() {
    if (o.hideRuler) { g.fillStyle = '#ff3fa4'; for (let y = TOP; y < GROUND; y += 8) g.fillRect(3 + ((y / 8) % 2) * 2, y, 3, 3); return; }
    const sc = scaleShown, step = sc / 10;
    g.fillStyle = 'rgba(10,13,34,.35)'; g.fillRect(0, TOP - 6, 12, GROUND - TOP + 8);
    g.font = '8px "Press Start 2P", monospace'; g.textBaseline = 'middle'; g.textAlign = 'left';
    for (let k = 0; k <= 10; k++) {
      const y = Math.round(yOf(k * step)), big = k % 5 === 0;
      g.fillStyle = '#0a0d22'; g.fillRect(2, y + 1, big ? 8 : 4, 1);
      g.fillStyle = big ? '#ffe66d' : '#e9f0ff'; g.fillRect(1, y, big ? 8 : 4, 1);
      if (big && k) { const t = String(+(k * step).toFixed(1)); g.fillStyle = '#0a0d22'; g.fillText(t, 4, y - 6); g.fillStyle = '#ffe66d'; g.fillText(t, 3, y - 7); }
    }
    // línea punteada hasta la nave
    const y = Math.round(yOf(shown)); g.fillStyle = 'rgba(255,230,109,.7)';
    for (let x = 10; x < shipX(); x += 4) g.fillRect(x, y, 2, 1);
  }
  function drawShip() {
    const s = ship(), y = s.y - SHIP_H + bob() + 2;
    if (!REDUCE.matches) { // estela del motor
      g.fillStyle = (Math.floor(performance.now() / 90) % 2) ? '#ffe66d' : '#ff8a1f';
      g.fillRect(s.x - 4, y + Math.round(SHIP_H * 0.42), 4, 2);
    }
    drawArt(g, 'nave', PARABOLA, s.x, y, SHIP_W, SHIP_H);
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!REDUCE.matches && !halted) scroll += dt * 22;
    const k = REDUCE.matches ? 1 : 1 - Math.exp(-dt * 10);
    shown += (h - shown) * k; scaleShown += (scale - scaleShown) * k;
    if (Math.abs(h - shown) < 1e-3) shown = h;
    drawBg(); drawRuler(); drawShip();
    o.paint(g, api);
    // etiqueta de altura junto a la nave (en px CSS)
    const s = ship(), kx = cssW / W, ky = cssH / H;
    tag.textContent = o.hideRuler ? '¿? m' : fmtH(locked ? h : shown);
    tag.classList.toggle('caos', o.hideRuler);
    tag.style.transform = `translate(${Math.round((s.x + SHIP_W + 2) * kx)}px, ${Math.round((s.y - SHIP_H / 2) * ky - 14)}px)`;
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  if (!canDrag()) hint.classList.add('gone');

  const api = {
    get W() { return W; }, get H() { return H; }, get GROUND() { return GROUND; }, get TOP() { return TOP; },
    get h() { return h; }, ship, yOf, setHeight, setPlanet,
    // Durante la caída se congela la escala para que el paquete caiga con la regla quieta.
    lock(v) { locked = v; if (v) { shown = h; scaleShown = scale; } else scale = nice(h); hint.classList.add('gone'); },
    halt(v) { halted = v; }, // tras el impacto la cámara se detiene
    setFixed(v) { o.fixed = v; }, setHideRuler(v) { o.hideRuler = v; },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); },
  };
  return api;
}

// Estructura HTML común de los simuladores: escena a pantalla completa con capas encima.
// top: lecturas y barras · sheet: ajustes (paquete, planeta, …) · result: extra del panel de resultados.
export function gameShell({ head = '', top = '', sheet = '', result = '', aria = 'Escenario de la caída' }) {
  return `<div class="game"><div class="stage" aria-label="${aria}">
    <div class="g-top">${head}${top}</div>
    <div class="result" role="region" aria-label="Resultado"><div id="verdict" class="verdict" aria-live="polite"></div>${result}<div id="after"></div>
      <button class="btn ghost mini" data-close>✕ Cerrar</button></div>
    <div id="scene"></div>
    <div class="g-bottom">
      <button class="btn ghost g-cfg" data-ajustes aria-expanded="false" aria-controls="ajustes">⚙<small>Ajustes</small></button>
      <button class="btn g-drop" id="drop">▼ SOLTAR</button>
    </div>
    <div class="sheet" id="ajustes" role="dialog" aria-label="Ajustes de la entrega">
      <div class="sheet-head"><h2>AJUSTES</h2><button class="icon-btn" data-cerrar aria-label="Cerrar ajustes">✕</button></div>${sheet}</div>
  </div></div>`;
}
// Conecta el panel de ajustes y el de resultados. Devuelve { result(on), sheet(on) }.
export function wireShell(el) {
  const sh = el.querySelector('.sheet'), rs = el.querySelector('.result'), btn = el.querySelector('[data-ajustes]');
  const sheet = (on) => { sh.classList.toggle('open', on); btn.setAttribute('aria-expanded', String(on)); if (on) sh.querySelector('[data-cerrar]').focus({ preventScroll: true }); };
  btn.onclick = () => sheet(!sh.classList.contains('open'));
  sh.querySelector('[data-cerrar]').onclick = () => { sheet(false); btn.focus({ preventScroll: true }); };
  const result = (on) => rs.classList.toggle('open', on);
  rs.querySelector('[data-close]').onclick = () => result(false);
  return { result, sheet };
}
