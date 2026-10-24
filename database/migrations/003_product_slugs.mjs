// 003: give every existing product a readable URL slug (from its name).
import { slugify } from '../slug.mjs';

export default async function up(db) {
  const [rows] = await db.query("SELECT id, name FROM products WHERE slug IS NULL OR slug = '' ORDER BY created_at");
  const [taken] = await db.query("SELECT slug FROM products WHERE slug IS NOT NULL AND slug <> ''");
  const used = new Set(taken.map((r) => r.slug));
  for (const row of rows) {
    const base = slugify(row.name);
    let slug = base;
    for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`;
    used.add(slug);
    await db.query('UPDATE products SET slug = ? WHERE id = ?', [slug, row.id]);
  }
  return `${rows.length} termék kapott URL-t`;
}
