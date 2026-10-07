// limit: energía máxima de impacto (J) contra suelo de roca, sin funda. Valores de juego, aproximados.
// Cd: coeficiente de arrastre y A: área frontal (m²) del paquete solo (Acto 2: F = ½·ρ·Cd·A·v²).
export const OBJECTS = [
  { id: 'cel', name: 'Celular', icon: '📱', m: 0.2, limit: 3, Cd: 1, A: 0.01, color: '#2de2c8' },
  { id: 'huevo', name: 'Huevo de criadero', icon: '🥚', m: 0.06, limit: 0.3, Cd: 0.5, A: 0.0015, color: '#ffe66d' },
  { id: 'vacuna', name: 'Frasco de vacuna', icon: '🧪', m: 0.1, limit: 1, Cd: 0.8, A: 0.002, color: '#ff3fa4' },
  { id: 'cristal', name: 'Cristal de energía', icon: '💎', m: 0.5, limit: 10, Cd: 0.6, A: 0.005, color: '#7df9ff' },
  { id: 'robot', name: 'Robot explorador', icon: '🤖', m: 5, limit: 200, Cd: 1, A: 0.06, color: '#ff8a1f' },
  { id: 'nucleo', name: 'Núcleo de Comunicación', icon: '📡', m: 2, limit: 50, Cd: 1, A: 0.04, color: '#ff3fa4' },
];
