export type UploadFolder = "products" | "datasheets" | "blog";

/** Public URL of an uploaded file (served by routes/uploads.$.ts). */
export const uploadUrl = (folder: UploadFolder, name: string | null | undefined) =>
  name ? `/uploads/${folder}/${encodeURIComponent(name)}` : "";

export const productPath = (p: { area: string; category: string; slug: string }) =>
  `/${p.area}/${p.category}/${p.slug}`;
