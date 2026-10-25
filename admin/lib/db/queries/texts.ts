import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db/client";
import type { SiteText } from "@/types";
import type { TextInput } from "@/lib/validations/text";

export async function listTexts(): Promise<SiteText[]> {
  const [rows] = await db.query<(SiteText & RowDataPacket)[]>(
    "SELECT `key`, value FROM site_texts ORDER BY `key`",
  );
  return rows.map((r) => ({ key: r.key, value: r.value }));
}

export async function upsertText({ key, value }: TextInput) {
  await db.query(
    "INSERT INTO site_texts (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
    [key, value],
  );
}
