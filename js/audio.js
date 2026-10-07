// Música chiptune y efectos generados con WebAudio (sin archivos de audio).
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
export const sfx = {
  click: () => tone(880, 0.06, 'square', 0.15),
  launch: () => tone(300, 0.25, 'square', 0.2, 0, 900),
  thud: () => { tone(120, 0.25, 'triangle', 0.5, 0, 40); noise(0.12, 0.2); },
  crash: () => { noise(0.5, 0.5); tone(200, 0.4, 'sawtooth', 0.2, 0, 50); },
  blip: () => tone(520 + Math.random() * 80, 0.03, 'square', 0.04),
  glitch: () => { tone(90, 0.2, 'sawtooth', 0.12, 0, 400); noise(0.15, 0.15); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'square', 0.18, i * 0.09)),
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

// Loop de música: arpegio + bajo, 8 compases.
const SONG = [[220, 277, 330, 440], [196, 247, 294, 392], [174, 220, 262, 349], [196, 247, 294, 392]];
export function musicStart() {
  if (!unlocked) return;
  ac(); if (musicTimer) return;
  let step = 0;
  musicTimer = setInterval(() => {
    const chord = SONG[Math.floor(step / 16) % SONG.length];
    tone(chord[step % 4] * 2, 0.11, 'square', 0.05);
    if (step % 8 === 0) tone(chord[0] / 2, 0.4, 'triangle', 0.18);
    step++;
  }, 140);
}
export function toggleSound() {
  const on = !get().sound; set({ sound: on });
  if (master) master.gain.value = on ? 0.25 : 0;
  return on;
}
