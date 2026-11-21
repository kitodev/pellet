// 008: brand from the old "gyarto" field + sample full product page – "ENplus A1 fapellet – 6 mm, 15 kg" (Tüzelőanyagok › A1 fapellet).
// Published right away so the new product page can be seen; complete it in the admin
// (manufacturer, certificate ID, photos, price). The values are the ENplus A1 limit values.
import { randomUUID } from "node:crypto";

export default async function up(db) {
  // The manufacturer used to be a technical field ("gyarto") – copy it to the new brand column.
  const [withSpecs] = await db.query(
    "SELECT id, specs FROM products WHERE brand = '' AND specs IS NOT NULL AND specs <> ''",
  );
  for (const row of withSpecs) {
    try {
      const gyarto = JSON.parse(row.specs)?.gyarto;
      if (typeof gyarto === "string" && gyarto.trim())
        await db.query("UPDATE products SET brand = ? WHERE id = ?", [
          gyarto.trim().slice(0, 120),
          row.id,
        ]);
    } catch {
      // invalid JSON – skip
    }
  }

  const slug = "enplus-a1-fapellet-6-mm-15-kg";
  const [rows] = await db.query("SELECT id FROM products WHERE slug = ?", [slug]);
  if (rows.length) return "már létezik";
  const specs = {
    alapanyag: "100% természetes faanyag (fűrészpor, faforgács), kötőanyag és adalék nélkül",
    minosites: "ENplus A1",
    atmero: "6",
    futoertek: "≥ 16,5",
    hamutartalom: "≤ 0,7",
    nedvesseg: "≤ 10",
    kiszereles: "15 kg/zsák",
  };
  await db.query(
    `INSERT INTO products (id, slug, area, category, name, brand, short_description, description, price, sale_price, price_unit,
       specs, image_path, datasheet_path, featured, published, sort_order, packaging, highlights, stock_status, price_mode,
       price_note, seo_title, meta_description, keywords, image_alt)
     VALUES (?, ?, 'futoanyagok', 'a1-fapellet', ?, '', ?, ?, NULL, NULL, 'Ft/zsák', ?, '', '', 1, 1, 0, ?, ?, 'in_stock', 'quantity', ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      slug,
      "ENplus A1 fapellet – 6 mm, 15 kg",
      "Prémium minőségű, ENplus A1 minősítésű fapellet 6 mm-es átmérővel, 15 kg-os zsákban. Alacsony hamutartalma és egyenletes égése miatt kiválóan alkalmas pelletkályhákhoz és -kazánokhoz. Zsákos és raklapos tételben is rendelhető, telephelyi átvétellel vagy kiszállítással.",
      [
        "Az ENplus A1 a fapellet legmagasabb minőségi osztálya: a gyártás és a szállítás minden lépését független tanúsító ellenőrzi, így a pellet tulajdonságai zsákról zsákra azonosak.",
        "",
        "A természetes faanyagból, kötőanyag nélkül préselt pellet egyenletesen és kevés hamuval ég. Ez ritkább tisztítást, kevesebb karbantartást és a kályha vagy kazán hosszabb élettartamát jelenti.",
        "",
        "Felhasználás: pelletkályhákhoz, vízteres pelletkandallókhoz és pelletkazánokhoz, amelyek 6 mm-es pellet használatára alkalmasak.",
        "",
        "Tárolás: száraz, fedett helyen, raklapon tárolja; a zsákot közvetlenül a felhasználás előtt bontsa ki.",
      ].join("\n"),
      JSON.stringify(specs),
      "15 kg/zsák",
      [
        "ENplus A1 minősítés – a legmagasabb pelletminőség",
        "Alacsony hamutartalom (≤ 0,7%)",
        "Magas fűtőérték (≥ 16,5 MJ/kg)",
        "6 mm átmérő – pelletkályhákhoz és -kazánokhoz",
        "Zsákos és raklapos kiszerelés",
      ].join("\n"),
      "Az ár a mennyiségtől és a szállítási címtől függ – raklapos tételre kedvezményes ajánlatot adunk.",
      "ENplus A1 fapellet 6 mm, 15 kg – zsákos és raklapos",
      "ENplus A1 minősítésű fapellet 6 mm-es átmérővel, 15 kg-os zsákban. Alacsony hamutartalom, magas fűtőérték – kérjen árajánlatot zsákos vagy raklapos tételre.",
      "ENplus A1 fapellet, fapellet 15 kg, pellet 6 mm, prémium pellet, raklapos pellet, Székesfehérvár",
      "ENplus A1 fapellet 15 kg-os zsákban",
    ],
  );
  return "mintatermék létrehozva (látható)";
}
