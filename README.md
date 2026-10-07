# Límite G

Juego web en pixel art para aprender **energía potencial, energía cinética y caída libre** (Física, nivel preparatoria).
Nova, mensajera de la Red Postal Interplanetaria, debe entregar paquetes frágiles por caída en distintos planetas sin rebasar su **Límite G**, mientras el Dr. Caos sabotea sus rutas.

- Juega: https://jjmbrooks.github.io/limite-g/
- Plan y punto de retoma: [PLAN.md](PLAN.md)
- Historia: [docs/historia.md](docs/historia.md)
- ¿Eres un agente de IA o vas a retomar el desarrollo? Lee [AGENTS.md](AGENTS.md) (cómo retomar: primer `[ ]` de PLAN.md).
- Convenciones de commits y firma: [CONTRIBUTING.md](CONTRIBUTING.md) · Cambios: [CHANGELOG.md](CHANGELOG.md)

Sin compilación: HTML, CSS y JavaScript con módulos ES. Para probar en local: `python3 -m http.server` y abrir `http://localhost:8000`.

**Funciona sin internet (PWA):** tras la primera visita se puede jugar sin datos y se puede instalar en el celular («Agregar a pantalla principal»). En `#logros` cada alumno genera una tarjeta pixel con sus insignias y la comparte por WhatsApp.
**Al publicar una versión nueva** sube `VERSION` en `sw.js` (p. ej. `m10-1` → `m10-2`) para que los teléfonos descarguen los cambios; si agregas archivos, `node scripts/qa/sw-precache.mjs --fix`. Detalles en [AGENTS.md](AGENTS.md).

## Licencia
- Código: licencia MIT ([LICENSE](LICENSE)). Úsalo y modifícalo libremente dando crédito a Jhonatan Jesús Martínez Brooks.
- Arte pixel, historia y textos: CC BY 4.0 ([LICENSE-ARTE.md](LICENSE-ARTE.md)).
- Fuentes Press Start 2P y VT323: SIL Open Font License 1.1 (textos en `assets/fuentes/`).

## Estructura
```
index.html            punto de entrada
manifest.webmanifest  PWA (íconos en assets/iconos/)
sw.js                 service worker: juego offline (sube VERSION al publicar)
css/style.css         tema pixel art
js/main.js            navegación entre pantallas (router por hash)
js/progress.js        progresión de la historia
js/state.js           guardado local (localStorage)
js/audio.js           música chiptune y efectos (WebAudio)
js/physics.js         fórmulas: Ep, Ec, caída libre
js/gfx/               arte pixel (paleta, sprites, planetas, escenarios, fondo estrellado)
js/ui/                diálogos, retratos y mini-animaciones
js/data/              planetas, paquetes, Códice, preguntas e historia
js/screens/           menú, historia/mapa, simulador, códice, examen
assets/sprites/       personajes y objetos (pixel art)
assets/fondos/        fondos de planetas
assets/audio/         música y efectos (si se agregan archivos)
docs/                 historia y mood board
scripts/qa.sh         control de calidad local (también lo corre GitHub Actions)
tests/                pruebas unitarias de física y datos (node:test)
.github/workflows/    publicación automática en GitHub Pages y control de calidad
```

## Publicación
Subir un `release.zip` a la raíz del repo: la acción "Publicar Límite G" lo desempaqueta conservando carpetas y publica en Pages.

**Importante:** el `release.zip` nunca incluye la carpeta `.github/` (genéralo con `git ls-files | grep -v '^.github/' | zip release.zip -@`).

## Control de calidad
- Local: `bash scripts/qa.sh` (Node 22 y python3). Revisa sintaxis, imports, referencias de `index.html`, `console.log`/TODO olvidados, pruebas de física y datos, y un humo por HTTP.
- Revisión manual antes de publicar: [docs/QA.md](docs/QA.md).
- En GitHub: el workflow **Calidad Límite G** corre `qa.sh` en cada push y pull request. Como `release.zip` no lleva `.github/`, **créalo a mano una sola vez**: en el repo, *Add file → Create new file*, nombre `.github/workflows/calidad.yml`, y pega el contenido de [docs/workflows/calidad.yml](docs/workflows/calidad.yml).
