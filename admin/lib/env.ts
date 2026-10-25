import "server-only";
import path from "node:path";
import { z } from "zod";

// Server-only configuration, validated once at startup.
const schema = z.object({
  DATABASE_URL: z
    .string()
    .regex(/^mysql:\/\//, "DATABASE_URL must look like mysql://user:password@host:3306/pellet"),
  UPLOADS_DIR: z.string().default("../uploads"),
});

// Defaults match XAMPP (root, no password) and the shared C:\pellet\uploads folder.
const parsed = schema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL || "mysql://root:@127.0.0.1:3306/pellet",
  UPLOADS_DIR: process.env.UPLOADS_DIR || undefined,
});
if (!parsed.success) {
  throw new Error(
    `Invalid env in admin/.env.local: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
  );
}

export const env = { ...parsed.data, UPLOADS_DIR: path.resolve(parsed.data.UPLOADS_DIR) };

export const SESSION_COOKIE = "pellet_session";
export const SESSION_DAYS = 7;
