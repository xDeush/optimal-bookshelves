# Enchanting Table Calculator

How many bookshelves should you put around the enchanting table to roll a specific enchantment?
Pick an item, material, enchantment and level, and the calculator shows the chance for every
bookshelf count from 0 to 15 and which count gives the best chance.

Minecraft Java Edition 1.21.11+. Data and simulation by **xDeush**
(the original spreadsheet is included: `xDeush-Enchanting-Table-Calculator.xlsx`).

## Features

- Chance for 0-15 bookshelves, the best count, and the range of counts where the enchantment can appear.
- Overview of every enchantment and level the table can give for the selected item.
- English and Polish, light and dark theme, shareable links (state lives in the URL).
- Built with the game's own textures, GUI sprites, font and enchantment glint, so it looks like the game.
- Keyboard: `/` search, `-` and `+` change bookshelves, arrow keys move through grids.

## Running locally

It's a static site with no build step:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Deploying

Any static host works. On GitHub Pages: push the folder to a repository, then go to
**Settings > Pages** and serve from the branch root. A custom domain can be added on the same page.

## Regenerating data and assets

`tools/` contains the scripts that produced `data.js`, the textures and the font:

- `tools/build_data.py <spreadsheet.xlsx> <client.jar> <pl_pl.json> <site dir>` reads the spreadsheet
  (enchantment table, `OptimalData`, `Compat`) and copies item textures and language names from the game jar.
- `tools/build_font.py <client.jar> <site dir>/assets/minecraft.woff` converts the game's bitmap font
  into a webfont.

Both need Python with `openpyxl`, `Pillow` and `fontTools`.

## Disclaimer

Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.
Minecraft textures, sprites and font are property of Mojang.
