// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// M11: celebración de un logro nuevo con botón «Compartir» que usa la tarjeta de js/ui/tarjeta.js
// (Web Share con archivo PNG; si el navegador no puede, descarga + enlace de WhatsApp).
import { get } from '../state.js';
import { toast } from './toast.js';
import { drawCard, shareCard, shareText, whatsappLink } from './tarjeta.js';

let busy = false;
// Dibuja y comparte la tarjeta del alumno. Debe llamarse desde un toque (Web Share lo exige).
export async function compartirTarjeta() {
  if (busy) return;
  busy = true;
  try {
    const s = get(), c = await drawCard(s, s.alumno || ''), text = shareText(s, s.alumno || '');
    const r = await shareCard(c, text);
    if (r === 'download') toast(`Se descargó <b>limite-g-logros.png</b>. <a href="${whatsappLink(text)}" target="_blank" rel="noopener">Enviar por WhatsApp</a>`, 8000, { interactive: true });
  } catch { toast('No se pudo crear la imagen. Ábrela desde ★ Logros.'); }
  busy = false;
}

// Aviso de celebración: insignia con destellos y botón Compartir.
export function celebrarLogro(html) {
  const t = toast(`<span class="toast-row"><span>${html}</span><button class="btn teal mini" data-share-logro>⇪ Compartir</button></span>`, 7000, { interactive: true, cls: 'logro-new' });
  t.querySelector('[data-share-logro]').onclick = () => { compartirTarjeta(); t.remove(); };
  return t;
}
