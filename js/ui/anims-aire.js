// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Mini-animaciones pixel art del Códice, Acto 2 (con aire). Mismo formato que js/ui/anims.js (canvas 120×72, instante t en s).
import { draw, planetSprite } from '../gfx/pixel.js';
import { OBJ_SPRITES, PARACAIDAS } from '../gfx/sprites.js';
import { PLANETS } from '../data/planets.js';
import { C, GROUND, base, vbar, label, loop } from './anims.js';

const AIRP = PLANETS.filter((p) => p.act === 2);
// Flecha vertical pixel (dy > 0 hacia abajo)
function arrow(g, x, y, len, col) {
  g.fillStyle = col; const s = Math.sign(len) || 1, L = Math.abs(len);
  g.fillRect(x, Math.min(y, y + len), 1, L);
  g.fillRect(x - 1, y + len - s, 3, 1); g.fillRect(x - 2, y + len - 2 * s, 5, 1);
}
// Partículas de aire que suben (el objeto "atraviesa" el aire)
function airflow(g, t, speed, x0 = 4, x1 = 80) {
  g.fillStyle = '#ffffff33';
  for (let i = 0; i < 14; i++) { const x = x0 + ((i * 37) % (x1 - x0)), y = GROUND - ((i * 23 + t * speed * 10) % GROUND); g.fillRect(x, Math.round(y), 1, 3); }
}
// Curva v(t) mínima dentro de la animación
function curve(g, f, T, x0, y0, w, h, vMax, col, tEnd = T, dash = false) {
  g.fillStyle = col;
  for (let i = 0; i <= w; i++) { const t = (i / w) * T; if (t > tEnd) break; if (dash && i % 4 > 1) continue; const v = Math.min(vMax, f(t)); g.fillRect(x0 + i, y0 + h - Math.round((v / vMax) * h), 1, 1); }
}
const vAir = (t, g = 9.81, vt = 18) => vt * Math.tanh((g * t) / vt); // solución exacta con arrastre ∝ v²

export const ANIMS_AIRE = {
  // Arrastre (flecha arriba) crece con v²; peso (flecha abajo) fijo.
  arrastre(g, t) {
    base(g);
    const p = loop(t, 3.5), v = Math.min(1, p * 1.6), y = 20 + Math.round(p * 6);
    airflow(g, t, 4 + v * 20, 6, 70);
    draw(g, OBJ_SPRITES.cel, 34, y);
    arrow(g, 38, y + 9, 12, C.orange); label(g, 'peso', 44, y + 14, C.orange);
    arrow(g, 38, y - 1, -Math.max(2, Math.round(v * v * 12)), C.teal); label(g, 'F aire', 44, y - 12, C.teal);
    vbar(g, 100, 10, 50, v * v, C.teal); label(g, 'v²', 99, 1, C.teal);
  },
  // La velocidad deja de crecer: la curva se aplana en vt.
  terminal(g, t) {
    base(g);
    const T = 6, tt = Math.min(T, loop(t, T + 1.5) * (T + 1.5));
    curve(g, (x) => vAir(x, 9.81, 18), T, 8, 8, 100, 50, 24, C.orange, tt);
    for (let x = 8; x < 108; x += 4) { g.fillStyle = C.magenta; g.fillRect(x, 8 + 50 - Math.round((18 / 24) * 50), 2, 1); }
    label(g, 'vt', 110, 16, C.magenta); label(g, 'v(t)', 10, 2, C.orange);
  },
  // Al abrir el paracaídas la velocidad cae a una vt mucho menor.
  paracaidas(g, t) {
    base(g);
    const p = loop(t, 4), open = p > 0.45, y = 6 + Math.round((open ? 0.45 + (p - 0.45) * 0.35 : p) * 70);
    airflow(g, t, open ? 3 : 16, 6, 70);
    if (open) draw(g, PARACAIDAS, 30, Math.min(y, GROUND - 8) - 8);
    draw(g, OBJ_SPRITES.robot, 32, Math.min(y, GROUND - 8));
    vbar(g, 100, 10, 50, open ? 0.15 : Math.min(1, p * 2), C.orange); label(g, 'v', 101, 1, C.orange);
    label(g, open ? 'A grande' : 'A chica', 52, 8, open ? C.teal : C.dim);
  },
  // Tres barras: Ep se vacía, Ec se estanca y el aire se lleva el resto.
  perdida(g, t) {
    base(g);
    const k = Math.min(1, loop(t, 4) * 1.3), ecF = Math.min(k, 0.18 + 0.1 * (1 - Math.exp(-k * 3))) * Math.min(1, k * 4);
    airflow(g, t, 12, 6, 50);
    draw(g, OBJ_SPRITES.cristal, 24, 6 + Math.round(k * 50));
    vbar(g, 68, 10, 50, 1 - k, C.teal); label(g, 'Ep', 67, 1, C.teal);
    vbar(g, 84, 10, 50, ecF, C.orange); label(g, 'Ec', 83, 1, C.orange);
    vbar(g, 100, 10, 50, Math.max(0, k - ecF), C.magenta); label(g, 'aire', 96, 62, C.magenta);
  },
  // Mismo paquete en Tierra, Titán y Venus: cuanto más denso el aire, más lento cae.
  densidad(g, t) {
    base(g);
    const tt = loop(t, 4) * 4;
    AIRP.forEach((p, i) => {
      const x = 12 + i * 36, vt = Math.sqrt((2 * 0.1 * p.g) / (p.air * 0.0016)), d = Math.min(1, (vt * tt) / 50 * 0.35);
      g.drawImage(planetSprite(p, 12), x, GROUND - 4);
      draw(g, OBJ_SPRITES.vacuna, x + 2, 4 + Math.round(d * 48));
      label(g, String(p.air), x - 2, 2, C.dim);
    });
  },
  // Recta sin aire (punteada) contra curva con aire que se aplana.
  compara(g, t) {
    base(g);
    const T = 5, tt = Math.min(T, loop(t, T + 1.5) * (T + 1.5));
    curve(g, (x) => 9.81 * x, T, 8, 8, 100, 50, 40, C.teal, tt, true);
    curve(g, (x) => vAir(x, 9.81, 18), T, 8, 8, 100, 50, 40, C.orange, tt);
    label(g, 'sin aire', 60, 6, C.teal); label(g, 'con aire', 60, 34, C.orange);
  },
};
export const STILL_AIRE = { arrastre: 1.6, terminal: 5.5, paracaidas: 2.6, perdida: 2.6, densidad: 1.8, compara: 5 };
