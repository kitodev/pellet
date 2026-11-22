export type UploadFolder = "products" | "datasheets" | "blog" | "slides";

/**
 * Public URL of an uploaded file: online files (Vercel Blob) are stored as full URLs,
 * local ones as file names served by routes/uploads.$.ts, built-in site pictures as "/termekkepek/…" paths.
 */
export const uploadUrl = (folder: UploadFolder, name: string | null | undefined) =>
  !name
    ? ""
    : /^(https?:\/\/|\/)/.test(name)
      ? name
      : `/uploads/${folder}/${encodeURIComponent(name)}`;

export const productPath = (p: { area: string; category: string; slug: string }) =>
  `/${p.area}/${p.category}/${p.slug}`;
