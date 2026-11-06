import { Text } from "@/components/features/content/ContentProvider";
import { useAreas, useText } from "@/hooks/useContent";
import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calculator,
  ChevronDown,
  ChevronRight,
  Leaf,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { productAreas, sectionTarget } from "@/lib/content/catalog";
import companyLogo from "@/assets/pellet-centrum-logo.jpg";
import { jsonLd as toJsonLd } from "@/lib/utils/seo";

export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Pellet Centrum Kft. főoldal">
      <img
        className="company-logo"
        src={companyLogo}
        width={768}
        height={768}
        alt="Pellet Centrum Kft. logó"
      />
      <div className="brand-name">
        <Text id="SiteChrome.text.1">{"PELLET CENTRUM"}</Text>
        <small>
          <Text id="SiteChrome.text.2">{"KFT. · TERMÉSZETES ENERGIA"}</Text>
        </small>
      </div>
    </Link>
  );
}

/** Main menu after Termékek (order from "Pelletcentrum weboldal váz.xlsx"). */
const pagesAfter = [
  { label: "Biomassza", to: "/biomassza" },
  { label: "Tudástár", to: "/blog" },
  { label: "Rólunk", to: "/rolunk" },
  { label: "Kapcsolat", to: "/kapcsolat" },
  { label: "Árajánlatkérés", to: "/arajanlat" },
] as const;
/** Szolgáltatások submenu – anchors on /szolgaltatasok (ids in routes/szolgaltatasok.tsx). */
const serviceLinks = [
  { id: "telepites", label: "Fűtőkészülékek telepítése" },
  { id: "beuzemeles", label: "Beüzemelés" },
  { id: "karbantartas", label: "Karbantartás" },
  { id: "szerviz", label: "Szerviz" },
  { id: "szallitas", label: "Szállítás" },
  { id: "tanacsadas", label: "Tanácsadás" },
] as const;
const active = { className: "active" };

/** Phone link for the header/footer (editable in the admin: contact.phone). */
function usePhone() {
  const phone = useText("contact.phone", "");
  return { phone, href: phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "" };
}

export function SiteHeader() {
  const areas = useAreas();
  const path = useLocation().pathname;
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const { phone, href } = usePhone();
  const isProductPath = productAreas.some((k) => path === `/${k}` || path.startsWith(`/${k}/`));
  useEffect(() => {
    setMenu(false);
    setOpen(null);
  }, [path]);
  return (
    <>
      <div className="topbar">
        <div className="container">
          <span>
            <Leaf size={12} />
            <Text id="SiteChrome.text.4">{"Természetes energia. Tudatos választás."}</Text>
          </span>
          <span className="top-location">
            <Text id="SiteChrome.text.5">
              {"Tüzelőanyag • Takarmány • Fűtési megoldások • Szerviz"}
            </Text>
          </span>
          {phone ? (
            <a href={href}>
              <Phone size={12} />
              {phone}
            </a>
          ) : (
            <Link to="/arajanlat">
              <Text id="SiteChrome.text.6">{"Árajánlatot kérek"}</Text>
              <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <div className="header-actions">
            <Link to="/kereso" className="header-search" aria-label="Keresés az oldalon">
              <Search size={16} />
              <span>
                <Text id="SiteChrome.text.13">{"Mit keres? pl. pellet, lótáp, kályha…"}</Text>
              </span>
            </Link>
            <Button asChild variant="outline" className="header-cta header-calc h-10 px-4 text-xs">
              <Link to="/kalkulator">
                <Calculator />
                <Text id="SiteChrome.calc">{"Kazánkalkulátor"}</Text>
              </Link>
            </Button>
            <Button asChild className="header-cta h-10 px-5 text-xs">
              <Link to="/arajanlat">
                <Text id="SiteChrome.text.8">{"Árajánlat"}</Text>
                <ArrowRight />
              </Link>
            </Button>
            <Button
              className="mobile-menu-button"
              variant="ghost"
              size="icon"
              aria-label={menu ? "Menü bezárása" : "Menü megnyitása"}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        <nav className="main-nav" aria-label="Fő navigáció">
          <div className="container">
            <Link to="/" activeOptions={{ exact: true }} activeProps={active}>
              <Text id="nav.home">{"Kezdőlap"}</Text>
            </Link>
            <div className="nav-dropdown products-dropdown">
              <Link to="/termekek" activeProps={active} className={isProductPath ? "active" : ""}>
                <Text id="nav.products">{"Termékek"}</Text> <ChevronDown size={12} />
              </Link>
              <div className="mega-menu products-mega">
                {productAreas.map((key) => {
                  const a = areas[key];
                  return (
                    <div key={key} className="mega-col">
                      <Link className="dropdown-title" to="/$terulet" params={{ terulet: key }}>
                        {a.label}
                      </Link>
                      {a.sections.map((sec) => (
                        <Link
                          key={sec.slug}
                          to="/$terulet/$kategoria"
                          params={{ terulet: key, kategoria: sectionTarget(a, sec.slug) }}
                        >
                          {sec.name}
                        </Link>
                      ))}
                    </div>
                  );
                })}
                <Link className="mega-all" to="/termekek">
                  <Text id="nav.allProducts">{"Összes termékkategória"}</Text>{" "}
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
            <div className="nav-dropdown">
              <Link to="/szolgaltatasok" activeProps={active}>
                <Text id="nav.services">{"Szolgáltatások"}</Text> <ChevronDown size={12} />
              </Link>
              <div className="mega-menu services-mega">
                <div className="mega-col">
                  {serviceLinks.map((l) => (
                    <Link key={l.id} to="/szolgaltatasok" hash={l.id}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            {pagesAfter.map((l) => (
              <Link key={l.to} to={l.to} activeProps={active}>
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
        {menu && (
          <nav className="mobile-nav" aria-label="Mobil navigáció">
            <Link to="/">Kezdőlap</Link>
            <div className="mobile-group">
              <div className="mobile-group-head">
                <Link to="/termekek">Termékek</Link>
                <button
                  type="button"
                  aria-expanded={open === "products"}
                  aria-label="Termékek almenü"
                  onClick={() => setOpen(open === "products" ? null : "products")}
                >
                  <ChevronDown size={18} className={open === "products" ? "rotate-180" : ""} />
                </button>
              </div>
              {open === "products" &&
                productAreas.map((key) => (
                  <div key={key} className="mobile-sub-group">
                    <Link className="dropdown-title" to="/$terulet" params={{ terulet: key }}>
                      {areas[key].label}
                    </Link>
                    {areas[key].sections.map((sec) => (
                      <Link
                        key={sec.slug}
                        className="mobile-sub"
                        to="/$terulet/$kategoria"
                        params={{ terulet: key, kategoria: sectionTarget(areas[key], sec.slug) }}
                      >
                        {sec.name}
                      </Link>
                    ))}
                  </div>
                ))}
            </div>
            <Link to="/szolgaltatasok">Szolgáltatások</Link>
            {pagesAfter.map((l) => (
              <Link key={l.to} to={l.to}>
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}

/**
 * Árajánlatkérés + Kazánkalkulátor – always on screen: a tab on the right edge (desktop)
 * and a bar at the bottom (mobile). Hidden on the two pages themselves.
 */
export function FloatingActions() {
  const path = useLocation().pathname.replace(/\/$/, "");
  return (
    <div className="floating-actions" role="complementary" aria-label="Gyors elérés">
      <Link to="/arajanlat" className={path === "/arajanlat" ? "fa-quote current" : "fa-quote"}>
        <Mail size={18} />
        <span>
          <Text id="floating.quote">{"Árajánlatkérés"}</Text>
        </span>
      </Link>
      <Link to="/kalkulator" className={path === "/kalkulator" ? "fa-calc current" : "fa-calc"}>
        <Calculator size={18} />
        <span>
          <Text id="floating.calc">{"Kazánkalkulátor"}</Text>
        </span>
      </Link>
    </div>
  );
}

export function SiteFooter() {
  const areas = useAreas();
  const { phone, href } = usePhone();
  const email = useText("contact.email", "");
  const address = useText("contact.address", "");
  const hours = useText("contact.hours", "");
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>
            <Text id="footer.text.1">
              {
                "Tüzelőanyag, takarmány, kályhák, kazánok és kiegészítők – egy helyen, szakértő segítséggel."
              }
            </Text>
          </p>
        </div>
        <div>
          <h3>
            <Text id="footer.products">{"Termékek"}</Text>
          </h3>
          <Link to="/termekek">
            <Text id="footer.allProducts">{"Összes termék"}</Text>
          </Link>
          {productAreas.map((k) => (
            <Link key={k} to="/$terulet" params={{ terulet: k }}>
              {areas[k].label}
            </Link>
          ))}
        </div>
        <div>
          <h3>
            <Text id="footer.info">{"Információ"}</Text>
          </h3>
          <Link to="/szolgaltatasok">Szolgáltatások</Link>
          <Link to="/biomassza">Biomassza</Link>
          <Link to="/blog">Tudástár</Link>
          <Link to="/rolunk">Rólunk</Link>
          <Link to="/kalkulator">Kazánkalkulátor</Link>
          <Link to="/kereso">Keresés</Link>
        </div>
        <div>
          <h3>
            <Text id="footer.contact">{"Kapcsolat"}</Text>
          </h3>
          {phone && (
            <a href={href}>
              <Phone size={13} />
              {phone}
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`}>
              <Mail size={13} />
              {email}
            </a>
          )}
          {address && (
            <span>
              <MapPin size={13} />
              {address}
            </span>
          )}
          {hours && <span className="whitespace-pre-line">{hours}</span>}
          <Link to="/kapcsolat" className="footer-more">
            <Text id="footer.contactLink">{"Elérhetőségek és térkép"}</Text>{" "}
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        © {new Date().getFullYear()} Pellet Centrum Kft. ·{" "}
        <Text id="footer.slogan">{"Természetes energia. Megbízható meleg."}</Text>
      </div>
    </footer>
  );
}

/** Page title band. `id` is the key prefix for the admin-editable texts (id.eyebrow / id.title / id.text). */
export function PageHero({
  id,
  eyebrow,
  title,
  text,
  children,
}: {
  id?: string | null;
  eyebrow: string;
  title: string;
  text?: string;
  children?: React.ReactNode;
}) {
  const path = useLocation().pathname.replace(/\/$/, "");
  // id === null: texts come from elsewhere (e.g. category names) – not editable here.
  const key = id === null ? "\u0000" : (id ?? path);
  const heading = useText(`${key}.title`, title);
  const label = useText(`${key}.eyebrow`, eyebrow);
  const description = useText(`${key}.text`, text ?? "");
  return (
    <section className="page-hero">
      <div className="container">
        {children}
        <div className="eyebrow">{label}</div>
        <h1>{heading}</h1>
        {description && <p>{description}</p>}
      </div>
    </section>
  );
}

export type Crumb = { label: string; to?: string; params?: Record<string, string> };

/** Breadcrumb trail (+ schema.org BreadcrumbList for Google). */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: "Kezdőlap", to: "/" }, ...items];
  const href = (c: Crumb) =>
    (c.to ?? "").replace(/\$(\w+)/g, (_, k: string) => c.params?.[k] ?? "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.to ? { item: href(c) } : {}),
    })),
  };
  return (
    <nav className="breadcrumbs" aria-label="Morzsamenü">
      <ol>
        {all.map((c, i) => (
          <li key={i}>
            {c.to && i < all.length - 1 ? (
              <Link to={c.to} params={c.params ?? {}}>
                {c.label}
              </Link>
            ) : (
              <span aria-current="page">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }} />
    </nav>
  );
}
