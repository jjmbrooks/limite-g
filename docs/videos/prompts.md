# Videos para Grok Imagine (image-to-video)

Tres imágenes iniciales **9:16 (768×1376)** en el mismo estilo 16-bit del juego, pensadas para verse en el celular a pantalla completa.
Sube cada imagen a Grok Imagine, pega el prompt en inglés y pide un clip de **6–10 s**.

| Imagen | Video que debes guardar | Dónde se reproduce en el juego |
|---|---|---|
| `docs/videos/intro.png` | `assets/video/intro.mp4` | Antes del prólogo (al empezar la historia o con «Ver el prólogo otra vez») |
| `docs/videos/entrega.png` | `assets/video/entrega.mp4` | La primera vez que se completa la misión de Marte (m2), antes del diálogo final de la misión |
| `docs/videos/final.png` | `assets/video/final.mp4` | Antes de la intro del Final en Estación Entropía |

## 1. Intro — `intro.png`

**Prompt (EN):**
> 16-bit pixel art, SNES style, smooth animation, no text. Slow cinematic push-in over the shoulder of the teal-haired pilot in an orange spacesuit, inside the cockpit of the courier spaceship gliding over a cratered moon; cockpit screens blink and she leans forward, determined. Above her, a giant purple-magenta hologram of a bald villain with teal goggles flickers to life with scanline glitches and grins menacingly, his coat rippling. Stars twinkle, engine flame pulses, the planet below slowly scrolls by. Ominous but adventurous mood, rich dithered colors, crisp pixels, stable framing, no camera shake, no text, no logos.

**Traducción (ES):**
> Pixel art de 16 bits, estilo SNES, animación fluida, sin texto. Acercamiento cinematográfico lento por encima del hombro de la piloto de pelo turquesa y traje naranja, dentro de la cabina de la nave-correo que se desliza sobre una luna con cráteres; las pantallas parpadean y ella se inclina hacia adelante, decidida. Arriba, un holograma gigante morado-magenta de un villano calvo con goggles turquesa se enciende con interferencias de líneas y sonríe amenazante, con el abrigo ondeando. Las estrellas titilan, la llama del motor late y el planeta se desplaza lentamente abajo. Ambiente inquietante pero aventurero, colores ricos con tramado, píxeles nítidos, encuadre estable, sin sacudidas de cámara, sin texto ni logotipos.

## 2. Entrega exitosa — `entrega.png`

**Prompt (EN):**
> 16-bit pixel art, SNES style, smooth animation, no text. The camera slowly tilts down following a silver delivery capsule with a glowing turquoise window as it descends gently under an orange-and-cream striped parachute over the red Martian desert. The parachute sways softly in the wind, fine red dust drifts across the dunes, the capsule touches down softly with a small puff of dust and its window light pulses happily twice. Pink-orange sky, distant mesas, the courier ship passes small in the sky. Calm, triumphant mood, rich dithered colors, crisp pixels, stable framing, no text, no logos.

**Traducción (ES):**
> Pixel art de 16 bits, estilo SNES, animación fluida, sin texto. La cámara baja lentamente siguiendo una cápsula de entrega plateada con ventana turquesa brillante que desciende suave bajo un paracaídas a rayas naranja y crema sobre el desierto rojo de Marte. El paracaídas se mece con el viento, un polvo rojo fino cruza las dunas, la cápsula toca el suelo con suavidad levantando una pequeña nube de polvo y la luz de su ventana late dos veces, contenta. Cielo rosa-naranja, mesetas a lo lejos, la nave-correo pasa pequeña en el cielo. Ambiente tranquilo y triunfal, colores ricos con tramado, píxeles nítidos, encuadre estable, sin texto ni logotipos.

## 3. Final — `final.png`

**Prompt (EN):**
> 16-bit pixel art, SNES style, smooth animation, no text. Slow cinematic dolly-in from behind the teal-haired courier in an orange spacesuit standing on a metal landing deck, holding a glowing magenta-and-yellow communication core. Ahead looms the huge dark-purple Entropy space station with blinking magenta lights and rotating antennas, banded Jupiter turning slowly behind it. Her hair and the core's glow pulse gently, small sparks drift, station lights flicker. Epic, hopeful final-showdown mood, rich dithered colors, crisp pixels, stable framing, no text, no logos.

**Traducción (ES):**
> Pixel art de 16 bits, estilo SNES, animación fluida, sin texto. Acercamiento cinematográfico lento desde atrás de la mensajera de pelo turquesa y traje naranja, de pie en una cubierta metálica de aterrizaje, sosteniendo un núcleo de comunicación brillante magenta y amarillo. Enfrente se alza la enorme Estación Entropía, morada oscura, con luces magenta que parpadean y antenas que giran, y Júpiter con sus bandas rotando lento detrás. Su pelo y el brillo del núcleo laten suavemente, pequeñas chispas flotan y las luces de la estación titilan. Ambiente épico y esperanzador de enfrentamiento final, colores ricos con tramado, píxeles nítidos, encuadre estable, sin texto ni logotipos.

## Cómo integrarlos (ya está programado)

1. Exporta cada clip como **MP4 H.264, 9:16 (p. ej. 720×1280), sin audio, 6–10 s y de preferencia ≤ 2 MB** (muchos alumnos usan datos móviles).
   Ejemplo con ffmpeg: `ffmpeg -i grok.mp4 -an -vf scale=720:-2 -c:v libx264 -crf 28 -preset slow -movflags +faststart assets/video/intro.mp4`
2. Guárdalos con los nombres de la tabla en `assets/video/`.
3. Corre `node scripts/qa/sw-precache.mjs --fix`, sube `VERSION` en `sw.js` y publica como siempre.

El código (`js/ui/video.js` + `js/data/videos.js`) revisa si el archivo existe (petición HEAD). Si existe, lo muestra a pantalla completa con `<video muted playsinline autoplay>` y botón **«Saltar ▶▶»** (también Esc); al terminar sigue la historia.
Si **no** existe, no hay red, el teléfono tiene activado el ahorro de datos o el alumno pidió movimiento reducido, se omite sin error.
