// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Vitrina de logros (#logros): insignias desbloqueadas y por desbloquear, guardadas en localStorage.
import { LOGROS } from '../data/logros.js';
import { get } from '../state.js';
import { portrait } from '../ui/speakers.js';
import { ico, montarIconos } from '../gfx/iconos.js';
import { go } from '../nav.js';
import { set } from '../state.js';
import { drawCard, shareCard, shareText, whatsappLink, cleanName } from '../ui/tarjeta.js';

export default function logros(el) {
  const s = get(), mine = s.logros || [], n = LOGROS.filter((l) => mine.includes(l.id)).length;
  el.innerHTML = `<h1 style="font-size:15px">LOGROS</h1>
    <p class="tag">${n} / ${LOGROS.length} insignias · Rango: <b style="color:var(--yellow)">${s.rank}</b></p>
    <div class="panel dialog"><span class="slot"></span><div><h2 style="color:var(--teal)">NOVA</h2>
      <p>${n === LOGROS.length ? '"¡Todas! La energía no se destruye; se transforma en el impacto perfecto."' : '"Cada insignia es una prueba de que la física funciona. ¡Vamos por las que faltan!"'}</p></div></div>
    <ul class="logros">${LOGROS.map((l) => {
      const on = mine.includes(l.id);
      return `<li class="logro ${on ? 'on' : ''}"><span class="logro-ico" aria-hidden="true">${on ? l.icon : ico('candado')}</span>
        <span><b>${l.title}</b><small>${l.desc}</small><span class="node-state">${on ? 'Desbloqueado ✓' : 'Bloqueado'}</span></span></li>`;
    }).join('')}</ul>
    <div class="panel compartir">
      <h2 style="color:var(--teal)">COMPARTE TU TARJETA</h2>
      <label for="alumno">Tu nombre (opcional, solo aparece en la imagen)</label>
      <input id="alumno" type="text" maxlength="22" autocomplete="given-name" placeholder="Ej. Ana G." value="">
      <button class="btn teal" data-share>⇪ Compartir tarjeta</button>
      <p class="share-msg" aria-live="polite"></p>
      <img class="share-prev" alt="Vista previa de tu tarjeta de logros" hidden>
    </div>
    <button class="btn" data-map>▶ Mapa de misiones</button>
    <button class="btn ghost" data-creditos>♪ Créditos</button>`;
  montarIconos(el);
  el.querySelector('.slot').replaceWith(portrait('nova', 'sm'));
  el.querySelector('[data-map]').onclick = () => go('historia');
  el.querySelector('[data-creditos]').onclick = () => go('creditos');

  // Tarjeta compartible (PNG pixel art): Web Share con archivo o, si no se puede, descarga + enlace de WhatsApp.
  const inp = el.querySelector('#alumno'), msg = el.querySelector('.share-msg'), prev = el.querySelector('.share-prev'), btn = el.querySelector('[data-share]');
  inp.value = s.alumno || '';
  let alive = true, busy = false;
  btn.onclick = async () => {
    if (busy) return;
    busy = true; btn.disabled = true; msg.textContent = 'Dibujando tu tarjeta…';
    try {
      const nombre = cleanName(inp.value);
      if (nombre !== (get().alumno || '')) set({ alumno: nombre });
      const c = await drawCard(get(), nombre), text = shareText(get(), nombre);
      if (!alive) return;
      prev.src = c.toDataURL('image/png'); prev.hidden = false;
      const r = await shareCard(c, text);
      if (!alive) return;
      if (r === 'shared') msg.textContent = '¡Listo! Tarjeta compartida.';
      else if (r === 'cancel') msg.textContent = 'Compartir cancelado. Puedes intentarlo de nuevo.';
      else {
        msg.innerHTML = 'Se descargó <b>limite-g-logros.png</b>. Adjúntala en tu chat o ' +
          `<a href="${whatsappLink(text)}" target="_blank" rel="noopener">envía el enlace por WhatsApp</a>.`;
      }
    } catch { msg.textContent = 'No se pudo crear la imagen en este navegador. Toma una captura de pantalla de la vista previa.'; }
    busy = false; btn.disabled = false;
  };
  return () => { alive = false; };
}
