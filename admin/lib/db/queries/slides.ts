import "server-only";
import { randomUUID } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db/client";
import type { Slide } from "@/types";
import type { SlideInput } from "@/lib/validations/slide";

const toSlide = (r: RowDataPacket): Slide => ({
  id: r.id,
  page: r.page === "termekek" ? "termekek" : "home",
  title: r.title ?? "",
  subtitle: r.subtitle ?? "",
  button_label: r.button_label ?? "",
  link_url: r.link_url ?? "",
  image_path: r.image_path,
  published: Number(r.published) === 1,
  sort_order: Number(r.sort_order ?? 0),
});

export async function listSlides(): Promise<Slide[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM slides ORDER BY page, sort_order, created_at",
  );
  return rows.map(toSlide);
}

export async function getSlide(id: string): Promise<Slide | null> {
  const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM slides WHERE id = ?", [id]);
  return rows[0] ? toSlide(rows[0]) : null;
}

export async function upsertSlide(s: SlideInput & { image_path: string }) {
  const values = [
    s.page,
    s.title,
    s.subtitle,
    s.button_label,
    s.link_url,
    s.image_path,
    s.published ? 1 : 0,
    s.sort_order,
  ];
  if (s.id) {
    const [res] = await db.query<ResultSetHeader>(
      "UPDATE slides SET page = ?, title = ?, subtitle = ?, button_label = ?, link_url = ?, image_path = ?, published = ?, sort_order = ? WHERE id = ?",
      [...values, s.id],
    );
    if (!res.affectedRows) throw new Error("A slide nem található.");
    return s.id;
  }
  const id = randomUUID();
  await db.query(
    "INSERT INTO slides (page, title, subtitle, button_label, link_url, image_path, published, sort_order, id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [...values, id],
  );
  return id;
}

export async function deleteSlideById(id: string) {
  await db.query("DELETE FROM slides WHERE id = ?", [id]);
}
