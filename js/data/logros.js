// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Logros: condiciones puras sobre el estado guardado (localStorage). Se guardan desbloqueados en state.logros.
import { ALL_MISSIONS } from './actos.js';
import { CODICE } from './codice.js';

const done = (s, id) => (s.missions?.[id] || 0) > 0;
const passed = (s, k) => !!s[k]?.passed;

export const LOGROS = [
  { id: 'primera', icon: '✉', title: 'Primera entrega', desc: 'Completa tu primera misión.', test: (s) => Object.values(s.missions || {}).some((x) => x > 0) },
  { id: 'acto1', icon: '1', title: 'Sin aire, sin miedo', desc: 'Completa el Acto 1 (Luna, Marte, Tierra ideal y Júpiter).', test: (s) => done(s, 'm4') },
  { id: 'acto2', icon: '☂', title: 'Dueña del aire', desc: 'Completa el Acto 2 (Tierra, Venus y Titán).', test: (s) => done(s, 'm8') },
  { id: 'acto3', icon: '■', title: 'Impacto perfecto', desc: 'Completa el Acto 3 (Europa e Ío).', test: (s) => done(s, 'm12') },
  { id: 'final', icon: '◎', title: 'Entropía vencida', desc: 'Entrega el Núcleo de Comunicación en la Estación Entropía.', test: (s) => done(s, 'f3') },
  { id: 'comandante', icon: '✎', title: 'Licencia completa', desc: 'Aprueba los exámenes de Piloto, Capitana y Comandante.', test: (s) => ['exam', 'exam2', 'exam3'].every((k) => passed(s, k)) },
  { id: 'sin-errores', icon: '8', title: 'Sin errores', desc: 'Saca 8 de 8 en un examen de licencia.', test: (s) => ['exam', 'exam2', 'exam3'].some((k) => s[k]?.best >= 8) },
  { id: 'memoria', icon: '◆', title: 'Memoria total', desc: 'Recupera todos los fragmentos del Códice Gravitacional.', test: (s) => Object.values(CODICE).flat().every((c) => (s.codice || []).includes(c.id)) },
  { id: 'galileo', icon: '★', title: 'Precisión de Galileo', desc: 'Consigue 3 ★ en todas las misiones.', test: (s) => ALL_MISSIONS.every((m) => (s.missions?.[m.id] || 0) >= 3) },
  { id: 'laboratorio', icon: '⚗', title: 'Científica de laboratorio', desc: 'Logra 10 entregas distintas en los simuladores libres.', test: (s) => Object.keys(s.combos || {}).length >= 10 },
  { id: 'constelacion', icon: '✦', title: 'Constelación', desc: 'Reúne 100 ★.', test: (s) => (s.score || 0) >= 100 },
];

// Ids de logros que el estado cumple y aún no estaban guardados.
export const newLogros = (s) => LOGROS.filter((l) => !(s.logros || []).includes(l.id) && l.test(s)).map((l) => l.id);
