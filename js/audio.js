// Música (archivo de Suno con respaldo chiptune) y efectos generados con WebAudio.
import { get, set } from './state.js';
let ctx, master, musicTimer, whoosh, unlocked = false;
// Nada suena antes de la primera interacción del usuario (regla de los navegadores y de accesibilidad).
const unlock = () => { unlocked = true; };
addEventListener('pointerdown', unlock, { once: true, capture: true });
addEventListener('keydown', unlock, { once: true, capture: true });

function ac() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = get().sound ? 0.25 : 0; master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
function tone(freq, dur, type = 'square', vol = 0.3, when = 0, slideTo) {
  if (!unlocked) return;
  const a = ac(), t = a.currentTime + when;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol = 0.4) {
  if (!unlocked) return;
  const a = ac(), buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = a.createBufferSource(), g = a.createGain(); g.gain.value = vol;
  s.buffer = buf; s.connect(g); g.connect(master); s.start();
}
// Jingles cortos (Kenney «Music Jingles», CC0) decodificados con WebAudio; si no cargan, suena la versión sintetizada.
const JINGLES = { victoria: 'assets/audio/sfx/victoria.m4a', logro: 'assets/audio/sfx/logro.m4a', rompe: 'assets/audio/sfx/rompe.m4a' };
const buffers = {};
function loadJingles() {
  if (loadJingles.done) return; loadJingles.done = true;
  for (const [k, url] of Object.entries(JINGLES))
    fetch(url).then((r) => r.arrayBuffer()).then((b) => new Promise((ok, ko) => ac().decodeAudioData(b, ok, ko))).then((buf) => (buffers[k] = buf)).catch(() => {});
}
function jingle(k, vol, fallback) {
  if (!unlocked) return;
  loadJingles();
  const b = buffers[k]; if (!b) return fallback();
  const a = ac(), src = a.createBufferSource(), g = a.createGain(); g.gain.value = vol;
  src.buffer = b; src.connect(g); g.connect(master); src.start();
}
addEventListener('pointerdown', () => loadJingles(), { once: true });
export const sfx = {
  click: () => tone(880, 0.06, 'square', 0.15),
  launch: () => tone(300, 0.25, 'square', 0.2, 0, 900),
  thud: () => { tone(120, 0.25, 'triangle', 0.5, 0, 40); noise(0.12, 0.2); },
  crash: () => { noise(0.35, 0.4); jingle('rompe', 1.4, () => tone(200, 0.4, 'sawtooth', 0.2, 0, 50)); },
  blip: () => tone(520 + Math.random() * 80, 0.03, 'square', 0.04),
  glitch: () => { tone(90, 0.2, 'sawtooth', 0.12, 0, 400); noise(0.15, 0.15); },
  win: () => jingle('victoria', 1.4, () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'square', 0.18, i * 0.09))),
  logro: () => jingle('logro', 1.4, () => [784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.1, 'square', 0.15, i * 0.06))),
};
// Silbido de caída: su tono sube con la velocidad.
export function fallStart() {
  if (!unlocked) return;
  const a = ac(); fallStop();
  const o = a.createOscillator(), g = a.createGain();
  o.type = 'triangle'; o.frequency.value = 200; g.gain.value = 0.06;
  o.connect(g); g.connect(master); o.start(); whoosh = { o, g };
}
export function fallSpeed(v) { if (whoosh) whoosh.o.frequency.value = 200 + Math.min(v, 80) * 12; }
export function fallStop() { if (whoosh) { whoosh.o.stop(); whoosh = null; } }

// Música por sección (pistas de Suno en assets/audio/, ver docs/audio/README.md), con fundido entre pistas.
// Si un archivo no carga, suena el loop chiptune generado con WebAudio.
const MUSIC_VOL = 0.45, FADE_MS = 700;
const TRACKS = { tema: 'assets/audio/tema.m4a', bitacora: 'assets/audio/bitacora.m4a', acto1: 'assets/audio/acto1.m4a', acto2: 'assets/audio/acto2.m4a', acto3: 'assets/audio/acto3.m4a', examen: 'assets/audio/examen.m4a', caos: 'assets/audio/caos.m4a', final: 'assets/audio/final.m4a', creditos: 'assets/audio/creditos.m4a' };
// Pantalla → pista. Las pantallas sin pista propia todavía conservan la que esté sonando.
const ROUTE_TRACK = { menu: 'tema', logros: 'tema', historia: 'bitacora', codice: 'bitacora', simulador: 'acto1', aire: 'acto2', impacto: 'acto3', examen: 'examen', creditos: 'creditos' };
const SONG = [[220, 277, 330, 440], [196, 247, 294, 392], [174, 220, 262, 349], [196, 247, 294, 392]];
let routeWant = 'tema', override = null, want = 'tema', curKey = null, cur = null, duck = 1, chipFallback = false;
const players = {};
function chipStart() {
  if (musicTimer) return;
  ac(); let step = 0;
  musicTimer = setInterval(() => {
    const chord = SONG[Math.floor(step / 16) % SONG.length];
    tone(chord[step % 4] * 2, 0.11, 'square', 0.05);
    if (step % 8 === 0) tone(chord[0] / 2, 0.4, 'triangle', 0.18);
    step++;
  }, 140);
}
function fade(el, to, ms, done) {
  const from = el.volume, t0 = performance.now();
  clearInterval(el._fade);
  el._fade = setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    el.volume = Math.max(0, Math.min(1, from + (to - from) * k));
    if (k >= 1) { clearInterval(el._fade); done && done(); }
  }, 30);
}
function player(key) {
  if (!players[key]) {
    const el = new Audio(TRACKS[key]); el.loop = true; el.preload = 'auto'; el.volume = 0;
    el.addEventListener('error', () => { if (curKey === key) { chipFallback = true; cur = null; curKey = null; if (get().sound) chipStart(); } }, { once: true });
    players[key] = el;
  }
  return players[key];
}
function apply() {
  if (!unlocked) return;
  if (chipFallback) { if (get().sound) chipStart(); return; }
  if (curKey === want && cur) { if (get().sound && cur.paused) cur.play().catch(() => {}); return; }
  const old = cur; cur = player(want); curKey = want;
  if (old) fade(old, 0, FADE_MS, () => old.pause());
  if (get().sound) { cur.play().catch(() => {}); fade(cur, MUSIC_VOL * duck, FADE_MS); }
}
export function musicStart() { apply(); }
// La llama main.js en cada cambio de pantalla.
// Las misiones del Final (f1, f2, f3) usan la batalla de la Estación Entropía en cualquier simulador.
export function musicFor(route, arg = '') { const k = /^f\d/.test(arg || '') ? 'final' : ROUTE_TRACK[route]; if (k) routeWant = k; override = null; want = routeWant; apply(); }
// Escenas especiales (p. ej. cuando habla Dr. Caos): pista temporal; null regresa a la de la pantalla.
export function musicScene(key) { override = key && TRACKS[key] ? key : null; want = override || routeWant; apply(); }
// Baja la música (diálogos, videos) o la regresa a su volumen.
export function musicDuck(on) { duck = on ? 0.35 : 1; if (cur) fade(cur, MUSIC_VOL * duck, 300); }
export function toggleSound() {
  const on = !get().sound; set({ sound: on });
  if (master) master.gain.value = on ? 0.25 : 0;
  if (cur) { if (on) { cur.play().catch(() => {}); fade(cur, MUSIC_VOL * duck, 300); } else cur.pause(); }
  else if (on) apply();
  return on;
}
