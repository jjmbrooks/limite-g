// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// M12.1: íconos de interfaz en pixel art 12×12 (sustituyen glifos Unicode como ◎ ◆ ✎ ★ ⊘).
// Misma paleta que los sprites (js/gfx/palette.js). Arte bajo CC BY 4.0 (ver LICENSE-ARTE.md).
import { pxCanvas } from './pixel.js';

export const ICONOS = {
  // Matraz de laboratorio con líquido teal
  lab: [
    '....kkkk....',
    '....kggk....',
    '....kggk....',
    '....kggk....',
    '...kggggk...',
    '..kgggggggk.',
    '..kttttttk..',
    '.kttwtttttk.',
    '.ktttttTttk.',
    'kttTtttttttk',
    'kTTTTTTTTTTk',
    '.kkkkkkkkkk.',
  ],
  // Libro del Códice (tapa teal, hojas crema)
  codice: [
    '.kkkkkkkkkk.',
    'kTttttttttck',
    'kTtkkkkkttck',
    'kTtkYYYkttck',
    'kTtkkkkkttck',
    'kTttttttttck',
    'kTttttttttck',
    'kTtttYYtttck',
    'kTttttttttck',
    'kTTTTTTTTTck',
    'kcccccccccck',
    '.kkkkkkkkkk.',
  ],
  // Tablilla de examen con lápiz
  examen: [
    '...kkkkk....',
    '.kkkgggkkk..',
    '.kxkkkkkxk..',
    '.kxccccccxk.',
    '.kxcNNNNcxk.',
    '.kxccccccxk.',
    '.kxcNNNcckoo',
    '.kxcccccckok',
    '.kxcNNNNkokk',
    '.kxccccckok.',
    '.kxxxxxxkk..',
    '.kkkkkkkk...',
  ],
  // Medalla con listón
  logro: [
    '.kmmk..kbbk.',
    '.kmMk..kBbk.',
    '..kMmkkbBk..',
    '...kkYYkk...',
    '..kYYYYYYk..',
    '.kYYccYYYYk.',
    '.kYcYYYYYOk.',
    '.kYYYooYYOk.',
    '.kYYYYYYYOk.',
    '..kYYYYOOk..',
    '...kkOOkk...',
    '.....kk.....',
  ],
  // Candado (bloqueado)
  candado: [
    '...kkkkkk...',
    '..kGkkkkGk..',
    '..kGk..kGk..',
    '..kGk..kGk..',
    '.kkkkkkkkkk.',
    '.kgggggggGk.',
    '.kggGkkGgGk.',
    '.kgggkkggGk.',
    '.kgggkkggGk.',
    '.kgggggggGk.',
    '.kGGGGGGGGk.',
    '.kkkkkkkkkk.',
  ],
};

// <canvas> del ícono, escalado por CSS (clase .ico-px).
export function icono(nombre, { cls = 'px ico-px', label = '' } = {}) {
  return pxCanvas(ICONOS[nombre], { cls, label });
}
// Marcador para innerHTML: <span data-ico="lab"></span> → se cambia por el canvas con montarIconos(el).
export const ico = (nombre, cls = '') => `<span class="ico-slot ${cls}" data-ico="${nombre}" aria-hidden="true"></span>`;
export function montarIconos(root) {
  root.querySelectorAll('[data-ico]').forEach((s) => s.replaceWith(icono(s.dataset.ico, { cls: 'px ico-px ' + s.className.replace('ico-slot', '').trim() })));
}
