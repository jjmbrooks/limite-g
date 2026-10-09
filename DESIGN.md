---
name: Límite G
description: Juego pixel art 16-bit para aprender energía potencial, cinética y caída libre (Física de prepa, México).
colors:
  noche: "#0b1026"
  panel: "#141b3d"
  ventana-alta: "#33449a"
  ventana-media: "#1d2766"
  ventana-baja: "#121a4a"
  marco: "#e9f0ff"
  marco-suave: "#8fa3ff"
  tinta: "#0a0d22"
  teal: "#2de2c8"
  naranja: "#ff8a1f"
  magenta: "#ff3fa4"
  amarillo: "#ffe66d"
  texto: "#e9f0ff"
  texto-tenue: "#8a93b8"
  rojo: "#ff4d4d"
typography:
  display:
    fontFamily: "'Press Start 2P', monospace"
    fontSize: "22px"
    lineHeight: 1.5
  titulo:
    fontFamily: "'Press Start 2P', monospace"
    fontSize: "13px"
    lineHeight: 1.5
  boton:
    fontFamily: "'Press Start 2P', monospace"
    fontSize: "12px"
  cuerpo:
    fontFamily: "'VT323', monospace"
    fontSize: "22px"
    lineHeight: 1.15
  nota:
    fontFamily: "'VT323', monospace"
    fontSize: "18px"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
components:
  button-primary:
    backgroundColor: "{colors.naranja}"
    textColor: "{colors.tinta}"
    typography: "{typography.boton}"
    rounded: "{rounded.lg}"
    padding: "16px 12px"
    height: "44px"
  button-ghost:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.texto}"
    rounded: "{rounded.lg}"
  chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.texto}"
    typography: "{typography.cuerpo}"
    height: "44px"
  ventana:
    backgroundColor: "{colors.ventana-media}"
    textColor: "{colors.texto}"
    rounded: "{rounded.lg}"
    padding: "14px"
---

# Design System: Límite G

## Overview

**Norte creativo (propuesta, por confirmar con el autor): «La consola del cartero espacial».** Todo se ve como un juego de Super Nintendo de los 90: escenarios pintados en pixel art, ventanas azules con marco claro doble, botones biselados que se hunden al tocarlos. La física se presenta como instrumentos de cabina (barras de energía, regla de altura, lecturas numéricas), nunca como una hoja de ejercicios.

Referencia obligatoria: `docs/mood-pixel.jpg`. Anti-referencias: interfaz plana tipo MS-DOS (ya descartada), plantillas genéricas de apps educativas (tarjetas blancas, degradados morados, íconos de línea).

Uso real: celular en mano (360–430 px), a menudo con datos limitados, en el salón o en casa; sesiones cortas.

## Colors

Paleta tomada del mood board. La noche (`noche`, `tinta`) es el fondo; el color vive en acentos con significado fijo.

### Primary
- **Naranja propulsor** (`naranja`): la acción principal (SOLTAR, CONTINUAR, COMENZAR). Una por pantalla.

### Secondary
- **Teal de cabina** (`teal`): Ep, información, lo completado, el Códice.

### Tertiary
- **Magenta Caos** (`magenta`): todo lo que pertenece a Dr. Caos (sabotajes, diálogos, datos borrados).
- **Amarillo marcador** (`amarillo`): lo seleccionado, el siguiente paso, valores importantes, estrellas.

### Neutral
- `texto` sobre ventanas; `texto-tenue` para notas (contraste ≥ 4.5:1 sobre `panel`). Nunca gris puro ni negro puro.

### Named Rules
- **Un color, un significado.** Teal = energía potencial / conocimiento; naranja = energía cinética / acción; magenta = Caos; amarillo = foco. Las barras Ep/Ec respetan esto en todas las pantallas.

## Typography

- **Press Start 2P** (display): títulos, botones, rótulos cortos. Nunca en párrafos ni por debajo de 9 px.
- **VT323** (cuerpo): todo texto que se lee (diálogos, instrucciones, resultados, fórmulas). 18–22 px.

### Hierarchy
display 22 px → título 13 px → botón 12 px → cuerpo 22 px → nota 18 px. Fuentes autoalojadas en `assets/fuentes/` (sin Google Fonts).

## Layout

Mobile first a 360 px, columna única de máximo 520 px. Los simuladores ocupan toda la pantalla bajo el HUD (sin scroll): lecturas arriba, escena al centro, barra de acción abajo con SOLTAR ≥ 56 px. Controles táctiles ≥ 44 px.

## Elevation & Depth

Profundidad de consola 16-bit: marco claro + contorno de tinta + sombra desplazada dura (`0 5px 0 tinta` en botones, `5px 7px 0` en ventanas). En este mundo la sombra dura es legítima (es el lenguaje de los sprites); no se usan halos de color sin desplazamiento ni brillos difusos.

## Shapes

Esquinas de 4–8 px (ventanas SNES), píxeles nítidos con `image-rendering: pixelated`. Íconos dibujados en pixel art (matrices en `js/gfx/sprites.js` o PNG en `assets/sprites/`), no glifos Unicode.

## Components

### Buttons
Primario naranja biselado (se hunde 4 px al presionar); fantasma azul con marco teal; teal para teoría/Códice. Texto en Press Start 2P con verbo de acción.

### Chips
Selección de paquete y planeta: icono pixel + nombre + dato (`g = 9.81`). Seleccionado = borde y texto amarillos.

### Cards / Containers
«Ventana» SNES (`.panel`, `.result`, `.sheet`, `.scene`): degradado azul de 3 tonos, marco claro doble. Nunca ventanas dentro de ventanas.

### Inputs / Fields
Campo numérico con `inputmode="decimal"`, borde teal; estado de error con borde rojo y mensaje que dice cómo corregir.

### Navigation
HUD fijo: volver (oculto en el menú), título, estrellas, sonido. Router por hash.

### Escena de caída (componente firma)
`js/ui/escena.js`: cámara vertical con zoom continuo, paralaje, regla en metros, altura arrastrable, rearme tras el impacto.

## Do's and Don'ts

### Do:
- Mostrar la física como instrumento (barras, regla, lecturas) y el cálculo con los números del intento.
- Una sola acción principal visible por pantalla.
- Respetar `prefers-reduced-motion` y el audio solo tras la primera interacción.

### Don't:
- No usar rótulos pequeños sobre los títulos ni bordes laterales de color en tarjetas.
- No usar glifos o emoji como sistema de íconos en elementos nuevos.
- No usar easing de rebote ni halos de brillo.
- No reemplazar el pixel art por ilustración vectorial o fotos.
