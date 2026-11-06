"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { deleteSlideById, getSlide, upsertSlide } from "@/lib/db/queries/slides";
import { deleteUpload, saveUpload } from "@/lib/storage/uploads";
import { parseSlideForm } from "@/lib/validations/slide";
import { toActionResult } from "@/lib/utils/action";
import type { ActionResult } from "@/types";

/** FormData: id?, page, title, subtitle, button_label, link_url, published, sort_order, image_path; file: image. */
export async function saveSlide(form: FormData): Promise<ActionResult<{ id: string }>> {
  return toActionResult(async () => {
    await requireAdmin();
    const { slide, image } = parseSlideForm(form);
    const previous = slide.id ? await getSlide(slide.id) : null;
    if (slide.id && !previous) throw new Error("A slide nem található.");
    const newImage = image ? await saveUpload("slides", image) : null;
    const image_path = newImage ?? previous?.image_path ?? "";
    if (!image_path) throw new Error("Válasszon képet a slide-hoz.");
    try {
      const id = await upsertSlide({ ...slide, image_path });
      if (previous?.image_path && previous.image_path !== image_path)
        await deleteUpload("slides", previous.image_path);
      revalidatePath("/");
      return { id };
    } catch (error) {
      await deleteUpload("slides", newImage);
      throw error;
    }
  }, "A slide mentése sikertelen. (Lefutott a pnpm db:migrate?)");
}

export async function deleteSlide(input: { id: string }): Promise<ActionResult> {
  return toActionResult(async () => {
    await requireAdmin();
    const { id } = z.object({ id: z.string().uuid() }).parse(input);
    const slide = await getSlide(id);
    await deleteSlideById(id);
    await deleteUpload("slides", slide?.image_path);
    revalidatePath("/");
  });
}
