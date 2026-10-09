# Análisis de interfaz y de pedagogía — Límite G (M12, 2026-10-08)

Revisión hecha por Hark sobre la versión m11-5 a partir de la retroalimentación del docente
(«la app no es muy intuitiva, el menú principal necesita un rediseño»). Cada hallazgo indica si se resolvió en M12.

## 1. Análisis como experto en interfaces (UX/UI)

| # | Hallazgo | Por qué importa | Cambio |
|---|---|---|---|
| U1 | El menú mostraba 5 botones con el mismo peso y dos citas largas. No había una acción principal. | En el celular el alumno no sabe qué tocar primero (ley de Hick: más opciones iguales = más indecisión). | ✅ Menú nuevo: una tarjeta **CONTINUAR** con el siguiente paso real de la historia (icono, título, objetivo y avance del acto). |
| U2 | El «siguiente objetivo» solo aparecía dentro del mapa. | El estado del sistema debe estar visible donde se toma la decisión. | ✅ La tarjeta del menú usa la misma lógica que el mapa (`nextStep()` en `progress.js`). |
| U3 | Accesos secundarios (Simulador, Códice, Examen, Logros) sin estado. | Sin estado no se sabe si vale la pena entrar. | ✅ Mosaico 2×2 con estado: fragmentos leídos, mejor calificación o «Aprobado ✓», insignias. |
| U4 | Botón ◀ visible en el menú, donde no hace nada. | Controles inertes confunden. | ✅ Se oculta en el menú; su etiqueta accesible es «Volver al menú». |
| U5 | Tras SOLTAR la nave no se podía volver a mover; a veces la segunda caída no se veía. | Bloquea el ciclo de juego principal. | ✅ Tocar o arrastrar la escena tras el impacto rearma la nave (aviso «⇕ arrastra para otro lanzamiento»); la cámara encuadra desde la nave en cada caída. |
| U6 | En Impacto la escena se desplazaba por dentro al soltar (ocultaba lecturas y dejaba media pantalla negra). | Pantalla «rota». | ✅ La escena ya no puede desplazarse internamente. |
| U7 | Al subir mucho, el fondo repetía franjas de textura. | Se veía como error gráfico. | ✅ Los huecos del paralaje se rellenan con el color y un degradado del horizonte. |
| U8 | Texto pequeño en Press Start 2P (8–10 px) en muchas etiquetas. | Legibilidad en pantallas de 360 px. | Parcial: el menú usa VT323 para textos largos. Pendiente revisar mapa y Códice. |
| U9 | Aviso de logro tapa botones del menú. | Bloquea toques. | Pendiente: moverlo arriba o hacerlo más bajo. |

## 2. Análisis como experto en pedagogía (Física, nivel medio superior)

| # | Hallazgo | Fundamento | Cambio |
|---|---|---|---|
| P1 | El alumno no veía qué iba a aprender ni en qué orden. | Hacer explícitos los objetivos de aprendizaje mejora la autorregulación. | ✅ «Tu ruta de aprendizaje» en el menú: cada acto con su física (Ep y Ec, arrastre, F·d = Ec, final). |
| P2 | En el laboratorio se soltaba sin pensar antes. | Ciclo **Predecir–Observar–Explicar** (POE): predecir activa ideas previas y hace visible el error conceptual. | ✅ Predicción opcional «Aguanta / Se rompe» antes de soltar, con retroalimentación y racha de aciertos. |
| P3 | El resultado decía «CRASH 3.9 J > 3 J» sin mostrar de dónde salía el número. | Unir representación visual y simbólica (ejemplo resuelto con los datos del propio intento). | ✅ Tras cada caída sin aire: `Ep = m·g·h = …` y `v = √(2·g·h) = …` con los números de ese lanzamiento (también en misiones). |
| P4 | El error en misión solo decía «muy bajo» o «crash». | La retroalimentación debe indicar cómo corregir. | Parcial: el cálculo mostrado permite ver qué variable ajustar. Pendiente: pista graduada tras 2 fallos. |
| P5 | Sin vista para el docente. | El docente necesita evidencia del avance. | Pendiente (requiere decidir si se exporta un resumen o se usa Firebase). |
| P6 | Exámenes sin repaso dirigido del error. | Retroalimentación elaborada. | Pendiente: enlazar cada pregunta fallada con su tarjeta del Códice. |

## Pendientes propuestos para M13
U8, U9, P4, P5, P6 y la prueba en teléfonos reales del arrastre de altura.
