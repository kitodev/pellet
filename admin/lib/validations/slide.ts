import { z } from "zod";

export const slideSchema = z.object({
  id: z.string().uuid().optional(),
  page: z.enum(["home", "termekek"]),
  title: z.string().trim().max(160, "A cím legfeljebb 160 karakter."),
  subtitle: z.string().trim().max(300, "Az alcím legfeljebb 300 karakter."),
  button_label: z.string().trim().max(60, "A gomb felirata legfeljebb 60 karakter."),
  link_url: z
    .string()
    .trim()
    .max(300)
    .refine(
      (v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v),
      "A link /-rel (pl. /termekek) vagy https://-sel kezdődjön.",
    ),
  image_path: z.string().max(191),
  published: z.boolean(),
  sort_order: z.number().int().min(-9999).max(9999),
});
export type SlideInput = z.infer<typeof slideSchema>;

export function parseSlideForm(form: FormData) {
  const str = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : "";
  };
  const id = str("id");
  const image = form.get("image");
  const slide = slideSchema.parse({
    ...(id ? { id } : {}),
    page: str("page") === "termekek" ? "termekek" : "home",
    title: str("title"),
    subtitle: str("subtitle"),
    button_label: str("button_label"),
    link_url: str("link_url"),
    image_path: str("image_path"),
    published: str("published") === "on" || str("published") === "true",
    sort_order: Number(str("sort_order")) || 0,
  });
  return { slide, image: image instanceof File && image.size > 0 ? image : null };
}
