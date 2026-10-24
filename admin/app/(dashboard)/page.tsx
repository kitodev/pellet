import { requireUser } from "@/lib/auth/session";
import { listProducts } from "@/lib/db/queries/products";
import { listReviews } from "@/lib/db/queries/reviews";
import { listPosts } from "@/lib/db/queries/posts";
import { listTexts } from "@/lib/db/queries/texts";
import { AdminTabs } from "@/components/features/dashboard/AdminTabs";

export default async function DashboardPage() {
  const { isAdmin } = await requireUser();
  if (!isAdmin) return null;
  const [products, reviews, posts, texts] = await Promise.all([listProducts(), listReviews(), listPosts(), listTexts()]);
  return <AdminTabs products={products} reviews={reviews} posts={posts} texts={texts} />;
}
