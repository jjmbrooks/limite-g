# Prompts de música (Suno v6) — Límite G

Prompts con los que se generó la banda sonora en Suno v6 (2026-10-07/08), por Jhonatan J. Martínez Brooks con prompts de Hark.
Si en Suno se ajustó algún prompt, la versión final manda; actualiza esta página.

## Pista en el juego ← prompt
| Archivo | Título en Suno | Prompt | Dónde suena |
|---|---|---|---|
| `assets/audio/tema.m4a` | Galactic Quest | 1 Tema principal | Menú y Logros |
| `assets/audio/bitacora.m4a` | Starship Interior | 2 Bitácora | Historia y Códice |
| `assets/audio/acto1.m4a` | Curious Lab Loop | 3 Caída libre | Simulador / Acto 1 |
| `assets/audio/acto2.m4a` | Skyward Flight | 4 Aire | Aire / Acto 2 |
| `assets/audio/acto3.m4a` | Crash Test Loop | 5 Impacto | Impacto / Acto 3 |
| `assets/audio/examen.m4a` | Puzzle Path | 6 Examen | Exámenes |
| `assets/audio/caos.m4a` | Sly Sneaky Motif | 7 Dr. Caos | Diálogos de Dr. Caos |
| `assets/audio/final.m4a` | Final Boss Battle | 8 Estación Entropía | Misiones f1–f3 |
| `assets/audio/creditos.m4a` | Victory Theme | 9 Créditos | Pantalla de créditos |

En el juego, los jingles J1–J3 se sustituyeron por los de Kenney (CC0), ver `README.md`; sus prompts quedan como referencia.

## Reglas usadas
- Estilo en 2–3 frases: género primero, BPM y el papel de cada instrumento. Sin nombres de artistas, juegos ni marcas.
- Lo que no se quiere va en **Exclude Styles**. Variety 0, Duration Custom.
- Continuidad: Cover/Remix del Tema principal con el prompt de cada pista.
- Exportar loops de 60–90 s, recortados al compás; en el repo van como M4A AAC 64 kbps (`ffmpeg -vn -c:a aac -b:a 64k -movflags +faststart`).

## Prompts

```text
Ajustes para todas: Variety 0 · Duration Custom · Letra: [Instrumental | loop, same energy]
Exclude Styles base: vocals, singing, lyrics, fade out, long intro, modern trap drums

1 TEMA PRINCIPAL (1:30)
16-bit 1990s console video game soundtrack, heroic space adventure, 132 BPM. A bright sampled-trumpet lead states a memorable, singable main theme, slap bass drives underneath, fast square-wave arpeggios sparkle, punchy gated drums. Instrumental. Confident and adventurous, built to loop seamlessly with no intro and no outro. Crisp, warm sound-chip mix.

2 BITÁCORA — mapa y diálogos (1:30)
16-bit 1990s console RPG soundtrack, calm starship interior, 92 BPM. Soft electric piano plays the main theme slowly, warm synth pads hold long chords, a gentle bass pulses, light shaker only. Instrumental. Relaxed and even, sits quietly under dialogue, seamless loop, no build-ups. Soft, spacious mix.

3 CAÍDA LIBRE — Acto 1 (1:15)
16-bit 1990s console puzzle-adventure music, playful science lab, 112 BPM. Bouncy marimba and pizzicato strings trade a curious melody, a plucky bass hops on the offbeat, light snare with handclaps. Instrumental. Curious and light-hearted, consistent energy, seamless loop. Bright, clean sound-chip mix.

4 AIRE — Acto 2 (1:15)
16-bit 1990s console flying-stage music, gliding through a windy sky, 104 BPM. A sampled flute carries a flowing version of the main theme, airy synth pads and harp arpeggios rise and fall, a soft steady drum groove. Instrumental. Floaty and hopeful, consistent energy, seamless loop. Wide, breezy mix.

5 IMPACTO — Acto 3 (1:15)
16-bit 1990s console action-stage music, tense crash-test lab, 124 BPM. Punchy orchestra hits and tight snare rolls drive the rhythm, a gritty synth bass pulses in eighth notes, a short metallic brass motif repeats. Instrumental. Focused tension without climax, consistent energy, seamless loop. Punchy, dry mix.

6 EXAMEN (1:15)
16-bit 1990s console quiz and puzzle music, concentration, 100 BPM. A ticking hi-hat and woodblock keep time, a soft music-box melody repeats, a low synth pad and patient bass leave lots of space. Instrumental. Calm focus with light suspense, no big changes, seamless loop. Minimal, clean mix.

7 DR. CAOS (1:00)
16-bit 1990s console villain theme, mischievous mad scientist, 96 BPM. A sneaky bassoon and pizzicato strings play a minor-key comic-menacing motif, a pipe organ stabs on the downbeat, a swung drum groove with spooky bell accents. Instrumental. Sly and theatrical, consistent energy, seamless loop. Dark, playful mix.
Exclude extra: horror, screams

8 ESTACIÓN ENTROPÍA — jefe final (1:30)
16-bit 1990s console final boss battle music, space station showdown, 150 BPM. Driving distorted synth bass and fast double-time drums, sampled strings play urgent ostinatos, brass blasts the main theme in a heroic minor key, a pipe organ adds menace. Instrumental. Epic and urgent, constant intensity, seamless loop. Loud, dense, punchy mix.

9 CRÉDITOS (2:00)
16-bit 1990s console ending credits music, victorious and nostalgic, 108 BPM. Sampled strings and trumpet play the main theme fully and warmly, gentle drums and slap bass, sparkling bell arpeggios. Instrumental. Starts tender, grows to a proud finale and ends on a clean final chord. Warm, wide mix.

J1 VICTORIA (0:05)
16-bit 1990s console stage-clear fanfare. Bright trumpets and a snare roll play a short triumphant phrase based on the main theme, ending on a held major chord. Instrumental. Ends cleanly, no fade.

J2 LOGRO (0:04)
16-bit 1990s console item-get jingle. Sparkling bell and square-wave arpeggio rising quickly, finishing with a bright chime. Instrumental. Ends cleanly, no fade.

J3 SE ROMPE (0:04)
16-bit 1990s console comic failure jingle. A descending trombone wah-wah phrase over a goofy tuba, finished with a small cymbal crash. Instrumental. Funny, not sad. Ends cleanly, no fade.
```
