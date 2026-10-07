// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Gráfica pixel art de velocidad contra tiempo v(t) (Acto 2): curvas, líneas horizontales de referencia y ejes.
// curves: [{ pts: [[t, v], …], color, dash }] · lines: [{ v, color, label }] · Sin DOM propio: dibuja en el contexto dado.
export const GW = 160, GH = 80;
const PAD = { l: 18, r: 4, t: 6, b: 12 };
const INK = '#e9f0ff', DIM = '#8a93b8', GRID = '#1b2350', BG = '#0e1430';

const nice = (x) => { // redondeo «bonito» para la escala (1, 2, 5 × 10ⁿ)
  if (!(x > 0) || !Number.isFinite(x)) return 1;
  const e = 10 ** Math.floor(Math.log10(x)), f = x / e;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e;
};
function text(g, s, x, y, col, align = 'left') {
  g.fillStyle = col; g.font = '8px monospace'; g.textBaseline = 'top'; g.textAlign = align; g.fillText(s, x, y); g.textAlign = 'left';
}

export function drawVt(g, { curves = [], lines = [], tMax = 1, vMax = 1 } = {}) {
  const T = nice(tMax), V = nice(vMax);
  const pw = GW - PAD.l - PAD.r, ph = GH - PAD.t - PAD.b;
  const X = (t) => PAD.l + Math.round((Math.min(t, T) / T) * pw);
  const Y = (v) => PAD.t + ph - Math.round((Math.min(v, V) / V) * ph);
  g.fillStyle = BG; g.fillRect(0, 0, GW, GH);
  g.fillStyle = GRID;
  for (let k = 1; k < 4; k++) { g.fillRect(PAD.l, PAD.t + Math.round((ph * k) / 4), pw, 1); g.fillRect(PAD.l + Math.round((pw * k) / 4), PAD.t, 1, ph); }
  g.fillStyle = DIM; g.fillRect(PAD.l, PAD.t, 1, ph + 1); g.fillRect(PAD.l, PAD.t + ph, pw, 1);
  text(g, String(V), PAD.l - 2, PAD.t - 2, DIM, 'right'); text(g, '0', PAD.l - 2, PAD.t + ph - 6, DIM, 'right');
  text(g, 'v', 2, PAD.t + ph / 2 - 8, INK); text(g, 'm/s', 0, PAD.t + ph / 2, DIM);
  text(g, T + ' s', GW - PAD.r, GH - 9, DIM, 'right'); text(g, 't', PAD.l + pw / 2, GH - 9, INK);
  for (const L of lines) {
    if (!(L.v > 0) || L.v > V) continue;
    const y = Y(L.v); g.fillStyle = L.color;
    for (let x = PAD.l + 1; x < PAD.l + pw; x += 4) g.fillRect(x, y, 2, 1);
    if (L.label) text(g, L.label, PAD.l + 3, y - 9 < PAD.t ? y + 2 : y - 9, L.color);
  }
  for (const c of curves) {
    g.fillStyle = c.color; let px = null, py = null, n = 0;
    for (const [t, v] of c.pts) {
      if (t > T) break;
      const x = X(t), y = Y(v);
      if (px !== null) { // segmento pixel a pixel
        const steps = Math.max(Math.abs(x - px), Math.abs(y - py), 1);
        for (let s = 1; s <= steps; s++) {
          n++; if (c.dash && n % 4 > 1) continue;
          g.fillRect(Math.round(px + ((x - px) * s) / steps), Math.round(py + ((y - py) * s) / steps), 1, 1);
        }
      }
      px = x; py = y;
    }
  }
}
