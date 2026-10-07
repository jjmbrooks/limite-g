// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Personajes que hablan: nombre, retrato pixel y color.
import { pxCanvas } from '../gfx/pixel.js';
import { NOVA, CAOS, GAL1 } from '../gfx/sprites.js';

export const SPEAKERS = {
  nova: { name: 'NOVA', sprite: NOVA, cls: '', color: 'var(--teal)' },
  gal: { name: 'GAL-1', sprite: GAL1, cls: 'gal', color: 'var(--yellow)' },
  caos: { name: 'DR. CAOS', sprite: CAOS, cls: 'caos', color: 'var(--magenta)' },
};
export const portrait = (who, extra = '') => pxCanvas(SPEAKERS[who].sprite, { cls: `avatar ${SPEAKERS[who].cls} ${extra}`, label: SPEAKERS[who].name });
