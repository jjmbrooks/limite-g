# Límite G — Plan de desarrollo

Juego web mobile first (pixel art) para enseñar energía potencial, cinética y caída libre.
Stack: HTML + CSS + JavaScript (módulos ES), sin compilación. Se publica con GitHub Pages desde `main` (raíz).
Referencias: `docs/historia.md` (historia) y `docs/mood-pixel.jpg` (estilo visual).

## Cómo retomar
1. Lee [AGENTS.md](AGENTS.md) y este archivo; busca el primer módulo con `[ ]` o `[~]`.
2. Cada módulo es independiente y se cierra con un commit `Mx: ...`.
3. Al terminar un módulo, márcalo `[x]` y anota en "Bitácora".

## Módulos
- [x] M0 Repo, plan e historia
- [x] M1 Esqueleto: pantallas (menú, códice, examen, simulador), tema pixel, guardado local (localStorage), audio chiptune y efectos (WebAudio)
- [x] M2 Simulador Acto 1 (sin aire): objeto, altura y planeta; caída animada; barras Ep→Ec; velocidad y energía al impacto; ¿sobrevive o se rompe?
- [x] M3 Assets pixel: Nova, Dr. Caos, GAL-1, nave Parábola, cápsula, 5 paquetes, planetas y fondos (basados en el mood board)
- [x] M4 Códice Gravitacional Acto 1: tarjetas animadas (Ep, Ec, conservación, caída libre, g por planeta, altura segura)
- [x] M5 Examen de licencia Acto 1: quiz + "interferencias" de Dr. Caos; rango Cadete → Piloto
- [x] M6 Historia: intro, diálogos Nova / GAL-1 / Dr. Caos, mapa de misiones y progresión
- [x] M7 Acto 2 (con aire): arrastre, velocidad terminal, paracaídas; Tierra, Venus, Titán
- [x] M8 Acto 3 (impacto): F·d = Ec, suelos y fundas; Europa e Ío
- [x] M9 Final en Estación Entropía + logros
- [x] M10 Logros compartibles como imagen (WhatsApp), PWA offline y pulido
- [ ] Futuro: autenticación y puntajes en Firebase

## Pendientes después de M10 (ideas, no bloquean)
- El Final no tiene Códice ni Examen propios (el menú se queda en los del Acto 3). Podría añadirse un «Examen final» que mezcle los tres bancos.
- La «Í» mayúscula de Press Start 2P se ve casi como «í» (títulos «LÍMITE G», «PARACAÍDAS»): es el glifo de la fuente; si molesta, dibujar el logo como sprite.
- Íconos de insignias (★ ☂ ⚗ …) usan la fuente del sistema: podrían pasar a sprites pixel para que se vean igual en todos los teléfonos.
- Probar en teléfonos reales: instalar la PWA (Android «Agregar a pantalla principal», iOS Compartir → «Agregar a inicio») y compartir la tarjeta a WhatsApp.

## Bitácora
- 2026-10-07 (Hark): M10 listo. Tarjeta de logros compartible (`js/ui/tarjeta.js`): PNG 540×720 dibujado en canvas (Nova, nombre opcional del alumno guardado en `state.alumno`, rango, ★, 11 insignias, URL del juego); en `#logros` se comparte con Web Share API (archivo) o se descarga y se ofrece enlace `wa.me` con texto. PWA offline: `manifest.webmanifest`, íconos pixel generados con `scripts/iconos.py` (192, 512 y maskable), `sw.js` con caché versionada (`VERSION`) y precarga de todos los archivos de runtime con rutas relativas; registro en `main.js` y aviso de versión nueva. Fuentes Press Start 2P y VT323 alojadas en `assets/fuentes/` (OFL) en vez de Google Fonts. QA: `scripts/qa/sw-precache.mjs` (lista completa, `--fix` la regenera), validación del manifiesto, y la prueba de navegador instala el SW, abre `#logros` sin red y genera la tarjeta. Pulido a 360 px: avisos de logros agrupados cuando llegan más de dos a la vez y guiones en chips en vez de cortes de palabra.
- 2026-10-07 (Hark): M9 listo. Final en Estación Entropía (`js/data/historia4.js`, acto 4 del mapa): intro y tres tramos con el Núcleo de Comunicación (nuevo paquete 2 kg / 50 J), uno por mecánica y reutilizando sus pantallas: f1 sin aire con regla y g borradas, f2 en el domo presurizado (planeta `entropia-domo`, ρ 1.2) con tormenta, f3 de impacto con suelo cambiante; desenlace con Caos. Logros en `localStorage` (`js/data/logros.js`, 11 insignias puras y probadas; aviso `js/ui/toast.js` y vitrina `#logros`, enlazada desde el menú y desde el último nodo del mapa).
- 2026-10-07 (Hark): M8 listo. Física de impacto en `js/physics.js` (`impact`, `fMedia`, `fMax`, `caseMass`, `D_PAQUETE` = 2 mm: con concreto y sin funda reproduce el Límite G del Acto 1). Suelos (concreto, pasto, arena, colchón de espuma) y fundas (cartón, unicel, hule espuma, gel) en `js/data/impacto.js`; la funda suma masa ((lado + 2·grosor)³ − lado³). Europa e Ío (`act: 3`). Pantalla `#impacto` con zoom del frenado a escala, medidor F / F máx y desglose F = Ec / d. Códice Acto 3 (6 tarjetas, `js/ui/anims-impacto.js`), Examen de Comandante (13 preguntas, `#examen/3`; rango nuevo «Comandante»), misiones m9–m12 con estrellas por masa de funda (sabotaje: Caos cambia el suelo → diseño para el peor caso). Pruebas `tests/impacto.test.mjs` y validación de misiones por fuerza bruta.
- 2026-10-07 (Hark): M7 listo. Física con aire en `js/physics.js` (`createFall`/`simulateFall`: Euler semi-implícito con arrastre implícito, paso fijo 1/240 s, estable al abrir el paracaídas; `vTerminal`, `drag`). Planetas Tierra con aire (ρ 1.225), Venus (65) y Titán (5.3); Cd y A por paquete; paracaídas en `js/data/paracaidas.js`. Pantalla `#aire` con barras Ep/Ec/Aire, gráfica v(t) pixel (con aire vs sin aire, vt y v máx. segura), apertura automática o manual (☂ ABRIR) y avance rápido adaptativo. Códice Acto 2 (6 tarjetas), Examen de Capitana (14 preguntas, `#examen/2`), mapa con 4 misiones (m5–m8; sabotajes: densidad borrada y tormenta) e intro del acto; se desbloquea tras m4. Pruebas: `tests/aire.test.mjs` y validación de misiones por fuerza bruta.
- 2026-10-07 (Hark): firma, CHANGELOG, CONTRIBUTING, AGENTS.md y control de calidad (`scripts/qa.sh`, pruebas `node:test`, workflow calidad.yml en docs/workflows).
- 2026-10-07 (Hark): M3 listo. Sprites como matrices de texto + paleta única (`js/gfx/`), planetas generados en pixel art, escenarios con tramado por planeta y fondo estrellado con paralaje (respeta movimiento reducido). Integrados en menú y simulador.
- 2026-10-07 (Hark): M4 listo. Códice Acto 1 con 6 tarjetas deslizables (dedo, botones, teclado), mini-animaciones pixel (`js/ui/anims.js`), ejemplos resueltos plegables y voz de GAL-1 / Nova / Dr. Caos. Cada tarjeta nueva da +1 ★; al verlas todas invita al examen.
- 2026-10-07 (Hark): M5 listo. Banco de 20 preguntas (`js/data/preguntas.js`: 9 de cálculo generadas al azar con distractores de errores típicos + 11 de concepto). Examen de 8 (4+4), aprobar con 6 → Piloto (+5 ★). Interferencias de Caos: texto con glitch (botón «Limpiar señal») y reloj de 25 s. Récord e intentos en localStorage. Pruebas validan 300 variantes por pregunta.
- 2026-10-07 (Hark): M6 listo. Prólogo y diálogos con máquina de escribir (tocar = completar/avanzar, «Omitir», Esc; instantáneo con movimiento reducido). Mapa del Acto 1: Códice → m1 Luna → m2 Marte (regla borrada: se escribe la altura) → Examen → m3 Tierra ideal → m4 Júpiter (regla y g borradas) → Acto 2 (próximamente). Misiones de altura exacta en `#simulador/mX` con ventana de energía, 1–3 ★ y +5 ★ la primera vez. Audio bloqueado hasta la primera interacción.
- 2026-10-07: M0–M2 listos (simulador funcional con sprites dibujados por código; se reemplazan en M3).
