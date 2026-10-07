// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Índice de actos: une los guiones de cada acto (mapa, intro, misiones) para el mapa y la progresión.
import { MISSIONS, MAP_ACT1 } from './historia.js';
import { INTRO_ACT2, MISSIONS_ACT2, MAP_ACT2 } from './historia2.js';
import { INTRO_ACT3, MISSIONS_ACT3, MAP_ACT3 } from './historia3.js';
import { INTRO_FINAL, MISSIONS_FINAL, MAP_FINAL } from './historia4.js';

// mode de cada misión → pantalla que la juega (#pantalla/id).
export const MODE_ROUTE = { vacio: 'simulador', aire: 'aire', impacto: 'impacto' };

export const ACTS = [
  { n: 1, title: 'ACTO 1 · SIN AIRE', map: MAP_ACT1, intro: null },
  { n: 2, title: 'ACTO 2 · CON AIRE', map: MAP_ACT2, intro: INTRO_ACT2 },
  { n: 3, title: 'ACTO 3 · IMPACTO', map: MAP_ACT3, intro: INTRO_ACT3 },
  { n: 4, title: 'FINAL · ESTACIÓN ENTROPÍA', map: MAP_FINAL, intro: INTRO_FINAL },
];
// Nodo de cierre al terminar el Final: abre la vitrina de logros.
export const NEXT = { id: 'logros', type: 'logros', title: 'Vitrina de logros', brief: 'Insignias de tu carrera en la Red Postal Interplanetaria.', requires: ['f3'] };

export const ALL_MISSIONS = [...MISSIONS.map((m) => ({ act: 1, mode: 'vacio', ...m })), ...MISSIONS_ACT2, ...MISSIONS_ACT3, ...MISSIONS_FINAL];
