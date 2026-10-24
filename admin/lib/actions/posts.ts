"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { deletePostById, getPost, upsertPost } from "@/lib/db/queries/posts";
import { uniqueSlug } from "@/lib/db/queries/products";
import { deleteUpload, saveUpload } from "@/lib/storage/uploads";
import { parsePostForm } from "@/lib/validations/post";
import { toActionResult } from "@/lib/utils/action";
import type { ActionResult } from "@/types";

/** FormData: id?, slug, title, excerpt, meta_description, body, status, cover_path; file: cover. */
export async function savePost(form: FormData): Promise<ActionResult<{ id: string; slug: string }>> {
  return toActionResult(async () => {
    await requireAdmin();
    const { post, cover } = parsePostForm(form);
    const previous = post.id ? await getPost(post.id) : null;
    if (post.id && !previous) throw new Error("A cikk nem található.");
    if (post.status === "published" && post.body.trim().length < 50) throw new Error("A közzétételhez írjon legalább néhány mondatot.");
    const newCover = cover ? await saveUpload("blog", cover) : null;
    try {
      const cover_path = newCover ?? (post.cover_path && post.cover_path === previous?.cover_path ? previous.cover_path : "");
      const slug = await uniqueSlug("blog_posts", post.slug || post.title, post.id);
      const id = await upsertPost({ ...post, slug, cover_path });
      if (previous?.cover_path && previous.cover_path !== cover_path) await deleteUpload("blog", previous.cover_path);
      revalidatePath("/");
      return { id, slug };
    } catch (error) {
      await deleteUpload("blog", newCover);
      throw error;
    }
  });
}

export async function deletePost(input: { id: string }): Promise<ActionResult> {
  return toActionResult(async () => {
    await requireAdmin();
    const { id } = z.object({ id: z.string().uuid() }).parse(input);
    const post = await getPost(id);
    await deletePostById(id);
    await deleteUpload("blog", post?.cover_path);
    revalidatePath("/");
  });
}
