// Creates (or resets the password of) an admin user.
// Usage:  pnpm db:create-admin <email> <password>
import { randomUUID } from 'node:crypto';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/pellet';
const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Használat: pnpm db:create-admin <email> <jelszó>');
  process.exit(1);
}
if (password.length < 8) {
  console.error('A jelszó legalább 8 karakter legyen.');
  process.exit(1);
}

const db = await mysql.createConnection(DATABASE_URL);
try {
  const hash = await bcrypt.hash(password, 12);
  const normalized = email.trim().toLowerCase();
  const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [normalized]);
  let userId = rows[0]?.id;
  if (userId) {
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId]);
    await db.query('DELETE FROM sessions WHERE user_id = ?', [userId]);
    console.log(`Jelszó frissítve: ${normalized}`);
  } else {
    userId = randomUUID();
    await db.query('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [userId, normalized, hash]);
    console.log(`Felhasználó létrehozva: ${normalized}`);
  }
  await db.query('INSERT IGNORE INTO user_roles (id, user_id, role) VALUES (?, ?, ?)', [randomUUID(), userId, 'admin']);
  console.log('Admin jogosultság beállítva.');
} finally {
  await db.end();
}
