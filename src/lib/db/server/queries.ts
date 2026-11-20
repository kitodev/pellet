import { randomUUID } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { db } from "./client";
import type {
  BlogPost,
  DocumentKind,
  PriceMode,
  Product,
  ProductDocument,
  Review,
  SiteText,
  Slide,
  StockStatus,
} from "@/types";
import type { ProductInput, TextInput } from "@/lib/validations/content";
import { slugify } from "@/lib/utils/slug";

const iso = (d: unknown) => (d ? new Date(d as string).toISOString() : null);

// ---- site texts ----
export async function listTexts(): Promise<SiteText[]> {
  const [rows] = await db().query<(SiteText & RowDataPacket)[]>(
    "SELECT `key`, value FROM site_texts ORDER BY `key`",
  );
  return rows.map((r) => ({ key: r.key, value: r.value }));
}

export async function upsertText({ key, value }: TextInput) {
  await db().query(
    "INSERT INTO site_texts (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
    [key, value],
  );
}

// ---- products ----
function parseSpecs(raw: unknown): Record<string, string> {
  if (typeof raw !== "string" || !raw) return {};
  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object") return {};
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => typeof v === "string" && v.trim())
        .map(([k, v]) => [k, String(v)]),
    );
  } catch {
    return {};
  }
}

const PRICE_MODES: PriceMode[] = ["public", "ask", "quantity"];
const STOCK: StockStatus[] = ["in_stock", "limited", "on_order", "out_of_stock"];
const DOC_KINDS: DocumentKind[] = ["certificate", "manual", "other"];
const str = (v: unknown) => (typeof v === "string" ? v : "");

function toProduct(
  r: RowDataPacket,
  images: string[] = [],
  documents: ProductDocument[] = [],
): Product {
  // Rows from before migration 007 have no price_mode: a price means "public".
  const priceMode = PRICE_MODES.includes(r["price_mode"])
    ? (r["price_mode"] as PriceMode)
    : r["price"] !== null || r["sale_price"] !== null
      ? "public"
      : "ask";
  return {
    id: r["id"],
    slug: r["slug"] ?? "",
    area: r["area"],
    category: r["category"],
    name: r["name"],
    brand: str(r["brand"]),
    short_description: r["short_description"] ?? "",
    description: r["description"] ?? "",
    price: r["price"] === null ? null : Number(r["price"]),
    sale_price: r["sale_price"] === null ? null : Number(r["sale_price"]),
    price_unit: r["price_unit"] ?? "",
    specs: parseSpecs(r["specs"]),
    image_path: r["image_path"] ?? "",
    images,
    datasheet_path: r["datasheet_path"] ?? "",
    packaging: str(r["packaging"]),
    highlights: str(r["highlights"]),
    stock_status: STOCK.includes(r["stock_status"]) ? r["stock_status"] : "in_stock",
    price_mode: priceMode,
    price_note: str(r["price_note"]),
    seo_title: str(r["seo_title"]),
    meta_description: str(r["meta_description"]),
    keywords: str(r["keywords"]),
    image_alt: str(r["image_alt"]),
    documents,
    featured: Number(r["featured"]) === 1,
    published: Number(r["published"]) === 1,
    sort_order: Number(r["sort_order"] ?? 0),
    created_at: iso(r["created_at"]) ?? "",
  };
}

async function imagesFor(ids: string[]) {
  const map = new Map<string, string[]>();
  if (!ids.length) return map;
  const [rows] = await db().query<RowDataPacket[]>(
    "SELECT product_id, path FROM product_images WHERE product_id IN (?) ORDER BY sort_order, created_at",
    [ids],
  );
  for (const r of rows) map.set(r["product_id"], [...(map.get(r["product_id"]) ?? []), r["path"]]);
  return map;
}

/** Extra PDFs (table from migration 007 – empty until it has run). */
async function documentsFor(ids: string[]) {
  const map = new Map<string, ProductDocument[]>();
  if (!ids.length) return map;
  try {
    const [rows] = await db().query<RowDataPacket[]>(
      "SELECT id, product_id, kind, title, path FROM product_documents WHERE product_id IN (?) ORDER BY sort_order, created_at",
      [ids],
    );
    for (const r of rows)
      map.set(r["product_id"], [
        ...(map.get(r["product_id"]) ?? []),
        {
          id: r["id"],
          kind: DOC_KINDS.includes(r["kind"]) ? r["kind"] : "other",
          title: str(r["title"]),
          path: r["path"],
        },
      ]);
  } catch (error) {
    console.error("[pellet] Termékdokumentumok betöltése sikertelen (pnpm db:migrate?):", error);
  }
  return map;
}

export async function listProducts({ publishedOnly = false } = {}): Promise<Product[]> {
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT * FROM products ${publishedOnly ? "WHERE published = 1" : ""} ORDER BY sort_order, created_at`,
  );
  const ids = rows.map((r) => r["id"]);
  const [images, documents] = await Promise.all([imagesFor(ids), documentsFor(ids)]);
  return rows.map((r) => toProduct(r, images.get(r["id"]), documents.get(r["id"])));
}

export async function getProduct(id: string): Promise<Product | null> {
  const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM products WHERE id = ?", [id]);
  if (!rows[0]) return null;
  return toProduct(rows[0], (await imagesFor([id])).get(id), (await documentsFor([id])).get(id));
}

async function uniqueProductSlug(name: string, exceptId?: string) {
  const base = slugify(name);
  const [rows] = await db().query<RowDataPacket[]>(
    "SELECT slug FROM products WHERE (slug = ? OR slug LIKE ?) AND id <> ?",
    [base, `${base}-%`, exceptId ?? ""],
  );
  const taken = new Set(rows.map((r) => r["slug"]));
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

/** Used by the website's built-in (simple) admin: only edits the basic fields, keeps everything else. */
export async function upsertProduct(input: ProductInput & { image_path: string }): Promise<string> {
  const { id, area, category, name, description, image_path } = input;
  if (id) {
    const [res] = await db().query<ResultSetHeader>(
      "UPDATE products SET area = ?, category = ?, name = ?, description = ?, image_path = ?, updated_at = NOW(3) WHERE id = ?",
      [area, category, name, description, image_path, id],
    );
    if (!res.affectedRows) throw new Error("A termék nem található.");
    return id;
  }
  const newId = randomUUID();
  await db().query(
    "INSERT INTO products (id, slug, area, category, name, description, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [newId, await uniqueProductSlug(name), area, category, name, description, image_path],
  );
  return newId;
}

export async function deleteProductRow(id: string) {
  const [res] = await db().query<ResultSetHeader>("DELETE FROM products WHERE id = ?", [id]);
  if (!res.affectedRows) throw new Error("A termék nem található.");
}

// ---- reviews ----
export async function listReviews({ publishedOnly = false } = {}): Promise<Review[]> {
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT * FROM reviews ${publishedOnly ? "WHERE published = 1" : ""} ORDER BY sort_order, review_date DESC, created_at DESC`,
  );
  return rows.map((r) => ({
    id: r["id"],
    author: r["author"],
    location: r["location"],
    rating: Number(r["rating"]),
    body: r["body"],
    source: r["source"],
    review_date: r["review_date"] ? new Date(r["review_date"]).toISOString().slice(0, 10) : null,
    published: Number(r["published"]) === 1,
    sort_order: Number(r["sort_order"]),
  }));
}

// ---- slides ----
export async function listSlides({ publishedOnly = false } = {}): Promise<Slide[]> {
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT * FROM slides ${publishedOnly ? "WHERE published = 1" : ""} ORDER BY sort_order, created_at`,
  );
  return rows.map((r) => ({
    id: r["id"],
    page: r["page"] === "termekek" ? "termekek" : "home",
    title: r["title"] ?? "",
    subtitle: r["subtitle"] ?? "",
    button_label: r["button_label"] ?? "",
    link_url: r["link_url"] ?? "",
    image_path: r["image_path"],
    published: Number(r["published"]) === 1,
    sort_order: Number(r["sort_order"] ?? 0),
  }));
}

// ---- blog ----
const toPost = (r: RowDataPacket): BlogPost => ({
  id: r["id"],
  slug: r["slug"],
  title: r["title"],
  excerpt: r["excerpt"],
  body: r["body"],
  cover_path: r["cover_path"],
  meta_description: r["meta_description"],
  status: r["status"],
  published_at: iso(r["published_at"]),
  updated_at: iso(r["updated_at"]),
  created_at: iso(r["created_at"]) ?? "",
});

/** Published posts, newest first (without body). */
export async function listPublishedPosts(): Promise<Omit<BlogPost, "body">[]> {
  const [rows] = await db().query<RowDataPacket[]>(
    "SELECT id, slug, title, excerpt, '' AS body, cover_path, meta_description, status, published_at, updated_at, created_at FROM blog_posts WHERE status = 'published' AND published_at <= NOW(3) ORDER BY published_at DESC",
  );
  return rows.map(toPost);
}

export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  const [rows] = await db().query<RowDataPacket[]>(
    "SELECT * FROM blog_posts WHERE slug = ? AND status = 'published' AND published_at <= NOW(3)",
    [slug],
  );
  return rows[0] ? toPost(rows[0]) : null;
}

// ---- quote requests (Árajánlatkérés) ----
export async function insertQuoteRequest(q: {
  product_id: string | null;
  product_name: string;
  product_url: string;
  quantity: string;
  unit: string;
  delivery: string;
  zip: string;
  city: string;
  installation: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
}) {
  const id = randomUUID();
  await db().query(
    `INSERT INTO quote_requests (id, product_id, product_name, product_url, quantity, unit, delivery, zip, city, installation, name, company, email, phone, message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      q.product_id,
      q.product_name,
      q.product_url,
      q.quantity,
      q.unit,
      q.delivery,
      q.zip,
      q.city,
      q.installation,
      q.name,
      q.company,
      q.email,
      q.phone,
      q.message,
    ],
  );
  return id;
}

export async function markQuoteMailed(id: string) {
  await db().query("UPDATE quote_requests SET mail_sent = 1 WHERE id = ?", [id]);
}
