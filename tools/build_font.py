import sys, json, zipfile, io
from PIL import Image
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
JAR, OUT = sys.argv[1:3]
jar = zipfile.ZipFile(JAR)
provs = json.loads(jar.read("assets/minecraft/font/include/default.json"))["providers"]
U = 128  # font units per Minecraft pixel; 1em = 8px
glyphs = {}  # codepoint -> (advance_px_units, rects)
for p in provs:
    if p.get("type") != "bitmap": continue
    path = "assets/minecraft/textures/" + p["file"].split(":")[1]
    img = Image.open(io.BytesIO(jar.read(path))).convert("RGBA")
    rows = p["chars"]; cw = img.width // len(rows[0]); ch = img.height // len(rows)
    h = p.get("height", 8); s = h / ch; asc = p["ascent"]
    px = img.load()
    for r, line in enumerate(rows):
        for c, chr_ in enumerate(line):
            cp = ord(chr_)
            if cp == 0 or cp == 32 or cp in glyphs: continue
            x0, y0 = c * cw, r * ch
            width = 0; rects = []
            for yy in range(ch):
                run = None
                for xx in range(cw + 1):
                    on = xx < cw and px[x0 + xx, y0 + yy][3] > 0
                    if on:
                        width = max(width, xx + 1)
                        if run is None: run = xx
                    elif run is not None:
                        top = (asc - yy * s) * U; bot = top - s * U
                        rects.append((run * s * U, bot, xx * s * U, top)); run = None
            adv = int(round((width * s + 1) * U)) if width else int(round(4 * U))
            glyphs[cp] = (adv, rects)
glyphs[32] = (4 * U, [])
order = [".notdef"] + [f"u{cp:04X}" for cp in sorted(glyphs)]
fb = FontBuilder(8 * U, isTTF=True)
fb.setupGlyphOrder(order)
fb.setupCharacterMap({cp: f"u{cp:04X}" for cp in glyphs})
pen_glyphs, metrics = {}, {}
pen = TTGlyphPen(None); pen_glyphs[".notdef"] = pen.glyph(); metrics[".notdef"] = (6 * U, 0)
for cp, (adv, rects) in glyphs.items():
    pen = TTGlyphPen(None)
    for x0, y0, x1, y1 in rects:
        x0, y0, x1, y1 = map(lambda v: int(round(v)), (x0, y0, x1, y1))
        pen.moveTo((x0, y1)); pen.lineTo((x1, y1)); pen.lineTo((x1, y0)); pen.lineTo((x0, y0)); pen.closePath()
    g = pen.glyph(); n = f"u{cp:04X}"; pen_glyphs[n] = g
    metrics[n] = (adv, min((r[0] for r in rects), default=0))
fb.setupGlyf(pen_glyphs)
fb.setupHorizontalMetrics({k: (v[0], int(round(v[1]))) for k, v in metrics.items()})
fb.setupHorizontalHeader(ascent=8 * U, descent=-2 * U)
fb.setupNameTable({"familyName": "Minecraft", "styleName": "Regular"})
fb.setupOS2(sTypoAscender=8 * U, sTypoDescender=-2 * U, sTypoLineGap=0, usWinAscent=8 * U, usWinDescent=2 * U)
fb.setupPost()
fb.font.flavor = "woff"
fb.save(OUT)
print(len(glyphs), "glyphs; has ą ł ż:", all(ord(c) in glyphs for c in "ąęłńśźżćó"))
