import { Text } from '@/components/features/content/ContentProvider';
import { useAreas, useText } from '@/hooks/useContent';
import { Link, useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronRight, Leaf, Mail, MapPin, Menu, Phone, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { groupedCategories, type AreaKey } from '@/lib/content/catalog';
import companyLogo from '@/assets/pellet-centrum-logo.jpg';
import { jsonLd as toJsonLd } from '@/lib/utils/seo';

export function Brand() {
  return <Link className="brand" to="/" aria-label="Pellet Centrum Kft. főoldal"><img className="company-logo" src={companyLogo} width={768} height={768} alt="Pellet Centrum Kft. logó" /><div className="brand-name"><Text id="SiteChrome.text.1">{"PELLET CENTRUM"}</Text><small><Text id="SiteChrome.text.2">{"KFT. · TERMÉSZETES ENERGIA"}</Text></small></div></Link>;
}

const productAreas: AreaKey[] = ['futoanyagok', 'takarmanyok', 'kalyhak-kandallok', 'kiegeszitok'];
const pagesAfter = [
  { label: 'Szolgáltatások', to: '/szolgaltatasok' },
  { label: 'Tudástár', to: '/blog' },
  { label: 'Rólunk', to: '/rolunk' },
  { label: 'Kapcsolat', to: '/kapcsolat' },
] as const;
const active = { className: 'active' };

/** Phone link for the header/footer (editable in the admin: contact.phone). */
function usePhone() {
  const phone = useText('contact.phone', '');
  return { phone, href: phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : '' };
}

export function SiteHeader() {
  const areas = useAreas();
  const path = useLocation().pathname;
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const { phone, href } = usePhone();
  useEffect(() => { setMenu(false); setOpen(null); }, [path]);
  return <>
    <div className="topbar"><div className="container"><span><Leaf size={12} /><Text id="SiteChrome.text.4">{"Természetes energia. Tudatos választás."}</Text></span><span className="top-location"><Text id="SiteChrome.text.5">{"Fűtőanyag • Takarmány • Kályhák • Szerviz"}</Text></span>{phone ? <a href={href}><Phone size={12} />{phone}</a> : <Link to="/arajanlat"><Text id="SiteChrome.text.6">{"Árajánlatot kérek"}</Text><ArrowRight size={12} /></Link>}</div></div>
    <header className="site-header">
      <div className="container header-inner"><Brand />
        <div className="header-actions">
          <Link to="/kereso" className="header-search" aria-label="Keresés az oldalon"><Search size={16} /><span><Text id="SiteChrome.text.13">{"Mit keres? pl. pellet, lótáp, kályha…"}</Text></span></Link>
          <Button asChild className="header-cta h-10 px-5 text-xs"><Link to="/arajanlat"><Text id="SiteChrome.text.8">{"Árajánlat"}</Text><ArrowRight /></Link></Button>
          <Button className="mobile-menu-button" variant="ghost" size="icon" aria-label={menu ? 'Menü bezárása' : 'Menü megnyitása'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</Button>
        </div>
      </div>
      <nav className="main-nav" aria-label="Fő navigáció"><div className="container">
        <Link to="/" activeOptions={{ exact: true }} activeProps={active}><Text id="nav.home">{"Kezdőlap"}</Text></Link>
        {productAreas.map(key => { const a = areas[key]; return <div className="nav-dropdown" key={key}>
          <Link to="/$terulet" params={{ terulet: key }} activeProps={active}>{a.label} <ChevronDown size={12} /></Link>
          <div className="mega-menu">{groupedCategories(a).map(g => <div key={g.group || key} className="mega-col"><span className="dropdown-title">{g.group || a.label}</span>{g.categories.map(c => <Link key={c.slug} to="/$terulet/$kategoria" params={{ terulet: key, kategoria: c.slug }}>{c.name}</Link>)}</div>)}
            <Link className="mega-all" to="/$terulet" params={{ terulet: key }}><Text id="nav.all">{"Összes termék"}</Text> <ArrowRight size={13} /></Link></div>
        </div>; })}
        {pagesAfter.map(l => <Link key={l.to} to={l.to} activeProps={active}>{l.label}</Link>)}
      </div></nav>
      {menu && <nav className="mobile-nav" aria-label="Mobil navigáció">
        <Link to="/">Kezdőlap</Link>
        {productAreas.map(key => { const a = areas[key]; const expanded = open === key; return <div key={key} className="mobile-group">
          <div className="mobile-group-head"><Link to="/$terulet" params={{ terulet: key }}>{a.label}</Link><button type="button" aria-expanded={expanded} aria-label={`${a.label} almenü`} onClick={() => setOpen(expanded ? null : key)}><ChevronDown size={18} className={expanded ? 'rotate-180' : ''} /></button></div>
          {expanded && groupedCategories(a).map(g => <div key={g.group || key} className="mobile-sub-group">{g.group && <span className="dropdown-title">{g.group}</span>}{g.categories.map(c => <Link key={c.slug} className="mobile-sub" to="/$terulet/$kategoria" params={{ terulet: key, kategoria: c.slug }}>{c.name}</Link>)}</div>)}
        </div>; })}
        {pagesAfter.map(l => <Link key={l.to} to={l.to}>{l.label}</Link>)}
        <Link to="/arajanlat" className="mobile-cta"><Text id="SiteChrome.text.10">{"Árajánlatkérés"}</Text></Link>
      </nav>}
    </header>
  </>;
}

export function SiteFooter() {
  const areas = useAreas();
  const { phone, href } = usePhone();
  const email = useText('contact.email', '');
  const address = useText('contact.address', '');
  const hours = useText('contact.hours', '');
  return <footer className="footer"><div className="container footer-grid">
    <div className="footer-brand"><Brand /><p><Text id="footer.text.1">{"Fűtőanyag, takarmány, kályhák és kiegészítők – egy helyen, szakértő segítséggel."}</Text></p></div>
    <div><h3><Text id="footer.products">{"Termékek"}</Text></h3>{productAreas.map(k => <Link key={k} to="/$terulet" params={{ terulet: k }}>{areas[k].label}</Link>)}</div>
    <div><h3><Text id="footer.info">{"Információ"}</Text></h3><Link to="/szolgaltatasok">Szolgáltatások</Link><Link to="/blog">Tudástár</Link><Link to="/rolunk">Rólunk</Link><Link to="/kalkulator">Kazánkalkulátor</Link><Link to="/kereso">Keresés</Link></div>
    <div><h3><Text id="footer.contact">{"Kapcsolat"}</Text></h3>
      {phone && <a href={href}><Phone size={13} />{phone}</a>}
      {email && <a href={`mailto:${email}`}><Mail size={13} />{email}</a>}
      {address && <span><MapPin size={13} />{address}</span>}
      {hours && <span className="whitespace-pre-line">{hours}</span>}
      <Link to="/kapcsolat" className="footer-more"><Text id="footer.contactLink">{"Elérhetőségek és térkép"}</Text> <ChevronRight size={13} /></Link>
    </div>
  </div><div className="container footer-bottom">© {new Date().getFullYear()} Pellet Centrum Kft. · <Text id="footer.slogan">{"Természetes energia. Megbízható meleg."}</Text></div></footer>;
}

/** Page title band. `id` is the key prefix for the admin-editable texts (id.eyebrow / id.title / id.text). */
export function PageHero({ id, eyebrow, title, text, children }: { id?: string | null; eyebrow: string; title: string; text?: string; children?: React.ReactNode }) {
  const path = useLocation().pathname.replace(/\/$/, '');
  // id === null: texts come from elsewhere (e.g. category names) – not editable here.
  const key = id === null ? '\u0000' : id ?? path;
  const heading = useText(`${key}.title`, title);
  const label = useText(`${key}.eyebrow`, eyebrow);
  const description = useText(`${key}.text`, text ?? '');
  return <section className="page-hero"><div className="container">{children}<div className="eyebrow">{label}</div><h1>{heading}</h1>{description && <p>{description}</p>}</div></section>;
}

export type Crumb = { label: string; to?: string; params?: Record<string, string> };

/** Breadcrumb trail (+ schema.org BreadcrumbList for Google). */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: 'Kezdőlap', to: '/' }, ...items];
  const href = (c: Crumb) => (c.to ?? '').replace(/\$(\w+)/g, (_, k: string) => c.params?.[k] ?? '');
  const jsonLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, ...(c.to ? { item: href(c) } : {}) })) };
  return <nav className="breadcrumbs" aria-label="Morzsamenü"><ol>{all.map((c, i) => <li key={i}>{c.to && i < all.length - 1 ? <Link to={c.to} params={c.params ?? {}}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}</li>)}</ol>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }} /></nav>;
}
