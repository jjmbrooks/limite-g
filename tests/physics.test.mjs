// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Pruebas unitarias de la física del juego (node:test). Corre con: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ep, ec, vImpact, tFall, stateAt, hSafe } from '../js/physics.js';
import { PLANETS } from '../js/data/planets.js';

const near = (a, b, tol = 1e-6, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ''} esperado ${b}, obtenido ${a}`);

test('Ep = m·g·h', () => {
  near(ep(2, 9.81, 10), 196.2, 1e-9);
  near(ep(0.2, 1.62, 5), 1.62, 1e-9);
  assert.equal(ep(1, 9.81, 0), 0);
});

test('Ec = ½·m·v²', () => {
  near(ec(2, 3), 9, 1e-12);
  near(ec(0.06, 10), 3, 1e-12);
  assert.equal(ec(5, 0), 0);
});

test('conservación: Ep inicial = Ep + Ec en todo instante (sin aire)', () => {
  for (const p of PLANETS) {
    const m = 0.5, h0 = 20, T = tFall(p.g, h0);
    for (let k = 0; k <= 10; k++) {
      const s = stateAt(m, p.g, h0, (T * k) / 10);
      near(s.ep + s.ec, s.total, 1e-9, `${p.name} t=${k}/10:`);
    }
    const fin = stateAt(m, p.g, h0, T);
    near(fin.h, 0, 1e-9, `${p.name} altura final`);
    near(fin.ec, ep(m, p.g, h0), 1e-9, `${p.name} Ec final = Ep inicial`);
  }
});

test('Ec al impacto con v = √(2gh) coincide con Ep inicial', () => {
  for (const p of PLANETS) near(ec(3, vImpact(p.g, 12)), ep(3, p.g, 12), 1e-9, p.name);
});

// Valores de referencia calculados a mano para h = 10 m (t = √(2h/g), v = √(2gh)).
const REF = {
  luna: { t: 3.5136, v: 5.6921 },
  marte: { t: 2.3218, v: 8.6139 },
  tierra: { t: 1.4278, v: 14.0071 },
  jupiter: { t: 0.8982, v: 22.2665 },
};
test('tiempo y velocidad de caída por planeta (h = 10 m, ±0.001)', () => {
  for (const [id, r] of Object.entries(REF)) {
    const p = PLANETS.find((q) => q.id === id);
    assert.ok(p, `falta el planeta ${id}`);
    near(tFall(p.g, 10), r.t, 1e-3, `${p.name} t:`);
    near(vImpact(p.g, 10), r.v, 1e-3, `${p.name} v:`);
  }
});

test('caída libre: h(t) = h0 − ½gt² y v(t) = g·t', () => {
  const g = 9.81, h0 = 50;
  for (const t of [0, 0.5, 1, 2, 3]) {
    const s = stateAt(1, g, h0, t);
    near(s.h, h0 - 0.5 * g * t * t, 1e-9, `h(${t})`);
    near(s.v, g * t, 1e-9, `v(${t})`);
  }
  near(stateAt(1, g, h0, 999).h, 0, 1e-12, 'no atraviesa el suelo');
});

test('altura segura h = E/(m·g) produce exactamente el límite', () => {
  for (const p of PLANETS) near(ep(0.2, p.g, hSafe(3, 0.2, p.g)), 3, 1e-9, p.name);
});

test('la caída es más lenta donde g es menor', () => {
  const sorted = [...PLANETS].filter((p, i, all) => all.findIndex((q) => q.g === p.g) === i).sort((a, b) => a.g - b.g);
  for (let i = 1; i < sorted.length; i++) assert.ok(tFall(sorted[i].g, 10) < tFall(sorted[i - 1].g, 10));
});
