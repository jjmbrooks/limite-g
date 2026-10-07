// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Navegación por hash (#pantalla o #pantalla/argumento) con sonido de clic.
import { sfx } from './audio.js';
export const go = (route) => { sfx.click(); location.hash = route; };
