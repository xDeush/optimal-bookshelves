(() => {
  "use strict";
  const D = window.ENCH_DATA;
  const $ = (id) => document.getElementById(id);

  // ---------- Static definitions ----------
  const TOOL_MATS = [["wooden", 15], ["stone", 5], ["copper", 13], ["iron", 14], ["golden", 22], ["diamond", 10], ["netherite", 15]];
  const ARMOR_MATS = [["leather", 15], ["chainmail", 12], ["copper", 8], ["iron", 9], ["golden", 25], ["diamond", 10], ["netherite", 15]];
  const ITEMS = [
    { id: "sword", mats: TOOL_MATS },
    { id: "axe", mats: TOOL_MATS },
    { id: "spear", mats: TOOL_MATS },
    { id: "mace", fixed: 15, icon: "mace" },
    { id: "pickaxe", mats: TOOL_MATS },
    { id: "shovel", mats: TOOL_MATS },
    { id: "hoe", mats: TOOL_MATS },
    { id: "bow", fixed: 1, icon: "bow" },
    { id: "crossbow", fixed: 1, icon: "crossbow_standby" },
    { id: "trident", fixed: 1, icon: "trident" },
    { id: "fishing_rod", fixed: 1, icon: "fishing_rod" },
    { id: "helmet", mats: ARMOR_MATS.concat([["turtle", 9]]) },
    { id: "chestplate", mats: ARMOR_MATS },
    { id: "leggings", mats: ARMOR_MATS },
    { id: "boots", mats: ARMOR_MATS },
    { id: "book", fixed: 1, icon: "book" },
  ];
  const GROUPS = [["melee", ["sword", "axe", "spear", "mace", "trident"]], ["ranged", ["bow", "crossbow"]], ["tools", ["pickaxe", "shovel", "hoe", "fishing_rod"]], ["armor", ["helmet", "chestplate", "leggings", "boots"]], ["other", ["book"]]];
  const ITEM = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
  // Bookshelf ring: perimeter of a 5x5 square with the bottom-middle left open as the doorway.
  // Filled clockwise from the shelf left of the doorway round to the one on its right.
  const RING = [[4, 1], [4, 0], [3, 0], [2, 0], [1, 0], [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [4, 3]];
  const ROMAN = ["", "I", "II", "III", "IV", "V"];

  const T = {
    pl: {
      by: "arkusz i dane: <strong>xDeush</strong>",
      theme: "Motyw",
      sheet: "Arkusz .xlsx",
      h1: "Ile biblioteczek postawić?",
      lead: "Wybierz przedmiot, materiał i enchant. Kalkulator pokaże szansę dla każdej liczby biblioteczek od 0 do 15 i wskaże najlepszą.",
      sItem: "Przedmiot",
      sMat: "Materiał",
      sMatHint: "liczba = zaklinalność (więcej = większy budżet)",
      groups: { melee: "Walka", ranged: "Strzelanie", tools: "Narzędzia", armor: "Zbroja", other: "Inne" },
      slotShort: "w 3. slocie stołu",
      oneIn: (n) => `ok. 1 na ${n} prób`,
      lvlTip: (c, n) => `najlepiej ${c} przy ${n} bibl.`,
      shelfAria: (k) => `${k} biblioteczek`,
      minusAria: "Jedna biblioteczka mniej",
      plusAria: "Jedna biblioteczka więcej",
      themeAria: "Przełącz jasny lub ciemny motyw",
      sheetAria: "Pobierz arkusz .xlsx",
      keysHint: "Skróty: / szukaj, - i + zmienia biblioteczki, strzałki poruszają się po siatce.",
      sEnch: "Zaklęcie",
      sLvl: "Poziom",
      search: "Szukaj zaklęcia...",
      enchCount: (n) => `${n} dostępnych ze stołu`,
      offShow: (n) => `Pokaż niedostępne ze stołu (${n})`,
      offHide: "Ukryj niedostępne ze stołu",
      anvil: "tylko kowadło",
      treasure: "skarb, nie ze stołu",
      none: "Brak wyników.",
      fixedMat: (e) => `Ten przedmiot ma stałą zaklinalność: <strong>${e}</strong>`,
      matPicked: (n, e) => `<strong>${n}</strong>, zaklinalność ${e}`,
      kCur: (n) => `Szansa przy ${n} ${shelfWord(n)}`,
      kBest: "Najlepsze ustawienie",
      yourSetup: "Twoje ustawienie",
      unit: (n) => (n === 1 ? "biblioteczka" : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? "biblioteczki" : "biblioteczek"),
      bestS: (c, one) => `szansa ${c}, ${one}`,
      setIt: (n) => `Ustaw ${n}`,
      youHave: "to Twoje ustawienie",
      never: "nigdy",
      shelves: "Biblioteczki wokół stołu",
      chartCap: "Szansa dla 0-15 biblioteczek",
      chartMax: (c) => `max ${c}`,
      lgCur: "Twoja liczba",
      lgBest: "Najlepsza",
      details: "Szczegóły mechaniki",
      dWeight: "Waga zaklęcia",
      dCost: "Okno kosztu (ten poziom)",
      dBudget: (n) => `Budżet przy ${n} bibl.`,
      dEnch: "Zaklinalność",
      dRange: "Działa przy",
      dBook: "Książka",
      dBookV: "jeden losowy enchant jest usuwany z wyniku",
      vNo: "Ten poziom nie wypada ze stołu na tym przedmiocie.",
      vZero: (n, a, b) => `Przy ${n} ${shelfWord(n)} nie wypadnie. Działa przy ${rangeTxt(a, b)} biblioteczkach.`,
      vOk: (a, b, best) => `Działa przy ${rangeTxt(a, b)} biblioteczkach. Najwyższa szansa przy ${best}.`,
      vBest: (a, b) => `To najlepsze ustawienie. Działa przy ${rangeTxt(a, b)} biblioteczkach.`,
      slotNote: "Szansa, że enchant pojawi się w najmocniejszym (3.) slocie stołu.",
      heatH: (n) => `Wszystkie zaklęcia: ${n}`,
      heatLead: "Duża liczba to szansa przy Twojej liczbie biblioteczek. Pod nią najlepszy wynik @ liczba biblioteczek, która go daje. Wybierz komórkę, żeby ją ustawić.",
      heatCol: "Zaklęcie",
      heatBest: (c, n) => `${c} @${n}`,
      howH: "Jak działa stół do zaklinania",
      how: [
        ["Budżet", "Stół losuje budżet (zmodyfikowany poziom) dla najmocniejszego slotu. Więcej biblioteczek to wyższy budżet, maksymalnie przy 15."],
        ["Okno kosztu", "Każdy poziom zaklęcia ma zakres [min; max]. Gra bierze najwyższy poziom, który się mieści, więc dany poziom wypada tylko w swoim efektywnym oknie."],
        ["Pasujące przedmioty", "Do puli trafiają tylko zaklęcia przypisane do przedmiotu. Książka akceptuje wszystkie, ale z wyniku znika jeden losowy enchant."],
        ["Losowanie wagami", "Jedno zaklęcie jest losowane z puli według wagi. Potem stół może dolosować kolejne, a szansa na to rośnie z budżetem."],
        ["Więcej nie zawsze lepiej", "Optymalna liczba biblioteczek bywa wyższa niż minimalna, bo większy budżet daje więcej dolosowań. Bywa też niższa, bo zbyt duży budżet przeskakuje na wyższy poziom."],
      ],
      sceneCap: "15 biblioteczek w odległości 2 bloków od stołu, z wolnym przejściem. Między stołem a półkami nic nie może stać.",
      foot1: "Dane i symulacja: <strong>xDeush</strong>. Wersja Minecraft 1.21.11+.",
      foot2: "Nie jest oficjalnym produktem Minecraft. Niezatwierdzony przez Mojang ani Microsoft i z nimi niezwiązany.",
      types: { sword: "Miecz", axe: "Siekiera", spear: "Włócznia", mace: "Buzdygan", pickaxe: "Kilof", shovel: "Łopata", hoe: "Motyka", bow: "Łuk", crossbow: "Kusza", trident: "Trójząb", fishing_rod: "Wędka", helmet: "Hełm", chestplate: "Napierśnik", leggings: "Nogawice", boots: "Buty", book: "Książka" },
      mats: { wooden: "Drewno", stone: "Kamień", copper: "Miedź", iron: "Żelazo", golden: "Złoto", diamond: "Diament", netherite: "Netheryt", leather: "Skóra", chainmail: "Kolczuga", turtle: "Skorupa żółwia" },
      tipEnch: "Zaklinalność",
    },
    en: {
      by: "spreadsheet and data by <strong>xDeush</strong>",
      theme: "Theme",
      sheet: ".xlsx sheet",
      h1: "How many bookshelves?",
      lead: "Pick an item, material and enchantment. You get the chance for every bookshelf count from 0 to 15 and the best one to use.",
      sItem: "Item",
      sMat: "Material",
      sMatHint: "number = enchantability (higher = bigger budget)",
      groups: { melee: "Melee", ranged: "Ranged", tools: "Tools", armor: "Armor", other: "Other" },
      slotShort: "in the table's 3rd slot",
      oneIn: (n) => `about 1 in ${n} tries`,
      lvlTip: (c, n) => `best ${c} at ${n} shelves`,
      shelfAria: (k) => `${k} bookshelves`,
      minusAria: "One bookshelf less",
      plusAria: "One bookshelf more",
      themeAria: "Toggle light or dark theme",
      sheetAria: "Download the .xlsx spreadsheet",
      keysHint: "Shortcuts: / search, - and + change bookshelves, arrow keys move through grids.",
      sEnch: "Enchantment",
      sLvl: "Level",
      search: "Search enchantments...",
      enchCount: (n) => `${n} available from the table`,
      offShow: (n) => `Show ones the table can't give (${n})`,
      offHide: "Hide ones the table can't give",
      anvil: "anvil only",
      treasure: "treasure, not from table",
      none: "No matches.",
      fixedMat: (e) => `This item has a fixed enchantability: <strong>${e}</strong>`,
      matPicked: (n, e) => `<strong>${n}</strong>, enchantability ${e}`,
      kCur: (n) => `Chance with ${n} ${n === 1 ? "bookshelf" : "bookshelves"}`,
      kBest: "Best setup",
      yourSetup: "Your setup",
      unit: (n) => (n === 1 ? "bookshelf" : "bookshelves"),
      bestS: (c, one) => `${c} chance, ${one}`,
      setIt: (n) => `Use ${n}`,
      youHave: "that's your setup",
      never: "never",
      shelves: "Bookshelves around the table",
      chartCap: "Chance for 0-15 bookshelves",
      chartMax: (c) => `max ${c}`,
      lgCur: "Your count",
      lgBest: "Best",
      details: "Mechanics details",
      dWeight: "Enchantment weight",
      dCost: "Cost window (this level)",
      dBudget: (n) => `Budget at ${n} shelves`,
      dEnch: "Enchantability",
      dRange: "Works with",
      dBook: "Book",
      dBookV: "one random enchantment is removed from the result",
      vNo: "This level never comes from the table on this item.",
      vZero: (n, a, b) => `It won't show up with ${n} ${n === 1 ? "bookshelf" : "bookshelves"}. Works with ${rangeTxt(a, b)} bookshelves.`,
      vOk: (a, b, best) => `Works with ${rangeTxt(a, b)} bookshelves. Highest chance at ${best}.`,
      vBest: (a, b) => `That's the best setup. Works with ${rangeTxt(a, b)} bookshelves.`,
      slotNote: "Chance that the enchantment shows up in the strongest (3rd) table slot.",
      heatH: (n) => `Every enchantment: ${n}`,
      heatLead: "The big number is the chance at your bookshelf count. Below it: the best result @ the bookshelf count that gives it. Pick a cell to select it.",
      heatCol: "Enchantment",
      heatBest: (c, n) => `${c} @${n}`,
      howH: "How the enchanting table works",
      how: [
        ["Budget", "The table rolls a budget (modified level) for the strongest slot. More bookshelves means a higher budget, capped at 15."],
        ["Cost window", "Every enchantment level has a [min; max] range. The game takes the highest level that fits, so a level only appears inside its effective window."],
        ["Matching items", "Only enchantments meant for the item enter the pool. Books accept all of them, but one random enchantment gets dropped from the result."],
        ["Weighted draw", "One enchantment is drawn from the pool by weight. The table can then roll extra ones, and that chance grows with the budget."],
        ["More isn't always better", "The best count can be above the minimum, since a bigger budget gives more extra rolls. It can also be lower, because too much budget jumps to a higher level."],
      ],
      sceneCap: "15 bookshelves two blocks away from the table, with a gap to walk in. Nothing may sit between the table and the shelves.",
      foot1: "Data and simulation by <strong>xDeush</strong>. Minecraft 1.21.11+.",
      foot2: "Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.",
      types: { sword: "Sword", axe: "Axe", spear: "Spear", mace: "Mace", pickaxe: "Pickaxe", shovel: "Shovel", hoe: "Hoe", bow: "Bow", crossbow: "Crossbow", trident: "Trident", fishing_rod: "Fishing Rod", helmet: "Helmet", chestplate: "Chestplate", leggings: "Leggings", boots: "Boots", book: "Book" },
      mats: { wooden: "Wood", stone: "Stone", copper: "Copper", iron: "Iron", golden: "Gold", diamond: "Diamond", netherite: "Netherite", leather: "Leather", chainmail: "Chainmail", turtle: "Turtle Shell" },
      tipEnch: "Enchantability",
    },
  };

  // ---------- State ----------
  const state = { item: "sword", mat: "diamond", ench: "sharpness", lvl: 4, shelves: 15, showOff: false, q: "" };
  let lang = "en";
  let L = T.en;

  function shelfWord(n) {
    if (n === 1) return "biblioteczce";
    return "biblioteczkach";
  }
  function rangeTxt(a, b) { return a === b ? `${a}` : `${a}-${b}`; }
  function pct(x) {
    if (x == null) return "-";
    if (x <= 0) return "0%";
    const v = x * 100;
    if (v < 0.1) return "<0.1%";
    return (v >= 10 ? v.toFixed(1) : v.toFixed(2)).replace(/\.?0+$/, "") + "%";
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  // ---------- Derived helpers ----------
  function matsOf(item) { return ITEM[item].mats || null; }
  function enchantability() {
    const it = ITEM[state.item];
    if (it.fixed) return it.fixed;
    const m = it.mats.find((x) => x[0] === state.mat);
    return m ? m[1] : it.mats[0][1];
  }
  function iconFor(item, mat) {
    const it = ITEM[item];
    if (it.icon) return it.icon;
    if (mat === "turtle") return "turtle_helmet";
    return `${mat}_${item}`;
  }
  function currentIcon() { return state.item === "book" ? "enchanted_book" : iconFor(state.item, state.mat); }
  function itemName(item, mat) {
    if (item === "book") return D.itemNames.book ? D.itemNames.book[lang] : L.types.book;
    const n = D.itemNames[iconFor(item, mat)];
    return n ? n[lang] : L.types[item];
  }
  function bookName() { return D.itemNames.enchanted_book ? D.itemNames.enchanted_book[lang] : "Enchanted Book"; }
  function enchName(e) { return D.names[e] ? D.names[e][lang] : e; }
  function row(item, e, lvl) { return D.opt[`${item}|${enchantability()}|${e}|${lvl}`] || null; }
  function source(e, item) { return (D.compat[e] || {})[item] || null; }
  function offered(item) {
    return Object.keys(D.ench).filter((e) => D.ench[e].table && source(e, item) === "table" && levelsWithData(item, e).length);
  }
  function levelsWithData(item, e) {
    const out = [];
    for (let l = 1; l <= D.ench[e].max; l++) { const r = row(item, e, l); if (r && r[1] > 0) out.push(l); }
    return out;
  }
  function unavailable(item) {
    return Object.keys(D.ench).filter((e) => source(e, item) && !offered(item).includes(e));
  }
  function maxBudget(n, E) {
    n = Math.min(n, 15);
    return Math.ceil((Math.max(8 + Math.floor(n / 2) + n, 2 * n) + 1 + 2 * Math.floor(E / 4)) * 1.15 + 0.5) - 1;
  }
  function minBudget(n) {
    n = Math.min(n, 15);
    return Math.round((Math.max(1 + Math.floor(n / 2), 2 * n, 3) + 1) * 0.85);
  }
  function sortByName(list) { return list.sort((a, b) => enchName(a).localeCompare(enchName(b), lang)); }

  // ---------- Tooltip ----------
  const tip = $("tip");
  const canHover = matchMedia("(hover: hover)").matches;
  document.addEventListener("pointerover", (ev) => {
    if (!canHover) return;
    const el = ev.target.closest("[data-tip]");
    if (!el) { tip.classList.remove("on"); return; }
    tip.innerHTML = el.dataset.tip;
    tip.classList.add("on");
  });
  document.addEventListener("pointermove", (ev) => {
    if (!tip.classList.contains("on")) return;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let x = ev.clientX + 14, y = ev.clientY - h - 10;
    if (x + w > innerWidth - 8) x = ev.clientX - w - 14;
    if (y < 8) y = ev.clientY + 18;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  });
  document.addEventListener("pointerout", (ev) => { if (!ev.relatedTarget || !ev.relatedTarget.closest || !ev.relatedTarget.closest("[data-tip]")) tip.classList.remove("on"); });

  // Update a container in place: keeps existing elements (and their :hover state) and only
  // touches the attributes and text that changed, so a click doesn't replay hover effects.
  function morph(a, b) {
    if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) { a.replaceWith(b); return; }
    if (a.nodeType === 3) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
    if (a.nodeType !== 1) return;
    for (const at of [...a.attributes]) if (!b.hasAttribute(at.name) && !(a.nodeName === "CANVAS" && (at.name === "width" || at.name === "height"))) a.removeAttribute(at.name);
    for (const at of [...b.attributes]) if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
    const an = [...a.childNodes], bn = [...b.childNodes];
    if (an.length !== bn.length) { a.replaceChildren(...bn); return; }
    for (let i = 0; i < an.length; i++) morph(an[i], bn[i]);
  }
  function patch(el, html) {
    const next = document.createElement(el.tagName);
    next.innerHTML = html;
    const an = [...el.childNodes], bn = [...next.childNodes];
    if (an.length !== bn.length) { el.replaceChildren(...bn); return; }
    for (let i = 0; i < an.length; i++) morph(an[i], bn[i]);
  }

  // ---------- Rendering ----------
  function renderStatic() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => { const v = L[el.dataset.i18n]; if (typeof v === "string") el.textContent = v; });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = L[el.dataset.i18nHtml]; });
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    $("search").placeholder = L.search;
    $("minus").setAttribute("aria-label", L.minusAria);
    $("plus").setAttribute("aria-label", L.plusAria);
    $("themeBtn").setAttribute("aria-label", L.themeAria);
    $("sheetBtn").setAttribute("aria-label", L.sheetAria);
    $("ring").setAttribute("aria-label", L.shelves);
    $("chart").setAttribute("aria-label", L.chartCap);
    $("howList").innerHTML = L.how.map(([a, b]) => `<li><div><strong>${a}</strong><span>${b}</span></div></li>`).join("");
  }

  function renderItems() {
    const btn = (it) => {
      const mat = it.mats ? (it.mats.some((m) => m[0] === state.mat) ? state.mat : (it.id === state.item ? state.mat : (it.mats.find((m) => m[0] === "diamond") || it.mats[0])[0])) : null;
      const icon = iconFor(it.id, mat || "diamond");
      return `<button type="button" class="slot pick" data-item="${it.id}" aria-pressed="${it.id === state.item}" aria-label="${esc(L.types[it.id])}" data-tip="<div>${esc(L.types[it.id])}</div>"><img src="assets/${icon}.png" alt="" width="16" height="16"></button>`;
    };
    patch($("items"), GROUPS.map(([g, ids]) => `<div class="grp"><span class="grp-l">${L.groups[g]}</span><div class="grp-i">${ids.map((id) => btn(ITEM[id])).join("")}</div></div>`).join(""));
  }

  function renderMats() {
    const it = ITEM[state.item];
    const box = $("mats");
    if (!it.mats) {
      patch(box, `<button type="button" class="slot pick" aria-pressed="true" disabled><img src="assets/${it.icon}.png" alt=""><span class="badge">${it.fixed}</span></button>`);
      $("matLabel").innerHTML = L.fixedMat(it.fixed);
      return;
    }
    patch(box, it.mats.map(([m, e]) => {
      const nm = itemName(state.item, m);
      return `<button type="button" class="slot pick" data-mat="${m}" aria-pressed="${m === state.mat}" aria-label="${esc(nm)}" data-tip="<div class='t1'>${esc(nm)}</div><div class='g'>${L.tipEnch}: ${e}</div>"><img src="assets/${iconFor(state.item, m)}.png" alt=""><span class="badge">${e}</span></button>`;
    }).join(""));
    $("matLabel").innerHTML = L.matPicked(esc(L.mats[state.mat]), enchantability());
  }

  function matchesQuery(e) {
    if (!state.q) return true;
    const q = state.q.toLowerCase();
    return enchName(e).toLowerCase().includes(q) || D.names[e].en.toLowerCase().includes(q) || D.names[e].pl.toLowerCase().includes(q) || e.includes(q.replace(/ /g, "_"));
  }

  function renderEnchs() {
    const list = sortByName(offered(state.item));
    const shown = list.filter(matchesQuery);
    $("enchCount").textContent = L.enchCount(list.length);
    patch($("enchs"), shown.length ? shown.map((e) => {
      const nm = enchName(e), mx = D.ench[e].max;
      return `<button type="button" class="ench" data-ench="${e}" aria-pressed="${e === state.ench}" data-tip="<div class='t1 y'>${esc(bookName())}</div><div class='g'>${esc(nm)} ${ROMAN[mx]}</div>"><canvas class="gl" data-src="assets/enchanted_book.png" aria-hidden="true"></canvas><span class="nm">${esc(nm)}</span><span class="mx">${ROMAN[mx]}</span></button>`;
    }).join("") : `<div class="ench-empty">${L.none}</div>`);

    const off = sortByName(unavailable(state.item)).filter(matchesQuery);
    $("offToggle").hidden = off.length === 0;
    $("offToggle").textContent = state.showOff ? L.offHide : L.offShow(off.length);
    $("enchsOff").hidden = !state.showOff || !off.length;
    patch($("enchsOff"), off.map((e) => {
      const why = D.ench[e].table ? L.anvil : L.treasure;
      return `<button type="button" class="ench" disabled><canvas class="gl" data-src="assets/enchanted_book.png" aria-hidden="true"></canvas><span class="nm">${esc(enchName(e))}<span class="why">${why}</span></span><span class="mx">${ROMAN[D.ench[e].max]}</span></button>`;
    }).join(""));
  }

  function renderLevels() {
    const e = D.ench[state.ench];
    const ok = levelsWithData(state.item, state.ench);
    let html = "";
    for (let l = 1; l <= e.max; l++) {
      const r = row(state.item, state.ench, l);
      const can = ok.includes(l);
      const now = can ? pct(r[2 + state.shelves]) : "-";
      html += `<button type="button" class="lvl" data-lvl="${l}" aria-pressed="${l === state.lvl}" ${can ? "" : "disabled"} aria-label="${esc(enchName(state.ench))} ${ROMAN[l]}: ${now}${can ? ", " + esc(L.lvlTip(pct(r[1]), r[0])) : ""}" data-tip="<div class='t1'>${esc(enchName(state.ench))} ${ROMAN[l]}</div><div class='g'>${can ? L.lvlTip(pct(r[1]), r[0]) : L.never}</div>"><span>${ROMAN[l]}<small>${now}</small></span></button>`;
    }
    patch($("lvls"), html);
  }

  function renderRing() {
    const cells = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      const k = RING.findIndex(([y, x]) => y === r && x === c);
      if (k >= 0) cells.push(`<button type="button" class="c shelf${k < state.shelves ? " on" : ""}" data-ring="${k}" tabindex="-1" aria-label="${esc(L.shelfAria(k + 1))}" aria-pressed="${k < state.shelves}"></button>`);
      else if (r === 2 && c === 2) cells.push(`<span class="c table"></span>`);
      else cells.push(`<span class="c"></span>`);
    }
    patch($("ring"), cells.join(""));
  }

  function renderResult() {
    const n = state.shelves;
    const r = row(state.item, state.ench, state.lvl);
    const icon = currentIcon();
    $("resImg").dataset.src = `assets/${icon}.png`;
    $("resItem").textContent = itemName(state.item, state.mat);
    $("resEnch").textContent = `${enchName(state.ench)} ${ROMAN[state.lvl]}`;

    const arr = r ? r.slice(2) : new Array(16).fill(0);
    const nz = arr.map((v, i) => (v > 0 ? i : -1)).filter((i) => i >= 0);
    const possible = r && nz.length > 0;
    $("resEnch").classList.toggle("never", !possible);

    const oneIn = (x) => (x > 0 ? L.oneIn(Math.max(1, Math.round(1 / x))) : "");
    $("vCur").textContent = possible ? pct(arr[n]) : "0%";
    $("sCur").textContent = possible && arr[n] > 0 ? oneIn(arr[n]) : "";
    $("vCur").classList.toggle("zero", !possible || arr[n] === 0);
    const sb = $("setBest");
    if (possible) {
      $("vBest").textContent = r[0];
      $("bestUnit").textContent = L.unit(r[0]);
      $("sBest").textContent = L.bestS(pct(r[1]), oneIn(r[1]));
      sb.textContent = L.setIt(r[0]);
      sb.hidden = r[0] === n;
    } else {
      $("vBest").textContent = "-";
      $("bestUnit").textContent = "";
      $("sBest").textContent = L.vNo;
      sb.hidden = true;
    }

    const v = $("verdict");
    v.classList.toggle("no", !possible || arr[n] === 0);
    if (!possible) v.textContent = L.vNo;
    else {
      const a = nz[0], b = nz[nz.length - 1];
      if (arr[n] === 0) v.textContent = L.vZero(n, a, b);
      else if (r[0] === n) v.textContent = L.vBest(a, b);
      else v.textContent = L.vOk(a, b, r[0]);
    }

    $("shelfOut").textContent = n;
    $("range").value = n;
    $("minus").disabled = n <= 0;
    $("plus").disabled = n >= 15;
    renderRing();

    const max = Math.max(...arr, 0);
    $("chartMax").textContent = possible ? L.chartMax(pct(max)) : "";
    patch($("chart"), arr.map((val, i) => {
      const h = max > 0 && val > 0 ? Math.max(val / max, 0.035) : 0;
      const cls = ["bar", i === n ? "cur" : "", possible && i === r[0] ? "best" : ""].join(" ");
      return `<button type="button" class="${cls}" data-bar="${i}" tabindex="-1" style="--h:${h.toFixed(4)}" aria-label="${i}: ${pct(val)}" data-tip="<div class='t1'>${esc(L.shelfAria(i))}</div><div class='g'>${pct(val)}</div>"><i></i></button>`;
    }).join(""));
    patch($("chartX"), arr.map((_, i) => `<span class="${i === n ? "cur" : i % 5 === 0 && Math.abs(i - n) > 1 ? "tick" : ""}">${i}</span>`).join(""));
    renderSummary(possible ? pct(arr[n]) : "0%", possible ? r[0] : null);

    const E = enchantability();
    const lv = D.ench[state.ench].levels[state.lvl];
    const dl = [
      [L.dEnch, E],
      [L.dWeight, D.ench[state.ench].weight],
      [L.dCost, lv ? `${lv[2]}-${lv[3]}` : "-"],
      [L.dBudget(n), `${minBudget(n)}-${maxBudget(n, E)}`],
      [L.dRange, possible ? rangeTxt(nz[0], nz[nz.length - 1]) : L.never],
    ];
    if (state.item === "book") dl.push([L.dBook, L.dBookV]);
    patch($("dl"), dl.map(([k, val]) => `<dt>${k}</dt><dd>${val}</dd>`).join("") + `<dt></dt><dd>${L.slotNote}</dd>`);
  }

  function renderSummary(cur, best) {
    $("sumImg").dataset.src = `assets/${currentIcon()}.png`;
    $("sumName").textContent = `${enchName(state.ench)} ${ROMAN[state.lvl]}`;
    $("sumVal").textContent = `${cur} @${state.shelves}`;
    $("sumBest").textContent = best == null ? L.never : `${L.lgBest}: ${best}`;
  }

  function renderHeat() {
    $("h-heat").textContent = L.heatH(itemName(state.item, state.mat));
    const list = sortByName(offered(state.item));
    const n = state.shelves;
    let peak = 0;
    for (const e of list) for (let l = 1; l <= D.ench[e].max; l++) { const r = row(state.item, e, l); if (r) peak = Math.max(peak, r[2 + n]); }
    let html = `<thead><tr><th>${L.heatCol}</th>${[1, 2, 3, 4, 5].map((l) => `<th>${ROMAN[l]}</th>`).join("")}</tr></thead><tbody>`;
    for (const e of list) {
      html += `<tr><td class="n"><div><canvas class="gl" data-src="assets/enchanted_book.png" aria-hidden="true"></canvas>${esc(enchName(e))}</div></td>`;
      for (let l = 1; l <= 5; l++) {
        if (l > D.ench[e].max) { html += `<td class="empty"></td>`; continue; }
        const r = row(state.item, e, l);
        const has = r && r[1] > 0;
        const val = has ? r[2 + n] : 0;
        const a = peak > 0 ? (val / peak) * 0.9 : 0;
        const sel = e === state.ench && l === state.lvl ? " sel" : "";
        html += `<td class="v"><button type="button" class="slot hc${sel}" style="--a:${a.toFixed(3)}" ${has ? `data-pick="${e}|${l}"` : "disabled"} aria-label="${esc(enchName(e))} ${ROMAN[l]}: ${pct(val)}"><b>${has ? pct(val) : "-"}</b><small>${has ? L.heatBest(pct(r[1]), r[0]) : L.never}</small></button></td>`;
      }
      html += `</tr>`;
    }
    patch($("heat"), html + "</tbody>");
  }

  function renderScene() {
    let s = "";
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      const k = RING.findIndex(([y, x]) => y === r && x === c);
      s += k >= 0 ? `<i class="s"></i>` : r === 2 && c === 2 ? `<i class="t"></i>` : `<i></i>`;
    }
    $("scene").innerHTML = s;
  }

  // ---------- State changes ----------
  function normalize() {
    const it = ITEM[state.item];
    if (it.mats && !it.mats.some((m) => m[0] === state.mat)) {
      const fallback = { leather: "wooden", chainmail: "iron", turtle: "iron", wooden: "leather", stone: "chainmail" }[state.mat];
      state.mat = it.mats.some((m) => m[0] === fallback) ? fallback : (it.mats.find((m) => m[0] === "diamond") || it.mats[0])[0];
    }
    const list = offered(state.item);
    // Come back to the enchantment the user picked last, once the item supports it again.
    if (state.want && list.includes(state.want)) state.ench = state.want;
    if (!list.includes(state.ench)) state.ench = sortByName(list.slice())[0];
    const lv = levelsWithData(state.item, state.ench);
    if (!lv.includes(state.lvl)) state.lvl = lv.length ? lv.reduce((best, l) => (Math.abs(l - state.lvl) < Math.abs(best - state.lvl) ? l : best), lv[0]) : 1;
    state.shelves = Math.max(0, Math.min(15, state.shelves | 0));
  }

  function writeHash() {
    const p = new URLSearchParams({ item: state.item, mat: state.mat, e: state.ench, l: state.lvl, b: state.shelves });
    history.replaceState(null, "", "#" + p.toString());
  }
  function readHash() {
    const p = new URLSearchParams(location.hash.slice(1));
    if (ITEM[p.get("item")]) state.item = p.get("item");
    if (p.get("mat")) state.mat = p.get("mat");
    if (D.ench[p.get("e")]) state.ench = p.get("e");
    if (p.get("l")) state.lvl = +p.get("l") || 1;
    if (p.get("b") != null && p.get("b") !== "") state.shelves = +p.get("b");
  }

  function update(parts) {
    normalize();
    if (parts.includes("items")) renderItems();
    if (parts.includes("mats")) renderMats();
    if (parts.includes("enchs")) renderEnchs();
    if (parts.includes("lvls")) renderLevels();
    renderResult();
    renderHeat();
    writeHash();
  }
  const ALL = ["items", "mats", "enchs", "lvls"];

  // ---------- Events ----------
  document.addEventListener("click", (ev) => {
    const t = ev.target.closest("button");
    if (!t || t.disabled) return;
    if (t.dataset.item) { state.item = t.dataset.item; if (state.q) { state.q = ""; $("search").value = ""; } update(ALL); }
    else if (t.dataset.mat) { state.mat = t.dataset.mat; update(ALL); }
    else if (t.dataset.ench) { state.ench = state.want = t.dataset.ench; update(["enchs", "lvls"]); }
    else if (t.dataset.lvl) { state.lvl = +t.dataset.lvl; update(["lvls"]); }
    else if (t.dataset.ring != null) { const k = +t.dataset.ring; state.shelves = state.shelves === k + 1 ? k : k + 1; update(["lvls"]); }
    else if (t.dataset.bar != null) { state.shelves = +t.dataset.bar; update(["lvls"]); }
    else if (t.dataset.pick) {
      const [e, l] = t.dataset.pick.split("|");
      state.ench = state.want = e; state.lvl = +l; update(["enchs", "lvls"]);
      if (innerWidth <= 960) document.querySelector(".result").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
    else if (t.id === "setBest") { const r = row(state.item, state.ench, state.lvl); if (r) { state.shelves = r[0]; update(["lvls"]); } }
    else if (t.id === "minus") { state.shelves--; update(["lvls"]); }
    else if (t.id === "plus") { state.shelves++; update(["lvls"]); }
    else if (t.id === "offToggle") { state.showOff = !state.showOff; renderEnchs(); }
    else if (t.dataset.lang) { setLang(t.dataset.lang); }
    else if (t.id === "themeBtn") { toggleTheme(); }
    else if (t.id === "sumBar") { document.querySelector(".result").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); }
  });
  $("range").addEventListener("input", (ev) => { state.shelves = +ev.target.value; update(["lvls"]); });
  $("search").addEventListener("input", (ev) => { state.q = ev.target.value.trim(); renderEnchs(); });
  $("search").addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter") return;
    const first = $("enchs").querySelector("[data-ench]");
    if (first) first.click();
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const typing = ev.target.matches && ev.target.matches("input, textarea");
    if (ev.key === "/" && !typing) { ev.preventDefault(); $("search").focus(); $("search").select(); return; }
    if (typing) return;
    if (ev.key === "-" || ev.key === "+" || ev.key === "=") {
      const d = ev.key === "-" ? -1 : 1;
      if ((d < 0 && state.shelves > 0) || (d > 0 && state.shelves < 15)) { state.shelves += d; update(["lvls"]); }
      return;
    }
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(ev.key)) return;
    const grid = ev.target.closest && ev.target.closest(".items, .grid-items, .ench-list, .levels");
    if (!grid) return;
    const btns = [...grid.querySelectorAll("button:not(:disabled)")];
    const i = btns.indexOf(ev.target);
    if (i < 0) return;
    if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") {
      const b = btns[ev.key === "ArrowLeft" ? i - 1 : i + 1];
      if (b) { ev.preventDefault(); b.focus(); }
      return;
    }
    // Vertical: jump to the button in the nearest row above/below, closest to the same x.
    const r0 = ev.target.getBoundingClientRect();
    const down = ev.key === "ArrowDown";
    let best = null, bd = Infinity;
    for (const b of btns) {
      const r = b.getBoundingClientRect();
      if (down ? r.top <= r0.top + 2 : r.top >= r0.top - 2) continue;
      const d = Math.abs(r.top - r0.top) * 1000 + Math.abs(r.left - r0.left);
      if (d < bd) { bd = d; best = b; }
    }
    if (best) { ev.preventDefault(); best.focus(); }
  });

  // Mobile: a compact result bar stays visible while the result panel is off screen.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { $("sumBar").classList.toggle("off", e.isIntersecting); }, { threshold: 0.15 }).observe(document.querySelector(".result"));
  }

  function setLang(l) {
    lang = l; L = T[l];
    try { localStorage.setItem("lang", l); } catch (e) {}
    renderStatic();
    update(ALL);
  }
  function toggleTheme() {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  }


  // ---------- Enchantment glint ----------
  // Port of the game's item glint (26.2: TextureTransform.setupGlintTexturing, RenderPipelines.GLINT,
  // core/glint.fsh). The glint texture is sampled at the item's atlas UV, scaled x8, rotated 10 degrees
  // and scrolled over time; its colour is multiplied by glintStrength and blended as src*src + dst
  // over the item's opaque pixels only. Defaults: glintSpeed 0.5, glintStrength 0.75.
  const Glint = (() => {
    const ATLAS = 512;          // items atlas size: one 16px sprite spans 16/512 of the atlas UV
    const SCALE = 8;            // GLINT_TEXTURING
    const SPEED = 0.5;          // options.glintSpeed default
    const STRENGTH = 0.75;      // options.glintStrength default
    const TEX = 128;            // enchanted_glint_item.png
    const ROT = Math.PI / 18;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const imgs = new Map();
    const load = (src) => {
      let im = imgs.get(src);
      if (!im) { im = new Image(); im.src = src; imgs.set(src, im); }
      return im;
    };
    const tex = load("assets/glint.png");
    const work = document.createElement("canvas");
    const wctx = work.getContext("2d");
    let pattern = null;
    // Each sprite sits somewhere in the atlas; give each icon a stable, distinct UV origin.
    const origin = (src) => { let h = 0; for (const c of src) h = (h * 31 + c.charCodeAt(0)) >>> 0; return [(h % 32) * 16, ((h >> 5) % 32) * 16]; };

    function draw(cv, now) {
      const src = cv.dataset.src;
      if (!src) return;
      const item = load(src);
      if (!item.complete || !item.naturalWidth || !tex.complete) return;
      const dpr = window.devicePixelRatio || 1;
      const size = Math.round(cv.clientWidth * dpr);
      if (!size) return;
      if (cv.width !== size) { cv.width = size; cv.height = size; }
      if (work.width !== size) { work.width = size; work.height = size; }
      const ctx = cv.getContext("2d");
      ctx.globalCompositeOperation = "source-over";
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(item, 0, 0, size, size);

      // Glint layer: texel = 128 * (R(8 * atlasUV) + (-f, g)), sampled with linear filtering.
      const millis = Math.floor(now * SPEED * 8);
      const f = (millis % 110000) / 110000, g = (millis % 30000) / 30000;
      const [ox, oy] = origin(src);
      const px = size / 16;                      // canvas px per sprite pixel
      const k = (TEX * SCALE) / ATLAS;           // glint texels per sprite pixel (= 2)
      // pattern space (glint texels) -> canvas space
      const m = new DOMMatrix()
        .scale(px / k)
        .translate(-ox * k, -oy * k)
        .rotate(-ROT * 180 / Math.PI)
        .translate(f * TEX, -g * TEX);
      if (!pattern) pattern = wctx.createPattern(tex, "repeat");
      pattern.setTransform(m);
      wctx.globalCompositeOperation = "source-over";
      wctx.imageSmoothingEnabled = true;
      wctx.clearRect(0, 0, size, size);
      wctx.fillStyle = pattern;
      wctx.fillRect(0, 0, size, size);
      // src*src: multiply the layer by itself
      wctx.globalCompositeOperation = "multiply";
      wctx.fillRect(0, 0, size, size);
      // * strength^2 (GlintAlpha is applied before the blend squares the colour)
      wctx.globalCompositeOperation = "source-over";
      wctx.globalAlpha = 1 - STRENGTH * STRENGTH;
      wctx.fillStyle = "#000";
      wctx.fillRect(0, 0, size, size);
      wctx.globalAlpha = 1;
      // only where the item has opaque pixels (cutout, depth EQUAL)
      wctx.globalCompositeOperation = "destination-in";
      wctx.imageSmoothingEnabled = false;
      wctx.drawImage(item, 0, 0, size, size);
      // + dst
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(work, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    }

    let last = 0;
    function frame(t) {
      requestAnimationFrame(frame);
      const step = reduce.matches ? 1000 : 1000 / 30;
      if (t - last < step) return;
      last = t;
      const now = reduce.matches ? 0 : Date.now();
      const vh = innerHeight;
      for (const cv of document.querySelectorAll("canvas.gl")) {
        const r = cv.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh || !r.width) continue;
        draw(cv, now);
      }
    }
    return { start: () => requestAnimationFrame(frame) };
  })();

  // ---------- Boot ----------
  let saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) {}
  lang = saved && T[saved] ? saved : "en";
  L = T[lang];
  readHash();
  addEventListener("hashchange", () => { readHash(); update(ALL); });
  renderScene();
  renderStatic();
  update(ALL);
  Glint.start();
})();
