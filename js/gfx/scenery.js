// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Escenarios pixel art del simulador: cielo con tramado (dithering), estrellas, astro decorativo y suelo por planeta.
import { hash, planetSprite } from './pixel.js';
import { PLANETS } from '../data/planets.js';

const mix = (a, b, t) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
// Astro que se ve en el cielo de cada planeta (solo decoración).
const DECOR = { luna: 'tierra', marte: 'luna', tierra: 'luna', jupiter: 'luna', 'tierra-aire': 'luna', venus: 'tierra', europa: 'jupiter', io: 'jupiter', entropia: 'jupiter', 'entropia-domo': 'jupiter' };
const cache = new Map();

// Devuelve un canvas W×H con el fondo fijo del planeta (se dibuja una vez y se reutiliza).
export function background(pl, W, H, groundY) {
  const key = `${pl.id}|${W}|${H}|${groundY}`;
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  // Cielo en 6 franjas con tramado de tablero entre franjas.
  const STEPS = 6;
  for (let y = 0; y < groundY + 4; y++) {
    const t = (y / (groundY + 4)) * (STEPS - 1), k = Math.floor(t), f = t - k;
    const c0 = mix(pl.sky[0], pl.sky[1], k / (STEPS - 1)), c1 = mix(pl.sky[0], pl.sky[1], Math.min(k + 1, STEPS - 1) / (STEPS - 1));
    for (let x = 0; x < W; x++) {
      const dither = f > 0.5 ? (f > 0.75 || (x + y) % 2 === 0) : f > 0.25 && (x + y) % 4 === 0;
      g.fillStyle = dither ? c1 : c0; g.fillRect(x, y, 1, 1);
    }
  }
  // Estrellas (más visibles donde el cielo es oscuro).
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(hash(i, 1, 3) * W), y = Math.floor(hash(i, 2, 3) * groundY * 0.7);
    g.fillStyle = i % 7 === 0 ? '#ffe66d' : '#ffffff'; g.globalAlpha = 0.25 + 0.5 * (1 - y / groundY);
    g.fillRect(x, y, 1, 1);
  }
  g.globalAlpha = 1;
  const other = PLANETS.find((p) => p.id === DECOR[pl.id]);
  if (other) g.drawImage(planetSprite(other, 12), W - 22, 22);
  // Suelo: color base, borde claro y textura según el planeta.
  g.fillStyle = mix(pl.ground, '#ffffff', 0.25); g.fillRect(0, groundY + 4, W, 1);
  g.fillStyle = pl.ground; g.fillRect(0, groundY + 5, W, H - groundY - 5);
  for (let y = groundY + 5; y < H; y++) for (let x = 0; x < W; x++) {
    const h = hash(x, y, 9);
    if (pl.px.style === 'craters' && h > 0.93) { g.fillStyle = mix(pl.ground, '#000000', 0.35); g.fillRect(x, y, 2, 1); }
    else if (pl.px.style === 'dust' && h > 0.9) { g.fillStyle = mix(pl.ground, '#000000', 0.3); g.fillRect(x, y, 1, 1); }
    else if (pl.px.style === 'earth' && h > 0.85) { g.fillStyle = mix(pl.ground, '#ffffff', 0.2); g.fillRect(x, y, 1, 2); }
    else if (pl.px.style === 'bands' && (y + Math.floor(x / 9)) % 4 === 0 && h > 0.4) { g.fillStyle = mix(pl.ground, '#ffffff', 0.15); g.fillRect(x, y, 1, 1); }
    else if (h > 0.97) { g.fillStyle = mix(pl.ground, '#000000', 0.25); g.fillRect(x, y, 1, 1); }
  }
  if (pl.px.style === 'craters') [[14, 3, 10], [78, 6, 14], [44, 9, 8]].forEach(([x, dy, w]) => {
    g.fillStyle = mix(pl.ground, '#000000', 0.3); g.fillRect(x, groundY + 5 + dy, w, 2);
    g.fillStyle = mix(pl.ground, '#ffffff', 0.3); g.fillRect(x + 1, groundY + 7 + dy, w - 2, 1);
  });
  if (pl.px.style === 'dust') [[8, 7], [92, 5], [30, 6]].forEach(([x, hgt]) => { // rocas
    g.fillStyle = mix(pl.ground, '#000000', 0.4); g.fillRect(x, groundY + 4 - hgt + 4, 6, hgt);
    g.fillStyle = mix(pl.ground, '#ffffff', 0.2); g.fillRect(x + 1, groundY + 4 - hgt + 4, 2, 1);
  });
  // Atmósfera (Acto 2): bandas de nubes o bruma con tramado; más densas cuanto más denso el aire.
  if (pl.air > 0) {
    const n = Math.min(6, 2 + Math.round(Math.log10(1 + pl.air) * 2));
    for (let i = 0; i < n; i++) {
      const y0 = 10 + Math.floor(hash(i, 4, 7) * (groundY - 30)), w = 30 + Math.floor(hash(i, 5, 7) * 50), x0 = Math.floor(hash(i, 6, 7) * (W - 20)) - 10;
      g.fillStyle = mix(pl.sky[1], '#ffffff', 0.35);
      for (let y = y0; y < y0 + 4; y++) for (let x = x0; x < x0 + w; x++) if ((x + y) % 2 === 0 || (y > y0 && y < y0 + 3 && x > x0 + 3 && x < x0 + w - 3)) g.fillRect(x, y, 1, 1);
    }
  }
  cache.set(key, c);
  return c;
}
