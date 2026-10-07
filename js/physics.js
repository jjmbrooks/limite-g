// Física del juego. Acto 1: caída libre sin aire (conservación de la energía).
export const ep = (m, g, h) => m * g * h;           // Energía potencial: Ep = m·g·h
export const ec = (m, v) => 0.5 * m * v * v;        // Energía cinética: Ec = ½·m·v²
export const vImpact = (g, h) => Math.sqrt(2 * g * h); // v = √(2gh)
export const tFall = (g, h) => Math.sqrt(2 * h / g);   // t = √(2h/g)
// Estado en el instante t (desde el reposo, sin aire)
export function stateAt(m, g, h0, t) {
  const fallen = Math.min(0.5 * g * t * t, h0);
  const h = h0 - fallen, v = Math.sqrt(2 * g * fallen);
  return { h, v, ep: ep(m, g, h), ec: ec(m, v), total: ep(m, g, h0) };
}
// Altura máxima segura para un límite de energía (J): h = E / (m·g)
export const hSafe = (limitJ, m, g) => limitJ / (m * g);
export const fmt = (x, d = 2) => Number(x).toLocaleString('es-MX', { maximumFractionDigits: d, minimumFractionDigits: d });
