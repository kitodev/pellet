import "server-only";
import { randomUUID } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db/client";
import { slugify } from "@/lib/utils/slug";
import type { DocumentKind, PriceMode, Product, ProductDocument, StockStatus } from "@/types";
import type { ProductInput } from "@/lib/validations/product";

function parseSpecs(raw: unknown): Record<string, string> {
  if (typeof raw !== "string" || !raw) return {};
  try {
    const v = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(v ?? {}).filter(([, x]) => typeof x === "string") as [string, string][],
    );
  } catch {
    return {};
  }
}

const PRICE_MODES: PriceMode[] = ["public", "ask", "quantity"];
const STOCK: StockStatus[] = ["in_stock", "limited", "on_order", "out_of_stock"];
const DOC_KINDS: DocumentKind[] = ["certificate", "manual", "other"];
const s = (v: unknown) => (typeof v === "string" ? v : "");

const toProduct = (
  r: RowDataPacket,
  images: string[] = [],
  documents: ProductDocument[] = [],
): Product => ({
  id: r.id,
  slug: r.slug ?? "",
  area: r.area,
  category: r.category,
  name: r.name,
  brand: s(r.brand),
  short_description: r.short_description ?? "",
  description: r.description ?? "",
  price: r.price === null ? null : Number(r.price),
  sale_price: r.sale_price === null ? null : Number(r.sale_price),
  price_unit: r.price_unit ?? "",
  specs: parseSpecs(r.specs),
  image_path: r.image_path ?? "",
  images,
  datasheet_path: r.datasheet_path ?? "",
  packaging: s(r.packaging),
  highlights: s(r.highlights),
  stock_status: STOCK.includes(r.stock_status) ? r.stock_status : "in_stock",
  price_mode: PRICE_MODES.includes(r.price_mode)
    ? r.price_mode
    : r.price !== null || r.sale_price !== null
      ? "public"
      : "ask",
  price_note: s(r.price_note),
  seo_title: s(r.seo_title),
  meta_description: s(r.meta_description),
  keywords: s(r.keywords),
  image_alt: s(r.image_alt),
  documents,
  featured: Number(r.featured) === 1,
  published: Number(r.published) === 1,
  sort_order: Number(r.sort_order ?? 0),
  created_at: new Date(r.created_at).toISOString(),
});

async function imagesFor(ids: string[]) {
  const map = new Map<string, string[]>();
  if (!ids.length) return map;
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT product_id, path FROM product_images WHERE product_id IN (?) ORDER BY sort_order, created_at",
    [ids],
  );
  for (const r of rows) map.set(r.product_id, [...(map.get(r.product_id) ?? []), r.path]);
  return map;
}

async function documentsFor(ids: string[]) {
  const map = new Map<string, ProductDocument[]>();
  if (!ids.length) return map;
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, product_id, kind, title, path FROM product_documents WHERE product_id IN (?) ORDER BY sort_order, created_at",
      [ids],
    );
    for (const r of rows)
      map.set(r.product_id, [
        ...(map.get(r.product_id) ?? []),
        {
          id: r.id,
          kind: DOC_KINDS.includes(r.kind) ? r.kind : "other",
          title: s(r.title),
          path: r.path,
        },
      ]);
  } catch (error) {
    console.error("product_documents (pnpm db:migrate?):", error);
  }
  return map;
}

export async function listProducts(): Promise<Product[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM products ORDER BY area, category, sort_order, created_at",
  );
  const ids = rows.map((r) => r.id);
  const [images, documents] = await Promise.all([imagesFor(ids), documentsFor(ids)]);
  return rows.map((r) => toProduct(r, images.get(r.id), documents.get(r.id)));
}

export async function getProduct(id: string): Promise<Product | null> {
  const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM products WHERE id = ?", [id]);
  return rows[0]
    ? toProduct(rows[0], (await imagesFor([id])).get(id), (await documentsFor([id])).get(id))
    : null;
}

/** Unique URL slug: the requested one (or the name) plus "-2", "-3"… when taken. */
export async function uniqueSlug(
  table: "products" | "blog_posts",
  wanted: string,
  exceptId?: string,
) {
  const base = slugify(wanted);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT slug FROM ${table} WHERE (slug = ? OR slug LIKE ?) AND id <> ?`,
    [base, `${base}-%`, exceptId ?? ""],
  );
  const taken = new Set(rows.map((r) => r.slug));
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

type SaveProduct = Omit<ProductInput, "remove_images" | "remove_documents" | "id"> & {
  id?: string | undefined;
  slug: string;
};

export async function upsertProduct(p: SaveProduct): Promise<string> {
  const values = [
    p.slug,
    p.area,
    p.category,
    p.name,
    p.brand,
    p.short_description,
    p.description,
    p.price,
    p.sale_price,
    p.price_unit,
    JSON.stringify(p.specs),
    p.image_path,
    p.datasheet_path,
    p.featured ? 1 : 0,
    p.published ? 1 : 0,
    p.sort_order,
    p.packaging,
    p.highlights,
    p.stock_status,
    p.price_mode,
    p.price_note,
    p.seo_title,
    p.meta_description,
    p.keywords,
    p.image_alt,
  ];
  if (p.id) {
    const [res] = await db.query<ResultSetHeader>(
      `UPDATE products SET slug = ?, area = ?, category = ?, name = ?, brand = ?, short_description = ?, description = ?, price = ?, sale_price = ?, price_unit = ?,
         specs = ?, image_path = ?, datasheet_path = ?, featured = ?, published = ?, sort_order = ?,
         packaging = ?, highlights = ?, stock_status = ?, price_mode = ?, price_note = ?, seo_title = ?, meta_description = ?, keywords = ?, image_alt = ?,
         updated_at = NOW(3) WHERE id = ?`,
      [...values, p.id],
    );
    if (!res.affectedRows) throw new Error("A termék nem található.");
    return p.id;
  }
  const id = randomUUID();
  await db.query(
    `INSERT INTO products (slug, area, category, name, brand, short_description, description, price, sale_price, price_unit, specs, image_path, datasheet_path, featured, published, sort_order,
       packaging, highlights, stock_status, price_mode, price_note, seo_title, meta_description, keywords, image_alt, id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [...values, id],
  );
  return id;
}

export async function addProductImages(productId: string, paths: string[], startAt: number) {
  for (const [i, p] of paths.entries())
    await db.query(
      "INSERT INTO product_images (id, product_id, path, sort_order) VALUES (?, ?, ?, ?)",
      [randomUUID(), productId, p, startAt + i],
    );
}

export async function removeProductImages(productId: string, paths: string[]) {
  if (paths.length)
    await db.query("DELETE FROM product_images WHERE product_id = ? AND path IN (?)", [
      productId,
      paths,
    ]);
}

export async function deleteProductById(id: string) {
  const [res] = await db.query<ResultSetHeader>("DELETE FROM products WHERE id = ?", [id]);
  if (!res.affectedRows) throw new Error("A termék nem található.");
}

export async function addProductDocuments(
  productId: string,
  docs: { kind: DocumentKind; title: string; path: string }[],
  startAt: number,
) {
  for (const [i, d] of docs.entries())
    await db.query(
      "INSERT INTO product_documents (id, product_id, kind, title, path, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
      [randomUUID(), productId, d.kind, d.title, d.path, startAt + i],
    );
}

export async function removeProductDocuments(productId: string, ids: string[]) {
  if (ids.length)
    await db.query("DELETE FROM product_documents WHERE product_id = ? AND id IN (?)", [
      productId,
      ids,
    ]);
}
