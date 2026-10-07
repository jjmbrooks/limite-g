// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Sprites pixel art como matrices de texto (una letra = un pixel de js/gfx/palette.js; '.' = transparente).
// Arte bajo CC BY 4.0 (ver LICENSE-ARTE.md). Para editar: cambia letras manteniendo el ancho de cada fila.

// Retratos 16×16
export const NOVA = [
  '.....kkkkkk.....',
  '...kkttttttkk...',
  '..kttttttttttk..',
  '.kttttttttttttk.',
  '.kttTssssssTttk.',
  '.ktTsssssssstTk.',
  '.ktTswessswestk.',
  '.ktsssssssssstk.',
  '..ktsssssssstk..',
  '...kSssMMssSk...',
  '....kkSSSSkk....',
  '.kgggooooooogggk',
  'kooooooooooooook',
  'koowwoooooomoOok',
  'kooOooooooooOook',
  'kooOooooooooOook',
];

export const CAOS = [
  '.....kkkkkk.....',
  '...kksssssskk...',
  '..kssssssssssk..',
  '.ksGttGssGttGsk.',
  '.ksGGGGssGGGGsk.',
  '.kssssssssssssk.',
  '.kskkSssssSkksk.',
  '.ksswrssssrwssk.',
  '.kssssssSsssssk.',
  '.kSswwwwwwwwsSk.',
  '..kssSwwwwSssk..',
  '...kSssssssSk...',
  '.pPkkttttttkkPp.',
  'pvpPkttttttkPpvp',
  'pppvPkttttkPvppp',
  'ppppvPkttkPvpppp',
];

export const GAL1 = [
  '.......mm.......',
  '.......kk.......',
  '.....kkkkkk.....',
  '...kkNNNNNNkk...',
  '..kNNggggggNNk..',
  '..kNggttttggNk..',
  '.kNgttTTTTttgNk.',
  '.kNgtTYYYYTtgNk.',
  '.kNgtTYwwYTtgNk.',
  '.kNgtTYwwYTtgNk.',
  '.kNgtTYYYYTtgNk.',
  '.kNgttTTTTttgNk.',
  '..kNggttttggNk..',
  '..kNNggggggNNk..',
  '...kkNNNNNNkk...',
  '.....kkkkkk.....',
];

// Nave-correo Parábola 24×9 (mira a la derecha)
export const PARABOLA = [
  '.....kkk................',
  '.....kOok...............',
  '..kkkkOokkkkkkkkkk......',
  '.kgggggggggggggggTTkk...',
  'ykgggoooooooooogggtttk..',
  'mkGGGggggggggggGGGGGGkk.',
  '.kkkkGGGkkkkkkkkkkkkk...',
  '.....kOok...............',
  '.....kkk................',
];

// Cápsula de entrega 12×12
export const CAPSULA = [
  '....kkkk....',
  '...kgwggk...',
  '...kgggGk...',
  '..kgtYYtGk..',
  '..kgtYYtGk..',
  '.kggttttGGk.',
  '.kgggggggGGk',
  'kooooooooOOk',
  'kgggggggGGGk',
  '.kkkkkkkkkk.',
  '..kddddddk..',
  '............',
];

// Paquetes 8×8 (mismo id que js/data/objects.js)
export const OBJ_SPRITES = {
  cel: ['.kkkkkk.', '.kddddk.', '.kttwtk.', '.kttttk.', '.ktTttk.', '.kttttk.', '.kdgddk.', '.kkkkkk.'],
  huevo: ['...kk...', '..kcck..', '.kcwcck.', '.kwccck.', 'kcccccck', 'kcccccYk', '.kcccYk.', '..kkkk..'],
  vacuna: ['..kkkk..', '..kGGk..', '.kkggkk.', '.kwgggk.', '.kwmmmk.', '.kmmmMk.', '.kmmmMk.', '.kkkkkk.'],
  cristal: ['........', '..kkkk..', '.kwttTk.', 'kwttttTk', 'kttttTTk', '.kttTTk.', '..ktTk..', '...kk...'],
  robot: ['....m...', '..kkkk..', '.kgtgtk.', '.kggggk.', 'kkookokk', 'gkooOokg', '.kOOOOk.', '.kk..kk.'],
  nucleo: ['...mm...', '..kYYk..', '.kmYYmk.', 'kmtYYtmk', 'kmtYYtmk', '.kmttmk.', '..kmmk..', '...kk...'],
};

// Grietas que se dibujan encima de un paquete roto (coordenadas dentro del 8×8)
export const CRACK = [[2, 1], [3, 2], [3, 3], [4, 4], [5, 4], [4, 5], [3, 6], [6, 2], [1, 4]];

// Paracaídas 12×8 (Acto 2): abierto y a medio inflar. Se dibuja centrado encima del paquete.
export const PARACAIDAS = [
  '...kkkkkk...',
  '.kkmmccmmkk.',
  'kmmmccccmmmk',
  'kkkkkkkkkkkk',
  '.g...gg...g.',
  '..g..gg..g..',
  '...g.gg.g...',
  '....gggg....',
];
export const PARACAIDAS_MEDIO = [
  '............',
  '............',
  '....kkkk....',
  '...kmccmk...',
  '...kkkkkk...',
  '....g..g....',
  '.....gg.....',
  '.....gg.....',
];
