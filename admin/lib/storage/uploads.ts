import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { env } from "@/lib/env";
import { MAX_IMAGE_BYTES, MAX_PDF_BYTES } from "@/lib/validations/product";

export type UploadFolder = "products" | "datasheets" | "blog" | "slides";
const RULES: Record<
  UploadFolder,
  { types: Record<string, string>; max: number; error: string; name: RegExp }
> = {
  products: {
    types: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" },
    max: MAX_IMAGE_BYTES,
    error: "JPG, PNG vagy WebP képet válasszon (max. 5 MB).",
    name: /\.(jpe?g|png|webp)$/i,
  },
  blog: {
    types: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" },
    max: MAX_IMAGE_BYTES,
    error: "JPG, PNG vagy WebP képet válasszon (max. 5 MB).",
    name: /\.(jpe?g|png|webp)$/i,
  },
  slides: {
    types: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" },
    max: MAX_IMAGE_BYTES,
    error: "JPG, PNG vagy WebP képet válasszon (max. 5 MB).",
    name: /\.(jpe?g|png|webp)$/i,
  },
  datasheets: {
    types: { "application/pdf": "pdf" },
    max: MAX_PDF_BYTES,
    error: "PDF fájlt válasszon (max. 10 MB).",
    name: /\.pdf$/i,
  },
};
const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};
// Uploads live outside the app (shared with the website) – don't let the bundler trace them.
const dir = (folder: UploadFolder) =>
  path.join(/* turbopackIgnore: true */ env.UPLOADS_DIR, folder);
export const isUploadFolder = (v: string): v is UploadFolder => v in RULES;

/** Accepts only plain names like "uuid.jpg" (no folders → no path traversal). */
export const safeName = (folder: UploadFolder, name: string) =>
  /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name) && RULES[folder].name.test(name) ? name : null;

/** Online storage (Vercel Blob) is used when BLOB_READ_WRITE_TOKEN is set – always on Vercel. */
export const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** A file already uploaded to Vercel Blob by the browser (see app/api/blob-upload). */
export const isBlobUrl = (v: string) =>
  /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(v);

/**
 * Stores an uploaded file and returns what goes into the database:
 * a Vercel Blob URL (online) or a plain file name in UPLOADS_DIR (local / XAMPP).
 * `file` may also be the URL of a file the browser already uploaded to Vercel Blob.
 */
export async function saveUpload(folder: UploadFolder, file: File | string): Promise<string> {
  const rule = RULES[folder];
  if (typeof file === "string") {
    const ok =
      isBlobUrl(file) &&
      new URL(file).pathname.startsWith(`/${folder}/`) &&
      rule.name.test(new URL(file).pathname);
    if (!ok) throw new Error("Érvénytelen feltöltött fájl.");
    return file;
  }
  const ext = rule.types[file.type];
  if (!ext || file.size > rule.max) throw new Error(rule.error);
  const name = `${randomUUID()}.${ext}`;
  if (blobEnabled()) {
    const blob = await put(`${folder}/${name}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return blob.url;
  }
  await mkdir(dir(folder), { recursive: true });
  await writeFile(
    path.join(/* turbopackIgnore: true */ dir(folder), name),
    Buffer.from(await file.arrayBuffer()),
  );
  return name;
}

export async function deleteUpload(folder: UploadFolder, name: string | null | undefined) {
  if (name && isBlobUrl(name)) {
    if (blobEnabled()) await del(name).catch(() => undefined);
    return;
  }
  const safe = name ? safeName(folder, name) : null;
  if (safe)
    await unlink(path.join(/* turbopackIgnore: true */ dir(folder), safe)).catch(() => undefined);
}

export async function readUpload(folder: UploadFolder, name: string) {
  const safe = safeName(folder, name);
  if (!safe) return null;
  try {
    return {
      body: await readFile(path.join(/* turbopackIgnore: true */ dir(folder), safe)),
      type: MIME[safe.split(".").pop()!.toLowerCase()] ?? "application/octet-stream",
    };
  } catch {
    return null;
  }
}
