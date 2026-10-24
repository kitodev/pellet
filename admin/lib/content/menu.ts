// Product catalogue structure: areas (main menu items) → categories (submenu items).
// Products themselves live in MySQL; this file defines the menu, the URLs and
// which technical data ("specs") each area's product page shows.
// NOTE: copy of the website file src/lib/content/catalog.ts – keep the two identical.
// (In the admin this file is called menu.ts; the older lib/content/catalog.ts is unused.)

export type AreaKey = 'futoanyagok' | 'takarmanyok' | 'kalyhak-kandallok' | 'kiegeszitok';

export type SpecField = {
  key: string;
  label: string;
  unit?: string;
  type: 'text' | 'number' | 'textarea';
  placeholder?: string;
};

export type Category = { slug: string; name: string; group?: string; short: string; description: string; keywords?: string[] };
export type Area = {
  key: AreaKey;
  label: string;
  title: string;
  intro: string;
  /** Technical data shown on every product page of this area, in this order. */
  specFields: SpecField[];
  categories: Category[];
};

export const areas: Record<AreaKey, Area> = {
  futoanyagok: {
    key: 'futoanyagok', label: 'Fűtőanyagok', title: 'Fűtőanyagok – pellet, brikett, tűzifa',
    intro: 'Fapellet zsákos és raklapos kiszerelésben, prémium és ipari minőségben, valamint brikett, tűzifa és apríték.',
    specFields: [
      { key: 'futoertek', label: 'Fűtőérték', unit: 'MJ/kg', type: 'number', placeholder: 'pl. 17,5' },
      { key: 'hamutartalom', label: 'Hamutartalom', unit: '%', type: 'number', placeholder: 'pl. 0,5' },
      { key: 'nedvesseg', label: 'Nedvességtartalom', unit: '%', type: 'number', placeholder: 'pl. 8' },
      { key: 'atmero', label: 'Átmérő', unit: 'mm', type: 'number', placeholder: 'pl. 6' },
      { key: 'minosites', label: 'Minősítés', type: 'text', placeholder: 'pl. ENplus A1' },
      { key: 'kiszereles', label: 'Kiszerelés', type: 'text', placeholder: 'pl. 15 kg/zsák, 65 zsák/raklap' },
    ],
    categories: [
      { slug: 'fa-pellet', group: 'Pellet', name: 'Fa pellet', short: 'Természetes fapellet', description: 'Tiszta, kéregmentes faanyagból préselt pellet otthoni kályhákhoz és kazánokhoz.', keywords: ['fapellet', 'pellet'] },
      { slug: 'premium-pellet', group: 'Pellet', name: 'Prémium pellet', short: 'Alacsony hamutartalom', description: 'Kiemelt minőségű, alacsony hamutartalmú pellet a ritkább tisztításért és az egyenletes égésért.', keywords: ['A1', 'ENplus'] },
      { slug: 'ipari-pellet', group: 'Pellet', name: 'Ipari pellet', short: 'Nagy fogyasztóknak', description: 'Pellet nagyobb kazánokhoz, üzemekhez és intézményekhez, nagy tételben.' },
      { slug: 'zsakos-pellet', group: 'Pellet', name: 'Pellet zsákos kiszerelésben', short: 'Könnyen tárolható', description: 'Zsákos pellet, amely kis helyen is jól tárolható és egyszerűen adagolható.', keywords: ['zsák'] },
      { slug: 'raklapos-pellet', group: 'Pellet', name: 'Pellet raklapos kiszerelésben', short: 'Egész szezonra', description: 'Raklapos tételek, hogy a teljes fűtési szezonra előre bespájzolhasson.', keywords: ['raklap'] },
      { slug: 'brikett', group: 'Egyéb tüzelőanyagok', name: 'Brikett', short: 'Hosszú égésidő', description: 'Préselt fabrikett kályhákba és kandallókba, egyenletes és hosszan tartó égéssel.' },
      { slug: 'tuzifa', group: 'Egyéb tüzelőanyagok', name: 'Tűzifa', short: 'Hagyományos fűtéshez', description: 'Tűzifa vegyes tüzelésű kazánokhoz, kályhákhoz és kandallókhoz.', keywords: ['fa', 'tüzifa'] },
      { slug: 'apritek', group: 'Egyéb tüzelőanyagok', name: 'Apríték', short: 'Nagy rendszerekhez', description: 'Faapríték apríték-tüzelésű kazánokhoz – elérhetőségről érdeklődjön.' },
    ],
  },
  takarmanyok: {
    key: 'takarmanyok', label: 'Takarmányok', title: 'Takarmányok',
    intro: 'Pelletált és kiegészítő takarmányok lovaknak, szarvasmarhának, sertésnek, baromfinak, nyulaknak és más állatoknak.',
    specFields: [
      { key: 'osszetetel', label: 'Összetétel', type: 'textarea' },
      { key: 'tapertek', label: 'Tápérték', type: 'textarea', placeholder: 'pl. nyersfehérje 16%, nyersrost 18%…' },
      { key: 'kiszereles', label: 'Kiszerelés', type: 'text', placeholder: 'pl. 25 kg/zsák' },
      { key: 'felhasznalas', label: 'Felhasználási javaslat', type: 'textarea' },
    ],
    categories: [
      { slug: 'lo-takarmany', name: 'Ló takarmány', short: 'Lovaknak', description: 'Pelletált takarmányok, lucernapellet és kiegészítők lovak számára.', keywords: ['ló', 'lucerna'] },
      { slug: 'szarvasmarha-takarmany', name: 'Szarvasmarha takarmány', short: 'Szarvasmarháknak', description: 'Takarmányok és kiegészítők tejelő és hústermelő szarvasmarhákhoz.', keywords: ['marha', 'tehén'] },
      { slug: 'sertes-takarmany', name: 'Sertés takarmány', short: 'Sertéseknek', description: 'Takarmányok a sertéstartás különböző szakaszaihoz.', keywords: ['disznó', 'malac'] },
      { slug: 'baromfi-takarmany', name: 'Baromfi takarmány', short: 'Baromfinak', description: 'Tápok tojótyúkoknak, brojlereknek és egyéb baromfinak.', keywords: ['tyúk', 'csirke', 'tojó'] },
      { slug: 'nyul-es-egyeb', name: 'Nyúl és egyéb állatok', short: 'Kisállatoknak', description: 'Takarmány nyulaknak és más kisállatoknak, valamint alom és vitaminok.', keywords: ['nyúl', 'alom', 'vitamin'] },
    ],
  },
  'kalyhak-kandallok': {
    key: 'kalyhak-kandallok', label: 'Kályhák és kandallók', title: 'Kályhák és kandallók',
    intro: 'Pellet- és fatüzelésű kályhák, kandallók, vízteres kályhák és ipari berendezések – szakszerű telepítéssel.',
    specFields: [
      { key: 'teljesitmeny', label: 'Teljesítmény', unit: 'kW', type: 'number', placeholder: 'pl. 9' },
      { key: 'legkobmeter', label: 'Fűthető légköbméter', unit: 'm³', type: 'number', placeholder: 'pl. 230' },
      { key: 'uzemanyag', label: 'Üzemanyag típusa', type: 'text', placeholder: 'pl. fapellet' },
      { key: 'hatasfok', label: 'Hatásfok', unit: '%', type: 'number' },
      { key: 'muszaki', label: 'Műszaki adatok', type: 'textarea', placeholder: 'Méretek, tömeg, füstcső-csatlakozás, tartály mérete…' },
    ],
    categories: [
      { slug: 'pellet-kalyhak', name: 'Pellet kályhák', short: 'Automatikus fűtés', description: 'Programozható pelletkályhák egyenletes, kényelmes fűtéshez.', keywords: ['kazán', 'pelletkályha'] },
      { slug: 'fatuzelesu-kalyhak', name: 'Fatüzelésű kályhák', short: 'Hagyományos meleg', description: 'Fatüzelésű kályhák tűzifához és brikett égetéséhez.', keywords: ['kályha', 'kandalló'] },
      { slug: 'kandallok', name: 'Kandallók', short: 'Látványos tűz', description: 'Kandallók és kandallóbetétek, amelyek fűtenek és hangulatot teremtenek.' },
      { slug: 'vizteres-kalyhak', name: 'Vízteres kályhák', short: 'Központi fűtéshez', description: 'Vízteres kályhák, amelyek a radiátoros vagy padlófűtési rendszert is ellátják.', keywords: ['vízteres', 'radiátor'] },
      { slug: 'ipari-berendezesek', name: 'Ipari berendezések', short: 'Nagy teljesítmény', description: 'Nagy teljesítményű kazánok és berendezések üzemeknek, gazdaságoknak.', keywords: ['kazán', 'ipari'] },
    ],
  },
  kiegeszitok: {
    key: 'kiegeszitok', label: 'Kiegészítők', title: 'Kiegészítők',
    intro: 'Pellettartályok, kéményelemek, füstcsövek, tisztítóeszközök, alkatrészek, termosztátok és ventilátorok.',
    specFields: [
      { key: 'meret', label: 'Méret / átmérő', type: 'text', placeholder: 'pl. Ø 80 mm, 1 m' },
      { key: 'anyag', label: 'Anyag', type: 'text', placeholder: 'pl. saválló acél' },
      { key: 'kompatibilitas', label: 'Kompatibilitás', type: 'text', placeholder: 'Mely kályhákhoz, kazánokhoz' },
      { key: 'muszaki', label: 'Műszaki adatok', type: 'textarea' },
    ],
    categories: [
      { slug: 'pellet-tartalyok', name: 'Pellet tartályok', short: 'Tárolás', description: 'Pellettárolók és -tartályok a kényelmes, tiszta tároláshoz.' },
      { slug: 'kemeny-elemek', name: 'Kémény elemek', short: 'Kéményrendszerek', description: 'Kéményrendszerek és kéményelemek szilárd tüzelésű berendezésekhez.' },
      { slug: 'fustcsovek', name: 'Füstcsövek', short: 'Bekötés', description: 'Füstcsövek, könyökök és idomok a biztonságos füstgáz-elvezetéshez.', keywords: ['füstgáz'] },
      { slug: 'tisztito-eszkozok', name: 'Tisztító eszközök', short: 'Karbantartás', description: 'Hamuporszívók, kefék és tisztítószerek a rendszeres karbantartáshoz.', keywords: ['hamuporszívó', 'porszívó', 'kefe'] },
      { slug: 'alkatreszek', name: 'Alkatrészek', short: 'Pótlás, javítás', description: 'Alkatrészek kályhákhoz és kazánokhoz: tömítések, égőfejek, rostélyok és egyebek.' },
      { slug: 'termosztatok', name: 'Termosztátok', short: 'Szabályozás', description: 'Szobatermosztátok és vezérlők a takarékos, kényelmes fűtéshez.' },
      { slug: 'ventilatorok', name: 'Ventilátorok', short: 'Hőelosztás', description: 'Kályhaventilátorok és légtechnikai eszközök a meleg jobb elosztásához.' },
    ],
  },
};

export const areaKeys = Object.keys(areas) as AreaKey[];
export const isAreaKey = (value: string): value is AreaKey => value in areas;

export function findCategory(area: AreaKey, slug: string) {
  return areas[area].categories.find(c => c.slug === slug);
}

/** Categories grouped for menus: [{ group: 'Pellet', categories: [...] }, …] (group '' = ungrouped). */
export function groupedCategories(area: Area) {
  const groups: { group: string; categories: Category[] }[] = [];
  for (const c of area.categories) {
    const name = c.group ?? '';
    const existing = groups.find(g => g.group === name);
    if (existing) existing.categories.push(c);
    else groups.push({ group: name, categories: [c] });
  }
  return groups;
}

/** Old URLs (before the 2026 menu redesign) → new area/category. */
export const legacyCategories: Record<string, { area: AreaKey; category?: string }> = {
  'biomassza': { area: 'futoanyagok' },
  'biomassza/pellet': { area: 'futoanyagok', category: 'fa-pellet' },
  'biomassza/kazanok': { area: 'kalyhak-kandallok', category: 'pellet-kalyhak' },
  'biomassza/porszivok': { area: 'kiegeszitok', category: 'tisztito-eszkozok' },
  'biomassza/fustgaz-elvezetes': { area: 'kiegeszitok', category: 'fustcsovek' },
  'biomassza/tartozekok': { area: 'kiegeszitok', category: 'pellet-tartalyok' },
  'takarmany': { area: 'takarmanyok' },
  'takarmany/takarmanypellet': { area: 'takarmanyok', category: 'lo-takarmany' },
  'takarmany/alom': { area: 'takarmanyok', category: 'nyul-es-egyeb' },
  'takarmany/vitaminok': { area: 'takarmanyok', category: 'nyul-es-egyeb' },
  'takarmany/kiegeszitok': { area: 'kiegeszitok', category: 'alkatreszek' },
};

export type SearchHit = { title: string; text: string; to: string; params?: Record<string, string> };
const pages: SearchHit[] = [
  { title: 'Szolgáltatások', text: 'Kályha telepítés, karbantartás, szerviz, szállítás, beüzemelés, tanácsadás', to: '/szolgaltatasok' },
  { title: 'Tudástár', text: 'Blog, cikkek, útmutatók pellethez, fűtéshez és takarmányozáshoz', to: '/blog' },
  { title: 'Rólunk', text: 'Bemutatkozás, küldetés, telephely, referenciák, minősítések', to: '/rolunk' },
  { title: 'Kapcsolat', text: 'Telefon, e-mail, térkép, nyitvatartás, üzenet', to: '/kapcsolat' },
  { title: 'Kazánkalkulátor', text: 'Hőigény, kályha és kazán teljesítmény becslés', to: '/kalkulator' },
  { title: 'Árajánlatkérés', text: 'Ajánlat, ár, rendelés', to: '/arajanlat' },
];

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function searchSite(query: string): SearchHit[] {
  const q = norm(query.trim());
  if (!q) return [];
  const hits: SearchHit[] = [...pages];
  for (const area of Object.values(areas)) {
    hits.push({ title: area.label, text: area.intro, to: '/$terulet', params: { terulet: area.key } });
    for (const c of area.categories) hits.push({ title: `${c.name} – ${area.label}`, text: `${c.description} ${(c.keywords ?? []).join(' ')}`, to: '/$terulet/$kategoria', params: { terulet: area.key, kategoria: c.slug } });
  }
  return hits.filter(h => norm(`${h.title} ${h.text}`).includes(q));
}
