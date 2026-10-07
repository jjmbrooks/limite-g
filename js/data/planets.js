// g en m/s² (valores de NASA, redondeados). act: acto en que aparece.
// air: densidad de la atmósfera en la superficie (kg/m³, aproximada; 0 = sin aire). La usa el Acto 2.
// px: tonos del sprite pixel (a claro, b base, c sombra, d detalle) y estilo de superficie.
export const PLANETS = [
  { id: 'luna', name: 'Luna', g: 1.62, sky: ['#05060f', '#1a1c2c'], ground: '#9a9aa8', act: 1,
    px: { a: '#e4e4ee', b: '#a8a8b8', c: '#6a6a7e', d: '#4a4a5c', style: 'craters' } },
  { id: 'marte', name: 'Marte', g: 3.71, sky: ['#2b0f0a', '#a8442a'], ground: '#c1440e', act: 1,
    px: { a: '#ff9a5c', b: '#d0582a', c: '#8a2e12', d: '#a8401a', style: 'dust' } },
  { id: 'tierra', name: 'Tierra', g: 9.81, sky: ['#0b2a6b', '#59a5e8'], ground: '#4f8a3a', act: 1, note: 'sin aire (modo ideal)',
    px: { a: '#8fd0ff', b: '#2f7fd8', c: '#1a3f8a', d: '#4f9a3a', style: 'earth' } },
  { id: 'jupiter', name: 'Júpiter', g: 24.79, sky: ['#3b2412', '#d9a066'], ground: '#8a5a2b', act: 1, note: 'superficie imaginaria',
    px: { a: '#f5d6a8', b: '#d9a066', c: '#8a5a2b', d: '#b87a44', style: 'bands' } },
  // Acto 2: con aire. Densidades superficiales aproximadas (NASA): Tierra 1.2, Venus ~65, Titán ~5.3 kg/m³.
  { id: 'tierra-aire', name: 'Tierra', g: 9.81, air: 1.225, sky: ['#0b2a6b', '#8cc8f0'], ground: '#4f8a3a', act: 2, note: 'con aire al nivel del mar',
    px: { a: '#8fd0ff', b: '#2f7fd8', c: '#1a3f8a', d: '#4f9a3a', style: 'earth' } },
  { id: 'venus', name: 'Venus', g: 8.87, air: 65, sky: ['#5a3a0a', '#e8b860'], ground: '#a87a3a', act: 2, note: 'atmósfera 50 veces más densa que la terrestre',
    px: { a: '#fff0c0', b: '#e8c070', c: '#a8783a', d: '#f5dca0', style: 'clouds' } },
  { id: 'titan', name: 'Titán', g: 1.35, air: 5.3, sky: ['#3a2208', '#d08a3a'], ground: '#6a4a2a', act: 2, note: 'luna de Saturno con bruma densa',
    px: { a: '#f0b060', b: '#d08a3a', c: '#7a4a1a', d: '#a86a2a', style: 'haze' } },
  // Acto 3: impacto. Lunas de Júpiter casi sin atmósfera.
  { id: 'europa', name: 'Europa', g: 1.31, sky: ['#05060f', '#1a2a4a'], ground: '#cfe4f0', act: 3, note: 'corteza de hielo',
    px: { a: '#f4fbff', b: '#cfe4f0', c: '#8aa8c0', d: '#b86a4a', style: 'ice' } },
  { id: 'io', name: 'Ío', g: 1.8, sky: ['#0a0505', '#3a2a10'], ground: '#e0c040', act: 3, note: 'volcanes de azufre',
    px: { a: '#fff08a', b: '#e0c040', c: '#a08020', d: '#d06020', style: 'volcano' } },
  // Final: Estación Entropía, en órbita de Júpiter (gravedad artificial de juego = g de Júpiter).
  { id: 'entropia', name: 'Estación Entropía', g: 24.79, sky: ['#0a0418', '#3a1450'], ground: '#5a5a7a', act: 4, note: 'cubierta de aterrizaje, sin aire',
    px: { a: '#e0a8ff', b: '#a45ad8', c: '#4b1a7a', d: '#ff3fa4', style: 'bands' } },
  { id: 'entropia-domo', name: 'Domo de Entropía', g: 24.79, air: 1.2, sky: ['#1a0830', '#7a3aa8'], ground: '#5a5a7a', act: 4, note: 'domo presurizado con aire',
    px: { a: '#e0a8ff', b: '#a45ad8', c: '#4b1a7a', d: '#ff3fa4', style: 'clouds' } },
];
