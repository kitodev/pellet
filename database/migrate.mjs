// Applies database/migrations/* in order, once each (tracked in schema_migrations).
// Usage:  pnpm db:migrate
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/pellet';
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

// Create the database itself if it doesn't exist yet.
const url = new URL(DATABASE_URL);
const dbName = decodeURIComponent(url.pathname.replace(/^\//, '')) || 'pellet';
const server = new URL(DATABASE_URL); server.pathname = '/';
// (Hosted databases often create it for you and don't allow this – then we just continue.)
try {
  const admin = await mysql.createConnection(server.toString());
  await admin.query(`CREATE DATABASE IF NOT EXISTS \`${dbName.replace(/`/g, '')}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await admin.end();
} catch (error) {
  console.warn(`(Az adatbázist nem tudtam létrehozni – feltételezem, hogy már létezik: ${error.message})`);
}

const db = await mysql.createConnection({ uri: DATABASE_URL, multipleStatements: true, charset: 'utf8mb4' });
try {
  await db.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name       VARCHAR(191) NOT NULL PRIMARY KEY,
    applied_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  const [rows] = await db.query('SELECT name FROM schema_migrations');
  const done = new Set(rows.map((r) => r.name));

  // A database created with the first schema.sql already has the 001 tables.
  const [legacy] = await db.query("SHOW TABLES LIKE 'products'");
  if (legacy.length && !done.has('001_initial.sql')) {
    await db.query("INSERT INTO schema_migrations (name) VALUES ('001_initial.sql')");
    done.add('001_initial.sql');
  }

  const files = (await readdir(dir)).filter((f) => /\.(sql|mjs)$/.test(f)).sort();
  let applied = 0;
  for (const file of files) {
    if (done.has(file)) continue;
    process.stdout.write(`→ ${file} … `);
    let note = '';
    if (file.endsWith('.sql')) {
      await db.query(await readFile(path.join(dir, file), 'utf8'));
    } else {
      const mod = await import(pathToFileURL(path.join(dir, file)).href);
      note = (await mod.default(db)) || '';
    }
    await db.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
    applied++;
    console.log(`kész${note ? ` (${note})` : ''}`);
  }
  console.log(applied ? `\n${applied} migráció lefutott. Az adatbázis naprakész.` : 'Az adatbázis már naprakész.');
} catch (error) {
  console.error('\nHIBA:', error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
