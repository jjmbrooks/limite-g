# Changelog

Todos los cambios notables de **Límite G** se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); las versiones siguen los módulos del [PLAN.md](PLAN.md).
Cada entrada escrita por Hark termina con "— firmado: Hark"; las de autores humanos, con su nombre.

## [Unreleased]

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

## [0.2.0] - 2026-10-07

### Added
- M0–M2: plan, historia, esqueleto de pantallas, guardado local, audio chiptune y simulador del Acto 1 (sin aire). — firmado: Jhonatan J. Martínez Brooks
- Licencia MIT, mood board y workflow de publicación `publicar.yml`. — firmado: Jhonatan J. Martínez Brooks
