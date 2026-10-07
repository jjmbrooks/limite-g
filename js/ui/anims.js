// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Mini-animaciones pixel art del Códice. Cada una dibuja el instante t (s) en un canvas de 120×72.
// Con movimiento reducido se muestra un solo cuadro representativo (STILL).
import { draw, planetSprite } from '../gfx/pixel.js';
import { OBJ_SPRITES } from '../gfx/sprites.js';
import { PLANETS } from '../data/planets.js';

export const AW = 120, AH = 72;
export const C = { bg: '#0e1430', grid: '#1b2350', ground: '#2a3570', teal: '#2de2c8', orange: '#ff8a1f', ink: '#e9f0ff', dim: '#8a93b8', yellow: '#ffe66d', magenta: '#ff3fa4' };
export const GROUND = 64;

export function base(g) {
  g.fillStyle = C.bg; g.fillRect(0, 0, AW, AH);
  g.fillStyle = C.grid; for (let x = 0; x < AW; x += 8) g.fillRect(x, 0, 1, GROUND);
  g.fillStyle = C.ground; g.fillRect(0, GROUND, AW, AH - GROUND);
}
// Barra vertical pixel (valor 0..1)
export function vbar(g, x, y, h, v, col) {
  g.fillStyle = '#000'; g.fillRect(x - 1, y - 1, 8, h + 2);
  g.fillStyle = C.grid; g.fillRect(x, y, 6, h);
  const f = Math.round(h * Math.max(0, Math.min(1, v)));
  g.fillStyle = col; g.fillRect(x, y + h - f, 6, f);
}
export function label(g, txt, x, y, col = C.ink) { g.fillStyle = col; g.font = '8px monospace'; g.textBaseline = 'top'; g.fillText(txt, x, y); }
export const loop = (t, T) => (t % T) / T;

export const ANIMS = {
  // Objeto que sube: la barra Ep crece con la altura.
  ep(g, t) {
    base(g);
    const k = Math.min(1, loop(t, 3) * 1.3), y = GROUND - 8 - Math.round(k * 46);
    g.fillStyle = C.dim; g.fillRect(40, y + 8, 1, GROUND - y - 8); // cuerda/regla
    g.fillRect(36, GROUND - 1, 9, 1);
    draw(g, OBJ_SPRITES.cristal, 36, y);
    label(g, 'h=' + (k * 10).toFixed(1) + 'm', 48, y);
    vbar(g, 100, 10, 50, k, C.teal); label(g, 'Ep', 99, 1, C.teal);
  },
  // Objeto que acelera y frena: la barra Ec va con v².
  ec(g, t) {
    base(g);
    const p = loop(t, 3), v = Math.sin(p * Math.PI), x = 4 + ((t * 40) % 84);
    for (let k = 1; k <= Math.round(v * 3); k++) { g.fillStyle = '#ffffff44'; g.fillRect(x - k * 5, GROUND - 5, 3, 1); }
    draw(g, OBJ_SPRITES.robot, x, GROUND - 8);
    label(g, 'v=' + (v * 6).toFixed(1) + 'm/s', 4, 4);
    vbar(g, 100, 10, 50, v * v, C.orange); label(g, 'Ec', 99, 1, C.orange);
  },
  // Caída con las dos barras: su suma no cambia.
  cons(g, t) {
    base(g);
    const T = 1.6, p = Math.min(1, loop(t, T + 0.8) * (T + 0.8) / T), fall = p * p, y = 6 + Math.round(fall * 50);
    draw(g, OBJ_SPRITES.vacuna, 30, y);
    vbar(g, 84, 10, 50, 1 - fall, C.teal); label(g, 'Ep', 83, 1, C.teal);
    vbar(g, 100, 10, 50, fall, C.orange); label(g, 'Ec', 99, 1, C.orange);
    label(g, 'Ep+Ec', 52, 30, C.yellow); label(g, '= cte', 54, 40, C.yellow);
  },
  // Estroboscopio: posiciones cada 0.2 s, cada vez más separadas.
  caida(g, t) {
    base(g);
    const n = Math.min(7, Math.floor(loop(t, 3.2) * 10) + 1);
    for (let i = 0; i < n; i++) {
      const y = 4 + Math.round(1.1 * i * i);
      g.globalAlpha = i === n - 1 ? 1 : 0.35; draw(g, OBJ_SPRITES.huevo, 26, y); g.globalAlpha = 1;
      label(g, (i * 0.2).toFixed(1) + 's', 38, y, C.dim);
      if (i) { g.fillStyle = C.yellow; g.fillRect(70, 4 + Math.round(1.1 * (i - 1) * (i - 1)) + 4, 1, Math.round(1.1 * (2 * i - 1)) - 1); g.fillRect(68, y + 3, 5, 1); }
    }
    label(g, 'Δh crece', 76, 28, C.yellow);
  },
  // Cuatro planetas, mismo objeto y altura, distinta g.
  g(g, t) {
    base(g);
    const list = PLANETS.filter((p) => p.act === 1).slice(0, 4), T = 2.6, tt = t % T;
    list.forEach((p, i) => {
      const x = 8 + i * 28, fall = Math.min(1, 0.5 * p.g * tt * tt / 12), y = 4 + Math.round(fall * 48);
      g.drawImage(planetSprite(p, 12), x, GROUND - 4);
      draw(g, OBJ_SPRITES.cel, x + 2, y);
      label(g, String(p.g), x, GROUND - 14 > y + 10 ? GROUND - 13 : 2, C.dim);
    });
  },
  // Línea de altura segura: la barra de Ec llega justo al Límite G.
  limite(g, t) {
    base(g);
    const p = loop(t, 2.4), fall = Math.min(1, (p * 1.4) ** 2), y = 14 + Math.round(fall * 42);
    for (let x = 4; x < 76; x += 4) { g.fillStyle = C.magenta; g.fillRect(x, 22, 2, 1); }
    label(g, 'h segura', 4, 12, C.magenta);
    draw(g, OBJ_SPRITES.cel, 34, y);
    vbar(g, 100, 10, 50, fall, C.orange);
    g.fillStyle = C.magenta; g.fillRect(96, 10, 14, 1); label(g, 'límite', 78, 2, C.magenta);
  },
};
export const STILL = { ep: 2.4, ec: 0.75, cons: 0.8, caida: 2.9, g: 1.2, limite: 1.1 };
