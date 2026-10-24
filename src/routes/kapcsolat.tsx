import { Text } from '@/components/features/content/ContentProvider';
import { createFileRoute } from '@tanstack/react-router';
import { Breadcrumbs, PageHero } from '@/components/layouts/SiteChrome';
import { QuoteForm } from '@/components/features/quote/QuoteForm';
import { ContactDetails, ContactMap } from '@/components/features/contact/ContactDetails';
import { pageHead } from '@/lib/utils/seo';

export const Route = createFileRoute('/kapcsolat')({
  head: () => pageHead('Kapcsolat', 'Telefon, e-mail, telephely, nyitvatartás és térkép. Kérdése van fűtőanyagról, takarmányról, kályháról vagy szervizről? Írjon nekünk.'),
  component: Page,
});

function Page() {
  return <>
    <PageHero eyebrow="Találjuk meg a jó megoldást" title="Kapcsolat" text="Hívjon, írjon, vagy látogasson el hozzánk – szívesen segítünk."><Breadcrumbs items={[{ label: 'Kapcsolat' }]} /></PageHero>
    <section className="section soft-section"><div className="container contact-grid">
      <div><h2><Text id="contact.title">{"Elérhetőségeink"}</Text></h2><ContactDetails /><ContactMap /></div>
      <div><h2><Text id="contact.formTitle">{"Írjon nekünk"}</Text></h2><QuoteForm /></div>
    </div></section>
  </>;
}
