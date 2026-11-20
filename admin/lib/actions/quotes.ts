"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { deleteQuoteRequest, setQuoteStatus } from "@/lib/db/queries/quotes";
import { toActionResult } from "@/lib/utils/action";
import type { ActionResult } from "@/types";

const idSchema = z.object({ id: z.string().uuid() });

export async function markQuote(input: { id: string; done: boolean }): Promise<ActionResult> {
  return toActionResult(async () => {
    await requireAdmin();
    const { id } = idSchema.parse(input);
    await setQuoteStatus(id, input.done ? "done" : "new");
    revalidatePath("/");
  });
}

export async function removeQuote(input: { id: string }): Promise<ActionResult> {
  return toActionResult(async () => {
    await requireAdmin();
    await deleteQuoteRequest(idSchema.parse(input).id);
    revalidatePath("/");
  });
}
