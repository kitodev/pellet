"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import {
  addProductImages,
  deleteProductById,
  getProduct,
  removeProductImages,
  uniqueSlug,
  upsertProduct,
} from "@/lib/db/queries/products";
import { deleteUpload, saveUpload } from "@/lib/storage/uploads";
import { MAX_GALLERY, parseProductForm, productIdSchema } from "@/lib/validations/product";
import { toActionResult } from "@/lib/utils/action";
import type { ActionResult } from "@/types";

/**
 * Create or update a product. FormData fields: id?, slug, area, category, name, short_description, description,
 * price, sale_price, price_unit, spec.<key>, featured, published, sort_order, image_path, datasheet_path,
 * remove_images[]; files: image, gallery[], datasheet.
 */
export async function saveProduct(
  form: FormData,
): Promise<ActionResult<{ id: string; slug: string }>> {
  return toActionResult(async () => {
    await requireAdmin();
    const { product, image, gallery, datasheet } = parseProductForm(form);
    const previous = product.id ? await getProduct(product.id) : null;
    if (product.id && !previous) throw new Error("A termék nem található.");
    const keptGallery = (previous?.images ?? []).filter((p) => !product.remove_images.includes(p));
    if (keptGallery.length + gallery.length > MAX_GALLERY)
      throw new Error(`Legfeljebb ${MAX_GALLERY} további kép tölthető fel.`);

    const uploaded: { folder: "products" | "datasheets"; name: string }[] = [];
    try {
      const newImage = image ? await saveUpload("products", image) : null;
      if (newImage) uploaded.push({ folder: "products", name: newImage });
      const newGallery: string[] = [];
      for (const g of gallery) {
        const n = await saveUpload("products", g);
        uploaded.push({ folder: "products", name: n });
        newGallery.push(n);
      }
      const newSheet = datasheet ? await saveUpload("datasheets", datasheet) : null;
      if (newSheet) uploaded.push({ folder: "datasheets", name: newSheet });

      // Keep existing files unless replaced or removed in the form.
      const image_path =
        newImage ??
        (product.image_path && product.image_path === previous?.image_path
          ? previous.image_path
          : "");
      const datasheet_path =
        newSheet ??
        (product.datasheet_path && product.datasheet_path === previous?.datasheet_path
          ? previous.datasheet_path
          : "");
      const slug = await uniqueSlug("products", product.slug || product.name, product.id);
      const id = await upsertProduct({ ...product, slug, image_path, datasheet_path });

      const removed = (previous?.images ?? []).filter((p) => product.remove_images.includes(p));
      await removeProductImages(id, removed);
      await addProductImages(id, newGallery, keptGallery.length);

      const orphans = [
        ...(previous?.image_path && previous.image_path !== image_path
          ? [{ folder: "products" as const, name: previous.image_path }]
          : []),
        ...(previous?.datasheet_path && previous.datasheet_path !== datasheet_path
          ? [{ folder: "datasheets" as const, name: previous.datasheet_path }]
          : []),
        ...removed.map((name) => ({ folder: "products" as const, name })),
      ];
      await Promise.all(orphans.map((o) => deleteUpload(o.folder, o.name)));
      revalidatePath("/");
      return { id, slug };
    } catch (error) {
      await Promise.all(uploaded.map((u) => deleteUpload(u.folder, u.name)));
      if (error instanceof Error && /Duplicate entry/.test(error.message))
        throw new Error("Ez az URL már foglalt, válasszon másikat.");
      throw error;
    }
  });
}

export async function deleteProduct(input: { id: string }): Promise<ActionResult> {
  return toActionResult(async () => {
    await requireAdmin();
    const { id } = productIdSchema.parse(input);
    const product = await getProduct(id);
    if (!product) throw new Error("A termék nem található.");
    await deleteProductById(id);
    await Promise.all([
      deleteUpload("products", product.image_path),
      ...product.images.map((i) => deleteUpload("products", i)),
      deleteUpload("datasheets", product.datasheet_path),
    ]);
    revalidatePath("/");
  });
}
