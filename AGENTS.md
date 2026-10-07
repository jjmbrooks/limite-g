# AGENTS.md — Guía para agentes de IA (y humanos) que retoman Límite G

## Cómo retomar (léelo primero)
1. Abre [PLAN.md](PLAN.md) y busca el **primer módulo con `[ ]` o `[~]`**. Ese es el siguiente trabajo.
2. Lee la [historia completa](docs/historia.md) y mira el mood board `docs/mood-pixel.jpg` antes de tocar textos o arte.
3. Corre `bash scripts/qa.sh`: debe terminar en ✅ antes de empezar y antes de cada commit.
4. Al cerrar un módulo: márcalo `[x]` en PLAN.md, añade una línea en la Bitácora, entrada en [CHANGELOG.md](CHANGELOG.md) y commit `Mx: ...` (ver «Firma»).
5. Si un módulo no cabe en tu sesión: deja el código estable (nunca un commit roto), márcalo `[~]` y escribe en PLAN.md qué falta.

## Propósito y público
Juego web educativo en pixel art para **Física de nivel medio superior (preparatoria) en México**, materia «Del Átomo al Universo. Fuerza y energía».
Enseña **Ep = m·g·h**, **Ec = ½·m·v²**, conservación de la energía y **caída libre** (después: arrastre, velocidad terminal, impacto F·d = Ec).
Lo usan estudiantes de 15–18 años desde su **celular** (muchos con datos limitados) y el profesor en clase. Todo el texto va en **español de México**.

## Decisiones tomadas (no las cambies sin hablar con el autor)
- **Física progresiva por actos**: Acto 1 sin aire (Luna, Marte, Tierra ideal, Júpiter); Acto 2 con aire (Tierra, Venus, Titán); Acto 3 impacto (Europa, Ío); Final en Estación Entropía. Cada acto añade un concepto; no adelantes fórmulas. Rangos: Cadete → Piloto (examen 1) → Capitana (examen 2) → Comandante (examen 3).
- **Sin servidor ni cuentas**: progreso en `localStorage` (clave versionada `limiteg.v1`, módulo `js/state.js`). Firebase queda como «Futuro».
- **Pixel art**: sprites definidos como matrices de texto + paleta en JS, renderizados a `<canvas>` con `image-rendering: pixelated`. Paleta del mood board: azul noche, teal, naranja, magenta, crema.
- **Mobile first**: diseño para 360 px; controles táctiles ≥ 44 px; audio solo tras la primera interacción; respetar `prefers-reduced-motion`.
- **Sin compilación**: HTML + CSS + JavaScript con módulos ES nativos. Nada de npm en tiempo de ejecución, nada de frameworks.
- **Estructura modular obligatoria**: un archivo por pantalla, por dato y por sistema. **Nunca** empaquetes el juego en un solo `index.html` (ya se intentó con un build.sh y se descartó).
- **Licencias**: código bajo **MIT** ([LICENSE](LICENSE)); arte, historia y textos bajo **CC BY 4.0** ([LICENSE-ARTE.md](LICENSE-ARTE.md)). Crédito: Jhonatan Jesús Martínez Brooks.

## Arquitectura
```
index.html               punto de entrada único (carga css/style.css y js/main.js)
manifest.webmanifest     PWA: nombre, colores e íconos (assets/iconos/, generados con scripts/iconos.py)
sw.js                    service worker: caché versionada (VERSION) y precarga de TODOS los archivos de runtime
css/style.css            tema pixel art, componentes y reglas de accesibilidad
js/main.js               router por hash (#pantalla/argumento, p. ej. #simulador/m2), HUD, fondo y arranque de audio
js/nav.js                go(ruta): navegación con sonido (evita imports circulares)
js/progress.js           progresión de la historia de todos los actos (isDone / isUnlocked / missionRoute / rangos)
js/state.js              guardado local (get/set/addScore), emite el evento 'state'
js/audio.js              música chiptune y efectos con WebAudio (sin archivos)
js/physics.js            fórmulas puras (Ep, Ec, v, t), caída con aire (createFall/simulateFall, paso fijo) e impacto (impact: F·d = Ec)
js/gfx/                  arte pixel: palette.js (paleta única), sprites.js (matrices de texto),
                         pixel.js (render a canvas + planetas generados), scenery.js (escenarios), starfield.js (fondo)
js/data/                 datos puros, sin DOM (planetas, paquetes, …) → se validan en tests/
js/ui/                   piezas de interfaz reutilizables (anims.js, anims-aire.js y anims-impacto.js del Códice, speakers.js retratos,
                         dialogo.js máquina de escribir, grafica.js gráfica v(t) pixel, toast.js avisos de logros,
                         tarjeta.js tarjeta PNG de logros + Web Share / descarga / wa.me)
js/screens/              una pantalla por archivo: export default (el, arg) => cleanup?
                         (simulador = Acto 1 sin aire, aire = Acto 2, impacto = Acto 3, logros = vitrina;
                         codice/N y examen/N abren el acto N; las misiones del Final reutilizan las tres pantallas)
assets/                  iconos/ (PWA), fuentes/ (Press Start 2P y VT323, OFL; sin Google Fonts) y lo que se agregue
docs/                    historia, mood board, QA manual, copia de workflows
scripts/qa.sh            control de calidad; scripts/qa/*.mjs son sus pasos
scripts/hark-commit.sh   commit firmado por Hark + línea de CHANGELOG
tests/*.test.mjs         pruebas node:test (física y datos)
.github/workflows/       publicar.yml (Pages) y calidad.yml (QA) — se crean/editan a mano en GitHub
```
Datos de contenido: `js/data/codice.js` (tarjetas por acto, registro `CODICE`), `js/data/preguntas*.js` (bancos) + `js/data/examenes.js` (registro `EXAMENES`: banco, aprobación, rango, clave de guardado), `js/data/historia*.js` (guion, misiones y mapa de cada acto; historia4.js = Final) unidos en `js/data/actos.js` (`ACTS`, `ALL_MISSIONS`, `MODE_ROUTE`: qué pantalla juega cada `mode` de misión), `js/data/paracaidas.js` (Acto 2) y `js/data/impacto.js` (suelos y fundas, Acto 3), `js/data/logros.js` (condiciones puras; `main.js` las revisa en cada evento 'state' y guarda `state.logros`).
Para añadir un acto: `historiaN.js` + entrada en `ACTS`, tarjetas en `CODICE`, banco en `EXAMENES`, pantalla si hay mecánica nueva (y su `mode` en `MODE_ROUTE`), pruebas en `tests/`.

Reglas de módulos: `js/physics.js` y `js/data/*` no tocan el DOM (se prueban en Node). Las pantallas reciben un `<section>` y devuelven opcionalmente una función de limpieza (cancelar `requestAnimationFrame`, timers, audio).

## Correr en local y QA
```bash
python3 -m http.server 8000      # abrir http://localhost:8000
bash scripts/qa.sh               # sintaxis, imports, HTML, limpieza, pruebas, humo HTTP
node --test tests/*.test.mjs     # solo pruebas
```
Revisión manual: [docs/QA.md](docs/QA.md). Si hay Playwright + Chromium, `qa.sh` también carga cada pantalla, instala el service worker, abre el juego sin red, genera la tarjeta de logros y falla con errores de consola (exporta `PLAYWRIGHT_DIR`; en este entorno la prueba de navegador tarda ~2 min).

## PWA offline (service worker)
- `sw.js` precarga la lista `PRECACHE` (rutas relativas: funciona en `/` y bajo `/limite-g/`) y responde desde la caché.
- **Archivo de runtime nuevo** (en `js/`, `css/`, `assets/`): corre `node scripts/qa/sw-precache.mjs --fix`; `qa.sh` falla si falta o sobra alguno.
- **Al publicar cualquier cambio sube `VERSION` en `sw.js`** (p. ej. `'m10-1'` → `'m10-2'` o `'m11-1'`). Sin eso los teléfonos que ya instalaron el juego siguen con la caché vieja. El SW nuevo borra las cachés `limiteg-*` anteriores y el juego avisa «Nueva versión lista».
- Íconos: `python3 scripts/iconos.py` (Pillow) los regenera desde el sprite NOVA.

## Publicación
0. Sube `VERSION` en `sw.js` (ver arriba) y corre `bash scripts/qa.sh`.
1. En local: `git ls-files | grep -v '^.github/' | zip release.zip -@` (release.zip está en `.gitignore`).
2. El autor sube `release.zip` a la raíz del repo desde la web de GitHub (*Add file → Upload files*).
3. El workflow `publicar.yml` lo desempaqueta conservando carpetas, hace commit y despliega GitHub Pages en **https://jjmbrooks.github.io/limite-g/**.
4. **Nunca incluyas `.github/` en el zip.** Los workflows se crean o editan a mano en GitHub; sus copias de referencia viven en `docs/workflows/`.
Los agentes no hacen push ni tocan GitHub: trabajan en local y entregan el zip.

## Firma
- Identidad local de git en este repo: `Hark <hark@hark.ai>` (nunca la global ni la del usuario).
- Commits con trailers `Signed-off-by: Hark <hark@hark.ai>` y `Co-authored-by: Hark <hark@hark.ai>`: usa `scripts/hark-commit.sh "Mx: ..." [Added|Changed|Fixed] ["texto CHANGELOG"]`.
- Entradas de CHANGELOG terminan con «— firmado: Hark». Archivos JS nuevos empiezan con
  `// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)`.
- Detalles en [CONTRIBUTING.md](CONTRIBUTING.md).
