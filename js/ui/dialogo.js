// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Diálogos con efecto máquina de escribir. Tocar: completa la línea o pasa a la siguiente. «Omitir» salta la escena.
// Con movimiento reducido el texto aparece completo de inmediato.
import { SPEAKERS, portrait } from './speakers.js';
import { sfx, musicScene } from '../audio.js';

const SPEED = 24; // ms por letra

// Monta la escena en `host` y llama onEnd() al terminar u omitir. Devuelve una función para detenerla.
export function playScene(host, lines, onEnd = () => {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = -1, typing = 0, done = false;
  host.innerHTML = `
    <div class="scene panel fade-in" role="dialog" aria-label="Diálogo">
      <div class="scene-who"><span class="slot"></span><h2 id="sc-name"></h2></div>
      <p class="scene-text" id="sc-text" aria-live="polite"></p>
      <div class="scene-ctl">
        <button class="btn ghost mini" data-skip>Omitir ▶▶</button>
        <button class="btn mini" data-next aria-label="Continuar">▼</button>
      </div>
    </div>`;
  const $ = (s) => host.querySelector(s);
  const text = $('#sc-text');

  function line() {
    clearInterval(typing);
    i++;
    if (i >= lines.length) return end();
    const L = lines[i], S = SPEAKERS[L.who];
    $('.scene-who').firstElementChild.replaceWith(portrait(L.who));
    $('#sc-name').textContent = S.name; $('#sc-name').style.color = S.color;
    $('.scene').dataset.who = L.who;
    if (L.who === 'caos') { sfx.glitch(); musicScene('caos'); } // su tema suena desde que aparece hasta el fin de la escena
    if (reduce) { text.textContent = L.text; return; }
    let n = 0; text.textContent = '';
    typing = setInterval(() => {
      n++; text.textContent = L.text.slice(0, n);
      if (n % 3 === 0) sfx.blip();
      if (n >= L.text.length) { clearInterval(typing); typing = 0; }
    }, SPEED);
  }
  function advance() {
    if (done) return;
    if (typing) { clearInterval(typing); typing = 0; text.textContent = lines[i].text; return; }
    sfx.click(); line();
  }
  function end() {
    if (done) return; done = true; clearInterval(typing);
    musicScene(null); host.innerHTML = ''; onEnd();
  }
  $('.scene').addEventListener('click', (e) => { if (!e.target.closest('[data-skip]')) advance(); });
  $('[data-skip]').onclick = () => { sfx.click(); end(); };
  host.addEventListener('keydown', (e) => { if (e.key === 'Escape') end(); });
  line();
  $('[data-next]').focus({ preventScroll: true });
  return () => { done = true; clearInterval(typing); musicScene(null); };
}
