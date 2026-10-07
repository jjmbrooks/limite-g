// g en m/s² (valores de NASA, redondeados). air: lo usa el Acto 2.
export const PLANETS = [
  { id: 'luna', name: 'Luna', g: 1.62, sky: ['#05060f', '#1a1c2c'], ground: '#9a9aa8', act: 1 },
  { id: 'marte', name: 'Marte', g: 3.71, sky: ['#2b0f0a', '#a8442a'], ground: '#c1440e', act: 1 },
  { id: 'tierra', name: 'Tierra', g: 9.81, sky: ['#0b2a6b', '#59a5e8'], ground: '#4f8a3a', act: 1, note: 'sin aire (modo ideal)' },
  { id: 'jupiter', name: 'Júpiter', g: 24.79, sky: ['#3b2412', '#d9a066'], ground: '#8a5a2b', act: 1, note: 'superficie imaginaria' },
];
