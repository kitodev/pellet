import { z } from "zod";

export const reviewSchema = z.object({
  id: z.string().uuid().optional(),
  author: z.string().trim().min(1, "Adja meg a vásárló nevét.").max(120),
  location: z.string().trim().max(120),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(1, "Adja meg a véleményt.").max(3000),
  source: z.string().trim().max(80),
  review_date: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Érvénytelen dátum."),
  published: z.boolean(),
  sort_order: z.coerce.number().int().min(-100000).max(100000),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
