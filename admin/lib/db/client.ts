import "server-only";
import mysql from "mysql2/promise";
import { env } from "@/lib/env";

/** TLS for hosted MySQL (TiDB Cloud refuses unencrypted connections); off for local XAMPP. */
function sslFor(uri: string) {
  let host = "";
  try {
    host = new URL(uri).hostname;
  } catch {
    // invalid URL – mysql2 reports it
  }
  const on = process.env.DB_SSL === "true" || host.endsWith(".tidbcloud.com");
  return on ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined;
}

const globalForDb = globalThis as unknown as { pelletPool?: mysql.Pool };

/** Shared MySQL pool (kept on globalThis so dev hot reloads don't open new pools). */
export const db: mysql.Pool =
  globalForDb.pelletPool ??
  (globalForDb.pelletPool = mysql.createPool({
    uri: env.DATABASE_URL,
    ssl: sslFor(env.DATABASE_URL),
    connectionLimit: 10,
    charset: "utf8mb4",
    timezone: "Z",
  }));
