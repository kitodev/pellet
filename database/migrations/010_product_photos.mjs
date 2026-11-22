// 010: main picture + gallery for every product that has no picture yet, from the website's own
// photos (public/termekkepek). Illustrations only – replace them in the admin with real product photos.
// Products that already have a main picture or gallery images are left untouched.
import { randomUUID } from "node:crypto";

const img = (n) => `/termekkepek/${n}.jpg`;

/** picture sets: [main, ...gallery] */
const SETS = {
  wood: ["fapellet", "fapellet-kozeli", "pellet-zsak", "pellet-raktar", "pellet-adagolas"],
  feed: ["takarmanypellet", "takarmanypellet-kozeli", "lo-istalloban"],
  briquette: ["pelletkalyha", "pellet-zsak", "pellet-raktar"],
  stove: ["pelletkalyha", "pellet-zsak", "fapellet", "fapellet-lapat"],
  boiler: ["pelletkazan", "kazanhaz", "pellet-adagolas", "pellet-raktar", "fapellet"],
  accessory: ["kazanhaz", "pelletkazan", "pelletkalyha"],
};

const BY_CATEGORY = {
  "a1-fapellet": "wood",
  "ipari-pellet": "wood",
  "szalma-pellet": "wood",
  brikett: "briquette",
  "cukorrepa-pellet": "feed",
  "szena-pellet": "feed",
  "lucerna-pellet": "feed",
  "lo-muzli": "feed",
  "levegos-pellet-kalyhak": "stove",
  "vizteres-pellet-kalyhak": "stove",
  "legcsatornazhato-pellet-kalyhak": "stove",
  "hamu-porszivok": "stove",
};
const BY_AREA = { futoanyagok: "wood", takarmanyok: "feed", "futesi-megoldasok": "boiler" };
const ACCESSORY = ["fustcsovek", "alkatreszek"];

export default async function up(db) {
  const [products] = await db.query(
    `SELECT p.id, p.area, p.category, p.image_path,
            (SELECT COUNT(*) FROM product_images i WHERE i.product_id = p.id) AS gallery
       FROM products p`,
  );
  let done = 0;
  for (const p of products) {
    if (p.image_path || Number(p.gallery) > 0) continue;
    const key = ACCESSORY.includes(p.category)
      ? "accessory"
      : (BY_CATEGORY[p.category] ?? BY_AREA[p.area] ?? "wood");
    const [main, ...gallery] = SETS[key];
    await db.query("UPDATE products SET image_path = ? WHERE id = ?", [img(main), p.id]);
    for (const [n, g] of gallery.entries())
      await db.query(
        "INSERT INTO product_images (id, product_id, path, sort_order) VALUES (?, ?, ?, ?)",
        [randomUUID(), p.id, img(g), n + 1],
      );
    done++;
  }
  return `${done} termékhez kerültek képek`;
}
