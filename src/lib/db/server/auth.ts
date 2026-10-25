import { createHash, randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "./client";
import { SESSION_DAYS } from "./env";

export type SessionUser = { id: string; email: string; isAdmin: boolean };
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Checks email + password. Returns the user id or null. */
export async function verifyCredentials(email: string, password: string): Promise<string | null> {
  const [rows] = await db().query<RowDataPacket[]>(
    "SELECT id, password_hash FROM users WHERE email = ?",
    [email.trim().toLowerCase()],
  );
  const user = rows[0];
  // Compare against a dummy hash when the user doesn't exist to keep timing similar.
  const ok = await bcrypt.compare(
    password,
    user?.["password_hash"] ?? "$2a$12$C6UzMDM.H6dfI/f/IKcEeO5Q7o6Vf8mbm4YH1m7Zl5O7j5JVZ5Q2a",
  );
  return user && ok ? (user["id"] as string) : null;
}

/** Creates a session and returns the raw token (only its hash is stored). */
export async function createSession(userId: string): Promise<{ token: string; expires: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db().query("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", [
    hashToken(token),
    userId,
    expires,
  ]);
  await db().query("DELETE FROM sessions WHERE expires_at < NOW(3)");
  return { token, expires };
}

export async function getSessionUser(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT u.id, u.email, EXISTS(SELECT 1 FROM user_roles r WHERE r.user_id = u.id AND r.role = 'admin') AS is_admin
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = ? AND s.expires_at > NOW(3)`,
    [hashToken(token)],
  );
  const row = rows[0];
  return row
    ? { id: row["id"], email: row["email"], isAdmin: Number(row["is_admin"]) === 1 }
    : null;
}

export async function deleteSession(token: string | undefined) {
  if (token) await db().query("DELETE FROM sessions WHERE id = ?", [hashToken(token)]);
}

export { randomUUID };
