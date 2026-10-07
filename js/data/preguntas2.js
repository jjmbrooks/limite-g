// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Banco del Examen de Capitana, Acto 2 (con aire). Mismo formato que js/data/preguntas.js. Textos bajo CC BY 4.0.
import { PLANETS } from './planets.js';
import { OBJECTS } from './objects.js';
import { pick, n, numeric } from './preguntas.js';
import { simulateFall } from '../physics.js';

const AIR = PLANETS.filter((p) => p.act === 2 && p.air > 0);
const OBJ = (id) => OBJECTS.find((o) => o.id === id);

export const PREGUNTAS_ACT2 = [
  { id: 'c2-arrastre', tipo: 'calculo', gen(rnd) {
    const p = pick(rnd, AIR), Cd = pick(rnd, [0.5, 0.8, 1, 1.2]), A = pick(rnd, [0.01, 0.02, 0.05, 0.1]), v = 10 + Math.round(rnd() * 30);
    const F = 0.5 * p.air * Cd * A * v * v;
    return { q: `Un dummy con Cd = ${Cd} y A = ${A} m² cae a ${v} m/s en ${p.name} (ρ = ${p.air} kg/m³). ¿Qué fuerza de arrastre siente?`,
      ...numeric(F, [2 * F, F / v, 0.5 * Cd * A * v * v], 'N'),
      explica: `F = ½·ρ·Cd·A·v² = 0.5 × ${p.air} × ${Cd} × ${A} × ${v}² = ${n(F, 'N')}. No olvides el ½, la densidad ni el cuadrado de v.` };
  } },
  { id: 'c2-vt', tipo: 'calculo', gen(rnd) {
    const o = pick(rnd, OBJECTS), p = pick(rnd, AIR), CdA = o.Cd * o.A, vt = Math.sqrt((2 * o.m * p.g) / (p.air * CdA));
    return { q: `${o.name}: m = ${o.m} kg y Cd·A = ${CdA} m². ¿Cuál es su velocidad terminal en ${p.name} (g = ${p.g} m/s², ρ = ${p.air} kg/m³)?`,
      ...numeric(vt, [vt * vt, Math.sqrt((o.m * p.g) / (p.air * CdA)), Math.sqrt((2 * o.m * p.g) / CdA)], 'm/s'),
      explica: `Peso = arrastre → m·g = ½·ρ·Cd·A·vt² → vt = √(2·m·g / (ρ·Cd·A)) = √(2 × ${o.m} × ${p.g} / (${p.air} × ${CdA})) = ${n(vt, 'm/s')}.` };
  } },
  { id: 'c2-ec-vt', tipo: 'calculo', gen(rnd) {
    const o = pick(rnd, OBJECTS), vt = pick(rnd, [2, 3, 4, 5, 6, 8, 10, 15, 20]), E = 0.5 * o.m * vt * vt, ok = E <= o.limit;
    return { q: `${o.name} (m = ${o.m} kg, aguanta ${o.limit} J) toca el suelo a su velocidad terminal con paracaídas: ${vt} m/s. ¿Con cuánta energía llega?`,
      ...numeric(E, [o.m * vt * vt, 0.5 * o.m * vt, o.m * 9.81 * vt], 'J'),
      explica: `Ec = ½·m·v² = 0.5 × ${o.m} × ${vt}² = ${n(E, 'J')}. ${ok ? 'Es menor que su Límite G: sobrevive.' : 'Supera su Límite G: hace falta un paracaídas más grande.'}` };
  } },
  { id: 'c2-perdida', tipo: 'calculo', gen(rnd) {
    const o = pick(rnd, [OBJ('cel'), OBJ('cristal'), OBJ('robot')]), p = pick(rnd, AIR), h = 50 + 25 * Math.floor(rnd() * 9);
    const v = Math.round(simulateFall({ m: o.m, g: p.g, h0: h, rho: p.air, CdA: o.Cd * o.A }, 99).v * 10) / 10;
    const Ep = o.m * p.g * h, Ec = 0.5 * o.m * v * v, L = Ep - Ec;
    return { q: `${o.name} (m = ${o.m} kg) cae ${h} m en ${p.name} (g = ${p.g} m/s²) y llega a ${v} m/s. ¿Cuánta energía se llevó el aire?`,
      ...numeric(L, [Ep, Ec, Ep + Ec], 'J'),
      explica: `Ep inicial = ${o.m} × ${p.g} × ${h} = ${n(Ep, 'J')}; Ec final = ½ × ${o.m} × ${v}² = ${n(Ec, 'J')}. E aire = Ep − Ec = ${n(L, 'J')}.` };
  } },
  { id: 'c2-area', tipo: 'calculo', gen(rnd) {
    const [o, p] = pick(rnd, [[OBJ('robot'), AIR[0]], [OBJ('robot'), AIR[1]], [OBJ('robot'), AIR[2]], [OBJ('cristal'), AIR.find((x) => x.id === 'tierra-aire')]]);
    const v = 2 + Math.floor(rnd() * 5), Cd = 1.4, A = (2 * o.m * p.g) / (p.air * Cd * v * v);
    return { q: `¿Qué área debe tener un paracaídas (Cd = ${Cd}) para que ${o.name.toLowerCase()} (m = ${o.m} kg) baje a ${v} m/s en ${p.name} (g = ${p.g} m/s², ρ = ${p.air} kg/m³)?`,
      ...numeric(A, [A / 2, A * v, (2 * o.m * p.g) / (Cd * v * v)], 'm²'),
      explica: `A = 2·m·g / (ρ·Cd·v²) = 2 × ${o.m} × ${p.g} / (${p.air} × ${Cd} × ${v}²) = ${n(A, 'm²')}.` };
  } },
  { id: 'k2-terminal', tipo: 'concepto', q: 'Cuando un paquete cae a su velocidad terminal, su aceleración es…',
    opciones: ['Cero: el arrastre iguala al peso', 'g, como siempre', 'Negativa: va frenando', 'Infinita'], correcta: 0,
    explica: 'A velocidad terminal la fuerza neta es cero (arrastre = peso), así que no hay aceleración: cae a velocidad constante.' },
  { id: 'k2-doble', tipo: 'concepto', q: 'Si la velocidad de un paquete se duplica, la fuerza de arrastre…',
    opciones: ['Se multiplica por 4', 'Se duplica', 'No cambia', 'Se reduce a la mitad'], correcta: 0,
    explica: 'F = ½·ρ·Cd·A·v²: depende del cuadrado de v. (2v)² = 4v².' },
  { id: 'k2-venus', tipo: 'concepto', q: '¿Por qué en Venus un frasco cae tan despacio que no necesita paracaídas?',
    opciones: ['Su atmósfera es unas 50 veces más densa: la vt es muy baja', 'Porque en Venus no hay gravedad', 'Porque hace mucho calor', 'Porque el frasco pesa menos en Venus'], correcta: 0,
    explica: 'vt = √(2mg/(ρ·Cd·A)): con ρ ≈ 65 kg/m³ la velocidad terminal es muy pequeña. La g de Venus (8.87) es parecida a la de la Tierra.' },
  { id: 'k2-energia', tipo: 'concepto', q: 'Con aire, la energía de impacto es menor que la Ep inicial. ¿Adónde se fue la diferencia?',
    opciones: ['El arrastre la transformó en calor y movimiento del aire', 'Se destruyó', 'Se quedó guardada en el paquete como Ep', 'Regresó a la nave'], correcta: 0,
    explica: 'La energía no se destruye: el trabajo del arrastre la transforma en calor y en movimiento del aire. Solo deja de estar en el paquete.' },
  { id: 'k2-masa', tipo: 'concepto', q: 'Con aire, dos esferas del mismo tamaño caen desde muy alto: una de 1 kg y otra de 4 kg. ¿Cuál tiene mayor velocidad terminal?',
    opciones: ['La de 4 kg: el doble de vt que la de 1 kg', 'Las dos igual, la masa no importa', 'La de 1 kg', 'La de 4 kg: cuatro veces la vt'], correcta: 0,
    explica: 'vt ∝ √m: con 4 veces la masa, vt es √4 = 2 veces mayor. Sin aire la masa no importa; con aire, sí.' },
  { id: 'k2-chute', tipo: 'concepto', q: '¿Cómo protege un paracaídas al paquete?',
    opciones: ['Aumenta Cd·A y así baja la velocidad terminal', 'Reduce la gravedad', 'Reduce la masa del paquete', 'Hace que el aire sea más denso'], correcta: 0,
    explica: 'Más área → más arrastre a la misma velocidad → el equilibrio con el peso llega a una vt mucho menor, y la Ec del impacto baja.' },
  { id: 'k2-caos', tipo: 'concepto', q: 'Dr. Caos transmite: "Abre siempre el paracaídas lo más alto posible: es lo más seguro". ¿Qué respondes?',
    opciones: ['Llega igual de lento pero tarda muchísimo: conviene abrirlo tarde, sin pasarse', 'Tiene razón: así llega más despacio', 'Abrirlo alto rompe el paquete', 'El paracaídas solo funciona si se abre arriba'], correcta: 0,
    explica: 'Una vez en su nueva vt, el paquete llega con la misma rapidez abra donde abra. Abrir alto solo alarga la entrega; abrir muy bajo no le da tiempo de frenar.' },
  { id: 'k2-luna', tipo: 'concepto', q: '¿Sirve un paracaídas para entregar en la Luna?',
    opciones: ['No: casi no hay aire, así que no hay arrastre', 'Sí, funciona mejor que en la Tierra', 'Sí, porque la gravedad es baja', 'Solo si es muy grande'], correcta: 0,
    explica: 'El arrastre necesita aire (F ∝ ρ). En la Luna ρ ≈ 0: el paracaídas cuelga sin frenar nada.' },
  { id: 'k2-grafica', tipo: 'concepto', q: 'En la gráfica v(t) de una caída con aire, ¿cómo se ve la velocidad terminal?',
    opciones: ['La curva se aplana en una línea horizontal', 'Una recta que sube sin parar', 'Un pico que baja a cero', 'Una línea vertical'], correcta: 0,
    explica: 'Al llegar a vt la velocidad ya no cambia: la curva se vuelve horizontal. Sin aire sería una recta inclinada (v = g·t).' },
];
