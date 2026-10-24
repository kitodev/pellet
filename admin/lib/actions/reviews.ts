"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { deleteReviewById, upsertReview } from "@/lib/db/queries/reviews";
import { reviewSchema, type ReviewInput } from "@/lib/validations/review";
import { toActionResult } from "@/lib/utils/action";
import type { ActionResult } from "@/types";

export async function saveReview(input: ReviewInput): Promise<ActionResult> {
  return toActionResult(async () => {
    await requireAdmin();
    await upsertReview(reviewSchema.parse(input));
    revalidatePath("/");
  });
}

export async function deleteReview(input: { id: string }): Promise<ActionResult> {
  return toActionResult(async () => {
    await requireAdmin();
    await deleteReviewById(z.object({ id: z.string().uuid() }).parse(input).id);
    revalidatePath("/");
  });
}
