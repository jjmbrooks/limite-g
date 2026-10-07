// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// M11: cinemáticas opcionales. Basta con subir el MP4 (9:16, H.264, sin audio, ≤ 2 MB) con este nombre:
// el juego lo detecta solo. Las imágenes iniciales y los prompts para Grok Imagine están en docs/videos/.
// Dónde se reproducen: intro → antes del prólogo; entrega → al completar por primera vez la misión de Marte (m2);
// final → antes de la intro del Final en Estación Entropía.
export const VIDEOS = {
  intro: { src: 'assets/video/intro.mp4', label: 'Cinemática: Nova en la nave Parábola y Dr. Caos en holograma', max: 12 },
  entrega: { src: 'assets/video/entrega.mp4', label: 'Cinemática: la cápsula aterriza suave en Marte', max: 12, mission: 'm2' },
  final: { src: 'assets/video/final.mp4', label: 'Cinemática: Nova frente a la Estación Entropía', max: 12, act: 4 },
};
