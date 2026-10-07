# Límite G

Juego web en pixel art para aprender **energía potencial, energía cinética y caída libre** (Física, nivel preparatoria).
Nova, mensajera de la Red Postal Interplanetaria, debe entregar paquetes frágiles por caída en distintos planetas sin rebasar su **Límite G**, mientras el Dr. Caos sabotea sus rutas.

- Juega: https://jjmbrooks.github.io/limite-g/
- Plan y punto de retoma: [PLAN.md](PLAN.md)
- Historia: [docs/historia.md](docs/historia.md)

Sin compilación: HTML, CSS y JavaScript con módulos ES. Para probar en local: `python3 -m http.server` y abrir `http://localhost:8000`.

## Licencia
Código bajo licencia MIT: úsalo y modifícalo libremente dando crédito a Jhonatan Jesús Martínez Brooks.

## Estructura
```
index.html            punto de entrada
css/style.css         tema pixel art
js/main.js            navegación entre pantallas
js/state.js           guardado local (localStorage)
js/audio.js           música chiptune y efectos (WebAudio)
js/physics.js         fórmulas: Ep, Ec, caída libre
js/data/              planetas y paquetes
js/screens/           menú, simulador, códice, examen
assets/sprites/       personajes y objetos (pixel art)
assets/fondos/        fondos de planetas
assets/audio/         música y efectos (si se agregan archivos)
docs/                 historia y mood board
.github/workflows/    publicación automática en GitHub Pages
```

## Publicación
Subir un `release.zip` a la raíz del repo: la acción "Publicar Límite G" lo desempaqueta conservando carpetas y publica en Pages.
