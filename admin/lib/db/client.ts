import "server-only";
import mysql from "mysql2/promise";
import { env } from "@/lib/env";

const globalForDb = globalThis as unknown as { pelletPool?: mysql.Pool };

/** Shared MySQL pool (kept on globalThis so dev hot reloads don't open new pools). */
export const db: mysql.Pool =
  globalForDb.pelletPool ??
  (globalForDb.pelletPool = mysql.createPool({
    uri: env.DATABASE_URL,
    connectionLimit: 10,
    charset: "utf8mb4",
    timezone: "Z",
  }));
