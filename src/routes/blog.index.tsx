import { Text } from '@/components/features/content/ContentProvider';
import { createFileRoute } from '@tanstack/react-router';
import { Breadcrumbs, PageHero } from '@/components/layouts/SiteChrome';
import { PostCard } from '@/components/features/blog/PostCard';
import { listPosts } from '@/lib/actions/content.functions';
import { pageHead } from '@/lib/utils/seo';

export const Route = createFileRoute('/blog/')({
  loader: () => listPosts(),
  head: () => pageHead('Tudástár – pellet, fűtés, takarmányozás', 'Gyakorlati cikkek pellet választásról, kályha karbantartásról, fűtési költségekről és takarmányozásról.'),
  component: Page,
});

function Page() {
  const posts = Route.useLoaderData();
  return <>
    <PageHero eyebrow="Blog" title="Tudástár" text="Gyakorlati tanácsok fűtéshez, tüzelőanyagokhoz, kályhákhoz és takarmányozáshoz."><Breadcrumbs items={[{ label: 'Tudástár' }]} /></PageHero>
    <section className="section soft-section"><div className="container">
      {posts.length ? <div className="post-grid">{posts.map(p => <PostCard key={p.id} post={p} />)}</div>
        : <p className="section-copy"><Text id="blog.empty">{"Hamarosan új cikkekkel jelentkezünk."}</Text></p>}
    </div></section>
  </>;
}
