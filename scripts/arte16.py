# Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
# M11: post-proceso del arte 16-bit generado (imágenes grandes con fondo transparente o paisajes)
# → PNG pixel art pequeños con paleta limitada en assets/sprites y assets/fondos.
# Uso: python3 scripts/arte16.py CARPETA_CON_ORIGINALES
#   Espera g_nova.png g_caos.png g_gal.png g_nave.png g_capsula.png g_objetos.png y f_<planeta>.png;
#   v_intro.png v_entrega.png v_final.png (opcionales) van a docs/videos/.
import sys, pathlib
from PIL import Image

SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'work/gen')
ROOT = pathlib.Path(__file__).resolve().parent.parent
SPR, FON, VID = ROOT / 'assets/sprites', ROOT / 'assets/fondos', ROOT / 'docs/videos'
for d in (SPR, FON, VID): d.mkdir(parents=True, exist_ok=True)


def crop_alpha(im):
    a = im.getchannel('A').point(lambda v: 255 if v > 96 else 0)
    return im.crop(a.getbbox())


def pixelate(im, w=None, h=None, colors=32):
    """Reduce por área (BOX) para no perder detalle, binariza el alfa y cuantiza sin tramado extra."""
    if w and not h: h = max(1, round(im.height * w / im.width))
    if h and not w: w = max(1, round(im.width * h / im.height))
    small = im.resize((w, h), Image.BOX)
    alpha = small.getchannel('A').point(lambda v: 255 if v > 110 else 0)
    rgb = Image.new('RGB', small.size, (0, 0, 0)); rgb.paste(small.convert('RGB'), mask=alpha)
    q = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    out = q.convert('RGBA'); out.putalpha(alpha)
    return out


def save_sprite(im, name, colors=32):
    # PNG con paleta + transparencia (mucho más ligero que RGBA).
    p = im.convert('RGBA').quantize(colors=colors + 1, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    # índice transparente
    alpha = im.getchannel('A')
    pal_t = None
    px, pa = p.load(), alpha.load()
    used = set(px[x, y] for y in range(p.height) for x in range(p.width) if pa[x, y])
    free = next(i for i in range(256) if i not in used)
    for y in range(p.height):
        for x in range(p.width):
            if not pa[x, y]: px[x, y] = free
    p.save(SPR / name, optimize=True, transparency=free)
    print(f'  {name:16} {im.size[0]}×{im.size[1]}  {(SPR / name).stat().st_size // 1024} KB')


def square(im, n):
    c = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    c.paste(im, ((n - im.width) // 2, n - im.height), im)
    return c


print('Sprites →', SPR)
for who in ('nova', 'caos', 'gal'):
    f = SRC / f'g_{who}.png'
    if not f.exists(): continue
    im = crop_alpha(Image.open(f).convert('RGBA'))
    k = 64 / max(im.size)
    save_sprite(square(pixelate(im, round(im.width * k), round(im.height * k), 40), 64), f'retrato-{who}.png', 40)
if (SRC / 'g_nave.png').exists():
    save_sprite(pixelate(crop_alpha(Image.open(SRC / 'g_nave.png').convert('RGBA')), w=72, colors=32), 'nave.png')
if (SRC / 'g_capsula.png').exists():
    save_sprite(pixelate(crop_alpha(Image.open(SRC / 'g_capsula.png').convert('RGBA')), h=22, colors=24), 'capsula.png', 24)
if (SRC / 'g_objetos.png').exists():
    # Hoja 3×2: se separa por celdas y cada objeto se recorta a su caja.
    sheet = Image.open(SRC / 'g_objetos.png').convert('RGBA')
    box = crop_alpha(sheet); bx, by = sheet.getchannel('A').point(lambda v: 255 if v > 96 else 0).getbbox()[:2]
    ids = ['cel', 'huevo', 'vacuna', 'cristal', 'robot', 'nucleo']
    cw, ch = box.width / 3, box.height / 2
    for i, oid in enumerate(ids):
        cell = box.crop((round((i % 3) * cw), round((i // 3) * ch), round((i % 3 + 1) * cw), round((i // 3 + 1) * ch)))
        it = crop_alpha(cell); k = 16 / max(it.size)
        save_sprite(square(pixelate(it, max(1, round(it.width * k)), max(1, round(it.height * k)), 16), 16), f'obj-{oid}.png', 16)

print('Fondos →', FON)
for f in sorted(SRC.glob('f_*.png')):
    im = Image.open(f).convert('RGB')
    h = 320; w = round(im.width * h / im.height)
    small = im.resize((w, h), Image.BOX).quantize(colors=48, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    out = FON / (f.stem[2:] + '.png'); small.save(out, optimize=True)
    print(f'  {out.name:16} {w}×{h}  {out.stat().st_size // 1024} KB')

print('Videos (imágenes iniciales) →', VID)
for f in sorted(SRC.glob('v_*.png')):
    im = Image.open(f).convert('RGB').quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    out = VID / (f.stem[2:] + '.png'); im.save(out, optimize=True)
    print(f'  {out.name:16} {im.size[0]}×{im.size[1]}  {out.stat().st_size // 1024} KB')
