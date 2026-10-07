// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Banco del Examen de licencia, Acto 1 (sin aire). Textos bajo CC BY 4.0.
// Pregunta fija: { id, tipo, q, opciones, correcta (índice), explica }.
// Pregunta de cálculo: { id, tipo: 'calculo', gen(rnd) } → devuelve { q, opciones, correcta, explica } con datos al azar.
// Los distractores numéricos son errores típicos (olvidar ½, la raíz, el cuadrado o usar la g equivocada).
import { PLANETS } from './planets.js';
import { OBJECTS } from './objects.js';

const ACT1 = PLANETS.filter((p) => p.act === 1);
export const pick = (rnd, list) => list[Math.floor(rnd() * list.length)];
export const r2 = (x) => Math.round(x * 100) / 100;
export const n = (x, u) => `${r2(x).toLocaleString('es-MX', { maximumFractionDigits: 2 })} ${u}`;
// Opciones numéricas: la correcta primero; quita repetidas (tras redondear) y rellena si hace falta.
export function numeric(correct, wrongs, unit) {
  const seen = new Set(), ops = [];
  for (const v of [correct, ...wrongs, correct * 1.5, correct * 0.5, correct * 3]) {
    const k = n(v, unit); if (!seen.has(k) && Number.isFinite(v) && v > 0 && r2(v) > 0) { seen.add(k); ops.push(k); }
    if (ops.length === 4) break;
  }
  return { opciones: ops, correcta: 0 };
}

export const PREGUNTAS_ACT1 = [
  { id: 'c-ep', tipo: 'calculo', gen(rnd) {
    const o = pick(rnd, OBJECTS), p = pick(rnd, ACT1), h = 1 + Math.round(rnd() * 19);
    const E = o.m * p.g * h, wrongG = p.id === 'tierra' ? 1.62 : 9.81;
    return { q: `${o.name} (m = ${o.m} kg) a ${h} m de altura en ${p.name} (g = ${p.g} m/s²). ¿Cuánta energía potencial tiene?`,
      ...numeric(E, [o.m * h, E / 2, o.m * wrongG * h], 'J'),
      explica: `Ep = m·g·h = ${o.m} × ${p.g} × ${h} = ${n(E, 'J')}.` };
  } },
  { id: 'c-ec', tipo: 'calculo', gen(rnd) {
    const o = pick(rnd, OBJECTS), v = 2 + Math.round(rnd() * 10), E = 0.5 * o.m * v * v;
    return { q: `${o.name} (m = ${o.m} kg) se mueve a ${v} m/s. ¿Cuál es su energía cinética?`,
      ...numeric(E, [o.m * v * v, 0.5 * o.m * v, o.m * v], 'J'),
      explica: `Ec = ½·m·v² = 0.5 × ${o.m} × ${v}² = 0.5 × ${o.m} × ${v * v} = ${n(E, 'J')}. No olvides el ½ ni el cuadrado.` };
  } },
  { id: 'c-v', tipo: 'calculo', gen(rnd) {
    const p = pick(rnd, ACT1), h = 2 + Math.round(rnd() * 18), v = Math.sqrt(2 * p.g * h);
    return { q: `En ${p.name} (g = ${p.g} m/s²) sueltas un paquete desde ${h} m, sin aire. ¿Con qué velocidad toca el suelo?`,
      ...numeric(v, [2 * p.g * h, Math.sqrt(p.g * h), p.g * h], 'm/s'),
      explica: `Ep = Ec → m·g·h = ½·m·v² → v = √(2·g·h) = √(2 × ${p.g} × ${h}) = ${n(v, 'm/s')}.` };
  } },
  { id: 'c-t', tipo: 'calculo', gen(rnd) {
    const p = pick(rnd, ACT1), h = 2 + Math.round(rnd() * 28), t = Math.sqrt((2 * h) / p.g);
    return { q: `¿Cuánto tarda en caer un paquete desde ${h} m en ${p.name} (g = ${p.g} m/s²), partiendo del reposo?`,
      ...numeric(t, [(2 * h) / p.g, Math.sqrt(h / p.g), h / p.g], 's'),
      explica: `h = ½·g·t² → t = √(2h / g) = √(2 × ${h} / ${p.g}) = ${n(t, 's')}.` };
  } },
  { id: 'c-hsafe', tipo: 'calculo', gen(rnd) {
    const o = pick(rnd, OBJECTS), p = pick(rnd, ACT1), h = o.limit / (o.m * p.g);
    return { q: `${o.name}: m = ${o.m} kg y Límite G = ${o.limit} J. ¿Cuál es la altura máxima segura en ${p.name} (g = ${p.g} m/s²)?`,
      ...numeric(h, [o.limit * o.m * p.g, o.limit / o.m, o.limit / p.g], 'm'),
      explica: `Ep = Límite → m·g·h = ${o.limit} → h = ${o.limit} / (${o.m} × ${p.g}) = ${n(h, 'm')}.` };
  } },
  { id: 'c-sobrevive', tipo: 'calculo', gen(rnd) {
    const o = pick(rnd, OBJECTS), p = pick(rnd, ACT1), hs = o.limit / (o.m * p.g);
    const h = r2(hs * (rnd() < 0.5 ? 0.7 : 1.3)), E = o.m * p.g * h, ok = E <= o.limit;
    return { q: `${o.name} (m = ${o.m} kg, aguanta ${o.limit} J) cae desde ${n(h, 'm')} en ${p.name} (g = ${p.g} m/s²). ¿Qué pasa?`,
      opciones: [ok ? `Sobrevive: llega con ${n(E, 'J')}` : `Se rompe: llega con ${n(E, 'J')}`, ok ? `Se rompe: llega con ${n(E, 'J')}` : `Sobrevive: llega con ${n(E, 'J')}`,
        `Sobrevive: llega con ${n(E / 2, 'J')}`, `Se rompe: llega con ${n(E * 2, 'J')}`],
      correcta: 0,
      explica: `Energía al impacto = Ep inicial = ${o.m} × ${p.g} × ${h} = ${n(E, 'J')}, que es ${ok ? 'menor o igual' : 'mayor'} que ${o.limit} J.` };
  } },
  { id: 'c-hdesdev', tipo: 'calculo', gen(rnd) {
    const p = pick(rnd, ACT1), v = 2 + Math.round(rnd() * 12), h = (v * v) / (2 * p.g);
    return { q: `Un dummy llegó al suelo de ${p.name} (g = ${p.g} m/s²) a ${v} m/s. ¿Desde qué altura lo soltaron?`,
      ...numeric(h, [v / (2 * p.g), (v * v) / p.g, v * v * 2 * p.g], 'm'),
      explica: `½·m·v² = m·g·h → h = v² / (2g) = ${v * v} / (2 × ${p.g}) = ${n(h, 'm')}.` };
  } },
  { id: 'c-cons', tipo: 'calculo', gen(rnd) {
    const E = 4 + Math.round(rnd() * 36), f = pick(rnd, [[0.25, 'una cuarta parte'], [0.5, 'la mitad'], [0.75, 'tres cuartas partes']]);
    return { q: `Un paquete empieza con Ep = ${E} J. Ha caído ${f[1]} de su altura (sin aire). ¿Cuánta energía cinética tiene en ese momento?`,
      ...numeric(E * f[0], [E * (1 - f[0]), E, E * f[0] * f[0]], 'J'),
      explica: `Se conserva Ep + Ec = ${E} J. Perdió ${f[1]} de la altura, así que perdió esa fracción de Ep, que ahora es Ec: ${E} × ${f[0]} = ${n(E * f[0], 'J')}.` };
  } },
  { id: 'c-ratio', tipo: 'calculo', gen(rnd) {
    const [a, b] = rnd() < 0.5 ? [ACT1[3], ACT1[0]] : [ACT1[2], ACT1[1]];
    return { q: `El mismo paquete cae desde la misma altura en ${a.name} (g = ${a.g}) y en ${b.name} (g = ${b.g}). ¿Cuántas veces más energía lleva al impacto en ${a.name}?`,
      ...numeric(a.g / b.g, [a.g - b.g, (a.g / b.g) ** 2, Math.sqrt(a.g / b.g)], 'veces'),
      explica: `Ep = m·g·h; con m y h iguales, la razón es ${a.g} / ${b.g} = ${r2(a.g / b.g)}.` };
  } },
  { id: 'k-masa', tipo: 'concepto', q: 'Desde 10 m en la Luna sueltas a la vez un robot (5 kg) y un huevo (0.06 kg). ¿Cuál llega primero?',
    opciones: ['Llegan al mismo tiempo', 'El robot, porque pesa más', 'El huevo, porque es más ligero', 'Depende del Límite G'], correcta: 0,
    explica: 'Sin aire, t = √(2h/g) no depende de la masa. Galileo lo mostró hace siglos.' },
  { id: 'k-conserva', tipo: 'concepto', q: 'Mientras un paquete cae sin aire, su energía mecánica (Ep + Ec)…',
    opciones: ['Se mantiene constante', 'Aumenta', 'Disminuye', 'Se vuelve cero'], correcta: 0,
    explica: 'Sin fricción del aire, la Ep que se pierde se gana como Ec: la suma no cambia.' },
  { id: 'k-joule', tipo: 'concepto', q: '¿A qué equivale 1 joule (J)?',
    opciones: ['1 kg·m²/s²', '1 kg·m/s', '1 m/s²', '1 kg·m/s²'], correcta: 0,
    explica: 'Ep = m·g·h tiene unidades kg × m/s² × m = kg·m²/s² = J. (kg·m/s² es el newton).' },
  { id: 'k-arriba', tipo: 'concepto', q: 'Justo antes de soltarlo desde la nave (en reposo), el paquete tiene…',
    opciones: ['Solo energía potencial', 'Solo energía cinética', 'Mitad y mitad', 'Ninguna energía'], correcta: 0,
    explica: 'En reposo v = 0, así que Ec = 0. Toda su energía es Ep = m·g·h.' },
  { id: 'k-abajo', tipo: 'concepto', q: 'Un instante antes de tocar el suelo (h ≈ 0), el paquete tiene…',
    opciones: ['Ec máxima y Ep casi cero', 'Ep máxima y Ec cero', 'Ep y Ec iguales', 'Ec cero'], correcta: 0,
    explica: 'Toda la Ep inicial ya se transformó en Ec: es el momento de mayor velocidad.' },
  { id: 'k-dobleh', tipo: 'concepto', q: 'Si duplicas la altura desde la que sueltas un paquete, su energía al impacto…',
    opciones: ['Se duplica', 'Se cuadruplica', 'Queda igual', 'Se reduce a la mitad'], correcta: 0,
    explica: 'Ep = m·g·h es proporcional a h: 2h → 2Ep.' },
  { id: 'k-doblev', tipo: 'concepto', q: 'Si un paquete llega con el doble de velocidad, su energía cinética…',
    opciones: ['Se cuadruplica', 'Se duplica', 'Queda igual', 'Se triplica'], correcta: 0,
    explica: 'Ec = ½·m·v²: (2v)² = 4v², la Ec se multiplica por 4.' },
  { id: 'k-g', tipo: 'concepto', q: 'En caída libre en la Tierra (sin aire), cada segundo la velocidad del paquete…',
    opciones: ['Aumenta 9.81 m/s', 'Aumenta 9.81 m', 'Se mantiene igual', 'Se duplica'], correcta: 0,
    explica: 'g = 9.81 m/s² significa que la velocidad crece 9.81 m/s cada segundo (v = g·t).' },
  { id: 'k-caos', tipo: 'concepto', q: 'Dr. Caos transmite: "En la Luna lo pesado cae más rápido, ¡aumenta la altura del robot!". ¿Qué respondes?',
    opciones: ['Falso: sin aire todos caen igual; solo importa g y h', 'Cierto: más masa, más rapidez', 'Cierto, pero solo en la Luna', 'Falso: lo ligero cae más rápido'], correcta: 0,
    explica: 'v = √(2gh) y t = √(2h/g) no dependen de la masa. ¡Interferencia neutralizada!' },
  { id: 'k-jupiter', tipo: 'concepto', q: '¿Por qué un celular que sobrevive una caída de 2 m en la Luna se rompe desde 2 m en Júpiter?',
    opciones: ['Porque g es mayor y entonces la Ep es mayor', 'Porque en Júpiter el celular pesa menos', 'Porque en Júpiter hay más aire', 'Porque la masa cambia de planeta'], correcta: 0,
    explica: 'La masa es la misma, pero g de Júpiter (24.79) es ~15 veces la de la Luna (1.62): Ep = m·g·h también.' },
  { id: 'k-ec-cero', tipo: 'concepto', q: '¿Puede un objeto tener energía cinética negativa?',
    opciones: ['No, porque m > 0 y v² ≥ 0', 'Sí, si cae hacia abajo', 'Sí, si frena', 'Solo en planetas sin aire'], correcta: 0,
    explica: 'Ec = ½·m·v²: la masa es positiva y v² nunca es negativa, así que Ec ≥ 0.' },
];

// Genera una pregunta lista para mostrar, con las opciones barajadas.
export function makeQuestion(item, rnd = Math.random) {
  const base = item.gen ? item.gen(rnd) : item;
  const order = base.opciones.map((_, k) => k).sort(() => rnd() - 0.5);
  return { id: item.id, tipo: item.tipo, q: base.q, explica: base.explica,
    opciones: order.map((k) => base.opciones[k]), correcta: order.indexOf(base.correcta) };
}
// Examen: n preguntas distintas al azar, mezclando cálculo y concepto. bank: banco del acto (por defecto el 1).
export function makeExam(n = 8, rnd = Math.random, bank = PREGUNTAS_ACT1) {
  const calc = bank.filter((p) => p.tipo === 'calculo').sort(() => rnd() - 0.5);
  const conc = bank.filter((p) => p.tipo === 'concepto').sort(() => rnd() - 0.5);
  const half = Math.ceil(n / 2);
  return [...calc.slice(0, half), ...conc.slice(0, n - half)].sort(() => rnd() - 0.5).map((p) => makeQuestion(p, rnd));
}
export const PASS = 6; // aciertos mínimos de 8 para obtener la licencia de Piloto
