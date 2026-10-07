// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Motor mínimo de pixel art: convierte matrices de texto en <canvas> (con caché) y genera planetas.
import { PALETTE } from './palette.js';

const cache = new Map();
let palIds = new WeakMap(), nextPal = 1;
const palId = (pal) => { if (!palIds.has(pal)) palIds.set(pal, nextPal++); return palIds.get(pal); };

// Canvas 1:1 del sprite (se reutiliza: no lo modifiques).
export function sprite(rows, pal = PALETTE) {
  const key = palId(pal) + '|' + rows.join('/');
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = rows[0].length; c.height = rows.length;
  const x = c.getContext('2d');
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i, j, 1, 1); } }));
  cache.set(key, c);
  return c;
}

// Dibuja un sprite en un contexto de juego (coordenadas enteras para que no se emborrone).
export function draw(ctx, rows, x, y, pal) {
  ctx.drawImage(sprite(rows, pal), Math.round(x), Math.round(y));
}

// <canvas> listo para el DOM, escalado por CSS con image-rendering: pixelated.
export function pxCanvas(rows, { cls = 'px', label = '', pal } = {}) {
  const src = sprite(rows, pal), c = document.createElement('canvas');
  c.width = src.width; c.height = src.height; c.className = cls;
  c.getContext('2d').drawImage(src, 0, 0);
  if (label) { c.setAttribute('role', 'img'); c.setAttribute('aria-label', label); } else c.setAttribute('aria-hidden', 'true');
  return c;
}

// Ruido determinista 0..1 (el mismo pixel siempre da el mismo valor).
export const hash = (x, y, seed = 0) => { const s = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453; return s - Math.floor(s); };

// Planeta pixel art N×N a partir de su estilo y 4 tonos (a claro, b base, c sombra, d detalle).
export function planetRows(style, n = 16, seed = 1) {
  const c = (n - 1) / 2, r = n / 2 - 0.3, rows = [];
  for (let y = 0; y < n; y++) {
    let row = '';
    for (let x = 0; x < n; x++) {
      const dx = x - c, dy = y - c, d = Math.hypot(dx, dy);
      if (d > r) { row += '.'; continue; }
      if (d > r - 1) { row += 'k'; continue; }
      const light = (-dx - dy) / (r * 1.4); // luz desde arriba a la izquierda
      let ch = light > 0.35 ? 'a' : light < -0.3 ? 'c' : 'b';
      const h = hash(x, y, seed), band = Math.floor((y / n) * 7);
      if (style === 'craters' && h > 0.82) ch = 'c';
      if (style === 'craters' && h > 0.95) ch = 'd';
      if (style === 'dust' && (h > 0.8 || (band === 3 && h > 0.35)) && ch !== 'c') ch = 'd';
      if (style === 'dust' && y <= 2) ch = 'w';
      if (style === 'earth' && hash(Math.floor((x * 4) / n), Math.floor((y * 4) / n), seed) > 0.6) ch = ch === 'c' ? 'X' : 'd';
      if (style === 'earth' && h > 0.94) ch = 'w';
      if (style === 'bands' && band % 2) ch = ch === 'c' ? 'c' : 'd';
      if (style === 'bands' && y === Math.round(n * 0.62) && x > c && x < c + 3) ch = 'r';
      if (style === 'clouds' && (band + (h > 0.7 ? 1 : 0)) % 3 === 0) ch = ch === 'c' ? 'c' : 'a';
      if (style === 'haze' && band % 3 === 1) ch = ch === 'a' ? 'b' : 'c';
      if (style === 'ice' && (Math.abs(dx + dy * 0.5 - 1) < 0.5 || Math.abs(dx * 0.3 - dy + 2) < 0.5)) ch = 'd';
      if (style === 'volcano' && h > 0.8) ch = h > 0.93 ? 'k' : 'd';
      row += ch;
    }
    rows.push(row);
  }
  return rows;
}

const planetPals = new Map();
// Paleta de un planeta (de js/data/planets.js → px) combinada con la base.
export function planetPal(p) {
  if (!planetPals.has(p.id)) planetPals.set(p.id, { ...PALETTE, a: p.px.a, b: p.px.b, c: p.px.c, d: p.px.d });
  return planetPals.get(p.id);
}
export const planetSprite = (p, n = 16) => sprite(planetRows(p.px.style, n, p.id.length + n), planetPal(p));
export const planetCanvas = (p, n = 16, cls = 'px') => pxCanvas(planetRows(p.px.style, n, p.id.length + n), { cls, label: p.name, pal: planetPal(p) });
