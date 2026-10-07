# Límite G — Plan de desarrollo

Juego web mobile first (pixel art) para enseñar energía potencial, cinética y caída libre.
Stack: HTML + CSS + JavaScript (módulos ES), sin compilación. Se publica con GitHub Pages desde `main` (raíz).
Referencias: `docs/historia.md` (historia) y `docs/mood-pixel.jpg` (estilo visual).

## Cómo retomar
1. Lee este archivo y busca el primer módulo con `[ ]` o `[~]`.
2. Cada módulo es independiente y se cierra con un commit `Mx: ...`.
3. Al terminar un módulo, márcalo `[x]` y anota en "Bitácora".

## Módulos
- [x] M0 Repo, plan e historia
- [x] M1 Esqueleto: pantallas (menú, códice, examen, simulador), tema pixel, guardado local (localStorage), audio chiptune y efectos (WebAudio)
- [x] M2 Simulador Acto 1 (sin aire): objeto, altura y planeta; caída animada; barras Ep→Ec; velocidad y energía al impacto; ¿sobrevive o se rompe?
- [ ] M3 Assets pixel: Nova, Dr. Caos, nave Parábola, cápsula, planetas y fondos (basados en el mood board)
- [ ] M4 Códice Gravitacional Acto 1: tarjetas animadas (Ep, Ec, conservación, caída libre, g por planeta)
- [ ] M5 Examen de licencia Acto 1: quiz + "interferencias" de Dr. Caos; rango Cadete → Piloto
- [ ] M6 Historia: intro, diálogos Nova / GAL-1 / Dr. Caos, mapa de misiones y progresión
- [ ] M7 Acto 2 (con aire): arrastre, velocidad terminal, paracaídas; Tierra, Venus, Titán
- [ ] M8 Acto 3 (impacto): F·d = Ec, suelos y fundas; Europa e Ío
- [ ] M9 Final en Estación Entropía + logros
- [ ] M10 Logros compartibles como imagen (WhatsApp), PWA offline y pulido
- [ ] Futuro: autenticación y puntajes en Firebase

## Bitácora
- 2026-10-07: M0–M2 listos (simulador funcional con sprites dibujados por código; se reemplazan en M3).
