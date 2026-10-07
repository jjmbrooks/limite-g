// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Exámenes por acto: banco, aprobación, clave de guardado y rango que otorgan. La pantalla abre #examen, #examen/2 o #examen/3.
import { PREGUNTAS_ACT1 } from './preguntas.js';
import { PREGUNTAS_ACT2 } from './preguntas2.js';
import { PREGUNTAS_ACT3 } from './preguntas3.js';

export const EXAMENES = {
  1: { act: 1, key: 'exam', bank: PREGUNTAS_ACT1, n: 8, pass: 6, rank: 'Piloto', title: 'Licencia de Piloto', requires: [], codice: 'codice' },
  2: { act: 2, key: 'exam2', bank: PREGUNTAS_ACT2, n: 8, pass: 6, rank: 'Capitana', title: 'Licencia de Capitana', requires: ['m4'], codice: 'codice/2' },
  3: { act: 3, key: 'exam3', bank: PREGUNTAS_ACT3, n: 8, pass: 6, rank: 'Comandante', title: 'Licencia de Comandante', requires: ['m8'], codice: 'codice/3' },
};
