import { Text } from '@/components/features/content/ContentProvider';
import { useAreas, useContent, useProducts, useText } from '@/hooks/useContent';
import { Link } from '@tanstack/react-router';
import { ArrowRight, BadgeCheck, Calculator, Clock, Flame, Handshake, Leaf, MessageSquare, Package, Quote, Star, Truck, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid, areaImage } from '@/components/features/catalog/AreaPages';
import { areaKeys } from '@/lib/content/catalog';
import { formatDate } from '@/lib/utils/format';

/** Rövid bemutatkozás + the four product areas (≤ 3 clicks to any product). */
export function IntroSection() {
  const areas = useAreas();
  const products = useProducts();
  return <section className="section soft-section"><div className="container">
    <div className="intro-grid"><div><div className="eyebrow"><Text id="home.intro.eyebrow">{"Bemutatkozás"}</Text></div><h2><Text id="home.intro.title">{"Minden, ami a meleg otthonhoz és az állattartáshoz kell"}</Text></h2></div>
      <p className="section-copy"><Text id="home.intro.text">{"A Pellet Centrum Kft.-nél egy helyen találja a fűtőanyagokat, a takarmányokat, a kályhákat és a hozzájuk tartozó kiegészítőket. Segítünk kiválasztani a megfelelő terméket, és szállítással, telepítéssel, szervizzel is rendelkezésére állunk."}</Text></p></div>
    <div className="area-tiles">{areaKeys.map(k => { const a = areas[k]; const count = products.filter(p => p.area === k).length; return <Link key={k} to="/$terulet" params={{ terulet: k }} className="area-tile">
      <img src={areaImage[k]} alt="" width={1024} height={768} loading="lazy" />
      <div><h3>{a.label}</h3><ul>{a.categories.slice(0, 4).map(c => <li key={c.slug}>{c.name}</li>)}{a.categories.length > 4 && <li>+{a.categories.length - 4}</li>}</ul><span className="choice-cta">{count ? `${count} termék` : <Text id="home.tiles.cta">{"Megnézem"}</Text>} <ArrowRight size={14} /></span></div>
    </Link>; })}</div>
  </div></section>;
}

export function FeaturedSection() {
  const products = useProducts().filter(p => p.featured).slice(0, 6);
  if (!products.length) return null;
  return <section className="section"><div className="container"><div className="section-heading"><div><div className="eyebrow"><Text id="home.featured.eyebrow">{"Ajánlatunk"}</Text></div><h2><Text id="home.featured.title">{"Kiemelt termékek"}</Text></h2></div></div><ProductGrid products={products} /></div></section>;
}

export function SaleSection() {
  const products = useProducts().filter(p => p.sale_price !== null).slice(0, 6);
  if (!products.length) return null;
  return <section className="section sale-section"><div className="container"><div className="section-heading"><div><div className="eyebrow"><Text id="home.sale.eyebrow">{"Ne maradjon le róla"}</Text></div><h2><Text id="home.sale.title">{"Aktuális akciók"}</Text></h2></div><p><Text id="home.sale.text">{"Az akciós árak a készlet erejéig érvényesek."}</Text></p></div><ProductGrid products={products} /></div></section>;
}

const reasons = [
  { icon: Leaf, t: 'Természetes alapanyagok', d: 'Megújuló forrásból származó pellet fűtéshez és takarmányozáshoz.' },
  { icon: BadgeCheck, t: 'Ellenőrzött minőség', d: 'Olyan termékeket kínálunk, amelyek mögött ki tudunk állni.' },
  { icon: Handshake, t: 'Személyre szabott ajánlat', d: 'Az Ön igényeihez és mennyiségéhez igazítva.' },
  { icon: Wrench, t: 'Szakértő szerviz', d: 'Telepítés, beüzemelés, karbantartás és hibaelhárítás.' },
  { icon: Flame, t: 'Teljes fűtési kínálat', d: 'Pellet, kályha, kémény, füstcső és tartozékok egy helyen.' },
  { icon: Truck, t: 'Kényelmes beszerzés', d: 'Ne akkor keresse a pelletet, amikor már mindenki keresi!' },
];

export function ReasonsSection() {
  return <section className="section soft-section" id="miert-minket"><div className="container">
    <div className="section-heading"><div><div className="eyebrow"><Text id="home.reasons.eyebrow">{"Előnyeink"}</Text></div><h2><Text id="home.reasons.title">{"Miért válasszon minket?"}</Text></h2></div></div>
    <div className="reason-grid">{reasons.map((r, i) => <div className="reason-card" key={r.t}><r.icon /><h3><Text id={`miert-minket.reason.${i}.t`}>{r.t}</Text></h3><p><Text id={`miert-minket.reason.${i}.d`}>{r.d}</Text></p></div>)}</div>
  </div></section>;
}

export function DeliverySection() {
  return <section className="pellet-trust" aria-labelledby="delivery-title"><div className="container delivery">
    <div><div className="eyebrow"><Text id="home.delivery.eyebrow">{"Szállítás"}</Text></div><h2 id="delivery-title"><Text id="home.delivery.title">{"Szállítási információk"}</Text></h2><p><Text id="home.delivery.text">{"Zsákos és raklapos tételeket, takarmányt és kályhákat is házhoz szállítunk. A szállítás díjáról és időpontjáról ajánlatkéréskor vagy telefonon tájékoztatjuk."}</Text></p><Button asChild variant="outline" className="mt-4"><Link to="/szolgaltatasok" hash="szallitas"><Text id="home.delivery.link">{"Részletek"}</Text><ArrowRight /></Link></Button></div>
    <div className="trust-grid">{[{ icon: Package, k: 'home.delivery.p1', t: 'Zsákos és raklapos tételek' }, { icon: Truck, k: 'home.delivery.p2', t: 'Házhoz szállítás' }, { icon: Clock, k: 'home.delivery.p3', t: 'Egyeztetett időpontban' }, { icon: Wrench, k: 'home.delivery.p4', t: 'Kályháknál telepítéssel' }].map(x => <div className="trust-item" key={x.k}><x.icon /><div><strong><Text id={x.k}>{x.t}</Text></strong></div></div>)}</div>
  </div></section>;
}

export function ReviewsSection() {
  const reviews = useContent()?.reviews ?? [];
  if (!reviews.length) return null;
  return <section className="section"><div className="container">
    <div className="section-heading"><div><div className="eyebrow"><Text id="home.reviews.eyebrow">{"Vásárlóink mondták"}</Text></div><h2><Text id="home.reviews.title">{"Vásárlói vélemények"}</Text></h2></div></div>
    <div className="review-grid">{reviews.slice(0, 6).map(r => <figure className="review-card" key={r.id}>
      <div className="stars" aria-label={`${r.rating} / 5 csillag`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={15} className={i < r.rating ? 'on' : ''} />)}</div>
      <Quote className="review-quote" size={22} /><blockquote>{r.body}</blockquote>
      <figcaption><strong>{r.author}</strong>{[r.location, r.source, formatDate(r.review_date)].filter(Boolean).join(' · ')}</figcaption>
    </figure>)}</div>
  </div></section>;
}

export function ContactCtaSection() {
  const phone = useText('contact.phone', '');
  return <section className="cta-band"><div className="container">
    <div><h2><Text id="home.cta.title">{"Kérdése van, vagy ajánlatot kérne?"}</Text></h2><p><Text id="home.cta.text">{"Írjon nekünk, és hamarosan személyre szabott ajánlattal jelentkezünk."}</Text>{phone && <> <Text id="home.cta.phone">{"Telefonon:"}</Text> <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a></>}</p></div>
    <div className="cta-actions"><Button asChild><Link to="/arajanlat"><Text id="home.cta.quote">{"Ajánlatot kérek"}</Text><ArrowRight /></Link></Button><Button asChild variant="outline"><Link to="/kapcsolat"><MessageSquare /><Text id="home.cta.contact">{"Kapcsolat"}</Text></Link></Button><Button asChild variant="ghost"><Link to="/kalkulator"><Calculator /><Text id="index.text.22">{"Kazánkalkulátor"}</Text></Link></Button></div>
  </div></section>;
}
