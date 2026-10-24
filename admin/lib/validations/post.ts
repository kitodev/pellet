import { z } from "zod";

export const postSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().max(120).regex(/^[a-z0-9-]*$/, "Az URL csak kisbetűt, számot és kötőjelet tartalmazhat."),
  title: z.string().trim().min(1, "Adjon meg címet.").max(200),
  excerpt: z.string().trim().max(500, "A bevezető legfeljebb 500 karakter."),
  meta_description: z.string().trim().max(300, "A Google-leírás legfeljebb 300 karakter."),
  body: z.string().max(200_000),
  status: z.enum(["draft", "published"]),
  cover_path: z.string().max(191),
});
export type PostInput = z.infer<typeof postSchema>;

export function parsePostForm(form: FormData) {
  const str = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : "";
  };
  const id = str("id");
  const cover = form.get("cover");
  const post = postSchema.parse({
    ...(id ? { id } : {}),
    slug: str("slug"), title: str("title"), excerpt: str("excerpt"), meta_description: str("meta_description"), body: str("body"),
    status: str("status") === "published" ? "published" : "draft", cover_path: str("cover_path"),
  });
  return { post, cover: cover instanceof File && cover.size > 0 ? cover : null };
}
