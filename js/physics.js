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

// ── Acto 2: caída con aire ──────────────────────────────────────────────
// Arrastre: F = ½·ρ·Cd·A·v² (ρ densidad del aire en kg/m³, Cd coeficiente de arrastre, A área frontal en m²).
export const drag = (rho, CdA, v) => 0.5 * rho * CdA * v * v;
// Velocidad terminal: cuando el arrastre iguala al peso, m·g = ½·ρ·Cd·A·vt² → vt = √(2mg / (ρ·Cd·A)).
export const vTerminal = (m, g, rho, CdA) => (rho * CdA > 0 ? Math.sqrt((2 * m * g) / (rho * CdA)) : Infinity);
export const DT = 1 / 240; // paso fijo de integración (s)

// Caída con aire paso a paso (Euler semi-implícito, paso fijo dt).
// La velocidad nueva se despeja con el arrastre implícito: v₁ + (dt·k/m)·v₁² = v₀ + g·dt (k = ½·ρ·Cd·A),
// así nunca cambia de signo ni explota aunque el paracaídas se abra a gran velocidad. Luego h₁ = h₀ − ½(v₀+v₁)·dt.
// chuteCdA: Cd·A del paracaídas (0 = sin paracaídas); openAt: altura (m) de apertura automática (≤ 0 = manual);
// openTime: segundos que tarda en inflarse por completo. deploy() lo abre en el instante actual.
export function createFall({ m, g, h0, rho = 0, CdA = 0, chuteCdA = 0, openAt = 0, openTime = 0.6, dt = DT }) {
  const s = { t: 0, h: h0, v: 0, lost: 0, work: 0, chute: -1, openedAt: null, landed: false };
  const E0 = m * g * h0;
  const cda = () => CdA + (s.chute >= 0 ? chuteCdA * Math.min(1, s.chute / openTime) : 0);
  function deploy() {
    if (s.chute < 0 && chuteCdA > 0 && !s.landed) { s.chute = 0; s.openedAt = s.h; }
  }
  function step() {
    if (s.landed) return s;
    if (openAt > 0 && s.h <= openAt) deploy();
    const k = 0.5 * rho * cda(), a = (dt * k) / m, b = s.v + g * dt;
    const v1 = a > 1e-12 ? (-1 + Math.sqrt(1 + 4 * a * b)) / (2 * a) : b;
    const dh = 0.5 * (s.v + v1) * dt; // distancia con la velocidad media del paso (exacta si no hay aire)
    let f = 1;
    if (dh >= s.h) { // toca el suelo dentro del paso: fracción f con v lineal en el paso
      const A2 = 0.5 * (v1 - s.v) * dt, B = s.v * dt;
      f = Math.abs(A2) > 1e-15 ? (-B + Math.sqrt(B * B + 4 * A2 * s.h)) / (2 * A2) : s.h / B;
      f = Math.min(1, Math.max(0, f)); s.h = 0; s.landed = true;
    } else s.h -= dh;
    s.work += k * v1 * v1 * (s.landed ? (s.v * f + 0.5 * (v1 - s.v) * f * f) * dt : dh); // trabajo del arrastre: F·distancia
    s.v += (v1 - s.v) * f; s.t += dt * f;
    if (s.chute >= 0) s.chute += dt * f;
    s.lost = E0 - m * g * s.h - 0.5 * m * s.v * s.v; // energía que se llevó el aire (calor y viento)
    return s;
  }
  // Avanza hasta el tiempo T (o hasta tocar el suelo).
  function until(T) { let n = 0; while (!s.landed && s.t < T && n++ < 2e6) step(); return s; }
  return { s, step, until, deploy, cda, E0, vt: () => vTerminal(m, g, rho, cda()) };
}

// Simula la caída completa. Devuelve tiempo, velocidad y energías al tocar el suelo, y muestras [t, v, h] cada `every` s.
export function simulateFall(p, every = 1 / 30) {
  const f = createFall(p), out = [[0, 0, p.h0]];
  let next = every, n = 0;
  while (!f.s.landed && n++ < 4e6) {
    f.step();
    if (f.s.t >= next || f.s.landed) { out.push([f.s.t, f.s.v, f.s.h]); next += every; }
  }
  const { t, v, lost, work, openedAt } = f.s;
  return { t, v, ec: ec(p.m, v), lost, work, openedAt, E0: f.E0, samples: out };
}

// ── Acto 3: impacto ─────────────────────────────────────────────────────
// Al chocar, el paquete se frena en una distancia d. El trabajo de la fuerza media lo detiene: F_media · d = Ec.
// d = deformación propia del paquete (D_PAQUETE) + hundimiento del suelo + compresión de la funda.
// Con suelo rígido y sin funda d = D_PAQUETE, así que F_máx = Límite G / D_PAQUETE reproduce el criterio del Acto 1.
export const D_PAQUETE = 0.002; // m
export const fMedia = (E, d) => E / d;
export const fMax = (limit) => limit / D_PAQUETE;
// Masa de una funda cúbica de grosor t (m) alrededor de un paquete de lado `side` (m) hecha de un material de densidad rho (kg/m³).
export const caseMass = (rho, side, t) => (t > 0 ? rho * ((side + 2 * t) ** 3 - side ** 3) : 0);
// Impacto tras caer h metros sin aire. mat = { rho, k } (k: fracción del grosor que se comprime); soilD: hundimiento del suelo (m).
export function impact({ m, g, h, side, soilD = 0, mat = null, t = 0 }) {
  const mc = mat ? caseMass(mat.rho, side, t) : 0, dCase = mat ? mat.k * t : 0;
  const d = D_PAQUETE + soilD + dCase, E = (m + mc) * g * h;
  return { mc, mTot: m + mc, E, d, dCase, F: fMedia(E, d), v: Math.sqrt(2 * g * h) };
}
