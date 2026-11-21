import { z } from "zod";
import { areas, areaKeys, isAreaKey } from "@/lib/content/menu";

const optionalPrice = z
  .string()
  .trim()
  .transform((v) => v.replace(/\s/g, "").replace(",", "."))
  .refine(
    (v) => v === "" || (/^\d+(\.\d+)?$/.test(v) && Number(v) <= 100_000_000),
    "Az ár egész szám legyen (Ft).",
  )
  .transform((v) => (v === "" ? null : Math.round(Number(v))));

export const productSchema = z
  .object({
    id: z.string().uuid().optional(),
    slug: z
      .string()
      .trim()
      .max(120)
      .regex(/^[a-z0-9-]*$/, "Az URL csak kisbetűt, számot és kötőjelet tartalmazhat."),
    area: z.enum(areaKeys as [string, ...string[]]),
    category: z.string().min(1).max(80),
    name: z.string().trim().min(1, "Adjon meg terméknevet.").max(200),
    brand: z.string().trim().max(120),
    packaging: z.string().trim().max(200),
    highlights: z.string().max(3000),
    stock_status: z.enum(["in_stock", "limited", "on_order", "out_of_stock"]),
    price_mode: z.enum(["public", "ask", "quantity"]),
    price_note: z.string().trim().max(300),
    seo_title: z.string().trim().max(200, "A SEO-cím legfeljebb 200 karakter."),
    meta_description: z.string().trim().max(300, "A meta leírás legfeljebb 300 karakter."),
    keywords: z.string().trim().max(300),
    image_alt: z.string().trim().max(200),
    short_description: z.string().trim().max(300, "A rövid leírás legfeljebb 300 karakter."),
    description: z.string().max(20000),
    price: optionalPrice,
    sale_price: optionalPrice,
    price_unit: z.string().trim().max(40),
    specs: z.record(z.string(), z.string().max(5000)),
    featured: z.boolean(),
    published: z.boolean(),
    sort_order: z.coerce.number().int().min(-100000).max(100000),
    image_path: z.string().max(191),
    datasheet_path: z.string().max(191),
    remove_images: z.array(z.string().max(191)),
    remove_documents: z.array(z.string().uuid()),
  })
  .refine((p) => isAreaKey(p.area) && areas[p.area].categories.some((c) => c.slug === p.category), {
    message: "Ismeretlen kategória.",
    path: ["category"],
  })
  .refine((p) => p.price_mode !== "public" || p.price !== null || p.sale_price !== null, {
    message: "Nyilvános árhoz adja meg az árat (vagy válasszon másik ármegjelenítést).",
    path: ["price"],
  })
  .refine((p) => p.sale_price === null || p.price === null || p.sale_price < p.price, {
    message: "Az akciós ár legyen kisebb, mint a normál ár.",
    path: ["sale_price"],
  });

export const productIdSchema = z.object({ id: z.string().uuid() });

export type ProductInput = z.infer<typeof productSchema>;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_BYTES = 10 * 1024 * 1024;
export const MAX_GALLERY = 12;

/** Reads the product form (FormData: fields + main image + gallery images + PDF). */
export function parseProductForm(form: FormData) {
  const str = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : "";
  };
  // A file, or the URL of a file the browser already uploaded to Vercel Blob
  const isUpload = (v: unknown): v is File | string =>
    (v instanceof File && v.size > 0) || (typeof v === "string" && v.startsWith("https://"));
  const file = (k: string) => {
    const v = form.get(k);
    return isUpload(v) ? v : null;
  };
  const area = str("area");
  const specKeys = isAreaKey(area) ? areas[area].specFields.map((f) => f.key) : [];
  const specs = Object.fromEntries(
    specKeys.map((k) => [k, str(`spec.${k}`).trim()]).filter(([, v]) => v),
  );
  const id = str("id");
  const product = productSchema.parse({
    ...(id ? { id } : {}),
    slug: str("slug"),
    area,
    category: str("category"),
    name: str("name"),
    brand: str("brand"),
    packaging: str("packaging"),
    highlights: str("highlights"),
    stock_status: str("stock_status") || "in_stock",
    price_mode: str("price_mode") || "ask",
    price_note: str("price_note"),
    seo_title: str("seo_title"),
    meta_description: str("meta_description"),
    keywords: str("keywords"),
    image_alt: str("image_alt"),
    short_description: str("short_description"),
    description: str("description"),
    price: str("price"),
    sale_price: str("sale_price"),
    price_unit: str("price_unit"),
    specs,
    featured: str("featured") === "on",
    published: str("published") === "on",
    sort_order: str("sort_order") || "0",
    image_path: str("image_path"),
    datasheet_path: str("datasheet_path"),
    remove_images: form.getAll("remove_images").filter((v): v is string => typeof v === "string"),
    remove_documents: form
      .getAll("remove_documents")
      .filter((v): v is string => typeof v === "string"),
  });
  // Extra PDFs: doc.certificate / doc.manual / doc.other (several files each) + optional title
  const documents = (["certificate", "manual", "other"] as const).flatMap((kind) =>
    form
      .getAll(`doc.${kind}`)
      .filter(isUpload)
      .map((file) => ({
        kind,
        file,
        title: (
          str(`doc_title.${kind}`).trim() ||
          (typeof file === "string" ? "" : file.name.replace(/\.pdf$/i, ""))
        ).slice(0, 200),
      })),
  );
  const gallery = form.getAll("gallery").filter(isUpload);
  return { product, image: file("image"), gallery, datasheet: file("datasheet"), documents };
}
