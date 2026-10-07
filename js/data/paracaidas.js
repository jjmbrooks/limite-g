// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Paracaídas del Acto 2. Cd ≈ 1.4 (domo de tela); A: área del domo abierto (m²). Su masa se desprecia.
export const CHUTES = [
  { id: 'ninguno', name: 'Ninguno', Cd: 0, A: 0 },
  { id: 'mini', name: 'Mini', Cd: 1.4, A: 0.05 },
  { id: 'mediano', name: 'Mediano', Cd: 1.4, A: 0.5 },
  { id: 'grande', name: 'Grande', Cd: 1.4, A: 3 },
];
export const OPEN_TIME = 0.6; // s que tarda en inflarse
export const cdA = (x) => x.Cd * x.A;
