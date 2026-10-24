export type AreaKey = 'biomassza' | 'takarmany';
export type Category = { slug: string; name: string; short: string; description: string; items: string[] };
export type Area = { key: AreaKey; title: string; label: string; intro: string; categories: Category[] };

export const areas: Record<AreaKey, Area> = {
  biomassza: {
    key: 'biomassza', label: 'Biomassza', title: 'Pellet mint tüzelőanyag',
    intro: 'Fapellet, kazánok és minden kiegészítő, ami a tiszta, kényelmes és gazdaságos fűtéshez kell.',
    categories: [
      { slug: 'pellet', name: 'Fűtőpellet', short: 'Természetes fapellet és brikett', description: 'Egyenletes égésű, magas fűtőértékű fapellet otthoni és ipari kazánokhoz.', items: ['Fapellet zsákos kiszerelésben', 'Fapellet raklapos tétel', 'Fabrikett'] },
      { slug: 'kazanok', name: 'Kazánok', short: 'Pellet- és biomassza kazánok', description: 'Korszerű kazánok családi házakhoz és nagyobb épületekhez, az épület hőigényéhez méretezve.', items: ['Pelletkazánok', 'Kombinált biomassza kazánok', 'Pelletégők'] },
      { slug: 'porszivok', name: 'Hamuporszívók', short: 'Tisztítás egyszerűen', description: 'Hamuporszívók és tisztítóeszközök a kazán és a kályha rendszeres karbantartásához.', items: ['Hamuporszívók', 'Szűrők és tartozékok', 'Tisztítókefék'] },
      { slug: 'fustgaz-elvezetes', name: 'Füstgáz-elvezetés', short: 'Kémény és bekötés', description: 'Füstcsövek, idomok és bekötési elemek a biztonságos füstgáz-elvezetéshez.', items: ['Füstcsövek és könyökök', 'Kéményrendszerek', 'Huzatszabályzók'] },
      { slug: 'tartozekok', name: 'Tartozékok', short: 'Tárolás és adagolás', description: 'Pellettárolók, adagolók és kiegészítők a kényelmes üzemeltetéshez.', items: ['Pellettárolók', 'Adagolócsigák', 'Termosztátok'] },
    ],
  },
  takarmany: {
    key: 'takarmany', label: 'Pelletált takarmányok', title: 'Pellet mint takarmány',
    intro: 'Pelletált takarmányok, alom és kiegészítők az állatok egészséges, kiegyensúlyozott tartásához.',
    categories: [
      { slug: 'takarmanypellet', name: 'Takarmánypellet', short: 'Pelletált takarmányok', description: 'Pelletált takarmányok lovak, haszonállatok és kisállatok számára.', items: ['Lucernapellet', 'Lótakarmány', 'Baromfi- és nyúltáp'] },
      { slug: 'alom', name: 'Alom', short: 'Pelletált alom', description: 'Jó nedvszívó képességű pelletált alom istállóba és kisállatoknak.', items: ['Faforgács-alompellet', 'Szalmapellet alom', 'Kisállatalom'] },
      { slug: 'vitaminok', name: 'Vitaminok', short: 'Vitaminok és ásványi anyagok', description: 'Vitamin- és ásványianyag-kiegészítők az állatok jó közérzetéért.', items: ['Vitaminkészítmények', 'Nyalósók', 'Ásványi keverékek'] },
      { slug: 'kiegeszitok', name: 'Kiegészítők', short: 'Etetés és tárolás', description: 'Etetők, tárolóedények és kiegészítők a mindennapi állattartáshoz.', items: ['Etetők és itatók', 'Takarmánytárolók', 'Adagolóeszközök'] },
    ],
  },
};

export function findCategory(area: AreaKey, slug: string) {
  return areas[area].categories.find(c => c.slug === slug);
}

export type SearchHit = { title: string; text: string; to: string; params?: Record<string, string> };
const pages: SearchHit[] = [
  { title: 'Rólunk', text: 'Bemutatkozás, céginformáció', to: '/rolunk' },
  { title: 'Miért válasszon minket', text: 'Előnyeink, minőség, szakértelem', to: '/miert-minket' },
  { title: 'Kazánkalkulátor', text: 'Hőigény, kazán teljesítmény becslés', to: '/kalkulator' },
  { title: 'Szerviz', text: 'Beüzemelés, karbantartás, javítás, kazán', to: '/szerviz' },
  { title: 'Kapcsolat', text: 'Elérhetőség, üzenet', to: '/kapcsolat' },
  { title: 'Árajánlatkérés', text: 'Ajánlat, ár, rendelés', to: '/arajanlat' },
];

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function searchSite(query: string): SearchHit[] {
  const q = norm(query.trim());
  if (!q) return [];
  const hits: SearchHit[] = [...pages];
  for (const area of Object.values(areas)) {
    hits.push({ title: area.title, text: area.intro, to: `/${area.key}` });
    for (const c of area.categories) hits.push({ title: `${c.name} – ${area.label}`, text: `${c.description} ${c.items.join(', ')}`, to: `/${area.key}/$kategoria`, params: { kategoria: c.slug } });
  }
  return hits.filter(h => norm(`${h.title} ${h.text}`).includes(q));
}
