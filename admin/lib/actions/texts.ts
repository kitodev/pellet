"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { upsertText } from "@/lib/db/queries/texts";
import { textSchema, textsSchema, type TextInput } from "@/lib/validations/text";
import { toActionResult } from "@/lib/utils/action";
import type { ActionResult } from "@/types";

export async function saveText(input: TextInput): Promise<ActionResult> {
  return toActionResult(async () => {
    await requireAdmin();
    const data = textSchema.parse(input);
    await upsertText(data).catch(() => {
      throw new Error("A szöveg mentése sikertelen.");
    });
    revalidatePath("/");
  });
}

/** Saves several texts at once (Elérhetőségek / Rólunk form). */
export async function saveTexts(input: TextInput[]): Promise<ActionResult> {
  return toActionResult(async () => {
    await requireAdmin();
    for (const t of textsSchema.parse(input)) await upsertText(t);
    revalidatePath("/");
  });
}
