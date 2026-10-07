// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Valida el banco del examen: tamaño, campos y que cada pregunta generada sea contestable.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PREGUNTAS_ACT1, makeQuestion, makeExam, PASS } from '../js/data/preguntas.js';
import { EXAMENES } from '../js/data/examenes.js';

// Generador pseudoaleatorio con semilla (resultados repetibles).
const seeded = (s) => () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);

test('banco: al menos 15 preguntas con cálculo y concepto', () => {
  assert.ok(PREGUNTAS_ACT1.length >= 15);
  assert.equal(new Set(PREGUNTAS_ACT1.map((p) => p.id)).size, PREGUNTAS_ACT1.length, 'ids repetidos');
  assert.ok(PREGUNTAS_ACT1.filter((p) => p.tipo === 'calculo').length >= 6);
  assert.ok(PREGUNTAS_ACT1.filter((p) => p.tipo === 'concepto').length >= 6);
});

test('cada pregunta (300 variantes) tiene 4 opciones distintas, una correcta y explicación', () => {
  for (const item of PREGUNTAS_ACT1) for (let s = 1; s <= 300; s++) {
    const q = makeQuestion(item, seeded(s));
    assert.ok(q.q && q.explica, `${item.id}: texto`);
    assert.equal(q.opciones.length, 4, `${item.id} semilla ${s}: ${q.opciones}`);
    assert.equal(new Set(q.opciones).size, 4, `${item.id} semilla ${s}: opciones repetidas ${q.opciones}`);
    assert.ok(q.correcta >= 0 && q.correcta < 4, `${item.id}: índice correcto`);
    assert.ok(!q.opciones.some((o) => /NaN|Infinity|undefined|^0 /.test(o)), `${item.id}: opción inválida ${q.opciones}`);
  }
});

test('la opción correcta de cálculo coincide con la física', () => {
  const q = makeQuestion(PREGUNTAS_ACT1.find((p) => p.id === 'c-v'), seeded(7));
  const [, g, h] = q.q.match(/g = ([\d.]+) m\/s²\) sueltas un paquete desde (\d+)/).map(Number);
  assert.equal(q.opciones[q.correcta], `${(Math.round(Math.sqrt(2 * g * h) * 100) / 100).toLocaleString('es-MX', { maximumFractionDigits: 2 })} m/s`);
});

test('examen: 8 preguntas distintas, mitad cálculo y mitad concepto', () => {
  for (let s = 1; s <= 50; s++) {
    const ex = makeExam(8, seeded(s));
    assert.equal(ex.length, 8);
    assert.equal(new Set(ex.map((q) => q.id)).size, 8);
    assert.equal(ex.filter((q) => q.tipo === 'calculo').length, 4);
  }
  assert.ok(PASS > 4 && PASS <= 8);
});

test('exámenes de cada acto: bancos válidos, ≥ 10 preguntas y 300 variantes contestables', () => {
  const ranks = new Set();
  for (const [k, E] of Object.entries(EXAMENES)) {
    assert.equal(E.act, +k);
    assert.ok(E.bank.length >= 10, `acto ${k}: al menos 10 preguntas`);
    assert.equal(new Set(E.bank.map((p) => p.id)).size, E.bank.length, `acto ${k}: ids repetidos`);
    assert.ok(E.bank.filter((p) => p.tipo === 'calculo').length >= E.n / 2 && E.bank.filter((p) => p.tipo === 'concepto').length >= E.n / 2);
    assert.ok(E.pass > E.n / 2 && E.pass <= E.n && E.key && E.rank);
    ranks.add(E.rank);
    for (const item of E.bank) for (let s = 1; s <= 300; s++) {
      const q = makeQuestion(item, seeded(s));
      assert.equal(new Set(q.opciones).size, 4, `${item.id} semilla ${s}: ${q.opciones}`);
      assert.ok(q.q && q.explica && q.correcta >= 0 && q.correcta < 4, item.id);
      assert.ok(!q.opciones.some((o) => /NaN|Infinity|undefined|^0 /.test(o)), `${item.id}: opción inválida ${q.opciones}`);
    }
    const ex = makeExam(E.n, seeded(3), E.bank);
    assert.equal(new Set(ex.map((q) => q.id)).size, E.n);
  }
  assert.equal(ranks.size, Object.keys(EXAMENES).length, 'cada examen otorga un rango distinto');
});

test('Acto 2: la vt de la pregunta coincide con la física', async () => {
  const { PREGUNTAS_ACT2 } = await import('../js/data/preguntas2.js');
  const q = makeQuestion(PREGUNTAS_ACT2.find((p) => p.id === 'c2-vt'), seeded(11));
  const [, m, CdA, g, rho] = q.q.match(/m = ([\d.]+) kg y Cd·A = ([\d.]+) m².*g = ([\d.]+) m\/s², ρ = ([\d.]+)/).map(Number);
  const vt = Math.sqrt((2 * m * g) / (rho * CdA));
  assert.equal(q.opciones[q.correcta], `${(Math.round(vt * 100) / 100).toLocaleString('es-MX', { maximumFractionDigits: 2 })} m/s`);
});
