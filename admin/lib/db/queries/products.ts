import "server-only";
import { randomUUID } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db/client";
import { slugify } from "@/lib/utils/slug";
import type { Product } from "@/types";
import type { ProductInput } from "@/lib/validations/product";

function parseSpecs(raw: unknown): Record<string, string> {
  if (typeof raw !== "string" || !raw) return {};
  try {
    const v = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(v ?? {}).filter(([, x]) => typeof x === "string") as [string, string][]);
  } catch {
    return {};
  }
}

const toProduct = (r: RowDataPacket, images: string[] = []): Product => ({
  id: r.id, slug: r.slug ?? "", area: r.area, category: r.category, name: r.name, short_description: r.short_description ?? "", description: r.description ?? "",
  price: r.price === null ? null : Number(r.price), sale_price: r.sale_price === null ? null : Number(r.sale_price), price_unit: r.price_unit ?? "",
  specs: parseSpecs(r.specs), image_path: r.image_path ?? "", images, datasheet_path: r.datasheet_path ?? "",
  featured: Number(r.featured) === 1, published: Number(r.published) === 1, sort_order: Number(r.sort_order ?? 0), created_at: new Date(r.created_at).toISOString(),
});

async function imagesFor(ids: string[]) {
  const map = new Map<string, string[]>();
  if (!ids.length) return map;
  const [rows] = await db.query<RowDataPacket[]>("SELECT product_id, path FROM product_images WHERE product_id IN (?) ORDER BY sort_order, created_at", [ids]);
  for (const r of rows) map.set(r.product_id, [...(map.get(r.product_id) ?? []), r.path]);
  return map;
}

export async function listProducts(): Promise<Product[]> {
  const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM products ORDER BY area, category, sort_order, created_at");
  const images = await imagesFor(rows.map((r) => r.id));
  return rows.map((r) => toProduct(r, images.get(r.id)));
}

export async function getProduct(id: string): Promise<Product | null> {
  const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM products WHERE id = ?", [id]);
  return rows[0] ? toProduct(rows[0], (await imagesFor([id])).get(id)) : null;
}

/** Unique URL slug: the requested one (or the name) plus "-2", "-3"… when taken. */
export async function uniqueSlug(table: "products" | "blog_posts", wanted: string, exceptId?: string) {
  const base = slugify(wanted);
  const [rows] = await db.query<RowDataPacket[]>(`SELECT slug FROM ${table} WHERE (slug = ? OR slug LIKE ?) AND id <> ?`, [base, `${base}-%`, exceptId ?? ""]);
  const taken = new Set(rows.map((r) => r.slug));
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

type SaveProduct = Omit<ProductInput, "remove_images" | "id"> & { id?: string | undefined; slug: string };

export async function upsertProduct(p: SaveProduct): Promise<string> {
  const values = [p.slug, p.area, p.category, p.name, p.short_description, p.description, p.price, p.sale_price, p.price_unit, JSON.stringify(p.specs), p.image_path, p.datasheet_path, p.featured ? 1 : 0, p.published ? 1 : 0, p.sort_order];
  if (p.id) {
    const [res] = await db.query<ResultSetHeader>(
      `UPDATE products SET slug = ?, area = ?, category = ?, name = ?, short_description = ?, description = ?, price = ?, sale_price = ?, price_unit = ?,
         specs = ?, image_path = ?, datasheet_path = ?, featured = ?, published = ?, sort_order = ?, updated_at = NOW(3) WHERE id = ?`,
      [...values, p.id],
    );
    if (!res.affectedRows) throw new Error("A termék nem található.");
    return p.id;
  }
  const id = randomUUID();
  await db.query(
    `INSERT INTO products (slug, area, category, name, short_description, description, price, sale_price, price_unit, specs, image_path, datasheet_path, featured, published, sort_order, id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [...values, id],
  );
  return id;
}

export async function addProductImages(productId: string, paths: string[], startAt: number) {
  for (const [i, p] of paths.entries()) await db.query("INSERT INTO product_images (id, product_id, path, sort_order) VALUES (?, ?, ?, ?)", [randomUUID(), productId, p, startAt + i]);
}

export async function removeProductImages(productId: string, paths: string[]) {
  if (paths.length) await db.query("DELETE FROM product_images WHERE product_id = ? AND path IN (?)", [productId, paths]);
}

export async function deleteProductById(id: string) {
  const [res] = await db.query<ResultSetHeader>("DELETE FROM products WHERE id = ?", [id]);
  if (!res.affectedRows) throw new Error("A termék nem található.");
}
