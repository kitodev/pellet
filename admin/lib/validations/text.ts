import { z } from "zod";

export const textSchema = z.object({ key: z.string().min(1).max(191), value: z.string().max(10000) });
export const textsSchema = z.array(textSchema).max(100);
export type TextInput = z.infer<typeof textSchema>;
