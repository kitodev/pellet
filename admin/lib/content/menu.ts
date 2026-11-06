// Product catalogue structure (2026-11, "Pelletcentrum weboldal váz.xlsx"):
//   area (Termékek → Tüzelőanyagok / Takarmányok / Fűtési megoldások)
//     → section (e.g. Fűtő pelletek; shown as a tile)
//       → category (e.g. A1 fapellet; products belong to these)
// A category can also have a `subgroup` (Biomassza kazánok → Lakossági / Ipari / Nagyipari).
// Products themselves live in MySQL; this file defines the menu, the URLs and
// which technical data ("specs") each area's product page shows.
// NOTE: copy of the website file src/lib/content/catalog.ts – keep the two identical.
// (In the admin this file is called menu.ts; the older lib/content/catalog.ts is unused.)

export type AreaKey = "futoanyagok" | "takarmanyok" | "futesi-megoldasok";

export type SpecField = {
  key: string;
  label: string;
  unit?: string;
  type: "text" | "number" | "textarea";
  placeholder?: string;
};

/** A tile on the Termékek page; opens a page with the tiles of its categories. */
export type Section = {
  slug: string;
  name: string;
  short: string;
  description: string;
};

/** Products are assigned to categories. */
export type Category = {
  slug: string;
  name: string;
  /** slug of the Section it belongs to */
  section: string;
  /** optional third level inside the section (e.g. "Lakossági") */
  subgroup?: string;
  short: string;
  description: string;
  keywords?: string[];
};
export type Area = {
  key: AreaKey;
  label: string;
  title: string;
  intro: string;
  /** Technical data shown on every product page of this area, in this order. */
  specFields: SpecField[];
  sections: Section[];
  categories: Category[];
};

export const areas: Record<AreaKey, Area> = {
  futoanyagok: {
    key: "futoanyagok",
    label: "Tüzelőanyagok",
    title: "Tüzelőanyagok – fűtő pelletek és brikettek",
    intro:
      "A1 fapellet, ipari pellet és szalmapellet zsákos és raklapos kiszerelésben, valamint brikettek.",
    specFields: [
      {
        key: "futoertek",
        label: "Fűtőérték",
        unit: "MJ/kg",
        type: "number",
        placeholder: "pl. 17,5",
      },
      {
        key: "hamutartalom",
        label: "Hamutartalom",
        unit: "%",
        type: "number",
        placeholder: "pl. 0,5",
      },
      {
        key: "nedvesseg",
        label: "Nedvességtartalom",
        unit: "%",
        type: "number",
        placeholder: "pl. 8",
      },
      { key: "atmero", label: "Átmérő", unit: "mm", type: "number", placeholder: "pl. 6" },
      { key: "minosites", label: "Minősítés", type: "text", placeholder: "pl. ENplus A1" },
      {
        key: "kiszereles",
        label: "Kiszerelés",
        type: "text",
        placeholder: "pl. 15 kg/zsák, 65 zsák/raklap",
      },
    ],
    sections: [
      {
        slug: "futo-pelletek",
        name: "Fűtő pelletek",
        short: "Fapellet, ipari és szalmapellet",
        description:
          "Pellet otthoni kályhákhoz és kazánokhoz, valamint nagyobb fűtési rendszerekhez.",
      },
      {
        slug: "brikettek",
        name: "Brikettek",
        short: "Hosszú égésidő",
        description: "Préselt brikett kályhákba, kandallókba és vegyes tüzelésű kazánokba.",
      },
    ],
    categories: [
      {
        slug: "a1-fapellet",
        section: "futo-pelletek",
        name: "A1 fapellet",
        short: "Prémium minőség",
        description:
          "Tiszta, kéregmentes faanyagból préselt, alacsony hamutartalmú A1 minőségű fapellet otthoni kályhákhoz és kazánokhoz.",
        keywords: ["fapellet", "pellet", "ENplus", "prémium", "zsák", "raklap"],
      },
      {
        slug: "ipari-pellet",
        section: "futo-pelletek",
        name: "Ipari pellet",
        short: "Nagy fogyasztóknak",
        description: "Pellet nagyobb kazánokhoz, üzemekhez és intézményekhez, nagy tételben.",
      },
      {
        slug: "szalma-pellet",
        section: "futo-pelletek",
        name: "Szalma pellet",
        short: "Gazdaságos tüzelőanyag",
        description: "Szalmából préselt pellet erre alkalmas biomassza-kazánokhoz.",
        keywords: ["szalmapellet"],
      },
      {
        slug: "brikett",
        section: "brikettek",
        name: "Brikett",
        short: "Hosszú égésidő",
        description:
          "Préselt brikett kályhákba és kandallókba, egyenletes és hosszan tartó égéssel.",
        keywords: ["fabrikett"],
      },
    ],
  },
  takarmanyok: {
    key: "takarmanyok",
    label: "Takarmányok",
    title: "Takarmányok – takarmány pelletek és ló müzlik",
    intro: "Cukorrépa-, széna- és lucernapellet, valamint ló müzlik.",
    specFields: [
      { key: "osszetetel", label: "Összetétel", type: "textarea" },
      {
        key: "tapertek",
        label: "Tápérték",
        type: "textarea",
        placeholder: "pl. nyersfehérje 16%, nyersrost 18%…",
      },
      { key: "kiszereles", label: "Kiszerelés", type: "text", placeholder: "pl. 25 kg/zsák" },
      { key: "felhasznalas", label: "Felhasználási javaslat", type: "textarea" },
    ],
    sections: [
      {
        slug: "takarmany-pelletek",
        name: "Takarmány pelletek",
        short: "Cukorrépa, széna, lucerna",
        description: "Pelletált takarmányok lovaknak és más haszonállatoknak.",
      },
      {
        slug: "lo-muzlik",
        name: "Ló müzlik",
        short: "Lovaknak",
        description: "Ízletes, kiegyensúlyozott müzlik lovak számára.",
      },
    ],
    categories: [
      {
        slug: "cukorrepa-pellet",
        section: "takarmany-pelletek",
        name: "Cukorrépa pellet",
        short: "Energiadús",
        description: "Cukorrépaszelet-pellet energiadús, rostban gazdag takarmányozáshoz.",
        keywords: ["cukorrépa", "répaszelet"],
      },
      {
        slug: "szena-pellet",
        section: "takarmany-pelletek",
        name: "Széna pellet",
        short: "Rostban gazdag",
        description: "Pelletált széna, amely kis helyen tárolható és pormentesen etethető.",
        keywords: ["széna"],
      },
      {
        slug: "lucerna-pellet",
        section: "takarmany-pelletek",
        name: "Lucerna pellet",
        short: "Magas fehérjetartalom",
        description: "Lucernapellet lovaknak és más állatoknak, magas fehérjetartalommal.",
        keywords: ["lucerna", "ló"],
      },
      {
        slug: "lo-muzli",
        section: "lo-muzlik",
        name: "Ló müzli",
        short: "Lovaknak",
        description: "Müzlik lovak napi takarmányozásához és kiegészítéséhez.",
        keywords: ["ló", "lótáp", "müzli"],
      },
    ],
  },
  "futesi-megoldasok": {
    key: "futesi-megoldasok",
    label: "Fűtési megoldások",
    title: "Fűtési megoldások – pellet kályhák, kazánok, kiegészítők",
    intro:
      "Pellet tüzelésű kályhák és kazánok, lakossági és ipari biomassza-kazánok, valamint füstcsövek, hamuporszívók és alkatrészek.",
    specFields: [
      { key: "gyarto", label: "Gyártó", type: "text", placeholder: "pl. a gyártó neve" },
      {
        key: "teljesitmeny",
        label: "Teljesítmény",
        unit: "kW",
        type: "number",
        placeholder: "pl. 9",
      },
      {
        key: "legkobmeter",
        label: "Fűthető légköbméter",
        unit: "m³",
        type: "number",
        placeholder: "pl. 230",
      },
      { key: "uzemanyag", label: "Üzemanyag típusa", type: "text", placeholder: "pl. fapellet" },
      { key: "hatasfok", label: "Hatásfok", unit: "%", type: "number" },
      { key: "meret", label: "Méret / átmérő", type: "text", placeholder: "pl. Ø 80 mm, 1 m" },
      { key: "anyag", label: "Anyag", type: "text", placeholder: "pl. saválló acél" },
      {
        key: "kompatibilitas",
        label: "Kompatibilitás",
        type: "text",
        placeholder: "Mely kályhákhoz, kazánokhoz",
      },
      {
        key: "muszaki",
        label: "Műszaki adatok",
        type: "textarea",
        placeholder: "Méretek, tömeg, füstcső-csatlakozás, tartály mérete…",
      },
    ],
    sections: [
      {
        slug: "pellet-kalyhak",
        name: "Pellet tüzelésű kályhák",
        short: "Levegős, vízteres, légcsatornázható",
        description: "Programozható pelletkályhák egyenletes, kényelmes fűtéshez.",
      },
      {
        slug: "pellet-kazanok",
        name: "Pellet tüzelésű kazánok",
        short: "Központi fűtéshez",
        description: "Pellet kazánok radiátoros és padlófűtési rendszerekhez, gyártók szerint.",
      },
      {
        slug: "biomassza-kazanok",
        name: "Biomassza tüzelésű kazánok",
        short: "Lakossági, ipari, nagyipari",
        description:
          "Biomassza-kazánok vízteres és légbefúvós kivitelben, családi házaktól az ipari létesítményekig.",
      },
      {
        slug: "kiegeszitok",
        name: "Kiegészítők",
        short: "Füstcsövek, hamuporszívók, alkatrészek",
        description: "Minden, ami a biztonságos és kényelmes fűtéshez kell.",
      },
    ],
    categories: [
      {
        slug: "levegos-pellet-kalyhak",
        section: "pellet-kalyhak",
        name: "Levegős pellet kályhák",
        short: "A helyiség levegőjét fűti",
        description: "Pelletkályhák, amelyek közvetlenül a helyiség levegőjét melegítik.",
        keywords: ["pelletkályha", "kályha"],
      },
      {
        slug: "vizteres-pellet-kalyhak",
        section: "pellet-kalyhak",
        name: "Vízteres pellet kályhák",
        short: "Központi fűtéshez",
        description:
          "Vízteres pelletkályhák, amelyek a radiátoros vagy padlófűtési rendszert is ellátják.",
        keywords: ["vízteres", "radiátor", "kályha"],
      },
      {
        slug: "legcsatornazhato-pellet-kalyhak",
        section: "pellet-kalyhak",
        name: "Légcsatornázható pellet kályhák",
        short: "Több helyiség fűtése",
        description: "Pelletkályhák, amelyek légcsatornákon keresztül több helyiséget is fűtenek.",
        keywords: ["légcsatorna", "kályha"],
      },
      {
        slug: "pellet-kazanok-gyartok",
        section: "pellet-kazanok",
        name: "Pellet kazánok",
        short: "Gyártók szerint",
        description: "Pellet tüzelésű kazánok – a termékeket gyártók szerint csoportosítjuk.",
        keywords: ["kazán", "pelletkazán"],
      },
      {
        slug: "lakossagi-vizteres",
        section: "biomassza-kazanok",
        subgroup: "Lakossági",
        name: "Lakossági vízteres kazánok",
        short: "Családi házakhoz",
        description: "Vízteres biomassza-kazánok családi házak központi fűtéséhez.",
        keywords: ["kazán", "biomassza"],
      },
      {
        slug: "lakossagi-legbefuvos",
        section: "biomassza-kazanok",
        subgroup: "Lakossági",
        name: "Lakossági légbefúvós kazánok",
        short: "Meleg levegős fűtés",
        description: "Légbefúvós biomassza-kazánok lakások, házak, műhelyek fűtésére.",
        keywords: ["kazán", "biomassza", "hőlégfúvó"],
      },
      {
        slug: "ipari-vizteres",
        section: "biomassza-kazanok",
        subgroup: "Ipari",
        name: "Ipari vízteres kazánok",
        short: "Üzemeknek, gazdaságoknak",
        description: "Nagyobb teljesítményű vízteres biomassza-kazánok üzemeknek és gazdaságoknak.",
        keywords: ["kazán", "ipari"],
      },
      {
        slug: "ipari-legbefuvos",
        section: "biomassza-kazanok",
        subgroup: "Ipari",
        name: "Ipari légbefúvós kazánok",
        short: "Csarnokok fűtése",
        description: "Légbefúvós biomassza-kazánok csarnokok, üzemek, fóliasátrak fűtésére.",
        keywords: ["kazán", "ipari"],
      },
      {
        slug: "nagyipari-vizteres",
        section: "biomassza-kazanok",
        subgroup: "Nagyipari",
        name: "Nagyipari vízteres kazánok",
        short: "Nagy teljesítmény",
        description: "Nagy teljesítményű vízteres biomassza-kazánok ipari létesítményekhez.",
        keywords: ["kazán", "nagyipari"],
      },
      {
        slug: "nagyipari-kazanok",
        section: "biomassza-kazanok",
        subgroup: "Nagyipari",
        name: "Nagyipari kazánok",
        short: "Egyedi rendszerek",
        description: "Nagyipari biomassza-kazánrendszerek egyedi méretezéssel.",
        keywords: ["kazán", "nagyipari"],
      },
      {
        slug: "fustcsovek",
        section: "kiegeszitok",
        name: "Füstcsövek",
        short: "Bekötés",
        description: "Füstcsövek, könyökök és idomok a biztonságos füstgáz-elvezetéshez.",
        keywords: ["füstgáz", "kémény"],
      },
      {
        slug: "hamu-porszivok",
        section: "kiegeszitok",
        name: "Hamu porszívók",
        short: "Tisztítás",
        description: "Hamuporszívók a kályhák és kazánok gyors, tiszta karbantartásához.",
        keywords: ["hamuporszívó", "porszívó", "tisztítás"],
      },
      {
        slug: "alkatreszek",
        section: "kiegeszitok",
        name: "Alkatrészek",
        short: "Pótlás, javítás",
        description:
          "Alkatrészek kályhákhoz és kazánokhoz: tömítések, égőfejek, rostélyok és egyebek.",
      },
    ],
  },
};

export const areaKeys = Object.keys(areas) as AreaKey[];
/** Order of the product areas on the Termékek page and in the TERMÉKEK menu. */
export const productAreas: AreaKey[] = ["futoanyagok", "takarmanyok", "futesi-megoldasok"];
export const isAreaKey = (value: string): value is AreaKey => value in areas;

export function findCategory(area: AreaKey, slug: string) {
  return areas[area].categories.find((c) => c.slug === slug);
}
export function findSection(area: AreaKey, slug: string) {
  return areas[area].sections.find((s) => s.slug === slug);
}

/** Categories of a section, grouped by subgroup: [{ subgroup: 'Lakossági', categories }] ('' = none). */
export function subgroupsOf(area: Pick<Area, "categories">, section: string) {
  const groups: { subgroup: string; categories: Category[] }[] = [];
  for (const c of area.categories.filter((x) => x.section === section)) {
    const name = c.subgroup ?? "";
    const existing = groups.find((g) => g.subgroup === name);
    if (existing) existing.categories.push(c);
    else groups.push({ subgroup: name, categories: [c] });
  }
  return groups;
}

/** Categories grouped by section, for menus and the admin: [{ group: 'Fűtő pelletek', categories }]. */
export function groupedCategories(area: Pick<Area, "sections" | "categories">) {
  return area.sections
    .map((s) => ({
      group: s.name,
      section: s,
      categories: area.categories.filter((c) => c.section === s.slug),
    }))
    .filter((g) => g.categories.length);
}

/**
 * Where a section tile links to: a section with a single category opens that category
 * directly (e.g. Brikettek → Brikett); otherwise the section page with the category tiles.
 */
export function sectionTarget(area: Pick<Area, "categories">, section: string) {
  const cats = area.categories.filter((c) => c.section === section);
  return cats.length === 1 ? cats[0]!.slug : section;
}

/** Old URLs (before the 2026 menu redesign) → new area/category. */
export const legacyCategories: Record<string, { area: AreaKey; category?: string }> = {
  "biomassza/pellet": { area: "futoanyagok", category: "a1-fapellet" },
  "biomassza/kazanok": { area: "futesi-megoldasok", category: "pellet-kalyhak" },
  "biomassza/porszivok": { area: "futesi-megoldasok", category: "hamu-porszivok" },
  "biomassza/fustgaz-elvezetes": { area: "futesi-megoldasok", category: "fustcsovek" },
  "biomassza/tartozekok": { area: "futesi-megoldasok", category: "kiegeszitok" },
  takarmany: { area: "takarmanyok" },
  "takarmany/takarmanypellet": { area: "takarmanyok", category: "takarmany-pelletek" },
  "takarmany/alom": { area: "takarmanyok" },
  "takarmany/vitaminok": { area: "takarmanyok" },
  "takarmany/kiegeszitok": { area: "futesi-megoldasok", category: "alkatreszek" },
};

/**
 * Areas / categories renamed in the 2026-11 restructure (xlsx) → their new place,
 * so old links (and product URLs) keep working with a permanent redirect.
 */
export const renamedAreas: Record<string, AreaKey> = {
  "kalyhak-kandallok": "futesi-megoldasok",
  kiegeszitok: "futesi-megoldasok",
};
export const renamedCategories: Record<string, { area: AreaKey; category?: string }> = {
  "futoanyagok/fa-pellet": { area: "futoanyagok", category: "a1-fapellet" },
  "futoanyagok/premium-pellet": { area: "futoanyagok", category: "a1-fapellet" },
  "futoanyagok/zsakos-pellet": { area: "futoanyagok", category: "a1-fapellet" },
  "futoanyagok/raklapos-pellet": { area: "futoanyagok", category: "a1-fapellet" },
  "futoanyagok/tuzifa": { area: "futoanyagok" },
  "futoanyagok/apritek": { area: "futoanyagok" },
  "takarmanyok/lo-takarmany": { area: "takarmanyok", category: "lucerna-pellet" },
  "takarmanyok/szarvasmarha-takarmany": { area: "takarmanyok" },
  "takarmanyok/sertes-takarmany": { area: "takarmanyok" },
  "takarmanyok/baromfi-takarmany": { area: "takarmanyok" },
  "takarmanyok/nyul-es-egyeb": { area: "takarmanyok" },
  "kalyhak-kandallok/pellet-kalyhak": { area: "futesi-megoldasok", category: "pellet-kalyhak" },
  "kalyhak-kandallok/vizteres-kalyhak": {
    area: "futesi-megoldasok",
    category: "vizteres-pellet-kalyhak",
  },
  "kalyhak-kandallok/ipari-berendezesek": {
    area: "futesi-megoldasok",
    category: "biomassza-kazanok",
  },
  "kiegeszitok/fustcsovek": { area: "futesi-megoldasok", category: "fustcsovek" },
  "kiegeszitok/kemeny-elemek": { area: "futesi-megoldasok", category: "fustcsovek" },
  "kiegeszitok/tisztito-eszkozok": { area: "futesi-megoldasok", category: "hamu-porszivok" },
  "kiegeszitok/alkatreszek": { area: "futesi-megoldasok", category: "alkatreszek" },
};

/** New place of an old /area/category URL (null = it is a current one / unknown). */
export function renamedTarget(area: string, category?: string) {
  if (category) {
    const hit = renamedCategories[`${area}/${category}`];
    if (hit) return hit;
  }
  const newArea = renamedAreas[area];
  if (newArea) return { area: newArea };
  return null;
}

export type SearchHit = {
  title: string;
  text: string;
  to: string;
  params?: Record<string, string>;
};
const pages: SearchHit[] = [
  {
    title: "Termékek",
    text: "Összes termékkategória: fűtőanyag, pellet, takarmány, kályha, kandalló, kiegészítő",
    to: "/termekek",
  },
  {
    title: "Szolgáltatások",
    text: "Kályha telepítés, karbantartás, szerviz, szállítás, beüzemelés, tanácsadás",
    to: "/szolgaltatasok",
  },
  {
    title: "Tudástár",
    text: "Blog, cikkek, útmutatók pellethez, fűtéshez és takarmányozáshoz",
    to: "/blog",
  },
  {
    title: "Rólunk",
    text: "Bemutatkozás, küldetés, telephely, referenciák, minősítések",
    to: "/rolunk",
  },
  { title: "Kapcsolat", text: "Telefon, e-mail, térkép, nyitvatartás, üzenet", to: "/kapcsolat" },
  {
    title: "Kazánkalkulátor",
    text: "Hőigény, kályha és kazán teljesítmény becslés",
    to: "/kalkulator",
  },
  { title: "Árajánlatkérés", text: "Ajánlat, ár, rendelés", to: "/arajanlat" },
  {
    title: "Biomassza",
    text: "Biomassza fűtés, megújuló energia, pellet, brikett, biomassza-kazán",
    to: "/biomassza",
  },
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function searchSite(query: string): SearchHit[] {
  const q = norm(query.trim());
  if (!q) return [];
  const hits: SearchHit[] = [...pages];
  for (const area of Object.values(areas)) {
    hits.push({
      title: area.label,
      text: area.intro,
      to: "/$terulet",
      params: { terulet: area.key },
    });
    for (const sec of area.sections)
      hits.push({
        title: `${sec.name} – ${area.label}`,
        text: `${sec.short} ${sec.description}`,
        to: "/$terulet/$kategoria",
        params: { terulet: area.key, kategoria: sec.slug },
      });
    for (const c of area.categories)
      hits.push({
        title: `${c.name} – ${area.label}`,
        text: `${c.description} ${(c.keywords ?? []).join(" ")}`,
        to: "/$terulet/$kategoria",
        params: { terulet: area.key, kategoria: c.slug },
      });
  }
  return hits.filter((h) => norm(`${h.title} ${h.text}`).includes(q));
}
