// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// M11: cinemáticas opcionales (videos de Grok Imagine). Si el archivo existe se reproduce a pantalla completa
// (muted, playsinline, con «Saltar»); si no existe, no hay red, el usuario ahorra datos o pidió movimiento
// reducido, se muestra su primer cuadro (poster) como placeholder fijo y se sigue con el juego. Los archivos van en assets/video/ (ver docs/videos/prompts.md).
import { VIDEOS } from '../data/videos.js';

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
const existe = new Map(); // src → Promise<boolean>

function disponible(src) {
  if (!existe.has(src)) {
    existe.set(src, fetch(src, { method: 'HEAD', cache: 'no-cache' })
      .then((r) => r.ok && /^video\//.test(r.headers.get('content-type') || 'video/mp4'))
      .catch(() => false));
  }
  return existe.get(src);
}

// Reproduce el video `key` de js/data/videos.js y llama onEnd() al terminar, saltar o fallar (siempre una vez).
export function playVideo(key, onEnd = () => {}) {
  const v = VIDEOS[key];
  let done = false, ov = null;
  const end = () => { if (done) return; done = true; ov?.remove(); document.removeEventListener('keydown', onKey); onEnd(); };
  const onKey = (e) => { if (e.key === 'Escape') end(); };
  if (!v || navigator.connection?.saveData || (REDUCE.matches && !v.poster)) { end(); return end; }
  const mostrar = (html) => {
    ov = document.createElement('div');
    ov.className = 'video-ov fade-in';
    ov.innerHTML = `${html}<button class="btn ghost mini video-skip" data-saltar>Saltar ▶▶</button>`;
    ov.querySelector('[data-saltar]').onclick = end;
    document.addEventListener('keydown', onKey);
    document.body.appendChild(ov);
  };
  // Placeholder: sin MP4 (o con movimiento reducido) se muestra el primer cuadro como cinemática fija.
  const poster = () => {
    if (!v.poster) return end();
    mostrar(`<img class="video-poster${REDUCE.matches ? '' : ' kb'}" src="${v.poster}" alt="${v.label}">`);
    ov.querySelector('img').addEventListener('error', end);
    ov.addEventListener('click', (e) => { if (!e.target.closest('[data-saltar]')) end(); });
    setTimeout(end, (v.still || 4) * 1000);
  };
  if (REDUCE.matches) { poster(); return end; }
  disponible(v.src).then((ok) => {
    if (done) return;
    if (!ok) return poster();
    mostrar(`<video muted playsinline autoplay preload="auto" ${v.poster ? `poster="${v.poster}"` : ''} aria-label="${v.label}"></video>`);
    const vid = ov.querySelector('video');
    vid.src = v.src;
    vid.addEventListener('ended', end); vid.addEventListener('error', end);
    const p = vid.play(); if (p && p.catch) p.catch(end);
    setTimeout(end, (v.max || 15) * 1000); // nunca se queda atorado
  });
  return end;
}
