// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Guion del Acto 3 (impacto): intro, misiones de fundas y suelos, y mapa. Textos bajo CC BY 4.0 (ver docs/historia.md).
// Misión de impacto: caída sin aire desde h0; el jugador diseña la funda (material + grosor) y, si soils tiene varias
// opciones, elige la zona de aterrizaje. Éxito: F_media ≤ F_máx del paquete en el suelo real.
// Estrellas por masa de la funda (cada gramo cuesta combustible): masa/masa del paquete ≤ c3 → 3, ≤ c2 → 2, si no 1.
// sabotage 'suelo': Caos cambia el suelo al azar al soltar; las estrellas se calculan para el peor caso (concreto).

export const INTRO_ACT3 = [
  { who: 'gal', text: 'Sector 3: lunas de Júpiter. Europa, cubierta de hielo; Ío, llena de volcanes. Casi sin aire: nada de paracaídas.' },
  { who: 'caos', text: 'Y yo controlo las plataformas de aterrizaje. Concreto, arena, pasto… las cambio cuando quiero.' },
  { who: 'nova', text: 'Entonces cuidaremos el último centímetro. Lo que rompe un paquete es frenar de golpe.' },
  { who: 'gal', text: 'Exacto: el suelo detiene al paquete con una fuerza media F en una distancia d. F · d = Ec. Si d crece, F baja.' },
  { who: 'nova', text: 'Por eso diseñaremos fundas. Pero cuidado: la funda también pesa y también cae.' },
];

export const MISSIONS_ACT3 = [
  {
    id: 'm9', act: 3, mode: 'impacto', title: 'Hielo duro en Europa', planet: 'europa', obj: 'vacuna', h0: 40,
    soils: ['concreto'], c3: 0.1, c2: 0.25, sabotage: [], requires: ['m8'],
    brief: 'La plataforma de la colonia es concreto sobre hielo. Diseña una funda para que la vacuna aguante caer 40 m.',
    pre: [
      { who: 'gal', text: 'El frasco aguanta 1 J sobre concreto, porque solo se deforma 2 mm: su fuerza máxima es 1 J / 0.002 m = 500 N.' },
      { who: 'nova', text: 'Desde 40 m en Europa llega con 0.1 · 1.31 · 40 = 5.24 J. Necesito d = 5.24 / 500 ≈ 1 cm de frenado.' },
      { who: 'caos', text: 'Envuélvelo en cartón grueso, cadete. Mucho cartón. Je.' },
    ],
    post: [
      { who: 'gal', text: 'Vacuna intacta. Mira el dato: misma energía, pero frenada en más distancia → menos fuerza.' },
      { who: 'caos', text: '¿Fundas ligeras? Qué económico. Veremos qué haces cuando elija yo dónde caes.' },
    ],
  },
  {
    id: 'm10', act: 3, mode: 'impacto', title: 'Zona de aterrizaje', planet: 'europa', obj: 'huevo', h0: 25,
    soils: ['concreto', 'pasto'], c3: 0.05, c2: 0.25, sabotage: [], requires: ['m9'],
    brief: 'Elige zona (concreto o el invernadero de pasto) y diseña la funda para el huevo desde 25 m. Menos funda, más estrellas.',
    pre: [
      { who: 'gal', text: 'La colonia tiene dos zonas libres: la plataforma de concreto y el pasto del invernadero.' },
      { who: 'nova', text: 'El pasto se hunde un centímetro. Ese centímetro también cuenta en d… y no pesa nada.' },
    ],
    post: [
      { who: 'nova', text: 'El suelo blando hace parte del trabajo. Por eso los gimnastas caen en colchonetas.' },
      { who: 'gal', text: 'Para las rutas de Ío, el Consejo pide el examen de Comandante.' },
    ],
  },
  {
    id: 'm11', act: 3, mode: 'impacto', title: 'Suelos traicioneros de Ío', planet: 'io', obj: 'cristal', h0: 60,
    soils: ['concreto', 'pasto', 'arena', 'espuma'], c3: 0.05, c2: 0.15, sabotage: ['suelo'], requires: ['examen3'],
    brief: 'Caos cambiará el suelo justo al soltar. Diseña la funda del cristal (60 m) para el peor caso: concreto.',
    pre: [
      { who: 'caos', text: '¿Arena? ¿Espuma? ¿Concreto? ¡Sorpresa! Elegiré el suelo cuando ya no puedas cambiar nada.' },
      { who: 'gal', text: 'No sabemos dónde caerá. Si la funda aguanta el suelo más duro, aguanta cualquiera.' },
      { who: 'nova', text: 'Diseño para el concreto: d = Ec / F máx. Lo que dé el suelo es ganancia.' },
    ],
    post: [
      { who: 'caos', text: '¡Imposible! Cambié el suelo y aun así…' },
      { who: 'nova', text: 'Diseñé para el peor caso, Caos. La física no apuesta.' },
    ],
  },
  {
    id: 'm12', act: 3, mode: 'impacto', title: 'Robot a los volcanes', planet: 'io', obj: 'robot', h0: 400,
    soils: ['concreto'], c3: 0.2, c2: 0.35, sabotage: [], requires: ['m11'],
    brief: 'Robot explorador desde 400 m sobre la roca volcánica (como concreto). Diseña una funda que lo salve sin cargar de más.',
    pre: [
      { who: 'gal', text: 'Robot de 5 kg desde 400 m en Ío: 3 600 J sin contar la funda. Su fuerza máxima es 200 J / 0.002 m = 100 000 N.' },
      { who: 'caos', text: 'Te regalo gel amortiguador, el mejor del mercado. Pesa una tonelada, pero eso es detalle.' },
      { who: 'nova', text: 'El gel se comprime muy bien… pero cada kilo de funda también suma energía: Ec = (m + m funda)·g·h.' },
    ],
    post: [
      { who: 'gal', text: 'Robot operativo en las faldas del volcán Loki. Acto 3 completado.' },
      { who: 'caos', text: 'Basta de juegos. Te espero en la Estación Entropía, en órbita de Júpiter. Ahí cortaré todas las comunicaciones del sistema.' },
      { who: 'nova', text: 'Ahí estaremos, GAL. Con todo lo que aprendimos.' },
    ],
  },
];

export const MAP_ACT3 = [
  { id: 'codice3', type: 'codice', act: 3, title: 'Códice: el impacto', brief: 'Recupera los 6 fragmentos sobre fuerza de impacto, suelos y fundas.', requires: ['m8'] },
  { id: 'm9', type: 'mision', requires: ['m8'] },
  { id: 'm10', type: 'mision', requires: ['m9'] },
  { id: 'examen3', type: 'examen', act: 3, title: 'Examen de Comandante', brief: 'Aprueba con 6 de 8 para ascender a Comandante y abrir las rutas de Ío.', requires: ['m10'] },
  { id: 'm11', type: 'mision', requires: ['examen3'] },
  { id: 'm12', type: 'mision', requires: ['m11'] },
];

// Estrellas de una entrega con funda. F: fuerza media en el suelo real; Fworst: en el peor suelo (o el mismo si no hay sabotaje).
export function starsImpact(m, { F, Fworst = F, Fmax, mc, mObj }) {
  if (F > Fmax) return 0;
  if (Fworst > Fmax) return 1; // sobrevivió por suerte
  const frac = mc / mObj;
  return frac <= m.c3 ? 3 : frac <= m.c2 ? 2 : 1;
}
