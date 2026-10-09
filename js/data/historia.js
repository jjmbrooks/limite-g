// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Guion del Acto 1: intro, misiones de altura exacta y mapa. Textos bajo CC BY 4.0 (ver docs/historia.md).
// who: nova | gal | caos

export const INTRO = [
  { who: 'gal', text: 'Año 2187. Órbita baja de la Luna. Sistemas de la nave-correo Parábola… en línea.' },
  { who: 'gal', text: 'Bienvenida, cadete Nova. La Red Postal Interplanetaria no aterriza: entregamos por caída para ahorrar combustible.' },
  { who: 'nova', text: 'Lo sé, GAL. Cada paquete tiene su resistencia: la energía máxima que aguanta al chocar. Si la rebaso, se rompe.' },
  { who: 'gal', text: 'Correcto. Comunicadores, vacunas, cristales de energía, huevos de criadero, robots… las colonias dependen de nosotras.' },
  { who: 'caos', text: 'Qué conmovedor. Soy el Dr. Caos, de Transportes Caos. Si sus entregas fallan, el Consejo Solar les quitará la licencia… y todas las rutas serán mías.' },
  { who: 'caos', text: 'Ya borré la memoria de tu IA y alteré sus mapas. La entropía siempre gana: todo lo que cae, se destruye.' },
  { who: 'gal', text: 'Alerta: perdí fórmulas y datos de gravedad. Debo recuperar los fragmentos del Códice Gravitacional.' },
  { who: 'nova', text: 'Entonces lo haremos a la antigua: con física. La energía no se destruye; se transforma en el impacto perfecto.' },
  { who: 'gal', text: 'Primera ruta: la Luna. Sin aire, solo gravedad. Abriendo el mapa de misiones.' },
];

// Misiones de altura exacta: la energía de impacto debe quedar entre lo y hi (fracción de la resistencia).
// sabotage: 'regla' = Caos borró la regla (se escribe la altura); 'g' = Caos borró el dato de g.
export const MISSIONS = [
  {
    id: 'm1', title: 'Primera entrega', planet: 'luna', obj: 'cel', lo: 0.8, hi: 1, sabotage: [], requires: [],
    brief: 'Entrega el comunicador en la colonia Tranquilidad usando entre el 80 % y el 100 % de su resistencia.',
    pre: [
      { who: 'gal', text: 'La colonia Tranquilidad necesita un comunicador. Aguanta 3 J. Si lo soltamos muy bajo, perdemos tiempo y combustible.' },
      { who: 'nova', text: 'Y si lo soltamos muy alto, llega hecho pedazos. Busco la altura donde Ep quede entre 2.4 J y 3 J.' },
    ],
    post: [{ who: 'gal', text: '¡Entrega confirmada! La colonia ya tiene señal.' }, { who: 'caos', text: 'Suerte de principiante. La próxima no será tan fácil.' }],
  },
  {
    id: 'm2', title: 'Vacunas para Olympus', planet: 'marte', obj: 'vacuna', lo: 0.85, hi: 1, sabotage: ['regla'], requires: ['m1'],
    brief: 'Caos borró la regla de altura. Calcula y escribe la altura para entregar la vacuna con 85 %–100 % de su resistencia.',
    pre: [
      { who: 'caos', text: '¿Buscabas tu regla de altura? Ups. La entropía se la comió.' },
      { who: 'gal', text: 'Sin regla no podemos ajustar a ojo. Tendrás que calcular la altura y escribirla.' },
      { who: 'nova', text: 'Frasco de 0.1 kg, aguanta 1 J, g de Marte 3.71 m/s². h = E / (m·g). Fácil.' },
    ],
    post: [{ who: 'nova', text: 'Vacunas entregadas. Sin regla y sin problema.' }, { who: 'caos', text: '¡Grrr! Mis mapas falsos eran perfectos…' }],
  },
  {
    id: 'm3', title: 'El huevo más frágil', planet: 'tierra', obj: 'huevo', lo: 0.9, hi: 1, sabotage: ['regla'], requires: ['examen'],
    brief: 'Simulación de la Tierra sin aire. El huevo aguanta solo 0.3 J: entrégalo con 90 %–100 % de su resistencia.',
    pre: [
      { who: 'gal', text: 'Prueba de piloto: un huevo de criadero en la Tierra, en modo ideal sin aire. Solo aguanta 0.3 J.' },
      { who: 'caos', text: 'Un huevo, con g = 9.81. Ve preparando la sartén.' },
    ],
    post: [{ who: 'gal', text: 'Huevo intacto. Precisión de piloto confirmada.' }],
  },
  {
    id: 'm4', title: 'Sabotaje en Júpiter', planet: 'jupiter', obj: 'robot', lo: 0.9, hi: 1, sabotage: ['regla', 'g'], requires: ['m3'],
    brief: 'Caos borró la regla y el dato de g. Usa lo que recuperaste del Códice para entregar el robot con 90 %–100 % de su resistencia.',
    pre: [
      { who: 'caos', text: 'Borré la gravedad de tu IA. Sin g no hay Ep, y sin Ep… ¡boom!' },
      { who: 'gal', text: 'Es cierto: el dato de g de Júpiter no aparece. Pero estaba en el Códice.' },
      { who: 'nova', text: 'Robot de 5 kg, aguanta 200 J, y la g de Júpiter la recuerdo. ¡A calcular!' },
    ],
    post: [
      { who: 'caos', text: 'Imposible… ¿cómo calculaste sin mis datos?' },
      { who: 'nova', text: 'La física no se borra, Caos. Se entiende.' },
      { who: 'gal', text: 'Acto 1 completado. Siguiente sector: planetas con atmósfera. Ahí el aire lo cambia todo.' },
    ],
  },
];

// Nodos del mapa del Acto 1, en orden. type: codice | mision | examen (el Acto 2 sigue en historia2.js)
export const MAP_ACT1 = [
  { id: 'codice', type: 'codice', title: 'Recupera el Códice', brief: 'Lee los 6 fragmentos del Códice Gravitacional.', requires: [] },
  { id: 'm1', type: 'mision', requires: [] },
  { id: 'm2', type: 'mision', requires: ['m1'] },
  { id: 'examen', type: 'examen', title: 'Examen de licencia', brief: 'Aprueba con 6 de 8 para ser Piloto y abrir rutas de mayor gravedad.', requires: ['m2'] },
  { id: 'm3', type: 'mision', requires: ['examen'] },
  { id: 'm4', type: 'mision', requires: ['m3'] },
];

// Estrellas de una entrega según qué tan cerca quedó del límite (ratio = E / resistencia).
export const starsFor = (ratio) => (ratio > 1 ? 0 : ratio >= 0.95 ? 3 : ratio >= 0.9 ? 2 : 1);
