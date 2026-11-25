import { Text } from "@/components/features/content/ContentProvider";
import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs, PageHero } from "@/components/layouts/SiteChrome";
import { PostCard } from "@/components/features/blog/PostCard";
import { listPosts } from "@/lib/actions/content.functions";
import { pageHead } from "@/lib/utils/seo";

export const Route = createFileRoute("/blog/")({
  loader: () => listPosts(),
  head: () =>
    pageHead(
      "Tudástár – pellet, fűtés, takarmányozás",
      "Gyakorlati cikkek pellet választásról, kályha karbantartásról, fűtési költségekről és takarmányozásról.",
    ),
  component: Page,
});

function Page() {
  const posts = Route.useLoaderData();
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Tudástár"
        text="Gyakorlati tanácsok fűtéshez, tüzelőanyagokhoz, kályhákhoz és takarmányozáshoz."
      >
        <Breadcrumbs items={[{ label: "Tudástár" }]} />
      </PageHero>
      <section className="section soft-section" aria-labelledby="post-list-title">
        <div className="container">
          <h2 id="post-list-title" className="sr-only">
            Cikkek
          </h2>
          {posts.length ? (
            <ul className="post-grid">
              {posts.map((p) => (
                <li key={p.id}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="section-copy">
              <Text id="blog.empty">{"Hamarosan új cikkekkel jelentkezünk."}</Text>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
