// Guardado local (solo navegador). Clave versionada para migraciones futuras.
// codice: ids de tarjetas vistas (todos los actos) · missions: { id: estrellas } · exam / exam2 / exam3: récord de cada examen.
// seenActs: actos cuya intro ya se vio en el mapa · logros: ids de logros desbloqueados (js/data/logros.js).
// alumno: nombre opcional que el alumno escribe para su tarjeta de logros (solo se guarda en este dispositivo).
const KEY = 'limiteg.v1';
const DEFAULT = { score: 0, sound: true, combos: {}, rank: 'Cadete', seenIntro: false, codice: [], missions: {}, exam: { best: 0, attempts: 0, passed: false },
  exam2: { best: 0, attempts: 0, passed: false }, exam3: { best: 0, attempts: 0, passed: false }, seenActs: [], logros: [], alumno: '' };
let state = load();

function load() {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { ...DEFAULT }; }
}
export function get() { return state; }
export function set(patch) {
  state = { ...state, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* almacenamiento bloqueado: se juega sin guardar */ }
  document.dispatchEvent(new CustomEvent('state', { detail: state }));
  return state;
}
export function addScore(n) { return set({ score: state.score + n }); }
