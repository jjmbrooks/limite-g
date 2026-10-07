// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// M11: arte 16-bit en PNG (assets/sprites, assets/fondos) con respaldo en los sprites de matriz.
// Si un PNG no carga (sin red, archivo faltante) se dibuja la matriz de js/gfx/sprites.js: el juego nunca se rompe.
import { sprite } from './pixel.js';

const RUTAS = {
  'retrato-nova': 'assets/sprites/retrato-nova.png',
  'retrato-caos': 'assets/sprites/retrato-caos.png',
  'retrato-gal': 'assets/sprites/retrato-gal.png',
  nave: 'assets/sprites/nave.png',
  capsula: 'assets/sprites/capsula.png',
  'obj-cel': 'assets/sprites/obj-cel.png',
  'obj-huevo': 'assets/sprites/obj-huevo.png',
  'obj-vacuna': 'assets/sprites/obj-vacuna.png',
  'obj-cristal': 'assets/sprites/obj-cristal.png',
  'obj-robot': 'assets/sprites/obj-robot.png',
  'obj-nucleo': 'assets/sprites/obj-nucleo.png',
};
// Fondo panorámico por planeta (las variantes con aire comparten el de su planeta).
const FONDO = { luna: 'luna', marte: 'marte', tierra: 'tierra', 'tierra-aire': 'tierra', jupiter: 'jupiter', venus: 'venus', titan: 'titan',
  europa: 'europa', io: 'io', entropia: 'entropia', 'entropia-domo': 'entropia' };
export const fondoKey = (pl) => (FONDO[pl.id] ? 'fondo-' + FONDO[pl.id] : null);
const ruta = (key) => RUTAS[key] || (key.startsWith('fondo-') ? `assets/fondos/${key.slice(6)}.png` : null);

const imgs = new Map(); // key → { img, ok, p }
export function load(key) {
  if (imgs.has(key)) return imgs.get(key).p;
  const src = ruta(key), rec = { img: new Image(), ok: false, p: null };
  rec.p = new Promise((res) => {
    if (!src) { res(null); return; }
    rec.img.onload = () => { rec.ok = true; res(rec.img); };
    rec.img.onerror = () => res(null); // sin error en consola: se usa la matriz
    rec.img.src = src;
  });
  imgs.set(key, rec);
  return rec.p;
}
// Imagen lista o null (y pide la carga si no se había pedido).
export function ready(key) { if (!imgs.has(key)) load(key); const r = imgs.get(key); return r && r.ok ? r.img : null; }

// Dibuja el PNG (o la matriz de respaldo) en el rectángulo x, y, w, h del contexto.
export function drawArt(ctx, key, rows, x, y, w, h) {
  const im = ready(key) || (rows ? sprite(rows) : null);
  if (im) ctx.drawImage(im, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// <canvas> para el DOM: muestra la matriz al instante y la cambia por el PNG en cuanto carga.
export function artCanvas(key, rows, { w = 16, h = w, cls = 'px', label = '' } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; c.className = cls;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const paint = (im) => { g.clearRect(0, 0, w, h); const k = Math.min(w / im.width, h / im.height); g.drawImage(im, Math.round((w - im.width * k) / 2), Math.round(h - im.height * k), Math.round(im.width * k), Math.round(im.height * k)); };
  const im = ready(key);
  if (im) paint(im); else { if (rows) paint(sprite(rows)); load(key).then((x) => x && paint(x)); }
  if (label) { c.setAttribute('role', 'img'); c.setAttribute('aria-label', label); } else c.setAttribute('aria-hidden', 'true');
  return c;
}
