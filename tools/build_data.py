import sys, json, zipfile, io, openpyxl
from PIL import Image
XLSX, JAR, PLLANG, OUT = sys.argv[1:5]
wb = openpyxl.load_workbook(XLSX)
ws = wb.worksheets[0]
ench = {}
for r in range(25, 153):
    name = ws.cell(r,1).value
    if not name: continue
    lvl = ws.cell(r,2).value
    e = ench.setdefault(name, {"max": ws.cell(r,5).value, "weight": ws.cell(r,6).value, "table": ws.cell(r,7).value == "YES", "levels": {}})
    e["levels"][lvl] = [ws.cell(r,3).value, ws.cell(r,4).value, ws.cell(r,11).value, ws.cell(r,12).value]
compat = {}
for row in wb['Compat'].iter_rows(min_row=2, values_only=True):
    if row[0]: compat.setdefault(row[0], {})[row[1]] = row[2] or "other"
opt = {}
for row in wb['OptimalData'].iter_rows(min_row=2, values_only=True):
    if not row[0]: continue
    item, en, name, lvl, best = row[:5]
    opt[f"{item}|{en}|{name}|{lvl}"] = [best] + [round(x or 0, 6) for x in row[6:23]]
jar = zipfile.ZipFile(JAR)
en = json.loads(jar.read("assets/minecraft/lang/en_us.json"))
pl = json.load(open(PLLANG, encoding="utf-8"))
names = {}
for k in list(ench):
    key = f"enchantment.minecraft.{k}"
    names[k] = {"en": en.get(key, k), "pl": pl.get(key, en.get(key, k))}
ikeys = {}
def tex(path): return Image.open(io.BytesIO(jar.read(f"assets/minecraft/textures/{path}.png"))).convert("RGBA")
icons = set()
def save(name, img): img.save(f"{OUT}/assets/{name}.png"); icons.add(name)
tools = ["sword","pickaxe","axe","shovel","hoe","spear"]
armor = ["helmet","chestplate","leggings","boots"]
for t in tools:
    for m in ["wooden","stone","copper","iron","golden","diamond","netherite"]:
        save(f"{m}_{t}", tex(f"item/{m}_{t}"))
for t in armor:
    for m in ["chainmail","copper","iron","golden","diamond","netherite"]:
        save(f"{m}_{t}", tex(f"item/{m}_{t}"))
    base = tex(f"item/leather_{t}"); ov = tex(f"item/leather_{t}_overlay")
    px = base.load(); c = (0xA0, 0x65, 0x40)
    for y in range(base.height):
        for x in range(base.width):
            r,g,b,a = px[x,y]; px[x,y] = (r*c[0]//255, g*c[1]//255, b*c[2]//255, a)
    base.alpha_composite(ov); save(f"leather_{t}", base)
for n in ["turtle_helmet","bow","crossbow_standby","trident","fishing_rod","mace","book","enchanted_book","lapis_lazuli","experience_bottle"]:
    save(n, tex(f"item/{n}"))
for n in ["bookshelf","enchanting_table_top","enchanting_table_side","oak_planks","deepslate_tiles","lapis_block"]:
    save(n, tex(f"block/{n}"))
save("glint", tex("misc/enchanted_glint_item"))
for k in en:
    if k.startswith("item.minecraft.") and k[15:] in icons: ikeys[k[15:]] = {"en": en[k], "pl": pl.get(k, en[k])}
data = {"ench": ench, "compat": compat, "opt": opt, "names": names, "itemNames": ikeys}
open(f"{OUT}/data.js","w",encoding="utf-8").write("window.ENCH_DATA=" + json.dumps(data, separators=(",",":"), ensure_ascii=False) + ";\n")
# coverage report
pairs = sorted({tuple(k.split("|")[:2]) for k in opt})
print("item|enchantability pairs:", pairs)
print("table enchants:", [k for k,v in ench.items() if v["table"]])
print("non-table:", [k for k,v in ench.items() if not v["table"]])
