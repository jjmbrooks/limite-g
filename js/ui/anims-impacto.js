// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Mini-animaciones pixel art del Códice, Acto 3 (impacto). Mismo formato que js/ui/anims.js (canvas 120×72, instante t en s).
import { draw } from '../gfx/pixel.js';
import { OBJ_SPRITES } from '../gfx/sprites.js';
import { C, GROUND, base, vbar, label, loop } from './anims.js';

// Caída que se frena en `dpx` pixeles: devuelve la y del paquete y si ya está frenando.
function fallStop(p, dpx, top = 4) {
  const yHit = GROUND - 8;
  if (p < 0.6) { const k = p / 0.6; return { y: top + (yHit - top) * k * k, f: 0 }; }
  const k = Math.min(1, (p - 0.6) / 0.15);
  return { y: yHit + dpx * (1 - (1 - k) * (1 - k)), f: k };
}
function soil(g, x, w, depth, col) { g.fillStyle = col; g.fillRect(x, GROUND, w, 8); g.fillStyle = '#00000044'; for (let i = 0; i < w; i += 3) g.fillRect(x + i, GROUND + 2 + (i % 2), 1, 1); if (depth) { g.fillStyle = C.bg; g.fillRect(x + w / 2 - 5, GROUND, 10, depth); } }
function forceBar(g, x, F, col = C.magenta) { vbar(g, x, 10, 50, Math.min(1, F), F > 1 ? C.magenta : col); }

export const ANIMS_IMPACTO = {
  // F·d = Ec: el paquete frena en d y la barra de fuerza sube.
  impacto(g, t) {
    base(g);
    const p = loop(t, 2.6), s = fallStop(p, 3);
    soil(g, 4, 70, 0, '#9a9aa8');
    draw(g, OBJ_SPRITES.vacuna, 34, Math.round(s.y));
    if (s.f) { g.fillStyle = C.yellow; g.fillRect(46, GROUND - 1, 1, 4); label(g, 'd', 49, GROUND - 6, C.yellow); }
    forceBar(g, 100, s.f ? 1.2 * s.f : 0); label(g, 'F', 101, 1, C.magenta);
    label(g, 'F·d=Ec', 50, 14, C.yellow);
  },
  // Dos caídas iguales: la que frena en más distancia recibe menos fuerza.
  frenado(g, t) {
    base(g);
    const p = loop(t, 2.6), a = fallStop(p, 1), b = fallStop(p, 6);
    soil(g, 4, 34, 0, '#9a9aa8'); soil(g, 44, 34, 6, '#ff8ac8');
    draw(g, OBJ_SPRITES.cel, 17, Math.round(a.y)); draw(g, OBJ_SPRITES.cel, 57, Math.round(b.y));
    vbar(g, 86, 10, 50, a.f, C.magenta); vbar(g, 102, 10, 50, b.f * 0.2, C.teal);
    label(g, 'F', 87, 1, C.magenta); label(g, 'F', 103, 1, C.teal);
  },
  // Cuatro suelos: cada uno se hunde distinto.
  suelos(g, t) {
    base(g);
    const p = loop(t, 2.6), cols = ['#9a9aa8', '#4f9a3a', '#e0c070', '#ff8ac8'], dep = [0, 1, 3, 7];
    cols.forEach((c, i) => {
      const x = 4 + i * 29, s = fallStop(p, dep[i]);
      soil(g, x, 26, Math.round(dep[i] * s.f), c);
      draw(g, OBJ_SPRITES.huevo, x + 9, Math.round(s.y));
      label(g, String(dep[i] ? [0, 1, 3, 8][i] : 0), x + 10, 2, C.dim);
    });
    label(g, 'cm', 108, 2, C.dim);
  },
  // La funda (marco) se aplasta al chocar: k · grosor.
  fundas(g, t) {
    base(g);
    const p = loop(t, 2.6), s = fallStop(p, 0), th = 5, sq = Math.round(th * 0.8 * s.f);
    soil(g, 4, 70, 0, '#9a9aa8');
    const x = 30, y = Math.round(s.y) - th - sq + 8 - 8;
    g.fillStyle = '#ffd23f'; g.fillRect(x - th, y - th + sq, 8 + 2 * th, 8 + 2 * th - sq);
    draw(g, OBJ_SPRITES.cristal, x, y + sq);
    label(g, 'k·grosor', 60, 20, C.yellow); if (s.f) label(g, 'aplasta', 60, 32, C.orange);
  },
  // Mucha funda pesada: la barra de Ec crece.
  masafunda(g, t) {
    base(g);
    const k = (Math.sin(t * 1.5) + 1) / 2, th = 1 + Math.round(k * 9);
    g.fillStyle = '#5ad8ff'; g.fillRect(36 - th, 26 - th, 8 + 2 * th, 8 + 2 * th);
    draw(g, OBJ_SPRITES.vacuna, 36, 26);
    soil(g, 4, 70, 0, '#9a9aa8');
    vbar(g, 100, 10, 50, 0.2 + 0.8 * k * k, C.orange); label(g, 'Ec', 99, 1, C.orange);
    label(g, 'gel', 4, 4, C.teal);
  },
  // Caos cambia el suelo: la funda diseñada para concreto aguanta en todos.
  peorcaso(g, t) {
    base(g);
    const cols = ['#9a9aa8', '#4f9a3a', '#e0c070', '#ff8ac8'], i = Math.floor(t / 1.3) % 4, p = (t % 1.3) / 1.3, s = fallStop(p, [0, 1, 3, 6][i]);
    soil(g, 4, 70, Math.round([0, 1, 3, 6][i] * s.f), cols[i]);
    g.fillStyle = '#f0f0f0'; g.fillRect(32, Math.round(s.y) - 3, 14, 14 - Math.round(s.f * 3));
    draw(g, OBJ_SPRITES.cristal, 35, Math.round(s.y));
    forceBar(g, 100, 0.85 * s.f / (1 + [0, 1, 3, 6][i] * 0.3), C.teal); label(g, 'F', 101, 1, C.teal);
    g.fillStyle = C.magenta; g.fillRect(96, 10 + Math.round(50 * 0.0), 14, 1); label(g, 'máx', 76, 2, C.magenta);
  },
};
export const STILL_IMPACTO = { impacto: 2.2, frenado: 2.2, suelos: 2.2, fundas: 2.2, masafunda: 1, peorcaso: 0.9 };
