import { z } from 'zod';

export const productSchema = z.object({
  id: z.string().uuid().optional(),
  area: z.enum(['futoanyagok', 'takarmanyok', 'kalyhak-kandallok', 'kiegeszitok']),
  category: z.string().min(1).max(80),
  name: z.string().trim().min(1).max(200),
  description: z.string().max(10000),
  image_path: z.string().max(500),
});
export const productIdSchema = z.object({ id: z.string().uuid() });
export const textSchema = z.object({ key: z.string().min(1).max(191), value: z.string().max(10000) });
export const loginSchema = z.object({ email: z.string().trim().email().max(191), password: z.string().min(1).max(200) });

export type ProductInput = z.infer<typeof productSchema>;
export type TextInput = z.infer<typeof textSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function assertAdmin(allowed: boolean | null) {
  if (allowed !== true) throw new Error('Nincs adminisztrátori jogosultsága.');
}

/** Reads the product form (sent as FormData because it may contain an image). */
export function parseProductForm(form: FormData) {
  const str = (k: string) => (typeof form.get(k) === 'string' ? (form.get(k) as string) : '');
  const id = str('id');
  const product = productSchema.parse({ ...(id ? { id } : {}), area: str('area'), category: str('category'), name: str('name'), description: str('description'), image_path: str('image_path') });
  const image = form.get('image');
  return { product, image: image instanceof File && image.size > 0 ? image : null };
}
