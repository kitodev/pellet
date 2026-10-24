import { createFileRoute } from '@tanstack/react-router';
import { PageHero } from '@/components/layouts/SiteChrome';
import { QuoteForm } from '@/components/features/quote/QuoteForm';
export const Route = createFileRoute('/arajanlat')({
  validateSearch: (s: Record<string, unknown>): { targy?: string } => (typeof s['targy'] === 'string' ? { targy: s['targy'] } : {}),
  head: () => ({ meta: [{ title: 'Árajánlatkérés – Pellet Centrum Kft.' }, { name: 'description', content: 'Kérjen személyre szabott árajánlatot pelletre, kazánra, takarmányra vagy szervizre.' }, { property: 'og:title', content: 'Árajánlatkérés – Pellet Centrum Kft.' }, { property: 'og:description', content: 'Kérjen személyre szabott árajánlatot pelletre, kazánra, takarmányra vagy szervizre.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }), component: Page });
function Page() { const { targy } = Route.useSearch(); return <><PageHero eyebrow="Személyre szabott ajánlat" title="Árajánlatkérés" text="Adja meg, mire van szüksége és milyen mennyiségben." /><section className="section soft-section"><div className="container narrow"><QuoteForm key={targy} {...(targy ? { initialSubject: targy } : {})} kind="Árajánlatkérés" /></div></section></>; }
