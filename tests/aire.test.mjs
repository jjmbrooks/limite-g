// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Pruebas de la física del Acto 2: arrastre, velocidad terminal, paracaídas y balance de energía.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drag, vTerminal, createFall, simulateFall, vImpact, tFall, ep, ec, DT } from '../js/physics.js';
import { PLANETS } from '../js/data/planets.js';
import { OBJECTS } from '../js/data/objects.js';
import { CHUTES, cdA } from '../js/data/paracaidas.js';

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ''} esperado ${b}, obtenido ${a}`);
const P = (id) => PLANETS.find((p) => p.id === id);
const O = (id) => OBJECTS.find((o) => o.id === id);

test('F = ½·ρ·Cd·A·v² y vt = √(2mg/(ρ·Cd·A))', () => {
  near(drag(1.225, 0.01, 10), 0.6125, 1e-12);
  near(drag(65, 0.5, 2), 65, 1e-12);
  near(vTerminal(0.2, 9.81, 1.225, 0.01), 17.8977, 1e-3, 'celular en la Tierra');
  near(vTerminal(5, 9.81, 1.225, 0.06), 36.5335, 1e-3, 'robot en la Tierra');
  assert.equal(vTerminal(1, 1.62, 0, 0.5), Infinity, 'sin aire no hay vt');
  // En vt el arrastre iguala al peso
  const vt = vTerminal(0.5, 8.87, 65, 0.003); near(drag(65, 0.003, vt), 0.5 * 8.87, 1e-9);
});

test('sin aire la integración numérica coincide con v = √(2gh) y t = √(2h/g)', () => {
  for (const p of PLANETS.filter((q) => q.act === 1)) {
    const r = simulateFall({ m: 0.3, g: p.g, h0: 40 });
    near(r.v, vImpact(p.g, 40), vImpact(p.g, 40) * 2e-3, `${p.name} v`);
    near(r.t, tFall(p.g, 40), 2 * DT, `${p.name} t`);
    near(r.lost, 0, 1e-6 * ep(0.3, p.g, 40) + 1e-9, `${p.name} sin pérdidas`);
  }
});

test('con aire, la velocidad tiende a vt sin rebasarla y la curva se aplana', () => {
  for (const id of ['tierra-aire', 'venus', 'titan']) {
    const p = P(id), o = O('cel'), vt = vTerminal(o.m, p.g, p.air, o.Cd * o.A);
    const f = createFall({ m: o.m, g: p.g, h0: 1e5, rho: p.air, CdA: o.Cd * o.A });
    let prev = 0;
    for (let k = 0; k < 20000; k++) { f.step(); assert.ok(f.s.v >= prev - 1e-12 && f.s.v <= vt * (1 + 1e-9), `${id}: v monótona y ≤ vt`); prev = f.s.v; }
    f.until(f.s.t + 60);
    near(f.s.v, vt, vt * 5e-3, `${id}: v → vt`);
  }
});

test('balance de energía: Ep inicial = Ep + Ec + E aire, y E aire = trabajo del arrastre', () => {
  for (const id of ['tierra-aire', 'venus', 'titan']) for (const c of CHUTES) {
    const p = P(id), o = O('robot'), h0 = 300;
    const f = createFall({ m: o.m, g: p.g, h0, rho: p.air, CdA: o.Cd * o.A, chuteCdA: cdA(c), openAt: 120 });
    let lostPrev = 0;
    while (!f.s.landed) {
      f.step();
      near(ep(o.m, p.g, f.s.h) + ec(o.m, f.s.v) + f.s.lost, f.E0, 1e-6 * f.E0, `${id}/${c.id}: suma`);
      assert.ok(f.s.lost >= lostPrev - 1e-9 * f.E0, `${id}/${c.id}: el aire nunca devuelve energía`); lostPrev = f.s.lost;
    }
    near(f.s.work, f.s.lost, 0.01 * f.E0, `${id}/${c.id}: trabajo del arrastre ≈ energía perdida`);
  }
});

test('paracaídas: estable aunque se abra a gran velocidad y frena hasta su nueva vt', () => {
  const p = P('venus'), o = O('robot'), big = cdA(CHUTES[CHUTES.length - 1]);
  for (const dt of [1 / 30, 1 / 120, 1 / 240]) {
    const f = createFall({ m: o.m, g: p.g, h0: 2000, rho: p.air, CdA: o.Cd * o.A, chuteCdA: big, dt });
    f.until(30); f.deploy(); f.until(60);
    assert.ok(Number.isFinite(f.s.v) && f.s.v >= 0, `dt=${dt}: v finita y ≥ 0`);
    near(f.s.v, vTerminal(o.m, p.g, p.air, o.Cd * o.A + big), 1e-3, `dt=${dt}: nueva vt`);
  }
  // Sin paracaídas, deploy() no hace nada
  const f = createFall({ m: 1, g: 9.81, h0: 10, rho: 1.225, CdA: 0.01 }); f.deploy(); assert.equal(f.s.chute, -1);
});

test('apertura automática: se abre a la altura pedida y abrir más abajo llega antes', () => {
  const p = P('tierra-aire'), o = O('robot'), c = cdA(CHUTES[3]);
  const a = simulateFall({ m: o.m, g: p.g, h0: 300, rho: p.air, CdA: o.Cd * o.A, chuteCdA: c, openAt: 200 });
  const b = simulateFall({ m: o.m, g: p.g, h0: 300, rho: p.air, CdA: o.Cd * o.A, chuteCdA: c, openAt: 40 });
  near(a.openedAt, 200, 0.5, 'altura de apertura');
  assert.ok(b.t < a.t, 'abrir tarde ahorra tiempo');
  near(a.ec, b.ec, 0.02 * a.ec, 'si alcanza su vt, llega con la misma energía');
  const late = simulateFall({ m: o.m, g: p.g, h0: 300, rho: p.air, CdA: o.Cd * o.A, chuteCdA: c, openAt: 3 });
  assert.ok(late.ec > 4 * b.ec, 'abrir demasiado bajo no alcanza a frenar');
});

test('convergencia: dt = 1/120 y dt = 1/960 dan la misma velocidad de impacto (±0.5 %)', () => {
  const base = { m: 0.06, g: 1.35, h0: 500, rho: 5.3, CdA: 0.00075, chuteCdA: cdA(CHUTES[1]), openAt: 20 };
  const a = simulateFall({ ...base, dt: 1 / 120 }), b = simulateFall({ ...base, dt: 1 / 960 });
  near(a.v, b.v, 0.005 * b.v); near(a.t, b.t, 0.005 * b.t);
});

test('la masa importa con aire: más masa con la misma forma → vt mayor (vt ∝ √m)', () => {
  near(vTerminal(4, 9.81, 1.225, 0.05) / vTerminal(1, 9.81, 1.225, 0.05), 2, 1e-12);
  const light = simulateFall({ m: 1, g: 9.81, h0: 200, rho: 1.225, CdA: 0.05 }), heavy = simulateFall({ m: 4, g: 9.81, h0: 200, rho: 1.225, CdA: 0.05 });
  assert.ok(heavy.t < light.t);
});
