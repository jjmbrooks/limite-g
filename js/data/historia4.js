// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Guion del Final (Estación Entropía): tres entregas encadenadas del Núcleo de Comunicación, una por acto.
// Cada misión usa la pantalla de su mecánica (mode: vacio | aire | impacto) con los mismos campos que su acto.
// Textos bajo CC BY 4.0 (ver docs/historia.md).

export const INTRO_FINAL = [
  { who: 'gal', text: 'Órbita de Júpiter. Estación Entropía a la vista. Detecto la gravedad artificial de Caos: 24.79 m/s².' },
  { who: 'caos', text: 'Bienvenida a mi casa, cadete. Aquí está el interruptor que apaga las comunicaciones de todo el Sistema Solar.' },
  { who: 'caos', text: 'Sin comunicadores, las colonias dependerán de mis cohetes. La entropía siempre gana: todo lo que cae, se destruye.' },
  { who: 'nova', text: 'Traemos el Núcleo de Comunicación. Si llega intacto al relé de la estación, las colonias seguirán conectadas.' },
  { who: 'gal', text: 'Tres tramos: la cubierta exterior sin aire, el domo presurizado y la plataforma del relé. Todo lo que aprendimos, Nova.' },
];

export const MISSIONS_FINAL = [
  {
    id: 'f1', act: 4, mode: 'vacio', title: 'Cubierta sin aire', planet: 'entropia', obj: 'nucleo', lo: 0.9, hi: 1,
    sabotage: ['regla', 'g'], requires: ['m12'],
    brief: 'Caos borró la regla y la g. Entrega el Núcleo (2 kg, 50 J) en la cubierta con 90 %–100 % de su Límite G.',
    pre: [
      { who: 'caos', text: 'Borré todo otra vez. Sin regla, sin g. ¿Qué harás ahora, Comandante?' },
      { who: 'nova', text: 'Lo mismo que en el Acto 1: h = E / (m·g). La g de la estación es la de Júpiter.' },
    ],
    post: [{ who: 'gal', text: 'Primer tramo superado. Entrando al domo presurizado: aquí sí hay aire.' }],
  },
  {
    id: 'f2', act: 4, mode: 'aire', title: 'Tormenta en el domo', planet: 'entropia-domo', obj: 'nucleo', h0: 500,
    tMax: 60, t2: 22, t3: 15, sabotage: ['tormenta'], requires: ['f1'],
    brief: 'Tormenta artificial en el domo: abre el paracaídas a mano. Núcleo desde 500 m, ≤ 50 J y < 60 s.',
    pre: [
      { who: 'caos', text: 'Mi domo, mi clima. Disfruta la tormenta… y olvídate del altímetro.' },
      { who: 'gal', text: 'Con g = 24.79 la velocidad terminal es enorme. Solo el paracaídas grande baja lo suficiente.' },
      { who: 'nova', text: 'Caer, esperar la vt… y abrir tarde, pero no demasiado.' },
    ],
    post: [{ who: 'gal', text: 'Segundo tramo superado. Falta la plataforma del relé.' }, { who: 'caos', text: '¡Todavía tengo mis suelos!' }],
  },
  {
    id: 'f3', act: 4, mode: 'impacto', title: 'El relé de Entropía', planet: 'entropia', obj: 'nucleo', h0: 10,
    soils: ['concreto', 'pasto', 'arena', 'espuma'], c3: 0.15, c2: 0.3, sabotage: ['suelo'], requires: ['f2'],
    brief: 'Último tramo: Caos cambiará la plataforma del relé. Diseña la funda del Núcleo (10 m) para el peor caso.',
    pre: [
      { who: 'caos', text: 'Concreto, arena, espuma… ¡nunca sabrás dónde cae!' },
      { who: 'nova', text: 'No necesito saberlo. Diseño para el concreto: F · d = Ec.' },
    ],
    post: [
      { who: 'gal', text: 'Núcleo conectado al relé. Comunicaciones del Sistema Solar… estables. ¡Lo lograste, Nova!' },
      { who: 'caos', text: 'No… no puede ser. Todo lo que cae… se destruye.' },
      { who: 'nova', text: 'No, Caos. La energía no se destruye; se transforma. Y si la entiendes, se transforma en el impacto perfecto.' },
      { who: 'caos', text: '…Tal vez la entropía no siempre gana. Tal vez solo gana cuando nadie hace las cuentas.' },
      { who: 'gal', text: 'El Consejo Solar confirma la licencia de la Red Postal. Comandante Nova: gracias por entregar el futuro.' },
    ],
  },
];

export const MAP_FINAL = [
  { id: 'f1', type: 'mision', requires: ['m12'] },
  { id: 'f2', type: 'mision', requires: ['f1'] },
  { id: 'f3', type: 'mision', requires: ['f2'] },
];
