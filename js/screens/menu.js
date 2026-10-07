import { go } from '../main.js';
import { get } from '../state.js';

export default function menu(el) {
  const s = get();
  el.innerHTML = `
    <h1>LÍMITE G</h1>
    <p class="tag">Red Postal Interplanetaria · Año 2187</p>
    <div class="panel dialog">
      <canvas class="avatar" id="nova" width="14" height="14"></canvas>
      <div><h2>NOVA</h2><p>"La energía no se destruye; se transforma en el impacto perfecto."</p></div>
    </div>
    <p class="muted" style="text-align:center">Rango: <b style="color:var(--yellow)">${s.rank}</b></p>
    <button class="btn" data-go="simulador">▶ Simulador de la Parábola<small>Lanza dummies: objeto, altura y planeta.</small></button>
    <button class="btn teal" data-go="codice">◆ Códice Gravitacional<small>Recupera la memoria de GAL-1.</small></button>
    <button class="btn ghost" data-go="examen">✎ Examen de licencia<small>Sube de Cadete a Piloto.</small></button>
    <div class="panel dialog">
      <canvas class="avatar" id="caos" width="14" height="14" style="border-color:var(--magenta)"></canvas>
      <div><h2 style="color:var(--magenta)">DR. CAOS</h2><p>"La entropía siempre gana: todo lo que cae, se destruye."</p></div>
    </div>`;
  el.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => go(b.dataset.go)));
  drawFace(el.querySelector('#nova'), NOVA); drawFace(el.querySelector('#caos'), CAOS);
}

// Retratos provisionales 14×14 (se reemplazan por sprites en M3).
const NOVA = ['....tttttt....','...tttttttt...','..ttssssssst..','..tsssssssst..','..tsewsseswt..','..tsssssssst..','..tssspppsst..','...ssssssss...','....oooooo....','..oooooooooo..','.oooo.oo.oooo.','.oooooooooooo.','.oooooooooooo.','.oooooooooooo.'];
const CAOS = ['..k.kk.kk.k...','..kkkkkkkkk...','..kssssssssk..','..sggsssggss..','..gcggsggcgs..','..sggsssggss..','..ssssssssss..','..ssmmmmmmss..','...ssssssss...','..pppppppppp..','.ppppggggpppp.','.pppppggppppp.','.pppppggppppp.','.pppppppppppp.'];
const PAL = { t: '#2de2c8', s: '#f2c49b', e: '#111', w: '#fff', p: '#7a2fbf', o: '#ff8a1f', k: '#333', g: '#2de2c8', c: '#ffe66d', m: '#ff3fa4' };
function drawFace(c, rows) {
  const x = c.getContext('2d');
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (PAL[ch]) { x.fillStyle = PAL[ch]; x.fillRect(i, j, 1, 1); } }));
}
