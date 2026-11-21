"use client";
import { upload } from "@vercel/blob/client";

type Field = { name: string; folder: "products" | "slides" | "blog" | "datasheets" };

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

let blobAvailable: boolean | null = null;

/**
 * Online (Vercel): uploads the chosen files straight from the browser to Vercel Blob and puts
 * their URLs into the form in place of the files – so large photos / PDFs work too.
 * Locally (no Blob token) it leaves the form unchanged and the server stores the files.
 */
export async function uploadFormFiles(form: FormData, fields: Field[]) {
  if (blobAvailable === null) {
    blobAvailable = await fetch("/api/blob-upload")
      .then((r) => r.json() as Promise<{ enabled?: boolean }>)
      .then((r) => r.enabled === true)
      .catch(() => false);
  }
  if (!blobAvailable) return;
  for (const { name, folder } of fields) {
    const files = form.getAll(name).filter((v): v is File => v instanceof File && v.size > 0);
    if (!files.length) continue;
    const urls: string[] = [];
    for (const file of files) {
      const ext = EXT[file.type];
      if (!ext) throw new Error(`Nem támogatott fájltípus: ${file.name}`);
      try {
        const blob = await upload(`${folder}/${crypto.randomUUID()}.${ext}`, file, {
          access: "public",
          handleUploadUrl: "/api/blob-upload",
          contentType: file.type,
        });
        urls.push(blob.url);
      } catch (error) {
        throw new Error(
          `A(z) „${file.name}” feltöltése nem sikerült${error instanceof Error && error.message ? `: ${error.message}` : "."}`,
        );
      }
    }
    form.delete(name);
    for (const u of urls) form.append(name, u);
  }
}
