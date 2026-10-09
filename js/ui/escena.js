// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// M11: escena de juego a pantalla completa compartida por los tres simuladores (sin aire, con aire, impacto).
// M11.1: cámara vertical continua. El mundo tiene el suelo en h = 0 y se ve a través de una cámara:
// · Zoom continuo: los metros visibles crecen suavemente con la altura de la nave (sin escalas a saltos).
// · Cerca del suelo la nave sube en pantalla; más arriba queda a ~40 % desde arriba y es el MUNDO el que baja.
// · Paralaje vertical por capas (cielo poco, lejanas a medias, suelo al 100 %) y horizontal sin fin;
//   arriba de la imagen se rellena con cielo tramado, nubes y, a gran altura, estrellas.
// · Al soltar, la cámara sigue al paquete hasta ver el suelo y el impacto; al reiniciar vuelve a la nave.
// · Regla lateral en coordenadas del mundo (marcas «bonitas» que se desplazan con la cámara).
// · La altura se cambia ARRASTRANDO arriba/abajo sobre la escena (o con flechas: role="slider").
// · Con la regla saboteada por Dr. Caos no se muestra ninguna altura (el alumno la escribe).
// La pantalla dibuja lo suyo en paint(g, sc) con sc.yOf(h) (mundo → pantalla, ya con la cámara) y sc.GROUND
// (y en pantalla del suelo, puede quedar fuera de vista). Mientras el paquete cae llama sc.focus(h).
import { drawArt, ready, load, fondoKey } from '../gfx/imagenes.js';
import { background } from '../gfx/scenery.js';
import { PARABOLA } from '../gfx/sprites.js';
import { hash } from '../gfx/pixel.js';

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
export const SHIP_W = 72, SHIP_H = 27;
const SHIP_MAX = 0.6; // fracción máxima de la zona de vuelo (desde el suelo) que ocupa la nave: 40 % desde arriba
// Metros visibles en la zona de vuelo: función continua de la altura (h^0.6). Hasta ~5 m el suelo queda a la vista.
const spanOf = (h) => Math.max(1.2, 3.2 * Math.pow(Math.max(h, 0.05), 0.6));
const stepOf = (h) => (h < 10 ? 0.1 : h < 100 ? 1 : 5);
const fmtH = (h) => (h < 10 ? h.toFixed(1) : String(Math.round(h))) + ' m';
const niceStep = (raw) => { const p = 10 ** Math.floor(Math.log10(raw)), f = raw / p; return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p; };
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// Capas de cada fondo (filas de la imagen de 320 px): cielo [0, sky), lejanas [sky, gnd), suelo [gnd, fin).
// Cortes elegidos donde no hay objetos que atraviesen la frontera (así el paralaje no «rompe» rocas ni montañas).
const CAPAS = {
  'fondo-tierra': { sky: 148, gnd: 222, nube: '#f4f6ff' }, 'fondo-marte': { sky: 110, gnd: 205, nube: '#f0b48a' },
  'fondo-luna': { sky: 152, gnd: 228 }, 'fondo-jupiter': { sky: 0, gnd: 255, nube: '#e8d2a8' },
  'fondo-venus': { sky: 178, gnd: 234, nube: '#f2d58a' }, 'fondo-titan': { sky: 160, gnd: 238, nube: '#e0a060' },
  'fondo-europa': { sky: 0, gnd: 178 }, 'fondo-io': { sky: 0, gnd: 250 }, 'fondo-entropia': { sky: 0, gnd: 215 },
};
const NIGHT = [6, 8, 26], VS = 0.25, VF = 0.6; // paralaje vertical de cielo y capas lejanas
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const mixRGB = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
// Datos derivados de cada imagen (una vez): tira doble con la copia en espejo y colores medios de filas clave.
const prep = new Map();
function prepOf(key, im) {
  if (prep.has(key)) return prep.get(key);
  const iw = im.width, ih = im.height, c = document.createElement('canvas');
  c.width = iw * 2; c.height = ih;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  x.drawImage(im, 0, 0); x.save(); x.translate(iw * 2, 0); x.scale(-1, 1); x.drawImage(im, 0, 0); x.restore();
  const L = CAPAS[key] || { sky: Math.round(ih * 0.5), gnd: Math.round(ih * 0.7) };
  const k = ih / 320, sky = Math.round(L.sky * k), gnd = Math.round(L.gnd * k);
  let avg = () => [40, 60, 120];
  try {
    const d = x.getImageData(0, 0, iw * 2, ih).data;
    avg = (row) => { // color más frecuente de la fila (en pixel art es el «fondo» de esa fila)
      const n = new Map(); let best = 0, col = [0, 0, 0];
      for (let i = 0; i < iw; i++) { const o = (row * iw * 2 + i) * 4, k = (d[o] << 16) | (d[o + 1] << 8) | d[o + 2], c = (n.get(k) || 0) + 1; n.set(k, c); if (c > best) { best = c; col = [d[o], d[o + 1], d[o + 2]]; } }
      return col;
    };
  } catch { /* lienzo «contaminado» (file://): colores por omisión */ }
  const r = { c, iw, ih, sky, gnd, nube: L.nube, top: avg(0), hor: avg(Math.max(0, sky - 1)), farBot: avg(Math.max(0, gnd - 1)), plain: avg(Math.min(ih - 1, gnd + 1)) };
  prep.set(key, r); return r;
}
// Nubes (posición fija en el «cielo» con paralaje) y estrellas: deterministas.
const CLOUDS = Array.from({ length: 14 }, (_, i) => ({ y: -30 - i * 120 - hash(i, 3, 7) * 60, x: hash(i, 4, 7) * 600, w: 26 + Math.round(hash(i, 5, 7) * 30), sp: 0.08 + 0.1 * hash(i, 6, 7) }));

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
  // La escena nunca se desplaza por dentro (un foco o un panel podía «scrollearla» y descuadrar todo).
  host.addEventListener('scroll', () => { if (host.scrollTop || host.scrollLeft) { host.scrollTop = 0; host.scrollLeft = 0; } });
  host.setAttribute('role', 'slider');
  host.setAttribute('aria-label', o.label || 'Altura de la nave: arrastra arriba o abajo, o usa las flechas');
  // GROUND0: y en pantalla del suelo cuando la cámara está abajo (borde inferior de la zona de vuelo).
  let W = 240, H = 380, GROUND0 = 320, TOP = 70, cssW = 1, cssH = 1;
  let pl = o.planet, h = o.h0, shown = o.h0, locked = false, scroll = 0, vel = 22, last = performance.now(), raf = 0;
  let bgKey = null, halted = false;
  // Cámara: cam = altura del mundo (m) que cae en GROUND0; span = metros visibles entre GROUND0 y TOP.
  let span = spanOf(o.h0), cam = 0, spanLock = span, camLock = 0, focusH = null;

  function resize() {
    const r = host.getBoundingClientRect(); cssW = Math.max(1, r.width); cssH = Math.max(1, r.height);
    W = Math.max(200, Math.min(300, Math.round(cssW / 1.5)));
    H = Math.round((W * cssH) / cssW);
    cv.width = W; cv.height = H; g.imageSmoothingEnabled = false;
    GROUND0 = H - Math.round(Math.max(52, H * 0.15)); // por encima de la barra de botones
    TOP = Math.round(Math.min(96, H * 0.22)); // por debajo de las lecturas superiores
    // Si la pantalla tiene capas encima (lecturas arriba, botones abajo), la zona de vuelo queda entre ellas.
    const top = host.querySelector('.g-top'), bot = host.querySelector('.g-bottom'), ky = H / cssH;
    if (top) TOP = Math.round((top.offsetTop + top.offsetHeight + 30) * ky);
    if (bot) GROUND0 = Math.min(H - 20, Math.round((cssH - bot.offsetHeight - 22) * ky));
    if (GROUND0 - TOP < 60) TOP = GROUND0 - 60;
  }
  const ro = new ResizeObserver(resize); ro.observe(host); host.querySelector('.g-top') && ro.observe(host.querySelector('.g-top')); resize();

  const ppm = () => (GROUND0 - TOP) / span; // píxeles por metro
  const yOf = (hh) => GROUND0 - (hh - cam) * ppm(); // mundo → pantalla (ya incluye la cámara)
  const shipX = () => Math.round(W * 0.28);
  const bob = () => (REDUCE.matches ? 0 : Math.round(Math.sin(performance.now() / 450) * 1.5));
  // Posición de la panza de la nave (de ahí sale el paquete).
  const ship = () => ({ x: shipX(), y: Math.round(yOf(shown)), cx: shipX() + SHIP_W / 2 });
  const camFor = (hs, sp) => Math.max(0, hs - SHIP_MAX * sp);

  function setPlanet(p) { pl = p; bgKey = fondoKey(p); if (bgKey) load(bgKey); }
  setPlanet(pl);
  function setHeight(v, { instant = false, silent = false } = {}) {
    h = Math.max(o.hMin, Math.min(o.hMax, Math.round(v / stepOf(v)) * stepOf(v)));
    h = +h.toFixed(2);
    if (instant) { shown = h; if (!locked) { span = spanOf(h); cam = camFor(h, span); } }
    host.setAttribute('aria-valuenow', String(h));
    host.setAttribute('aria-valuetext', o.hideRuler ? 'altura oculta por Dr. Caos' : fmtH(h));
    if (!silent) o.onHeight(h);
  }
  host.setAttribute('aria-valuemin', String(o.hMin)); host.setAttribute('aria-valuemax', String(o.hMax));
  setHeight(h, { instant: true, silent: true });

  // Arrastre: 60 % del alto de la escena multiplica la altura ×10 (preciso cerca del suelo y rápido arriba).
  let drag = null;
  const canDrag = () => !o.fixed && !o.hideRuler && !locked;
  // Tras un lanzamiento la escena queda «bloqueada» mostrando el impacto; tocarla de nuevo rearma la nave
  // (la pantalla reinicia con o.rearm(); si devuelve false, todavía está cayendo y no se puede).
  const rearm = () => locked && halted && !o.fixed && !o.hideRuler && o.rearm && o.rearm() !== false;
  host.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button,input,a,.result,.sheet,#scene')) return;
    if (locked) rearm();
    if (!canDrag()) return;
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
    if (e.target !== host) return;
    if (locked && /^(Arrow|Page)/.test(e.key)) rearm();
    if (!canDrag()) return;
    const k = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }[e.key];
    if (!k) return;
    e.preventDefault(); setHeight(h + k * stepOf(h));
  });

  // Cámara: sigue a la nave (o al paquete con focus) con suavizado exponencial; nunca salta.
  function camera(dt) {
    let tSpan, tCam;
    if (locked) {
      tSpan = spanLock;
      tCam = focusH == null ? camLock : Math.max(0, Math.min(camLock, focusH - 0.45 * tSpan));
    } else { tSpan = spanOf(shown); tCam = camFor(shown, tSpan); }
    const k = REDUCE.matches ? 1 : 1 - Math.exp(-dt * (locked ? 9 : 6));
    span += (tSpan - span) * k; cam += (tCam - cam) * k;
    if (locked && focusH != null) { // el paquete nunca sale de la vista; al tocar el suelo la cámara está abajo
      cam = Math.max(0, Math.min(cam, focusH - 0.08 * span));
      cam = Math.max(cam, focusH - 0.9 * span);
    }
    if (Math.abs(tCam - cam) < 1e-4 * span) cam = tCam;
  }

  // Fondo con paralaje: horizontal (sin fin, en espejo) y vertical (cielo 25 %, lejanas 60 %, suelo 100 %).
  const tile = (P, sy, sh, dy, off) => {
    if (sh <= 0 || dy >= H || dy + sh <= 0) return;
    const period = P.iw * 2; let x = -Math.round(((off % period) + period) % period);
    for (; x < W; x += period) g.drawImage(P.c, 0, sy, period, sh, x, Math.round(dy), period, sh);
  };
  function drawBg() {
    const im = bgKey && ready(bgKey), d = cam * ppm(), alt = cam + span * 0.5;
    if (!im) { // respaldo generado, desplazado con la cámara
      g.fillStyle = pl.sky?.[0] || '#05060f'; g.fillRect(0, 0, W, H);
      g.drawImage(background(pl, W, H, GROUND0), 0, Math.round(d)); return;
    }
    const P = prepOf(bgKey, im), y0 = H - P.ih;
    const ySky = y0 + VS * d, yFar = y0 + P.sky + VF * d, yGnd = y0 + P.gnd + d;
    const imgTop = P.sky > 0 ? ySky : yFar - P.sky;
    // Cielo por encima de la imagen: degradado hacia la noche (más rápido cuanto más alto), tramado y estrellas.
    const night = smooth(120, 1800, alt), dark = 1 - Math.max(...P.top) / 255;
    if (imgTop > 0) {
      const L = Math.max(70, 900 * (1 - night)), gr = g.createLinearGradient(0, imgTop, 0, imgTop - L);
      gr.addColorStop(0, hex(P.top)); gr.addColorStop(1, hex(mixRGB(P.top, NIGHT, Math.min(1, 0.55 + night))));
      g.fillStyle = gr; g.fillRect(0, 0, W, Math.ceil(imgTop) + 1);
      const yE = Math.min(H, Math.floor(imgTop) - 2); // tramado pixel (textura fija, sin costo por píxel)
      if (yE > 0) { g.globalAlpha = 0.2; g.drawImage(dither(), 0, 0, W, yE, 0, 0, W, yE); g.globalAlpha = 1; }
      const sa = Math.max(night, dark > 0.8 ? 1 : 0);
      if (sa > 0.02) for (let i = 0; i < 46; i++) {
        const sy = ((hash(i, 2, 4) * H * 1.6 + 0.06 * d) % (H * 1.6)) - 0.3 * H;
        if (sy > imgTop - 6 || sy < 0) continue;
        const sx = (((hash(i, 1, 4) * W - scroll * 0.01) % W) + W) % W;
        g.globalAlpha = sa * (0.45 + 0.5 * hash(i, 9, 2)) * Math.min(1, (imgTop - sy) / 40);
        g.fillStyle = i % 6 ? '#ffffff' : '#ffe66d'; g.fillRect(Math.floor(sx), Math.floor(sy), 1, 1);
      }
      g.globalAlpha = 1;
    }
    // Capas de la imagen y los huecos que abre el paralaje vertical (color medio de la fila de borde).
    // Los huecos que abre el paralaje se rellenan con el color de su fila de borde (antes se repetían filas
    // de la imagen y se veían texturas duplicadas al subir).
    if (P.sky > 0) { // hueco entre cielo y lejanas: color del horizonte
      tile(P, 0, P.sky, ySky, scroll * 0.05);
      const a = Math.floor(ySky + P.sky) - 1, b = Math.ceil(yFar) + 1;
      if (b > a) { g.fillStyle = hex(P.hor); g.fillRect(0, a, W, b - a); }
    }
    tile(P, P.sky, P.gnd - P.sky, yFar, scroll * 0.25);
    // Hueco entre lejanas y suelo: degradado de la base de las lejanas a la llanura del suelo, con tramado.
    const yFarEnd = Math.floor(yFar + P.gnd - P.sky) - 1, yG = Math.ceil(yGnd) + 1;
    if (yG > yFarEnd && yFarEnd < H && yG > 0) {
      const gr = g.createLinearGradient(0, yFarEnd, 0, yG);
      gr.addColorStop(0, hex(P.farBot)); gr.addColorStop(Math.min(1, 24 / (yG - yFarEnd)), hex(P.plain)); gr.addColorStop(1, hex(P.plain));
      g.fillStyle = gr; g.fillRect(0, yFarEnd, W, yG - yFarEnd);
      const y1 = Math.max(0, yFarEnd), y2 = Math.min(H, yG);
      if (y2 > y1) { g.globalAlpha = 0.12; g.drawImage(dither(), 0, y1, W, y2 - y1, 0, y1, W, y2 - y1); g.globalAlpha = 1; }
    }
    tile(P, P.gnd, P.ih - P.gnd, yGnd, scroll * 0.7);
    // Nubes en el cielo (paralaje intermedio), solo en mundos con atmósfera visible.
    if (P.nube) {
      for (const c of CLOUDS) {
        const cy = Math.round(y0 + c.y + 0.4 * d); if (cy < -12 || cy > H) continue;
        const span2 = W + 2 * c.w, cx = Math.round((((c.x - scroll * c.sp) % span2) + span2) % span2) - c.w;
        cloud(cx, cy, c.w, P.nube);
      }
    }
  }
  let dith = null;
  function dither() {
    if (dith && dith.width === W && dith.height === H) return dith;
    dith = document.createElement('canvas'); dith.width = W; dith.height = H;
    const x = dith.getContext('2d'); x.fillStyle = '#000014';
    for (let y = 0; y < H; y += 2) for (let i = (y >> 1) % 4; i < W; i += 4) if (hash(i, y, 5) < 0.6) x.fillRect(i, y, 1, 1);
    return dith;
  }
  function cloud(x, y, w, col) {
    g.globalAlpha = 0.9; g.fillStyle = col;
    g.fillRect(x, y + 4, w, 5); g.fillRect(x + 3, y + 2, Math.round(w * 0.55), 3); g.fillRect(x + Math.round(w * 0.3), y, Math.round(w * 0.35), 3);
    g.fillStyle = 'rgba(40,40,90,.25)'; g.fillRect(x + 2, y + 8, w - 4, 2);
    g.globalAlpha = 1;
  }
  function drawRuler() {
    const yb = Math.min(yOf(0), H);
    if (o.hideRuler) { g.fillStyle = '#ff3fa4'; for (let y = TOP; y < Math.min(yb, GROUND0); y += 8) g.fillRect(3 + ((y / 8) % 2) * 2, y, 3, 3); return; }
    if (yb <= TOP) return;
    const k = ppm(), step = niceStep(span / 5), minor = step / (step * k / 5 >= 5 ? 5 : 2);
    g.fillStyle = 'rgba(10,13,34,.35)'; g.fillRect(0, TOP - 6, 12, yb - TOP + 6);
    g.font = '8px "Press Start 2P", monospace'; g.textBaseline = 'middle'; g.textAlign = 'left';
    const hb = Math.max(0, cam - (yb - GROUND0) / k), ht = cam + (GROUND0 - TOP + 6) / k, dec = step < 1 ? 1 : 0;
    for (let n = Math.ceil(hb / minor - 1e-6); n * minor <= ht; n++) {
      const v = n * minor, y = Math.round(yOf(v)), big = Math.abs(v / step - Math.round(v / step)) < 1e-6;
      if (y < TOP - 6 || y > yb) continue;
      g.fillStyle = '#0a0d22'; g.fillRect(2, y + 1, big ? 8 : 4, 1);
      g.fillStyle = big ? '#ffe66d' : '#e9f0ff'; g.fillRect(1, y, big ? 8 : 4, 1);
      if (big && v > 0 && y - 7 >= TOP - 6) { const t = String(+v.toFixed(dec)); g.fillStyle = '#0a0d22'; g.fillText(t, 4, y - 6); g.fillStyle = '#ffe66d'; g.fillText(t, 3, y - 7); }
    }
    // línea punteada hasta la nave
    const y = Math.round(yOf(shown)); if (y < 0 || y > H) return;
    g.fillStyle = 'rgba(255,230,109,.7)';
    for (let x = 10; x < shipX(); x += 4) g.fillRect(x, y, 2, 1);
  }
  function drawShip() {
    const s = ship(), y = s.y - SHIP_H + bob() + 2;
    if (y > H || y + SHIP_H < 0) return;
    if (!REDUCE.matches) { // estela del motor
      g.fillStyle = (Math.floor(performance.now() / 90) % 2) ? '#ffe66d' : '#ff8a1f';
      g.fillRect(s.x - 4, y + Math.round(SHIP_H * 0.42), 4, 2);
    }
    drawArt(g, 'nave', PARABOLA, s.x, y, SHIP_W, SHIP_H);
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    // El fondo sigue desplazándose mientras cae el paquete; tras el impacto frena suave (el paquete ya no viaja).
    vel += ((halted ? 0 : 22) - vel) * (1 - Math.exp(-dt * 3));
    if (!REDUCE.matches) scroll += dt * vel;
    const k = REDUCE.matches ? 1 : 1 - Math.exp(-dt * 10);
    shown += (h - shown) * k;
    if (Math.abs(h - shown) < 1e-3) shown = h;
    camera(dt);
    drawBg(); drawRuler(); drawShip();
    o.paint(g, api);
    // etiqueta de altura junto a la nave (en px CSS); se oculta si la nave sale de la vista
    const s = ship(), kx = cssW / W, ky = cssH / H, vis = s.y > TOP - 20 && s.y < H;
    tag.textContent = o.hideRuler ? '¿? m' : fmtH(locked ? h : shown);
    tag.classList.toggle('caos', o.hideRuler);
    tag.style.visibility = vis ? '' : 'hidden';
    tag.style.transform = `translate(${Math.round((s.x + SHIP_W + 2) * kx)}px, ${Math.round((s.y - SHIP_H / 2) * ky - 14)}px)`;
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  if (!canDrag()) hint.classList.add('gone');

  const api = {
    get W() { return W; }, get H() { return H; }, get TOP() { return TOP; },
    get GROUND() { return yOf(0); }, // y en pantalla del suelo (h = 0); puede quedar fuera de vista
    get h() { return h; }, get span() { return span; }, ship, yOf, setHeight, setPlanet,
    // Durante la caída se congela el zoom; la cámara sigue al paquete (focus) hasta ver el suelo.
    lock(v) {
      locked = v; focusH = null;
      // La caída se encuadra desde la nave (no desde donde quedó la cámara tras el lanzamiento anterior).
      if (v) { shown = h; spanLock = spanOf(h); camLock = camFor(h, spanLock); }
      hint.classList.add('gone');
      if (!v) hint.textContent = '⇕ arrastra para subir o bajar';
    },
    focus(v) { focusH = v == null ? null : Math.max(0, v); }, // altura (m) del paquete que la cámara debe seguir
    halt(v) { // tras el impacto el fondo frena suavemente y se invita a otro lanzamiento
      halted = v;
      if (v && o.rearm && !o.fixed && !o.hideRuler) { hint.textContent = '⇕ arrastra para otro lanzamiento'; hint.classList.remove('gone'); }
    },
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
