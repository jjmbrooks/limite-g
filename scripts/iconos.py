#!/usr/bin/env python3
# Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
# Genera los íconos PWA pixel art (assets/iconos/icon-192.png, icon-512.png y maskable-512.png)
# a partir del retrato NOVA de js/gfx/sprites.js y la paleta de js/gfx/palette.js. Requiere Pillow.
# Uso: python3 scripts/iconos.py
import re, pathlib
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
pal_src = (ROOT / 'js/gfx/palette.js').read_text(encoding='utf-8')
PAL = dict(re.findall(r"\b([A-Za-z]):\s*'(#[0-9a-fA-F]{6})'", pal_src))
spr_src = (ROOT / 'js/gfx/sprites.js').read_text(encoding='utf-8')
nova = re.search(r"export const NOVA = \[(.*?)\];", spr_src, re.S).group(1)
ROWS = re.findall(r"'([^']+)'", nova)

def hexrgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (255,)

def icono(n, margen):
    # Lienzo de 24×24 «pixeles de juego»: fondo azul noche, marco teal, estrellas y Nova al centro.
    g = 24
    img = Image.new('RGBA', (g, g), hexrgb('#0b1026'))
    px = img.load()
    if margen == 0:
        for i in range(g):
            for j in (0, g - 1):
                px[i, j] = px[j, i] = hexrgb(PAL['t'])
    for (x, y) in [(3, 3), (20, 4), (5, 19), (19, 20), (2, 11)]:
        px[x, y] = hexrgb(PAL['c'])
    ox, oy = 4, 5
    for j, r in enumerate(ROWS):
        for i, ch in enumerate(r):
            if ch in PAL and 0 <= oy + j < g:
                px[ox + i, oy + j] = hexrgb(PAL[ch])
    if margen:  # maskable: zona segura del 80 %, se reduce y centra
        inner = img.resize((int(n * 0.8),) * 2, Image.NEAREST)
        out = Image.new('RGBA', (n, n), hexrgb('#0b1026'))
        out.paste(inner, ((n - inner.width) // 2,) * 2)
        return out
    return img.resize((n, n), Image.NEAREST)

dest = ROOT / 'assets/iconos'
dest.mkdir(parents=True, exist_ok=True)
icono(192, 0).save(dest / 'icon-192.png', optimize=True)
icono(512, 0).save(dest / 'icon-512.png', optimize=True)
icono(512, 1).save(dest / 'maskable-512.png', optimize=True)
print('✓ íconos en', dest.relative_to(ROOT))
