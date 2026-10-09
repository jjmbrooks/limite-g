# Changelog

Todos los cambios notables de **Límite G** se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); las versiones siguen los módulos del [PLAN.md](PLAN.md).
Cada entrada escrita por Hark termina con "— firmado: Hark"; las de autores humanos, con su nombre.

## [Unreleased]

### Added
- M12: menú rediseñado (CONTINUAR con el siguiente paso, ruta de aprendizaje, mosaico con estado), predicción antes de soltar y cálculo tras el impacto en el simulador sin aire, análisis en docs/analisis-ux-pedagogia.md. — firmado: Hark

### Fixed
- Tras soltar se puede rearmar la nave arrastrando; la segunda caída se encuadra desde la nave; la escena ya no se desplaza por dentro; el fondo ya no repite franjas al subir. — firmado: Hark
- Placeholders de cinemáticas: sin MP4 se muestra su primer cuadro (assets/video/*.webp); prompts de Suno en docs/audio/prompts-suno.md. — firmado: Hark
- Pantalla de créditos con «Victory Theme»; jingles CC0 de Kenney (victoria, logro, paquete roto); primeros y últimos cuadros de los videos. — firmado: Hark
- Música por sección: «Galactic Quest» (tema, menú y logros) y «Starship Interior» (bitácora: historia y Códice), con fundido y respaldo chiptune. — firmado: Hark
- Audio: créditos con Victory Theme y jingles CC0 de Kenney — firmado: Hark

### Fixed
- M11.1 escena de los simuladores: cámara vertical con zoom continuo (0.2–2000 m, sin saltos de escala) que sigue a la nave y, al soltar, al paquete hasta ver el suelo y el impacto; paralaje vertical por capas (cielo, lejanas, suelo) con cielo tramado, nubes y estrellas a gran altura; el fondo ya no se congela al soltar (frena suave tras el impacto) ni se rompen las texturas; regla en coordenadas del mundo; caché m11-2 — firmado: Hark

### Changed
- M11 interfaz 16-bit: ventanas con marco doble y degradado tipo SNES, botones biselados con estado presionado, HUD con placas, chips, pestañas y barras con brillo, fondo con degradado de cielo y transiciones suaves (se apagan con movimiento reducido) — firmado: Hark
- M11 simuladores (sin aire, con aire, impacto): escena a pantalla completa sin scroll en 360×640 y 390×844 (js/ui/escena.js): fondo 16-bit con paralaje por franjas que se desplaza sin fin y nave con bamboleo; la altura se cambia arrastrando sobre la escena (o con flechas: role=slider) con regla lateral de escala automática y etiqueta de altura junto a la nave; SOLTAR grande superpuesto, Ajustes en hoja deslizable y resultados superpuestos tras el impacto (gráfica v(t) y zoom del frenado); con la regla saboteada no se muestra la altura y se escribe — firmado: Hark

### Added
- Convención de firma de Hark: `scripts/hark-commit.sh`, `CONTRIBUTING.md` y este CHANGELOG. — firmado: Hark
- Control de calidad: `scripts/qa.sh` (sintaxis, enlace de módulos, referencias HTML, limpieza, pruebas `node:test` de física y datos, humo HTTP), workflow `calidad.yml` (copia en `docs/workflows/`) y `docs/QA.md` — firmado: Hark
- `AGENTS.md` (guía para retomar el proyecto), `LICENSE-ARTE.md` (CC BY 4.0 para arte, historia y textos) y README actualizado — firmado: Hark
- M3: arte pixel en `js/gfx/` (paleta del mood board, retratos de Nova, Dr. Caos y GAL-1, nave Parábola, cápsula, 5 paquetes, planetas generados, escenarios con tramado y fondo estrellado con paralaje), integrado en menú y simulador; botones ≥44 px y `prefers-reduced-motion` — firmado: Hark
- M4: Códice Gravitacional del Acto 1: 6 tarjetas deslizables (Ep, Ec, conservación, caída libre, g por planeta, altura segura) con mini-animaciones pixel, fórmula, ejemplo resuelto y voz de GAL-1, Nova y Dr. Caos; progreso guardado — firmado: Hark
- M5: Examen de licencia del Acto 1: banco de 20 preguntas (cálculo generado al azar y concepto), 8 por intento, retroalimentación explicada por GAL-1, interferencias de Dr. Caos (glitch y reloj), rango Cadete → Piloto y récord guardado — firmado: Hark
- M6: Historia del Acto 1: prólogo y diálogos de Nova, GAL-1 y Dr. Caos con máquina de escribir y «Omitir», mapa de misiones con progresión desbloqueable y 4 misiones de altura exacta en el simulador (sabotajes: regla y g borradas), estrellas por precisión; el audio espera a la primera interacción — firmado: Hark
- M7: Acto 2 con aire: física de arrastre F = ½·ρ·Cd·A·v² con integración de paso fijo estable, velocidad terminal y paracaídas (apertura automática o manual), simulador `#aire` con barra de energía perdida y gráfica v(t) pixel con aire vs sin aire, Tierra/Venus/Titán con densidades reales aproximadas, Códice y Examen de Capitana (14 preguntas), 4 misiones con historia y sabotajes (densidad borrada, tormenta), desbloqueo tras el Acto 1 — firmado: Hark
- M8: Acto 3 de impacto: F_media·d = Ec con distancia de frenado (paquete + suelo + funda), suelos (concreto, pasto, arena, espuma) y fundas diseñables (material y grosor; su masa suma energía), simulador `#impacto` con zoom del frenado y medidor de fuerza, Europa e Ío, Códice y Examen de Comandante (13 preguntas), 4 misiones con historia y sabotaje de suelos (diseño para el peor caso) — firmado: Hark
- M9: Final en Estación Entropía: intro, tres tramos con el Núcleo de Comunicación (sin aire con datos borrados, domo con tormenta y paracaídas, plataforma con suelo cambiante) y desenlace; logros guardados en localStorage (11 insignias) con aviso al desbloquear y vitrina `#logros` — firmado: Hark
- M10: tarjeta de logros en PNG pixel art compartible (Web Share con archivo, o descarga + enlace de WhatsApp); PWA offline con manifest, íconos pixel, service worker con caché versionada y fuentes alojadas en el repo; QA del precache y prueba sin red; avisos de logros agrupados y guiones en chips — firmado: Hark
- M11 arte 16-bit: retratos de Nova, Dr. Caos y GAL-1, nave, cápsula, 6 paquetes y 9 fondos panorámicos en PNG (assets/sprites, assets/fondos) generados con el mood board como referencia y reducidos a pixel art con paleta limitada (scripts/arte16.py); js/gfx/imagenes.js carga los PNG con la matriz como respaldo — firmado: Hark
- M11 logros: la celebración de cada logro desbloqueado (destellos) ofrece «⇪ Compartir», que dibuja la tarjeta de js/ui/tarjeta.js y la comparte con Web Share o la descarga con enlace de WhatsApp (js/ui/compartir.js) — firmado: Hark
- M11 videos: 3 imágenes iniciales 9:16 en estilo 16-bit (docs/videos/intro.png, entrega.png, final.png) con prompts de image-to-video en inglés y español (docs/videos/prompts.md); js/ui/video.js reproduce assets/video/*.mp4 (muted, playsinline, «Saltar») antes del prólogo, tras la primera entrega en Marte y antes del Final, y los omite sin error si no existen; PLAN.md (M11) y AGENTS.md actualizados — firmado: Hark

## [0.2.0] - 2026-10-07

### Added
- M0–M2: plan, historia, esqueleto de pantallas, guardado local, audio chiptune y simulador del Acto 1 (sin aire). — firmado: Jhonatan J. Martínez Brooks
- Licencia MIT, mood board y workflow de publicación `publicar.yml`. — firmado: Jhonatan J. Martínez Brooks

## M12.1 — Pasada de diseño Impeccable (2026-10-09)
- DESIGN.md: sistema visual documentado (paleta con significado, tipografía, ventanas SNES, componente escena).
- Avisos de logro en cola (uno a la vez) y elevados sobre SOLTAR en los simuladores.
- Examen: vuelven los colores de correcta/incorrecta (especificidad) y se añaden ✓/✗.
- Íconos pixel 12×12 (js/gfx/iconos.js) en lugar de glifos Unicode en el menú y Logros; candado para lo bloqueado.
- Contraste: texto secundario #b9c2e6 dentro de ventanas; bloqueados legibles (sin opacity sobre el texto).
- Objetivos táctiles de 44 px en pestañas y predicción.
- Predicción honesta: con predicción elegida Ep se oculta hasta soltar; en Impacto la fuerza se revela al impactar.
- Ahorro de datos: la música por sección ya no se precarga (≈10 MB menos al instalar); se guarda en caché al sonar.
- Sin easing de rebote ni halo de brillo; menú sin rótulos sobre títulos; selección/scrollbar/caret con la paleta.
- Arreglo: la vista previa oculta de Logros ya no aparece como imagen rota.

## M12.2 — «Resistencia» en lugar de «Límite G» como unidad (2026-10-09)
- El nombre de la app se conserva. Dentro del juego, la energía máxima que aguanta un paquete se llama ahora **resistencia** (en J): lecturas, Códice, historia, misiones, examen y documentación.
