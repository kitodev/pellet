import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Érvénytelen e-mail-cím.").max(191),
  password: z.string().min(1, "Adja meg a jelszót."),
});
export type LoginInput = z.infer<typeof loginSchema>;
