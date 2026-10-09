// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Progresión de la historia: qué nodos del mapa están completos y cuáles desbloqueados (todos los actos).
import { get } from './state.js';
import { CODICE } from './data/codice.js';
import { ALL_MISSIONS, MODE_ROUTE, ACTS } from './data/actos.js';
import { EXAMENES } from './data/examenes.js';

// Nodos especiales: 'codice' / 'codice2' (todas las tarjetas del acto), 'examen' / 'examen2' (aprobado).
export function isDone(id) {
  const s = get();
  const cx = id.match(/^codice(\d*)$/), ex = id.match(/^examen(\d*)$/);
  if (cx) return (CODICE[+(cx[1] || 1)] || []).every((c) => s.codice.includes(c.id));
  if (ex) { const e = EXAMENES[+(ex[1] || 1)]; return !!(e && s[e.key]?.passed); }
  if (ALL_MISSIONS.some((m) => m.id === id)) return (s.missions[id] || 0) > 0;
  return false;
}
export const isUnlocked = (node) => node.requires.every(isDone);
export const missionById = (id) => ALL_MISSIONS.find((m) => m.id === id);
export const missionRoute = (m) => `${MODE_ROUTE[m.mode] || 'simulador'}/${m.id}`;
// Rango que nunca baja: se queda con el más alto entre el actual y el nuevo.
export const RANKS = ['Cadete', 'Piloto', 'Capitana', 'Comandante'];
export const higherRank = (a, b) => (RANKS.indexOf(b) > RANKS.indexOf(a) ? b : a);
// Acto más avanzado que ya está abierto (1, 2, 3…).
export const currentAct = () => ACTS.filter((a) => isUnlocked(a.map[0])).reduce((n, a) => Math.max(n, a.n), 1);

// Siguiente paso recomendado (el mismo que resalta el mapa): primero el acto abierto más avanzado.
// Devuelve { node, act, done, total } (node = null si no queda nada) y lo usa el menú para «Continuar».
export function nextStep() {
  const open = ACTS.filter((a, i) => i === 0 || isUnlocked(a.map[0]));
  const act = open[open.length - 1];
  const expand = (n) => ({ ...n, ...(n.type === 'mision' ? missionById(n.id) : {}) });
  const pend = (list) => list.find((n) => isUnlocked(n) && !isDone(n.id));
  const node = pend(act.map) || open.map((a) => pend(a.map)).find(Boolean) || null;
  return { node: node && expand(node), act, done: act.map.filter((n) => isDone(n.id)).length, total: act.map.length };
}
// Ruta a la que lleva un nodo del mapa (misión, códice o examen de su acto).
export const nodeRoute = (n) => (n.type === 'mision' ? missionRoute(n) : n.type + (n.act > 1 ? '/' + n.act : ''));
