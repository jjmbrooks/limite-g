// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Tarjeta de logros compartible: se dibuja en <canvas> en pixel art (Nova, rango, ★, insignias, nombre opcional)
// y se comparte como PNG con Web Share API (files); si no se puede, se descarga y se ofrece un enlace de WhatsApp.
import { sprite } from '../gfx/pixel.js';
import { NOVA } from '../gfx/sprites.js';
import { PALETTE as P } from '../gfx/palette.js';
import { LOGROS } from '../data/logros.js';

export const URL_JUEGO = 'https://jjmbrooks.github.io/limite-g/';
const W = 540, H = 720, U = 6; // 90 × 120 «pixeles de juego» de 6 px reales
const PIX = "'Press Start 2P', monospace", VT = "'VT323', monospace";

// Texto que acompaña a la imagen (WhatsApp, redes, etc.).
export function shareText(s, nombre = '') {
  const n = LOGROS.filter((l) => (s.logros || []).includes(l.id)).length;
  const quien = nombre ? `${nombre} es` : 'Soy';
  return `🚀 ¡${quien} ${s.rank} de la Red Postal Interplanetaria en Límite G! ${n}/${LOGROS.length} insignias y ${s.score || 0} ★. `
    + `Aprende energía potencial, cinética y caída libre jugando: ${URL_JUEGO}`;
}

// Recorta el nombre del alumno a algo seguro para la tarjeta.
export const cleanName = (t) => String(t || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 22);

function box(ctx, a, b, w, h, fill, line) {
  ctx.fillStyle = '#000'; ctx.fillRect(a + U, b + U, w, h); // sombra dura
  ctx.fillStyle = line; ctx.fillRect(a, b, w, h);
  ctx.fillStyle = fill; ctx.fillRect(a + U / 2, b + U / 2, w - U, h - U);
}

// Ajusta el tamaño de letra para que el texto quepa en maxW (sirve también con la fuente de respaldo).
function fit(ctx, text, size, family, maxW, min = 10) {
  let z = size;
  do { ctx.font = `${z}px ${family}`; } while (ctx.measureText(text).width > maxW && --z > min);
  return z;
}
// Parte el texto en ≤ maxLines renglones que quepan en maxW, bajando la letra si hace falta.
function wrap(ctx, text, size, family, maxW, maxLines = 2) {
  for (let z = size; z >= 10; z--) {
    ctx.font = `${z}px ${family}`;
    const lines = [''];
    for (const w of text.split(' ')) {
      const t = (lines[lines.length - 1] + ' ' + w).trim();
      if (ctx.measureText(t).width > maxW && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = t;
    }
    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= maxW)) return { lines, z };
  }
  return { lines: [text], z: 10 };
}

// Dibuja la tarjeta y devuelve el <canvas>. Espera a las fuentes pixel si están disponibles.
export async function drawCard(s, nombre = '') {
  try { await Promise.all([document.fonts.load(`16px ${PIX}`), document.fonts.load(`20px ${VT}`)]); } catch { /* sin fuentes: monospace */ }
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  // Fondo: azul noche con estrellas deterministas.
  x.fillStyle = '#0b1026'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) {
    const sx = Math.floor((Math.sin(i * 91.7) * 0.5 + 0.5) * 90) * U, sy = Math.floor((Math.sin(i * 37.3 + 1) * 0.5 + 0.5) * 120) * U;
    x.fillStyle = i % 7 ? '#3c4466' : P.c; x.fillRect(sx, sy, U / (i % 3 ? 2 : 1), U / (i % 3 ? 2 : 1));
  }
  // Marco teal doble.
  x.fillStyle = P.t; x.fillRect(0, 0, W, U); x.fillRect(0, H - U, W, U); x.fillRect(0, 0, U, H); x.fillRect(W - U, 0, U, H);
  x.fillStyle = P.q; x.fillRect(2 * U, 2 * U, W - 4 * U, U / 2); x.fillRect(2 * U, H - 2.5 * U, W - 4 * U, U / 2);
  x.textBaseline = 'top'; x.textAlign = 'center';
  // Título.
  x.font = `28px ${PIX}`; x.fillStyle = '#000'; x.fillText('LÍMITE G', W / 2 + 4, 34 + 4);
  x.fillStyle = P.o; x.fillText('LÍMITE G', W / 2, 34);
  const sub = 'Red Postal Interplanetaria · Energía y caída libre';
  fit(x, sub, 22, VT, W - 6 * U); x.fillStyle = P.g; x.fillText(sub, W / 2, 76);
  // Retrato de Nova (16×16 → 120 px).
  box(x, 36, 110, 132, 132, '#0e1430', P.t);
  x.drawImage(sprite(NOVA), 42, 116, 120, 120);
  // Rango, nombre y estrellas.
  x.textAlign = 'left';
  x.font = `12px ${PIX}`; x.fillStyle = P.g; x.fillText(cleanName(nombre) ? 'MENSAJERO(A):' : 'RANGO', 192, 118);
  let y = 140;
  if (cleanName(nombre)) { fit(x, cleanName(nombre), 30, VT, W - 192 - 4 * U, 14); x.fillStyle = P.c; x.fillText(cleanName(nombre), 192, y); y += 38; x.font = `12px ${PIX}`; x.fillStyle = P.g; x.fillText('RANGO', 192, y); y += 20; }
  fit(x, String(s.rank || 'Cadete').toUpperCase(), 20, PIX, W - 192 - 4 * U); x.fillStyle = P.Y; x.fillText(String(s.rank || 'Cadete').toUpperCase(), 192, y); y += 36;
  x.font = `18px ${PIX}`; x.fillStyle = P.Y; x.fillText(`★ ${s.score || 0}`, 192, y);
  // Insignias: 4 por fila.
  const mine = s.logros || [], n = LOGROS.filter((l) => mine.includes(l.id)).length;
  x.textAlign = 'center'; x.font = `14px ${PIX}`; x.fillStyle = P.t; x.fillText(`INSIGNIAS ${n}/${LOGROS.length}`, W / 2, 270);
  const cols = 4, bw = 102, bh = 96, gap = 18, x0 = (W - (cols * bw + (cols - 1) * gap)) / 2;
  LOGROS.forEach((l, i) => {
    const on = mine.includes(l.id), cx = x0 + (i % cols) * (bw + gap), cy = 300 + Math.floor(i / cols) * (bh + 18);
    box(x, cx, cy, bw, bh, on ? '#1b2350' : '#0e1430', on ? P.Y : P.d);
    x.font = `28px ${PIX}`; x.fillStyle = on ? P.Y : P.d; x.fillText(on ? l.icon : '?', cx + bw / 2, cy + 14);
    const { lines, z } = wrap(x, l.title, 18, VT, bw - 12); x.fillStyle = on ? P.c : P.G;
    lines.forEach((t, k) => x.fillText(t, cx + bw / 2, cy + 52 + k * (z - 1)));
  });
  // Pie con la URL.
  x.font = `20px ${VT}`; x.fillStyle = P.g; x.fillText('Juega gratis en tu celular:', W / 2, H - 76);
  x.font = `12px ${PIX}`; x.fillStyle = P.t; x.fillText(URL_JUEGO.replace('https://', ''), W / 2, H - 50);
  return c;
}

const toBlob = (c) => new Promise((ok, no) => c.toBlob((b) => (b ? ok(b) : no(new Error('PNG vacío'))), 'image/png'));

// Comparte la tarjeta. Devuelve 'shared' | 'cancel' | 'download' (en ese caso conviene mostrar el enlace de WhatsApp).
export async function shareCard(canvas, text) {
  const blob = await toBlob(canvas);
  const file = new File([blob], 'limite-g-logros.png', { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Límite G', text }); return 'shared'; }
    catch (e) { if (e && e.name === 'AbortError') return 'cancel'; }
  }
  downloadBlob(blob, file.name);
  return 'download';
}

export function downloadBlob(blob, name) {
  const a = document.createElement('a'), url = URL.createObjectURL(blob);
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export const whatsappLink = (text) => 'https://wa.me/?text=' + encodeURIComponent(text);
