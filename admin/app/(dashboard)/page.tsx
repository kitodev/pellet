import { requireUser } from "@/lib/auth/session";
import { listProducts } from "@/lib/db/queries/products";
import { listReviews } from "@/lib/db/queries/reviews";
import { listPosts } from "@/lib/db/queries/posts";
import { listTexts } from "@/lib/db/queries/texts";
import { listSlides } from "@/lib/db/queries/slides";
import { AdminTabs } from "@/components/features/dashboard/AdminTabs";

export default async function DashboardPage() {
  const { isAdmin } = await requireUser();
  if (!isAdmin) return null;
  const [products, slides, reviews, posts, texts] = await Promise.all([
    listProducts(),
    // slides table: migration 005 (pnpm db:migrate) – until then the tab is just empty
    listSlides().catch(() => []),
    listReviews(),
    listPosts(),
    listTexts(),
  ]);
  return (
    <AdminTabs products={products} slides={slides} reviews={reviews} posts={posts} texts={texts} />
  );
}
