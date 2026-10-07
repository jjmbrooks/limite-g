// Guardado local (solo navegador). Clave versionada para migraciones futuras.
const KEY = 'limiteg.v1';
const DEFAULT = { score: 0, sound: true, combos: {}, rank: 'Cadete', seenIntro: false };
let state = load();

function load() {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { ...DEFAULT }; }
}
export function get() { return state; }
export function set(patch) {
  state = { ...state, ...patch };
  localStorage.setItem(KEY, JSON.stringify(state));
  document.dispatchEvent(new CustomEvent('state', { detail: state }));
  return state;
}
export function addScore(n) { return set({ score: state.score + n }); }
