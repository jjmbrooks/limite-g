// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Guion del Acto 2 (con aire): intro, misiones con paracaídas y mapa. Textos bajo CC BY 4.0 (ver docs/historia.md).
// Misión de aire: h0 fijo (altura de vuelo de la Parábola); el jugador elige paracaídas y cuándo abrirlo.
// Éxito: Ec al tocar el suelo ≤ Límite G y tiempo ≤ tMax. Estrellas por tiempo: ≤ t3 → 3, ≤ t2 → 2, si no 1.
// sabotage: 'rho' = Caos borró la densidad del aire · 'tormenta' = sin altímetro automático (se abre a mano).

export const INTRO_ACT2 = [
  { who: 'gal', text: 'Sector 2: planetas con atmósfera. Activando sensores de presión… El modo ideal sin aire se terminó.' },
  { who: 'nova', text: 'Con aire, el paquete roza millones de moléculas al caer. Esa fricción lo frena: es la fuerza de arrastre.' },
  { who: 'gal', text: 'Y crece con el cuadrado de la velocidad. Llega un momento en que iguala al peso y el paquete deja de acelerar: velocidad terminal.' },
  { who: 'caos', text: 'Qué bonito. Pero yo controlo el clima de este sector. Tormentas, bruma, datos borrados… El aire también es caos, cadete.' },
  { who: 'nova', text: 'Para eso tenemos paracaídas. Y física.' },
];

export const MISSIONS_ACT2 = [
  {
    id: 'm5', act: 2, mode: 'aire', title: 'Robot en paracaídas', planet: 'tierra-aire', obj: 'robot', h0: 300,
    tMax: 40, t2: 18, t3: 13, sabotage: [], requires: ['m4'],
    brief: 'Suelta el robot desde 300 m en la Tierra con aire. Debe llegar con ≤ 200 J y en menos de 40 s.',
    pre: [
      { who: 'gal', text: 'Tierra real, con aire. El robot pesa 5 kg y aguanta 200 J. Sin paracaídas se acercaría a su velocidad terminal: unos 36 m/s.' },
      { who: 'nova', text: '½ · 5 · 36² son más de 3 000 J. Necesito un paracaídas con área suficiente para bajar la velocidad terminal.' },
      { who: 'gal', text: 'Y la colonia lo espera en menos de 40 s. Si abres demasiado alto, bajará flotando por minutos.' },
    ],
    post: [
      { who: 'gal', text: 'Robot entregado. ¿Viste la gráfica? La curva se aplana: eso es la velocidad terminal.' },
      { who: 'caos', text: 'Un paracaídas… qué solución tan barata. Veremos qué haces con mi atmósfera favorita.' },
    ],
  },
  {
    id: 'm6', act: 2, mode: 'aire', title: 'El infierno de Venus', planet: 'venus', obj: 'vacuna', h0: 200,
    tMax: 70, t2: 55, t3: 50, sabotage: [], requires: ['m5'],
    brief: 'Vacunas para la colonia flotante de Venus desde 200 m: ≤ 1 J y en menos de 70 s.',
    pre: [
      { who: 'caos', text: 'Consejo de amigo: en Venus abre el paracaídas grande desde arriba. Por seguridad. Je.' },
      { who: 'gal', text: 'El aire de Venus es unas 50 veces más denso que el de la Tierra. Eso cambia la velocidad terminal por completo.' },
      { who: 'nova', text: 'vt = √(2mg / (ρ·Cd·A)). Si ρ es enorme, vt es pequeña… Antes de obedecer a Caos, haré la cuenta.' },
    ],
    post: [
      { who: 'nova', text: 'En Venus el propio aire es un paracaídas. Con el grande abierto arriba habríamos tardado más de media hora.' },
      { who: 'caos', text: '¡Bah! Disfruta tu licencia mientras puedas.' },
      { who: 'gal', text: 'Nova, para las rutas de Titán el Consejo exige el examen de Capitana.' },
    ],
  },
  {
    id: 'm7', act: 2, mode: 'aire', title: 'Bruma de Titán', planet: 'titan', obj: 'huevo', h0: 500,
    tMax: 200, t2: 120, t3: 95, sabotage: ['rho'], requires: ['examen2'],
    brief: 'Caos borró la densidad del aire de Titán. Entrega el huevo desde 500 m con ≤ 0.3 J y en menos de 200 s.',
    pre: [
      { who: 'caos', text: 'Borré la densidad de Titán de tu IA. Sin ρ no hay velocidad terminal… ni huevo.' },
      { who: 'gal', text: 'Confirmo: dato de densidad perdido. Pero quedó en el Códice: la bruma de Titán es unas 4 veces más densa que el aire terrestre.' },
      { who: 'nova', text: 'g es solo 1.35 m/s², pero el huevo aguanta 0.3 J. Paracaídas sí… y abierto lo más tarde que pueda.' },
    ],
    post: [
      { who: 'gal', text: 'Huevo intacto en la colonia Kraken. Precisión de Capitana.' },
      { who: 'caos', text: 'Disfrutas el aire tranquilo, ¿verdad? Mira el radar de la Tierra.' },
    ],
  },
  {
    id: 'm8', act: 2, mode: 'aire', title: 'Tormenta sobre la Tierra', planet: 'tierra-aire', obj: 'cristal', h0: 1000,
    tMax: 80, t2: 40, t3: 30, sabotage: ['tormenta'], requires: ['m7'],
    brief: 'La tormenta de Caos apagó el altímetro automático: abre el paracaídas a mano. Cristal desde 1000 m, ≤ 10 J y < 80 s.',
    pre: [
      { who: 'caos', text: '¡Tormenta eléctrica cortesía de Transportes Caos! Tu apertura automática está frita.' },
      { who: 'gal', text: 'Es verdad: tendrás que tocar ☂ ABRIR durante la caída. Vigila la altura en la pantalla.' },
      { who: 'nova', text: 'Primero cae hasta su velocidad terminal, luego abro antes de que sea tarde. Respira, Nova.' },
    ],
    post: [
      { who: 'nova', text: 'Cristal entregado. El aire no es caos si entiendes sus reglas.' },
      { who: 'caos', text: '¡Basta! Si no puedo vencer tus caídas… cambiaré el suelo donde aterrizan.' },
      { who: 'gal', text: 'Acto 2 completado. Siguiente sector: las lunas heladas y volcánicas de Júpiter. Ahí importa cómo se frena el golpe.' },
    ],
  },
];

// Nodos del mapa del Acto 2. type: codice | mision | examen | proximo (act indica qué Códice o Examen abre).
export const MAP_ACT2 = [
  { id: 'codice2', type: 'codice', act: 2, title: 'Códice: el aire', brief: 'Recupera los 6 fragmentos sobre arrastre, velocidad terminal y paracaídas.', requires: ['m4'] },
  { id: 'm5', type: 'mision', requires: ['m4'] },
  { id: 'm6', type: 'mision', requires: ['m5'] },
  { id: 'examen2', type: 'examen', act: 2, title: 'Examen de Capitana', brief: 'Aprueba con 6 de 8 para ascender a Capitana y abrir las rutas de Titán.', requires: ['m6'] },
  { id: 'm7', type: 'mision', requires: ['examen2'] },
  { id: 'm8', type: 'mision', requires: ['m7'] },
];

// Estrellas de una entrega con aire (null si falló).
export function starsAir(m, ec, limit, t) {
  if (ec > limit || t > m.tMax) return 0;
  return t <= m.t3 ? 3 : t <= m.t2 ? 2 : 1;
}
