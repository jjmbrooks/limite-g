// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Personajes que hablan: nombre, retrato pixel y color.
import { artCanvas } from '../gfx/imagenes.js';
import { NOVA, CAOS, GAL1 } from '../gfx/sprites.js';

export const SPEAKERS = {
  nova: { name: 'NOVA', sprite: NOVA, cls: '', color: 'var(--teal)' },
  gal: { name: 'GAL-1', sprite: GAL1, cls: 'gal', color: 'var(--yellow)' },
  caos: { name: 'DR. CAOS', sprite: CAOS, cls: 'caos', color: 'var(--magenta)' },
};
// Retrato 16-bit (PNG 64×64) con la matriz como respaldo.
export const portrait = (who, extra = '') => artCanvas('retrato-' + who, SPEAKERS[who].sprite, { w: 64, cls: `avatar ${SPEAKERS[who].cls} ${extra}`, label: SPEAKERS[who].name });
