// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Valida que los datos del juego tengan los campos requeridos y valores sensatos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLANETS } from '../js/data/planets.js';
import { OBJECTS } from '../js/data/objects.js';

const HEX = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;
const uniqueIds = (list, what) => assert.equal(new Set(list.map((x) => x.id)).size, list.length, `ids repetidos en ${what}`);

test('planetas: campos requeridos', () => {
  assert.ok(PLANETS.length >= 4);
  uniqueIds(PLANETS, 'planetas');
  for (const p of PLANETS) {
    assert.match(p.id, /^[a-z0-9-]+$/, `id inválido ${p.id}`);
    assert.ok(typeof p.name === 'string' && p.name.length, `${p.id}: name`);
    assert.ok(p.g > 0 && p.g < 30, `${p.id}: g fuera de rango`);
    assert.ok(Array.isArray(p.sky) && p.sky.length === 2 && p.sky.every((c) => HEX.test(c)), `${p.id}: sky`);
    assert.match(p.ground, HEX, `${p.id}: ground`);
    assert.ok(Number.isInteger(p.act) && p.act >= 1, `${p.id}: act`);
    assert.ok((p.air ?? 0) >= 0 && (p.air ?? 0) < 100, `${p.id}: densidad del aire`);
    if (p.act === 1) assert.ok(!p.air, `${p.id}: el Acto 1 es sin aire`);
    if (p.act === 2) assert.ok(p.air > 0, `${p.id}: el Acto 2 necesita aire`);
    if (p.act === 3) assert.ok(!p.air, `${p.id}: el Acto 3 es sin aire (impacto)`);
  }
  for (const id of ['tierra-aire', 'venus', 'titan']) assert.ok(PLANETS.some((p) => p.id === id && p.act === 2), `falta ${id} en el Acto 2`);
});

test('paquetes: campos requeridos', () => {
  assert.ok(OBJECTS.length >= 5);
  uniqueIds(OBJECTS, 'paquetes');
  for (const o of OBJECTS) {
    assert.match(o.id, /^[a-z0-9-]+$/, `id inválido ${o.id}`);
    assert.ok(typeof o.name === 'string' && o.name.length, `${o.id}: name`);
    assert.ok(o.m > 0, `${o.id}: masa`);
    assert.ok(o.limit > 0, `${o.id}: límite`);
    assert.match(o.color, HEX, `${o.id}: color`);
    assert.ok(o.Cd > 0 && o.Cd < 2 && o.A > 0 && o.A < 1, `${o.id}: Cd y A`);
  }
});

test('paracaídas: Cd·A creciente y más grande que cualquier paquete', async () => {
  const { CHUTES, cdA } = await import('../js/data/paracaidas.js');
  uniqueIds(CHUTES, 'paracaídas');
  assert.equal(cdA(CHUTES[0]), 0, 'el primero es «sin paracaídas»');
  for (let i = 2; i < CHUTES.length; i++) assert.ok(cdA(CHUTES[i]) > cdA(CHUTES[i - 1]));
  const maxObj = Math.max(...OBJECTS.map((o) => o.Cd * o.A));
  for (const c of CHUTES.slice(1)) assert.ok(cdA(c) > maxObj, `${c.id} debe frenar más que un paquete solo`);
});

test('sprites: filas del mismo ancho y solo letras de la paleta', async () => {
  const S = await import('../js/gfx/sprites.js');
  const { PALETTE } = await import('../js/gfx/palette.js');
  const all = { NOVA: S.NOVA, CAOS: S.CAOS, GAL1: S.GAL1, PARABOLA: S.PARABOLA, CAPSULA: S.CAPSULA, PARACAIDAS: S.PARACAIDAS, PARACAIDAS_MEDIO: S.PARACAIDAS_MEDIO, ...S.OBJ_SPRITES };
  for (const [name, rows] of Object.entries(all)) {
    assert.ok(rows.length > 0, name);
    for (const [j, r] of rows.entries()) {
      assert.equal(r.length, rows[0].length, `${name} fila ${j} mide ${r.length}`);
      for (const ch of r) assert.ok(ch === '.' || PALETTE[ch], `${name} fila ${j}: letra "${ch}" no está en la paleta`);
    }
  }
  for (const o of OBJECTS) {
    const sp = S.OBJ_SPRITES[o.id];
    assert.ok(sp, `falta el sprite del paquete ${o.id}`);
    assert.equal(sp.length, 8); assert.equal(sp[0].length, 8);
  }
});

test('planetas: tonos y estilo del sprite', async () => {
  const { planetRows } = await import('../js/gfx/pixel.js');
  for (const p of PLANETS) {
    assert.ok(p.px && ['a', 'b', 'c', 'd'].every((k) => HEX.test(p.px[k])), `${p.id}: px`);
    const rows = planetRows(p.px.style, 16, 1);
    assert.equal(rows.length, 16); assert.ok(rows.every((r) => r.length === 16));
  }
});

test('códice: tarjetas completas y con animación existente (todos los actos)', async () => {
  const { CODICE } = await import('../js/data/codice.js');
  const A1 = await import('../js/ui/anims.js'), A2 = await import('../js/ui/anims-aire.js'), A3 = await import('../js/ui/anims-impacto.js');
  const ANIMS = { ...A1.ANIMS, ...A2.ANIMS_AIRE, ...A3.ANIMS_IMPACTO }, STILL = { ...A1.STILL, ...A2.STILL_AIRE, ...A3.STILL_IMPACTO };
  const all = Object.values(CODICE).flat();
  assert.ok(Object.values(CODICE).every((c) => c.length >= 5) && Object.keys(CODICE).length >= 3);
  uniqueIds(all, 'códice (ids únicos entre actos)');
  for (const c of all) {
    for (const k of ['id', 'title', 'speaker', 'anim', 'quote', 'formula', 'text']) assert.ok(c[k], `${c.id}: falta ${k}`);
    assert.ok(['gal', 'nova', 'caos'].includes(c.speaker), `${c.id}: speaker`);
    assert.ok(ANIMS[c.anim] && STILL[c.anim] !== undefined, `${c.id}: animación ${c.anim}`);
    assert.ok(c.example?.q && c.example.steps.length >= 2, `${c.id}: ejemplo`);
  }
});

test('historia: misiones con planeta, paquete y ventana válidos', async () => {
  const { MISSIONS, MAP_ACT1, INTRO, starsFor } = await import('../js/data/historia.js');
  const { hSafe } = await import('../js/physics.js');
  const who = ['nova', 'gal', 'caos'];
  assert.ok(INTRO.length >= 5 && INTRO.every((l) => who.includes(l.who) && l.text));
  uniqueIds(MISSIONS, 'misiones');
  for (const m of MISSIONS) {
    const p = PLANETS.find((x) => x.id === m.planet), o = OBJECTS.find((x) => x.id === m.obj);
    assert.ok(p && o, `${m.id}: planeta/paquete inexistente`);
    assert.ok(m.lo > 0 && m.lo < m.hi && m.hi <= 1, `${m.id}: ventana`);
    assert.ok(hSafe(o.limit, o.m, p.g) <= 50, `${m.id}: la altura segura cabe en el simulador`);
    for (const l of [...m.pre, ...m.post]) assert.ok(who.includes(l.who) && l.text, `${m.id}: diálogo`);
  }
  const ids = new Set(MAP_ACT1.map((n) => n.id));
  for (const n of MAP_ACT1) for (const r of n.requires) assert.ok(ids.has(r), `${n.id} requiere ${r}, que no existe`);
  for (const n of MAP_ACT1.filter((n) => n.type === 'mision')) assert.ok(MISSIONS.some((m) => m.id === n.id), `nodo ${n.id} sin misión`);
  assert.equal(starsFor(1.01), 0); assert.equal(starsFor(0.96), 3); assert.equal(starsFor(0.91), 2); assert.equal(starsFor(0.85), 1);
});

test('historia Acto 2: misiones de aire posibles y con decisiones reales', async () => {
  const { MISSIONS_ACT2, MAP_ACT2, INTRO_ACT2, starsAir } = await import('../js/data/historia2.js');
  const { ACTS, ALL_MISSIONS } = await import('../js/data/actos.js');
  const { CHUTES, cdA, OPEN_TIME } = await import('../js/data/paracaidas.js');
  const { simulateFall } = await import('../js/physics.js');
  const who = ['nova', 'gal', 'caos'];
  assert.ok(INTRO_ACT2.length >= 3 && INTRO_ACT2.every((l) => who.includes(l.who) && l.text));
  uniqueIds(ALL_MISSIONS, 'misiones (todos los actos)');
  const ids = new Set(ACTS.flatMap((a) => a.map.map((n) => n.id)));
  for (const n of MAP_ACT2) for (const r of n.requires) assert.ok(ids.has(r), `${n.id} requiere ${r}, que no existe`);
  assert.ok(MISSIONS_ACT2.length >= 4);
  for (const m of MISSIONS_ACT2) {
    const p = PLANETS.find((x) => x.id === m.planet), o = OBJECTS.find((x) => x.id === m.obj);
    assert.ok(p && o && p.act === 2, `${m.id}: planeta/paquete`);
    assert.ok(m.t3 < m.t2 && m.t2 < m.tMax && m.h0 > 0 && m.h0 <= 1000, `${m.id}: tiempos/altura`);
    for (const l of [...m.pre, ...m.post]) assert.ok(who.includes(l.who) && l.text, `${m.id}: diálogo`);
    const run = (c, openAt) => simulateFall({ m: o.m, g: p.g, h0: m.h0, rho: p.air, CdA: o.Cd * o.A, chuteCdA: cdA(c), openAt, openTime: OPEN_TIME }, 99);
    // Existe al menos una decisión (paracaídas + altura de apertura) que da 3 estrellas…
    let best = 0;
    for (const c of CHUTES) for (const a of c.A ? [m.h0, 200, 100, 60, 40, 30, 25, 20, 15, 10, 5] : [0]) {
      if (a > m.h0) continue; const r = run(c, a); best = Math.max(best, starsAir(m, r.ec, o.limit, r.t));
    }
    assert.equal(best, 3, `${m.id}: debe poder lograrse con 3 ★`);
    // …y abrir el paracaídas más grande desde arriba nunca da 3 estrellas (abrir tarde importa).
    const top = run(CHUTES[CHUTES.length - 1], m.h0);
    assert.ok(starsAir(m, top.ec, o.limit, top.t) < 3, `${m.id}: abrir arriba no debe ser óptimo`);
  }
  assert.equal(starsAir({ tMax: 10, t2: 5, t3: 3 }, 1, 2, 2), 3);
  assert.equal(starsAir({ tMax: 10, t2: 5, t3: 3 }, 3, 2, 2), 0, 'roto');
  assert.equal(starsAir({ tMax: 10, t2: 5, t3: 3 }, 1, 2, 11), 0, 'tarde');
});

test('historia Acto 3: suelos/fundas válidos y misiones de impacto posibles con decisiones reales', async () => {
  const { MISSIONS_ACT3, MAP_ACT3, INTRO_ACT3, starsImpact } = await import('../js/data/historia3.js');
  const { ACTS, NEXT } = await import('../js/data/actos.js');
  const { SUELOS, FUNDAS, T_MAX, sideOf } = await import('../js/data/impacto.js');
  const { impact, fMax } = await import('../js/physics.js');
  const who = ['nova', 'gal', 'caos'];
  uniqueIds(SUELOS, 'suelos'); uniqueIds(FUNDAS, 'fundas');
  for (const s of SUELOS) assert.ok(s.d >= 0 && s.d < 0.2 && HEX.test(s.color), s.id);
  assert.equal(Math.min(...SUELOS.map((s) => s.d)), 0, 'hay un suelo rígido (concreto)');
  for (const f of FUNDAS) assert.ok(f.rho >= 0 && f.k >= 0 && f.k < 1 && HEX.test(f.color), f.id);
  assert.ok(INTRO_ACT3.length >= 3 && INTRO_ACT3.every((l) => who.includes(l.who) && l.text));
  const ids = new Set(ACTS.flatMap((a) => a.map.map((n) => n.id)));
  for (const n of [...MAP_ACT3, NEXT]) for (const r of n.requires) assert.ok(ids.has(r), `${n.id} requiere ${r}, que no existe`);
  assert.ok(MISSIONS_ACT3.length >= 4);
  for (const m of MISSIONS_ACT3) {
    const p = PLANETS.find((x) => x.id === m.planet), o = OBJECTS.find((x) => x.id === m.obj);
    assert.ok(p && o && p.act === 3, `${m.id}: planeta/paquete`);
    assert.ok(m.soils.length && m.soils.every((id) => SUELOS.some((s) => s.id === id)), `${m.id}: suelos`);
    assert.ok(m.c3 < m.c2 && m.h0 > 0 && m.h0 <= 500, `${m.id}: umbrales`);
    for (const l of [...m.pre, ...m.post]) assert.ok(who.includes(l.who) && l.text, `${m.id}: diálogo`);
    const FM = fMax(o.limit), worst = SUELOS.find((s) => s.d === 0);
    const play = (soil, f, t) => {
      const r = impact({ m: o.m, g: p.g, h: m.h0, side: sideOf(o), soilD: soil.d, mat: f.rho ? f : null, t: f.rho ? t : 0 });
      const w = impact({ m: o.m, g: p.g, h: m.h0, side: sideOf(o), soilD: worst.d, mat: f.rho ? f : null, t: f.rho ? t : 0 });
      return starsImpact(m, { F: r.F, Fworst: m.sabotage.includes('suelo') ? w.F : r.F, Fmax: FM, mc: r.mc, mObj: o.m });
    };
    const choices = m.sabotage.includes('suelo') ? [worst] : SUELOS.filter((s) => m.soils.includes(s.id));
    let best = 0;
    for (const s of choices) for (const f of FUNDAS) for (let t = 0; t <= T_MAX + 1e-9; t += 0.001) best = Math.max(best, play(s, f, Math.round(t * 1000) / 1000));
    assert.equal(best, 3, `${m.id}: debe poder lograrse con 3 ★`);
    // Sin funda, en el suelo más duro disponible, se rompe: la funda (o la zona) es una decisión real.
    const hard = choices.reduce((a, b) => (b.d < a.d ? b : a));
    assert.equal(play(hard, FUNDAS[0], 0), 0, `${m.id}: sin funda en ${hard.id} debe romperse`);
  }
  const M = { c3: 0.1, c2: 0.3 };
  assert.equal(starsImpact(M, { F: 1, Fmax: 2, mc: 0.05, mObj: 1 }), 3);
  assert.equal(starsImpact(M, { F: 1, Fmax: 2, mc: 0.2, mObj: 1 }), 2);
  assert.equal(starsImpact(M, { F: 3, Fmax: 2, mc: 0, mObj: 1 }), 0, 'roto');
  assert.equal(starsImpact(M, { F: 1, Fworst: 3, Fmax: 2, mc: 0, mObj: 1 }), 1, 'suerte');
});

test('Final en Estación Entropía: tres tramos (uno por mecánica) posibles con 3 ★', async () => {
  const { MISSIONS_FINAL, MAP_FINAL, INTRO_FINAL } = await import('../js/data/historia4.js');
  const { ACTS, NEXT, MODE_ROUTE } = await import('../js/data/actos.js');
  const { starsFor } = await import('../js/data/historia.js');
  const { starsAir } = await import('../js/data/historia2.js');
  const { starsImpact } = await import('../js/data/historia3.js');
  const { CHUTES, cdA, OPEN_TIME } = await import('../js/data/paracaidas.js');
  const { SUELOS, FUNDAS, T_MAX, sideOf } = await import('../js/data/impacto.js');
  const { hSafe, ep, simulateFall, impact, fMax } = await import('../js/physics.js');
  assert.ok(INTRO_FINAL.length >= 3);
  assert.deepEqual(MISSIONS_FINAL.map((m) => m.mode).sort(), ['aire', 'impacto', 'vacio']);
  const ids = new Set(ACTS.flatMap((a) => a.map.map((n) => n.id)));
  for (const n of [...MAP_FINAL, NEXT]) for (const r of n.requires) assert.ok(ids.has(r), `${n.id} requiere ${r}`);
  for (const m of MISSIONS_FINAL) {
    assert.ok(MODE_ROUTE[m.mode], `${m.id}: pantalla para ${m.mode}`);
    const p = PLANETS.find((x) => x.id === m.planet), o = OBJECTS.find((x) => x.id === m.obj);
    assert.ok(p && o, `${m.id}: planeta/paquete`);
    for (const l of [...m.pre, ...m.post]) assert.ok(['nova', 'gal', 'caos'].includes(l.who) && l.text);
    let best = 0;
    if (m.mode === 'vacio') {
      const h = hSafe(o.limit, o.m, p.g); assert.ok(h <= 50 && h >= 0.2, `${m.id}: altura en rango`);
      best = starsFor(ep(o.m, p.g, Math.floor(h * 100) / 100) / o.limit);
    } else if (m.mode === 'aire') {
      for (const c of CHUTES) for (const a of c.A ? [m.h0, 100, 50, 30, 20, 15, 12, 10] : [0]) {
        const r = simulateFall({ m: o.m, g: p.g, h0: m.h0, rho: p.air, CdA: o.Cd * o.A, chuteCdA: cdA(c), openAt: a, openTime: OPEN_TIME }, 99);
        best = Math.max(best, starsAir(m, r.ec, o.limit, r.t));
      }
    } else {
      const worst = SUELOS.find((s) => s.d === 0);
      for (const f of FUNDAS) for (let t = 0; t <= T_MAX + 1e-9; t += 0.001) {
        const r = impact({ m: o.m, g: p.g, h: m.h0, side: sideOf(o), soilD: worst.d, mat: f.rho ? f : null, t: f.rho ? t : 0 });
        best = Math.max(best, starsImpact(m, { F: r.F, Fmax: fMax(o.limit), mc: r.mc, mObj: o.m }));
      }
    }
    assert.equal(best, 3, `${m.id}: debe poder lograrse con 3 ★`);
  }
});

test('logros: ids únicos, condiciones puras y desbloqueo progresivo', async () => {
  const { LOGROS, newLogros } = await import('../js/data/logros.js');
  const { ALL_MISSIONS } = await import('../js/data/actos.js');
  const { CODICE } = await import('../js/data/codice.js');
  uniqueIds(LOGROS, 'logros');
  assert.ok(LOGROS.length >= 8 && LOGROS.every((l) => l.title && l.desc && l.icon && typeof l.test === 'function'));
  const vacio = { score: 0, combos: {}, codice: [], missions: {}, exam: {}, exam2: {}, exam3: {}, logros: [] };
  assert.deepEqual(newLogros(vacio), [], 'nada al empezar');
  assert.deepEqual(newLogros({ ...vacio, missions: { m1: 1 } }), ['primera']);
  const todo = { score: 500, combos: Object.fromEntries([...Array(10)].map((_, i) => ['c' + i, 1])), codice: Object.values(CODICE).flat().map((c) => c.id),
    missions: Object.fromEntries(ALL_MISSIONS.map((m) => [m.id, 3])), exam: { passed: true, best: 8 }, exam2: { passed: true }, exam3: { passed: true }, logros: [] };
  assert.equal(newLogros(todo).length, LOGROS.length, 'con todo hecho se desbloquean todos');
  assert.deepEqual(newLogros({ ...todo, logros: LOGROS.map((l) => l.id) }), [], 'no se repiten');
});
