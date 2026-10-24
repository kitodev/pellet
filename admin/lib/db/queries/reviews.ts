import "server-only";
import { randomUUID } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db/client";
import type { Review } from "@/types";
import type { ReviewInput } from "@/lib/validations/review";

export async function listReviews(): Promise<Review[]> {
  const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM reviews ORDER BY sort_order, review_date DESC, created_at DESC");
  return rows.map((r) => ({
    id: r.id, author: r.author, location: r.location, rating: Number(r.rating), body: r.body, source: r.source,
    review_date: r.review_date ? new Date(r.review_date).toISOString().slice(0, 10) : null, published: Number(r.published) === 1, sort_order: Number(r.sort_order),
  }));
}

export async function upsertReview(r: ReviewInput) {
  const values = [r.author, r.location, r.rating, r.body, r.source, r.review_date || null, r.published ? 1 : 0, r.sort_order];
  if (r.id) {
    const [res] = await db.query<ResultSetHeader>("UPDATE reviews SET author = ?, location = ?, rating = ?, body = ?, source = ?, review_date = ?, published = ?, sort_order = ? WHERE id = ?", [...values, r.id]);
    if (!res.affectedRows) throw new Error("A vélemény nem található.");
    return;
  }
  await db.query("INSERT INTO reviews (author, location, rating, body, source, review_date, published, sort_order, id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [...values, randomUUID()]);
}

export async function deleteReviewById(id: string) {
  await db.query("DELETE FROM reviews WHERE id = ?", [id]);
}
