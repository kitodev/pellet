import mysql from "mysql2/promise";
import { serverEnv } from "./env";

/** TLS for hosted MySQL (TiDB Cloud refuses unencrypted connections); off for local XAMPP. */
function sslFor(uri: string) {
  let host = "";
  try {
    host = new URL(uri).hostname;
  } catch {
    // invalid URL – mysql2 reports it
  }
  const on = process.env["DB_SSL"] === "true" || host.endsWith(".tidbcloud.com");
  return on ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined;
}

const globalForDb = globalThis as unknown as { pelletPool?: mysql.Pool };

/** Shared MySQL connection pool (reused across hot reloads in dev). */
export function db(): mysql.Pool {
  if (!globalForDb.pelletPool) {
    const uri = serverEnv().databaseUrl;
    const ssl = sslFor(uri);
    globalForDb.pelletPool = mysql.createPool({
      uri,
      ...(ssl ? { ssl } : {}),
      connectionLimit: 10,
      connectTimeout: 5000,
      charset: "utf8mb4",
      timezone: "Z",
      dateStrings: false,
    });
  }
  return globalForDb.pelletPool;
}
