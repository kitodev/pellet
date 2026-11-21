import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSession } from "@/lib/auth/session";
import { blobEnabled } from "@/lib/storage/uploads";
import { MAX_IMAGE_BYTES, MAX_PDF_BYTES } from "@/lib/validations/product";

const IMAGE = ["image/jpeg", "image/png", "image/webp"];
const FOLDERS: Record<string, { types: string[]; max: number }> = {
  products: { types: IMAGE, max: MAX_IMAGE_BYTES },
  slides: { types: IMAGE, max: MAX_IMAGE_BYTES },
  blog: { types: IMAGE, max: MAX_IMAGE_BYTES },
  datasheets: { types: ["application/pdf"], max: MAX_PDF_BYTES },
};

/**
 * Direct browser → Vercel Blob uploads (Vercel functions accept max. 4.5 MB per request,
 * so photos and PDFs don't go through the Server Actions). Only for signed-in admins.
 * Returns 501 when BLOB_READ_WRITE_TOKEN is not set (local run) – the form then sends the files itself.
 */
/** Does this deployment have online file storage? (the forms ask before uploading) */
export async function GET() {
  return Response.json({ enabled: blobEnabled() });
}

export async function POST(request: Request) {
  if (!blobEnabled()) return Response.json({ error: "blob-disabled" }, { status: 501 });
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const { isAdmin } = await getSession();
        if (!isAdmin) throw new Error("Nincs jogosultsága.");
        const m = /^(products|slides|blog|datasheets)\/[a-f0-9-]{36}\.(jpe?g|png|webp|pdf)$/i.exec(
          pathname,
        );
        const rule = m ? FOLDERS[m[1]!.toLowerCase()] : undefined;
        if (!rule) throw new Error("Érvénytelen fájlnév.");
        return {
          allowedContentTypes: rule.types,
          maximumSizeInBytes: rule.max,
          addRandomSuffix: false,
        };
      },
    });
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Feltöltési hiba." },
      { status: 400 },
    );
  }
}
