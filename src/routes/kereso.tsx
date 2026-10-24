import { createFileRoute, Link } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { PageHero } from '@/components/layouts/SiteChrome';
import { searchSite } from '@/lib/content/catalog';
import { useContent } from '@/hooks/useContent';
export const Route = createFileRoute('/kereso')({
  validateSearch: (s: Record<string, unknown>): { q?: string } => (typeof s['q'] === 'string' ? { q: s['q'] } : {}),
  head: () => ({ meta: [{ title: 'Kereső – Pellet Centrum Kft.' }, { name: 'description', content: 'Keressen termékeink és szolgáltatásaink között.' }, { property: 'og:title', content: 'Kereső – Pellet Centrum Kft.' }, { property: 'og:description', content: 'Keressen termékeink és szolgáltatásaink között.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }), component: Page });
function Page() {
  const { q = '' } = Route.useSearch(); const navigate = Route.useNavigate(); const hits = searchSite(q);
  const content = useContent();
  const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (q.trim()) for (const p of content?.products ?? []) if (norm(`${p.name} ${p.description}`).includes(norm(q.trim()))) hits.push({ title: p.name, text: p.short_description || p.description, to: '/$terulet/$kategoria/$termek', params: { terulet: p.area, kategoria: p.category, termek: p.slug } });
  return <><PageHero eyebrow="Keresés" title="Mit keres?" /><section className="section"><div className="container narrow">
    <label className="search-box"><Search /><input aria-label="Keresés" autoFocus value={q} placeholder="pl. pellet, lótáp, kályha, füstcső…" onChange={e => navigate({ search: e.target.value ? { q: e.target.value } : {}, replace: true })} /></label>
    {q && <p className="section-copy">{hits.length} találat</p>}
    <div className="search-results">{hits.map(h => <Link key={`${h.to}${h.title}`} to={h.to} params={h.params ?? {}}><strong>{h.title}</strong><span>{h.text}</span></Link>)}</div>
  </div></section></>;
}
