import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layouts/SiteChrome";
import { Markdown } from "@/components/features/blog/Markdown";
import { readPost } from "@/lib/actions/content.functions";
import { formatDate, readingMinutes } from "@/lib/utils/format";
import { jsonLd, pageHead } from "@/lib/utils/seo";
import { uploadUrl } from "@/lib/utils/urls";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await readPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead(loaderData.title, loaderData.meta_description || loaderData.excerpt, {
          type: "article",
          ...(loaderData.cover_path ? { image: uploadUrl("blog", loaderData.cover_path) } : {}),
        })
      : {},
  component: Page,
});

function Page() {
  const post = Route.useLoaderData();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description || post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at ?? post.published_at,
    author: { "@type": "Organization", name: "Pellet Centrum Kft." },
    publisher: { "@type": "Organization", name: "Pellet Centrum Kft." },
    ...(post.cover_path ? { image: uploadUrl("blog", post.cover_path) } : {}),
  };
  return (
    <article className="section article-page">
      <div className="container narrow">
        <Breadcrumbs items={[{ label: "Tudástár", to: "/blog" }, { label: post.title }]} />
        <header className="article-header">
          <h1>{post.title}</h1>
          <p className="article-meta">
            <time dateTime={post.published_at ?? ""}>{formatDate(post.published_at)}</time> ·{" "}
            {readingMinutes(post.body)} perc olvasás
          </p>
          {post.excerpt && <p className="lead">{post.excerpt}</p>}
        </header>
        {post.cover_path && (
          <img
            className="article-cover"
            src={uploadUrl("blog", post.cover_path)}
            alt=""
            width={1024}
            height={576}
          />
        )}
        <Markdown source={post.body} />
        <footer className="article-footer">
          <Button asChild variant="outline">
            <Link to="/blog">
              <ArrowLeft />
              Vissza a Tudástárba
            </Link>
          </Button>
          <Button asChild>
            <Link to="/arajanlat">
              Ajánlatot kérek
              <ArrowRight />
            </Link>
          </Button>
        </footer>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      </div>
    </article>
  );
}
