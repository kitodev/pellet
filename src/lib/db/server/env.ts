import path from "node:path";

/** XAMPP default: user root, no password, database "pellet". Override with DATABASE_URL in .env. */
export const DEFAULT_DATABASE_URL = "mysql://root:@127.0.0.1:3306/pellet";

/** Server-only configuration (from .env). */
export function serverEnv() {
  const databaseUrl = process.env["DATABASE_URL"] || DEFAULT_DATABASE_URL;
  return {
    databaseUrl,
    uploadsDir: path.resolve(process.env["UPLOADS_DIR"] || "uploads"),
  };
}

export const SESSION_COOKIE = "pellet_session";
export const SESSION_DAYS = 7;
