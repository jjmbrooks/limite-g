// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Créditos (#creditos): desfilan hacia arriba con «Victory Theme» de fondo. Con movimiento reducido se muestran quietos.
import { go } from '../nav.js';
import { portrait } from '../ui/speakers.js';

const BLOQUES = [
  ['LÍMITE G', 'Un juego de física para prepa: energía potencial, cinética, caída libre, aire e impacto.'],
  ['IDEA, GUION Y DOCENCIA', 'Jhonatan Jesús Martínez Brooks'],
  ['PROGRAMACIÓN, ARTE PIXEL Y DISEÑO', 'Hark'],
  ['MÚSICA', 'Compuesta con Suno por Jhonatan J. Martínez Brooks: Galactic Quest · Starship Interior · Curious Lab Loop · Skyward Flight · Crash Test Loop · Puzzle Path · Sly Sneaky Motif · Final Boss Battle · Victory Theme'],
  ['JINGLES', '«Music Jingles» de Kenney (kenney.nl), licencia CC0'],
  ['TIPOGRAFÍAS', 'Press Start 2P (CodeMan38) y VT323 (Peter Hull), SIL Open Font License'],
  ['PERSONAJES', 'Nova · GAL-1 · Dr. Caos'],
  ['GRACIAS POR JUGAR', '"Nada se destruye: la energía solo cambia de forma." — GAL-1'],
];

export default function creditos(el) {
  el.innerHTML = `<div class="creditos" role="region" aria-label="Créditos">
      <div class="cred-roll">${BLOQUES.map(([t, d]) => `<section><h2>${t}</h2><p>${d}</p></section>`).join('')}
        <div class="cred-caras"><span data-who="nova"></span><span data-who="gal"></span><span data-who="caos"></span></div>
      </div>
    </div>
    <button class="btn" data-menu>◀ Volver al menú</button>`;
  el.querySelectorAll('.cred-caras [data-who]').forEach((s) => { try { s.replaceWith(portrait(s.dataset.who, 'sm')); } catch { s.remove(); } });
  el.querySelector('[data-menu]').onclick = () => go('menu');
}
