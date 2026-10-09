# Límite G — Checklist manual de QA

Corre primero `bash scripts/qa.sh` (debe terminar en ✅ QA OK). Después, revisa a mano en un teléfono real
o en las herramientas de desarrollador del navegador (modo dispositivo). Marca cada casilla.

## 1. Móvil (360 px de ancho)
- [ ] A 360×740 nada se desborda horizontalmente (no aparece scroll lateral).
- [ ] El HUD (◀, título, ★, ♪) cabe en una línea.
- [ ] Botones, chips y slider se tocan con el pulgar sin errores; el escenario del simulador se ve completo.
- [ ] Girar el teléfono a horizontal no rompe la pantalla.
- [ ] Tarjetas del Códice se deslizan con el dedo y con los botones ◀ ▶.

## 2. Audio
- [ ] No suena nada antes del primer toque (regla de navegadores móviles).
- [ ] Tras el primer toque arranca la música; los efectos suenan al tocar botones, soltar e impactar.
- [ ] El botón ♪ silencia y reactiva; la preferencia se recuerda al recargar.

## 3. Guardado local (localStorage, clave `limiteg.v1`)
- [ ] ★, rango, misiones superadas, tarjetas vistas y mejor examen persisten al recargar.
- [ ] En modo incógnito / con almacenamiento bloqueado el juego no se cae (solo no guarda).
- [ ] Borrar los datos del sitio regresa al estado inicial (Cadete, 0 ★, intro sin ver).
- [ ] Al cumplir un logro aparece el aviso «¡Logro desbloqueado!» una sola vez y queda en `#logros` al recargar.

## 4. Física coherente
- [ ] Simulador: Ep + Ec se mantiene constante durante la caída (las barras suman 100 %).
- [ ] Con h = 10 m en la Tierra: t ≈ 1.43 s y v ≈ 14.01 m/s; en la Luna: t ≈ 3.51 s y v ≈ 5.69 m/s.
- [ ] El veredicto coincide con Ep = m·g·h comparada con la resistencia del paquete.
- [ ] Las preguntas de cálculo del examen dan la respuesta correcta con las fórmulas del Códice.
- [ ] Las misiones de altura exacta se pueden resolver con lápiz y papel (h = E / (m·g)).
- [ ] Acto 2 (`#aire`): Ep + Ec + Aire suman la Ep inicial; la velocidad se aplana en la vt mostrada (celular en la Tierra ≈ 17.9 m/s).
- [ ] Acto 3 (`#impacto`): F = Ec / d; en concreto y sin funda el veredicto coincide con el del Acto 1 (Ep ≤ resistencia); más grosor o suelo más blando bajan F, pero la funda suma masa (Ec sube).
- [ ] Acto 2: abrir el paracaídas (automático o con ☂ ABRIR) baja la curva de v(t) a la nueva vt; la línea punteada «sin aire» llega a √(2gh).

## 5. Textos en español
- [ ] Sin faltas de ortografía; acentos correctos (energía, cinética, límite, gravitacional, órbita, cápsula…).
- [ ] Decimales con punto, como se usa en México (es-MX), y unidades con espacio: 9.81 m/s², 3 J.
- [ ] Tono consistente: GAL-1 explica, Nova anima, Dr. Caos provoca.

## 6. Accesibilidad básica
- [ ] Contraste: texto claro sobre fondo azul noche (≥ 4.5:1 en texto normal); el texto gris (`--dim`) solo para notas.
- [ ] Todo lo tocable mide al menos 44 × 44 px.
- [ ] Con «Reducir movimiento» activado (prefers-reduced-motion) no hay parpadeos, glitch animado ni estrellas en movimiento; la máquina de escribir muestra el texto completo de inmediato.
- [ ] Los botones solo con icono tienen `aria-label`.
- [ ] Se puede jugar con teclado en computadora (Tab, Enter, flechas en el Códice).
- [ ] Ningún dato depende solo del color (el veredicto también se escribe con texto).

## PWA y compartir (M10)
- [ ] Tras abrir el juego con internet, en modo avión recarga: el juego abre y se puede jugar (fuentes pixel incluidas).
- [ ] Android: menú ⋮ → «Instalar app» / «Agregar a pantalla principal» muestra el ícono de Nova; iOS: Compartir → «Agregar a inicio».
- [ ] Tras publicar con `VERSION` nueva en `sw.js`, al volver a abrir aparece «Nueva versión lista» y al recargar se ven los cambios.
- [ ] `#logros` → «Compartir tarjeta»: en el celular abre el menú de compartir con la imagen (WhatsApp la adjunta); en computadora se descarga `limite-g-logros.png` y aparece el enlace de WhatsApp.
- [ ] La tarjeta muestra nombre (si se escribió), rango, ★, insignias desbloqueadas y la URL del juego.
