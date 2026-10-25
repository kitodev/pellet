import "server-only";
import { randomUUID } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db/client";
import type { BlogPost } from "@/types";
import type { PostInput } from "@/lib/validations/post";

const iso = (d: unknown) => (d ? new Date(d as string).toISOString() : null);
const toPost = (r: RowDataPacket): BlogPost => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt,
  body: r.body,
  cover_path: r.cover_path,
  meta_description: r.meta_description,
  status: r.status,
  published_at: iso(r.published_at),
  updated_at: iso(r.updated_at),
  created_at: iso(r.created_at) ?? "",
});

export async function listPosts(): Promise<BlogPost[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM blog_posts ORDER BY status = 'draft' DESC, COALESCE(published_at, created_at) DESC",
  );
  return rows.map(toPost);
}

export async function getPost(id: string): Promise<BlogPost | null> {
  const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM blog_posts WHERE id = ?", [id]);
  return rows[0] ? toPost(rows[0]) : null;
}

/** Saves a post; the publish date is set the first time it is published. */
export async function upsertPost(p: PostInput & { slug: string }) {
  if (p.id) {
    const [res] = await db.query<ResultSetHeader>(
      `UPDATE blog_posts SET slug = ?, title = ?, excerpt = ?, meta_description = ?, body = ?, status = ?, cover_path = ?,
         published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN NOW(3) ELSE published_at END, updated_at = NOW(3) WHERE id = ?`,
      [
        p.slug,
        p.title,
        p.excerpt,
        p.meta_description,
        p.body,
        p.status,
        p.cover_path,
        p.status,
        p.id,
      ],
    );
    if (!res.affectedRows) throw new Error("A cikk nem található.");
    return p.id;
  }
  const id = randomUUID();
  await db.query(
    `INSERT INTO blog_posts (id, slug, title, excerpt, meta_description, body, status, cover_path, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ${p.status === "published" ? "NOW(3)" : "NULL"})`,
    [id, p.slug, p.title, p.excerpt, p.meta_description, p.body, p.status, p.cover_path],
  );
  return id;
}

export async function deletePostById(id: string) {
  await db.query("DELETE FROM blog_posts WHERE id = ?", [id]);
}
