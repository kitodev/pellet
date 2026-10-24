import { Text } from '@/components/features/content/ContentProvider';
import { useText } from '@/hooks/useContent';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Award, History, MapPin, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs, PageHero } from '@/components/layouts/SiteChrome';
import { ContactMap, useContactDetails } from '@/components/features/contact/ContactDetails';
import { pageHead } from '@/lib/utils/seo';
import pellets from '@/assets/wood-pellets.jpg';

export const Route = createFileRoute('/rolunk')({
  head: () => pageHead('Rólunk', 'Ismerje meg a Pellet Centrum Kft.-t: történetünk, küldetésünk, telephelyünk, referenciáink és minősítéseink.'),
  component: Page,
});

/** A text block that only appears once the admin has filled it in. */
function AboutBlock({ id, icon: Icon, title }: { id: string; icon: typeof History; title: string }) {
  const body = useText(`about.${id}`, '');
  if (!body.trim()) return null;
  return <article className="about-block"><Icon /><div><h2><Text id={`about.${id}.title`}>{title}</Text></h2><p className="whitespace-pre-line">{body}</p></div></article>;
}

function Page() {
  const contact = useContactDetails();
  return <>
    <PageHero eyebrow="Ismerjen meg minket" title="Rólunk" text="Fűtésben és állattartásban is megbízható partner."><Breadcrumbs items={[{ label: 'Rólunk' }]} /></PageHero>
    <section className="section"><div className="container about-grid"><div>
      <div className="eyebrow"><Target size={14} /> <Text id="about.mission.title">{"Küldetésünk"}</Text></div>
      <h2><Text id="rolunk.text.1">{"Jó fűtés és jó takarmány."}</Text><br /><Text id="rolunk.text.2">{"Biztos alapokra építve."}</Text></h2>
      <p className="section-copy whitespace-pre-line"><Text id="about.mission">{"Célunk, hogy vásárlóink egy helyen, megbízható minőségben jussanak hozzá mindenhez, ami a meleg otthonhoz és az állatok egészséges tartásához kell – szakértő tanácsadással, szállítással és szervizzel."}</Text></p>
      <Button asChild><Link to="/kapcsolat"><Text id="rolunk.text.8">{"Vegye fel velünk a kapcsolatot"}</Text><ArrowRight /></Link></Button>
    </div><div className="about-picture"><img src={pellets} width={1024} height={768} alt="Természetes fapellet" /></div></div></section>
    <section className="section soft-section"><div className="container about-blocks">
      <AboutBlock id="history" icon={History} title="A cég története" />
      <AboutBlock id="references" icon={Users} title="Referenciák" />
      <AboutBlock id="certifications" icon={Award} title="Minősítések" />
      {(contact.address || contact.map) && <article className="about-block"><MapPin /><div><h2><Text id="about.site.title">{"Telephelyünk"}</Text></h2>{contact.address && <p>{contact.address}</p>}<ContactMap /></div></article>}
    </div></section>
  </>;
}
