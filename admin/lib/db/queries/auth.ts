import "server-only";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db/client";
import { SESSION_DAYS } from "@/lib/env";

export type SessionUser = { id: string; email: string; isAdmin: boolean };
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const DUMMY_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKcEeO5Q7o6Vf8mbm4YH1m7Zl5O7j5JVZ5Q2a";

/** Returns the user id when email + password match, otherwise null. */
export async function verifyCredentials(email: string, password: string): Promise<string | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, password_hash FROM users WHERE email = ?",
    [email.trim().toLowerCase()],
  );
  const user = rows[0];
  const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  return user && ok ? (user.id as string) : null;
}

/** Creates a session; only the SHA-256 of the token is stored. */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.query("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", [
    hashToken(token),
    userId,
    expires,
  ]);
  await db.query("DELETE FROM sessions WHERE expires_at < NOW(3)");
  return { token, expires };
}

export async function findSessionUser(token: string): Promise<SessionUser | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT u.id, u.email, EXISTS(SELECT 1 FROM user_roles r WHERE r.user_id = u.id AND r.role = 'admin') AS is_admin
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = ? AND s.expires_at > NOW(3)`,
    [hashToken(token)],
  );
  const row = rows[0];
  return row ? { id: row.id, email: row.email, isAdmin: Number(row.is_admin) === 1 } : null;
}

export async function deleteSession(token: string) {
  await db.query("DELETE FROM sessions WHERE id = ?", [hashToken(token)]);
}
