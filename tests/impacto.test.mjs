// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Pruebas de la física del Acto 3: F_media · d = Ec, distancia de frenado, fundas y su masa.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { impact, fMedia, fMax, caseMass, D_PAQUETE, ep } from '../js/physics.js';
import { OBJECTS } from '../js/data/objects.js';
import { PLANETS } from '../js/data/planets.js';
import { SUELOS, FUNDAS, sideOf } from '../js/data/impacto.js';

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ''} esperado ${b}, obtenido ${a}`);

test('F media = Ec / d (y F·d devuelve la energía)', () => {
  near(fMedia(5.24, 0.002), 2620, 1e-9);
  near(fMedia(6, 0.03), 200, 1e-9);
  for (const d of [0.002, 0.01, 0.05]) near(fMedia(10, d) * d, 10, 1e-12);
});

test('coherencia con el Acto 1: en concreto y sin funda, F ≤ F máx ⇔ Ep ≤ resistencia', () => {
  const concreto = SUELOS.find((s) => s.d === 0);
  for (const o of OBJECTS) for (const p of PLANETS.filter((q) => !q.air)) for (const h of [0.5, 1, 2, 5, 10, 40]) {
    const r = impact({ m: o.m, g: p.g, h, side: sideOf(o), soilD: concreto.d });
    assert.equal(r.F <= fMax(o.limit) + 1e-9, ep(o.m, p.g, h) <= o.limit + 1e-12, `${o.id} en ${p.id} desde ${h} m`);
    near(r.E, ep(o.m, p.g, h), 1e-12);
  }
  near(fMax(1), 1 / D_PAQUETE, 1e-9);
});

test('duplicar la distancia de frenado reduce la fuerza a la mitad', () => {
  const E = 12;
  near(fMedia(E, 0.04) / fMedia(E, 0.02), 0.5, 1e-12);
});

test('suelos más blandos → más d → menos fuerza (misma energía)', () => {
  const o = OBJECTS.find((x) => x.id === 'cel'), sorted = [...SUELOS].sort((a, b) => a.d - b.d);
  const rs = sorted.map((s) => impact({ m: o.m, g: 1.31, h: 30, side: sideOf(o), soilD: s.d }));
  for (let i = 1; i < rs.length; i++) { near(rs[i].E, rs[0].E, 1e-12, 'misma Ec'); assert.ok(rs[i].F < rs[i - 1].F); }
});

test('funda: comprime k·grosor y su masa es la del cascarón (lado + 2·grosor)³ − lado³', () => {
  near(caseMass(20, 0.1, 0.01), 20 * (0.12 ** 3 - 0.1 ** 3), 1e-12);
  assert.equal(caseMass(1000, 0.1, 0), 0);
  const o = OBJECTS.find((x) => x.id === 'vacuna'), f = FUNDAS.find((x) => x.id === 'hule');
  const r = impact({ m: o.m, g: 1.31, h: 40, side: sideOf(o), mat: f, t: 0.02 });
  near(r.dCase, f.k * 0.02, 1e-12); near(r.d, D_PAQUETE + f.k * 0.02, 1e-12);
  near(r.E, (o.m + r.mc) * 1.31 * 40, 1e-12, 'la funda también cae');
});

test('una funda densa puede empeorar el golpe: más masa que distancia ganada', () => {
  const o = OBJECTS.find((x) => x.id === 'vacuna'), gel = FUNDAS.find((x) => x.id === 'gel'), uni = FUNDAS.find((x) => x.id === 'unicel');
  const base = { m: o.m, g: 1.31, h: 40, side: sideOf(o) };
  const thick = impact({ ...base, mat: gel, t: 0.05 }), light = impact({ ...base, mat: uni, t: 0.02 });
  assert.ok(thick.mc > 5 * o.m, 'el gel grueso pesa varias veces el paquete');
  assert.ok(light.F < thick.F, 'el unicel ligero gana');
});
