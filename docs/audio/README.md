# Estrategia de audio — Límite G (Suno v6)
Implementada (prompts usados en `prompts-suno.md`). Plan original: 10 pistas (tema, mapa, acto1, acto2, acto3, examen, dr-caos, final-jefe, creditos) + 3 jingles (victoria, logro, se-rompe).
Formato: loops 60–90 s recortados a compás, M4A/AAC ~96 kbps mono-compatible, en assets/audio/. Carga diferida (no precache), crossfade 600 ms, música se atenúa en diálogos/videos. Volumen música y efectos por separado.
Reglas Suno v6: estilo en 2–3 frases (género primero, BPM, rol de cada instrumento), "instrumental" + Exclude Styles (vocals...), Variety 0, Duration Custom, sin nombres de artistas/marcas; generar primero el tema y reutilizar su melodía con Cover/Remix para las demás.

## Créditos y jingles (2026-10-08)
- `assets/audio/creditos.m4a` — «Victory Theme» (Suno, de Jhonatan): pantalla `#creditos` (botón ♪ Créditos en Logros).
- `assets/audio/sfx/victoria.m4a` (jingles_NES12), `logro.m4a` (jingles_NES14), `rompe.m4a` (jingles_NES11): «Music Jingles» de Kenney (https://kenney.nl/assets/music-jingles), licencia **CC0 1.0** (dominio público; atribución opcional, se da en Créditos). Licencia original en `assets/audio/sfx/LICENCIA-Kenney-CC0.txt`.
- `sfx.win()` → victoria, `sfx.logro()` → logro, `sfx.crash()` → ruido + rompe. Si un jingle no carga, suena la versión sintetizada.
