// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Banco del Examen de Comandante, Acto 3 (impacto). Mismo formato que js/data/preguntas.js. Textos bajo CC BY 4.0.
import { PLANETS } from './planets.js';
import { OBJECTS } from './objects.js';
import { SUELOS, FUNDAS } from './impacto.js';
import { pick, n, numeric } from './preguntas.js';
import { D_PAQUETE } from '../physics.js';

const ACT3 = PLANETS.filter((p) => p.act === 3);
const m4 = (x) => `${x.toLocaleString('es-MX', { maximumFractionDigits: 4 })} m`;
const cm = (m) => `${Math.round(m * 1000) / 10} cm`;

export const PREGUNTAS_ACT3 = [
  { id: 'c3-fuerza', tipo: 'calculo', gen(rnd) {
    const o = pick(rnd, OBJECTS), p = pick(rnd, ACT3), h = 5 + 5 * Math.floor(rnd() * 10), d = pick(rnd, [0.005, 0.01, 0.02, 0.04, 0.05]);
    const E = o.m * p.g * h, F = E / d;
    return { q: `${o.name} (m = ${o.m} kg) cae ${h} m en ${p.name} (g = ${p.g} m/s²) y se frena en ${cm(d)}. ¿Qué fuerza media recibe?`,
      ...numeric(F, [E * d, E / (d * 100), E], 'N'),
      explica: `Ec = m·g·h = ${o.m} × ${p.g} × ${h} = ${n(E, 'J')}. F = Ec / d = ${n(E, 'J')} / ${d} m = ${n(F, 'N')}. Ojo: d en metros.` };
  } },
  { id: 'c3-distancia', tipo: 'calculo', gen(rnd) {
    const o = pick(rnd, OBJECTS), p = pick(rnd, ACT3), h = 10 + 10 * Math.floor(rnd() * 8), Fm = o.limit / D_PAQUETE;
    const E = o.m * p.g * h, d = E / Fm;
    return { q: `${o.name}: m = ${o.m} kg y aguanta una fuerza media de ${n(Fm, 'N')}. Si cae ${h} m en ${p.name} (g = ${p.g} m/s²), ¿qué distancia de frenado mínima necesita? (en cm)`,
      ...numeric(d * 100, [E * Fm / 100, (Fm / E) / 100, d * 1000], 'cm'),
      explica: `Ec = ${o.m} × ${p.g} × ${h} = ${n(E, 'J')}. d = Ec / F máx = ${n(E, 'J')} / ${n(Fm, 'N')} = ${m4(d)} ≈ ${n(d * 100, 'cm')}.` };
  } },
  { id: 'c3-ec-v', tipo: 'calculo', gen(rnd) {
    const o = pick(rnd, OBJECTS), v = 2 + Math.floor(rnd() * 9), d = pick(rnd, [0.01, 0.02, 0.05, 0.1]), E = 0.5 * o.m * v * v, F = E / d;
    return { q: `${o.name} (m = ${o.m} kg) toca el suelo a ${v} m/s y se frena en ${cm(d)}. ¿Cuál es la fuerza media del impacto?`,
      ...numeric(F, [(o.m * v * v) / d, (0.5 * o.m * v) / d, E * d], 'N'),
      explica: `Ec = ½·m·v² = 0.5 × ${o.m} × ${v}² = ${n(E, 'J')}. F = Ec / d = ${n(E, 'J')} / ${d} m = ${n(F, 'N')}.` };
  } },
  { id: 'c3-grosor', tipo: 'calculo', gen(rnd) {
    const f = pick(rnd, FUNDAS.slice(1)), s = pick(rnd, SUELOS.slice(0, 2)), dNeed = pick(rnd, [0.02, 0.025, 0.03, 0.04, 0.05]);
    const t = (dNeed - D_PAQUETE - s.d) / f.k;
    return { q: `Un paquete necesita ${cm(dNeed)} de frenado sobre ${s.name.toLowerCase()} (se hunde ${cm(s.d)}; el paquete se deforma 0.2 cm). ¿Qué grosor de ${f.name.toLowerCase()} (k = ${f.k}) necesita la funda? (ignora su masa)`,
      ...numeric(t * 100, [((dNeed - D_PAQUETE - s.d) * f.k) * 100, (dNeed / f.k) * 100, (dNeed - D_PAQUETE - s.d) * 100 + 0.5], 'cm'),
      explica: `d funda = ${cm(dNeed)} − 0.2 cm − ${cm(s.d)} = ${n((dNeed - D_PAQUETE - s.d) * 100, 'cm')}. Grosor = d funda / k = ${n((dNeed - D_PAQUETE - s.d) * 100, 'cm')} / ${f.k} = ${n(t * 100, 'cm')}.` };
  } },
  { id: 'c3-altura', tipo: 'calculo', gen(rnd) {
    const o = pick(rnd, OBJECTS), p = pick(rnd, ACT3), s = pick(rnd, SUELOS.slice(1)), Fm = o.limit / D_PAQUETE, d = D_PAQUETE + s.d;
    const h = (Fm * d) / (o.m * p.g);
    return { q: `${o.name} (m = ${o.m} kg, F máx = ${n(Fm, 'N')}) cae sin funda sobre ${s.name.toLowerCase()} en ${p.name} (g = ${p.g} m/s²). d = 0.2 cm + ${cm(s.d)}. ¿Desde qué altura máxima puede caer?`,
      ...numeric(h, [(Fm * D_PAQUETE) / (o.m * p.g), Fm * d * o.m * p.g, (Fm * d) / o.m], 'm'),
      explica: `Ec máx = F máx · d = ${n(Fm, 'N')} × ${m4(d)} = ${n(Fm * d, 'J')}. h = Ec / (m·g) = ${n(Fm * d, 'J')} / (${o.m} × ${p.g}) = ${n(h, 'm')}.` };
  } },
  { id: 'k3-doble', tipo: 'concepto', q: 'Si la distancia de frenado se duplica y la energía del impacto es la misma, la fuerza media…',
    opciones: ['Se reduce a la mitad', 'Se duplica', 'No cambia', 'Se reduce a la cuarta parte'], correcta: 0,
    explica: 'F = Ec / d: con el doble de d, la fuerza es la mitad.' },
  { id: 'k3-misma', tipo: 'concepto', q: 'Dos huevos iguales caen desde la misma altura: uno en concreto y otro en arena. ¿Qué es igual en los dos?',
    opciones: ['La energía cinética al tocar el suelo', 'La fuerza del impacto', 'La distancia de frenado', 'Nada: todo cambia'], correcta: 0,
    explica: 'La Ec (m·g·h) es la misma. Lo que cambia es d: en arena es mayor, así que la fuerza es menor.' },
  { id: 'k3-airbag', tipo: 'concepto', q: '¿Por qué una bolsa de aire protege en un choque?',
    opciones: ['Aumenta la distancia (y el tiempo) de frenado, así baja la fuerza', 'Quita energía cinética antes del choque', 'Hace que la persona pese menos', 'Aumenta la fuerza para frenar más rápido'], correcta: 0,
    explica: 'La energía a frenar es la misma, pero la bolsa reparte el frenado en más centímetros: F = Ec / d baja.' },
  { id: 'k3-gel', tipo: 'concepto', q: 'Dr. Caos propone una funda de gel muy gruesa (1 000 kg/m³) para un frasco pequeño. ¿Cuál es el problema?',
    opciones: ['Su masa suma mucha energía: Ec = (m + m funda)·g·h', 'El gel no se comprime', 'El gel aumenta la gravedad', 'Ninguno: más funda siempre es mejor'], correcta: 0,
    explica: 'La funda también cae. Si pesa más que el paquete, la energía a frenar se multiplica y puede que ni así aguante.' },
  { id: 'k3-peor', tipo: 'concepto', q: 'No sabes en qué suelo caerá el paquete (Caos lo cambia). ¿Para cuál diseñas la funda?',
    opciones: ['Para el más duro (concreto): si aguanta ahí, aguanta en todos', 'Para el más blando', 'Para el promedio', 'Da igual'], correcta: 0,
    explica: 'Un suelo más blando solo añade distancia de frenado. Diseñar para el peor caso es el margen de seguridad.' },
  { id: 'k3-unidad', tipo: 'concepto', q: 'En F · d = Ec, si d está en metros y Ec en joules, la fuerza queda en…',
    opciones: ['Newtons (N)', 'Joules (J)', 'Watts (W)', 'Metros por segundo (m/s)'], correcta: 0,
    explica: '1 J = 1 N · m, así que J / m = N.' },
  { id: 'k3-rodillas', tipo: 'concepto', q: '¿Por qué doblas las rodillas al caer de un salto?',
    opciones: ['Para frenar en más distancia y recibir menos fuerza', 'Para tener menos energía cinética', 'Para caer más lento', 'Para aumentar la fuerza'], correcta: 0,
    explica: 'Doblar las rodillas alarga la distancia de frenado del cuerpo: la misma energía se quita con menos fuerza.' },
  { id: 'k3-limite', tipo: 'concepto', q: 'Un frasco aguanta 1 J sobre concreto, donde se frena en 2 mm. ¿Cuál es su fuerza máxima?',
    opciones: ['500 N', '0.002 N', '2 N', '1 000 N'], correcta: 0,
    explica: 'F máx = Límite G / d = 1 J / 0.002 m = 500 N.' },
];
