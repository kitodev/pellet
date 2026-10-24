// One-time copy of the website data from Supabase to MySQL.
// Copies: site_texts, products, and product images (to UPLOADS_DIR/products).
// Users/passwords can't be read with the public key – create admins with `pnpm db:create-admin`.
//
// Usage:  pnpm db:migrate-data
// Needs in .env: SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY. Optional: DATABASE_URL (default: XAMPP root@127.0.0.1/pellet), UPLOADS_DIR (default ./uploads)
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';

const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env;
const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/pellet';
const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || 'uploads');
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Hiányzik a SUPABASE_URL vagy SUPABASE_PUBLISHABLE_KEY a .env fájlból.');
  process.exit(1);
}

const base = SUPABASE_URL.replace(/\/+$/, '');
const headers = { apikey: SUPABASE_PUBLISHABLE_KEY };
if (!SUPABASE_PUBLISHABLE_KEY.startsWith('sb_')) headers.Authorization = `Bearer ${SUPABASE_PUBLISHABLE_KEY}`;

async function rest(table, query) {
  const res = await fetch(`${base}/rest/v1/${table}?${query}`, { headers });
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function downloadImage(file) {
  const sign = await fetch(`${base}/storage/v1/object/sign/product-images/${encodeURIComponent(file)}`, {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ expiresIn: 600 }),
  });
  if (!sign.ok) throw new Error(`aláírás ${sign.status}`);
  const { signedURL } = await sign.json();
  const res = await fetch(`${base}/storage/v1${signedURL}`);
  if (!res.ok) throw new Error(`letöltés ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

const toMysqlDate = (iso) => new Date(iso).toISOString().slice(0, 23).replace('T', ' ');
const safeName = (name) => path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');

const db = await mysql.createConnection(DATABASE_URL);
try {
  const texts = await rest('site_texts', 'select=key,value');
  for (const t of texts) {
    await db.query('INSERT INTO site_texts (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [t.key, t.value ?? '']);
  }
  console.log(`Szövegek: ${texts.length} átmásolva.`);

  const products = await rest('products', 'select=*&order=created_at');
  await mkdir(path.join(UPLOADS_DIR, 'products'), { recursive: true });
  let images = 0;
  const failed = [];
  for (const p of products) {
    let imagePath = '';
    if (p.image_path) {
      imagePath = safeName(p.image_path);
      try {
        await writeFile(path.join(UPLOADS_DIR, 'products', imagePath), await downloadImage(p.image_path));
        images++;
      } catch (error) {
        failed.push(`${p.name} (${p.image_path}): ${error.message}`);
        imagePath = '';
      }
    }
    await db.query(
      `INSERT INTO products (id, area, category, name, description, image_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE area = VALUES(area), category = VALUES(category), name = VALUES(name),
         description = VALUES(description), image_path = VALUES(image_path)`,
      [p.id, p.area, p.category, p.name, p.description ?? '', imagePath, toMysqlDate(p.created_at)],
    );
  }
  console.log(`Termékek: ${products.length} átmásolva, képek: ${images} letöltve → ${path.join(UPLOADS_DIR, 'products')}`);
  if (failed.length) console.warn(`Nem sikerült letölteni ${failed.length} képet:\n  ${failed.join('\n  ')}`);
  console.log('\nKész. Admin felhasználó létrehozása:  pnpm db:create-admin <email> <jelszó>');
} finally {
  await db.end();
}
