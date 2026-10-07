// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Historia: prólogo con diálogos y mapa de misiones de todos los actos con progresión desbloqueable.
// La primera vez que se abre un acto nuevo se reproduce su intro (state.seenActs).
import { INTRO } from '../data/historia.js';
import { ACTS, NEXT } from '../data/actos.js';
import { PLANETS } from '../data/planets.js';
import { OBJECTS } from '../data/objects.js';
import { CODICE } from '../data/codice.js';
import { EXAMENES } from '../data/examenes.js';
import { LOGROS } from '../data/logros.js';
import { playScene } from '../ui/dialogo.js';
import { planetCanvas, pxCanvas } from '../gfx/pixel.js';
import { OBJ_SPRITES, GAL1 } from '../gfx/sprites.js';
import { isDone, isUnlocked, missionById, missionRoute } from '../progress.js';
import { get, set } from '../state.js';
import { go } from '../nav.js';
import { artCanvas } from '../gfx/imagenes.js';
import { playVideo } from '../ui/video.js';
import { VIDEOS } from '../data/videos.js';

const actOpen = (a) => isUnlocked(a.map[0]);

export default function historia(el, arg) {
  let stop = null, stopVideo = null, gone = false;
  // M11: si hay cinemática (assets/video/*.mp4) se reproduce antes del diálogo; si no existe, se omite.
  function scene(title, lines, then, video) {
    el.innerHTML = `<h1 style="font-size:15px">${title}</h1><p class="tag">Toca el cuadro para avanzar</p><div id="scene"></div>`;
    const talk = () => { if (gone) return; stop = playScene(el.querySelector('#scene'), lines, then); };
    if (video) stopVideo = playVideo(video, talk); else talk();
  }
  const intro = () => scene('PRÓLOGO', INTRO, () => { set({ seenIntro: true }); map(); }, 'intro');
  function map() {
    const s = get();
    const fresh = ACTS.find((a) => a.intro && actOpen(a) && !s.seenActs.includes(a.n));
    if (fresh) return scene(fresh.title, fresh.intro, () => { set({ seenActs: [...get().seenActs, fresh.n] }); map(); }, Object.keys(VIDEOS).find((k) => VIDEOS[k].act === fresh.n));
    const expand = (n) => ({ ...n, ...(n.type === 'mision' ? missionById(n.id) : {}), done: isDone(n.id), open: isUnlocked(n) });
    const acts = ACTS.filter((a, i) => i === 0 || actOpen(a)).map((a) => ({ ...a, nodes: a.map.map(expand) }));
    const all = [...acts.flatMap((a) => a.nodes), expand(NEXT)];
    const cur = acts[acts.length - 1];
    const next = [...cur.nodes, ...all].find((n) => n.open && !n.done && n.type !== 'proximo'); // primero el acto actual
    const lockedAct = ACTS.find((a) => !actOpen(a));
    el.innerHTML = `<h1 style="font-size:15px">MAPA DE MISIONES</h1>
      <p class="tag">${cur.title} · Rango: <b style="color:var(--yellow)">${s.rank}</b></p>
      <div class="say"><span class="slot-gal"></span><p>${next ? `GAL-1: "Siguiente objetivo: <b>${next.title}</b>."` : 'GAL-1: "Sector completado. Calibrando sensores para el siguiente acto."'}</p></div>
      ${[...acts].reverse().map((a) => `<h2 class="act-title">${a.title}</h2>
      <ol class="map">${a.nodes.map((n) => li(n, n === next, s)).join('')}${a === cur ? li(lockedAct ? { ...lockedAct.map[0], id: 'lock', type: 'proximo', title: lockedAct.title, brief: 'Completa este acto para abrir el siguiente.', open: false } : all[all.length - 1], false, s) : ''}</ol>`).join('')}
      <button class="btn ghost" data-replay>↺ Ver el prólogo otra vez</button>`;
    el.querySelector('.slot-gal').replaceWith(artCanvas('retrato-gal', GAL1, { w: 64, cls: 'avatar sm gal', label: 'GAL-1' }));
    el.querySelectorAll('.node-btn').forEach((b) => {
      const n = all.find((x) => x.id === b.dataset.id), ico = b.querySelector('.node-ico');
      if (!n) { ico.textContent = '?'; return; }
      if (n.type === 'mision') { ico.appendChild(planetCanvas(PLANETS.find((p) => p.id === n.planet), 16, 'px node-px')); ico.appendChild(artCanvas('obj-' + n.obj, OBJ_SPRITES[n.obj], { cls: 'px node-obj' })); }
      else ico.textContent = { codice: '◆', examen: '✎', logros: '★' }[n.type] || '?';
      b.onclick = () => go(n.type === 'mision' ? missionRoute(n) : n.type + (n.act > 1 ? '/' + n.act : ''));
    });
    el.querySelector('[data-replay]').onclick = intro;
  }
  const li = (n, isNext, s) => `
        <li class="node ${n.done ? 'done' : n.open ? 'open' : 'locked'} ${isNext ? 'next' : ''}">
          <button class="node-btn" data-id="${n.id}" ${n.open && n.type !== 'proximo' ? '' : 'disabled'} aria-label="${n.title}${n.done ? ', completada' : n.open ? '' : ', bloqueada'}">
            <span class="node-ico"></span>
            <span class="node-body"><b>${n.title}</b><small>${n.brief}</small>
              <span class="node-state">${nodeState(n, s)}</span></span>
          </button>
        </li>`;
  function nodeState(n, s) {
    if (n.type === 'proximo') return n.open ? 'Próximamente' : '⊘ Bloqueado';
    if (n.type === 'logros') return n.open ? `${(s.logros || []).length} / ${LOGROS.length} logros` : '⊘ Termina el Final';
    if (!n.open) return '⊘ Completa la anterior';
    if (n.type === 'mision') {
      const st = s.missions[n.id] || 0, o = OBJECTS.find((x) => x.id === n.obj);
      return st ? '★'.repeat(st) + '☆'.repeat(3 - st) : `NUEVA · ${o.name}`;
    }
    if (n.type === 'examen') { const e = EXAMENES[n.act || 1]; return n.done ? `Licencia de ${e.rank} ✓` : `Mejor: ${s[e.key].best} / ${e.n}`; }
    const cards = CODICE[n.act || 1];
    return n.done ? 'Completo ✓' : `${cards.filter((c) => s.codice.includes(c.id)).length} / ${cards.length} fragmentos`;
  }
  if (arg === 'intro' || !get().seenIntro) intro(); else map();
  return () => { gone = true; stopVideo && stopVideo(); stop && stop(); };
}
