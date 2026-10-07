// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Acto 3: suelos de aterrizaje y materiales de funda. Valores de juego, aproximados.
// Suelo d: cuánto se hunde al recibir el golpe (m). Funda rho: densidad (kg/m³); k: fracción del grosor que se comprime.
export const SUELOS = [
  { id: 'concreto', name: 'Concreto', d: 0, color: '#9a9aa8' },
  { id: 'pasto', name: 'Pasto', d: 0.01, color: '#4f9a3a' },
  { id: 'arena', name: 'Arena', d: 0.03, color: '#e0c070' },
  { id: 'espuma', name: 'Colchón de espuma', d: 0.08, color: '#ff8ac8' },
];
export const FUNDAS = [
  { id: 'ninguna', name: 'Ninguna', rho: 0, k: 0, color: '#3c4466' },
  { id: 'carton', name: 'Cartón', rho: 50, k: 0.5, color: '#b8864a' },
  { id: 'unicel', name: 'Unicel', rho: 20, k: 0.6, color: '#f0f0f0' },
  { id: 'hule', name: 'Hule espuma', rho: 30, k: 0.8, color: '#ffd23f' },
  { id: 'gel', name: 'Gel', rho: 1000, k: 0.9, color: '#5ad8ff' },
];
export const T_MAX = 0.1; // grosor máximo de funda (m)
// Lado del paquete (m), suponiéndolo un cubo de área frontal A.
export const sideOf = (o) => Math.sqrt(o.A);
