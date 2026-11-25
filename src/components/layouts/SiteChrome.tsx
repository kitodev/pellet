import { Text } from "@/components/features/content/ContentProvider";
import { useAreas, useText } from "@/hooks/useContent";
import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calculator,
  ChevronDown,
  ChevronRight,
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
      <span className="brand-name">
        <Text id="SiteChrome.text.1">{"PELLET CENTRUM"}</Text>
        <small>
          <Text id="SiteChrome.text.2">{"KFT. · TERMÉSZETES ENERGIA"}</Text>
        </small>
      </span>
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
  const isProductPath = productAreas.some((k) => path === `/${k}` || path.startsWith(`/${k}/`));
  useEffect(() => {
    setMenu(false);
    setOpen(null);
  }, [path]);
  return (
    <>
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
              aria-controls="mobile-nav"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        <nav className="main-nav" aria-label="Fő navigáció">
          <div className="container">
            <ul className="nav-list">
              <li>
                <Link to="/" activeOptions={{ exact: true }} activeProps={active}>
                  <Text id="nav.home">{"Kezdőlap"}</Text>
                </Link>
              </li>
              <li className="nav-dropdown products-dropdown">
                <Link
                  to="/termekek"
                  activeProps={active}
                  className={isProductPath ? "active" : ""}
                  aria-haspopup="true"
                >
                  <Text id="nav.products">{"Termékek"}</Text> <ChevronDown size={12} aria-hidden />
                </Link>
                <div className="mega-menu products-mega">
                  {productAreas.map((key) => {
                    const a = areas[key];
                    return (
                      <ul key={key} className="mega-col">
                        <li>
                          <Link className="dropdown-title" to="/$terulet" params={{ terulet: key }}>
                            {a.label}
                          </Link>
                        </li>
                        {a.sections.map((sec) => (
                          <li key={sec.slug}>
                            <Link
                              to="/$terulet/$kategoria"
                              params={{ terulet: key, kategoria: sectionTarget(a, sec.slug) }}
                            >
                              {sec.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    );
                  })}
                  <Link className="mega-all" to="/termekek">
                    <Text id="nav.allProducts">{"Összes termékkategória"}</Text>{" "}
                    <ArrowRight size={13} aria-hidden />
                  </Link>
                </div>
              </li>
              <li className="nav-dropdown">
                <Link to="/szolgaltatasok" activeProps={active} aria-haspopup="true">
                  <Text id="nav.services">{"Szolgáltatások"}</Text>{" "}
                  <ChevronDown size={12} aria-hidden />
                </Link>
                <div className="mega-menu services-mega">
                  <ul className="mega-col">
                    {serviceLinks.map((l) => (
                      <li key={l.id}>
                        <Link to="/szolgaltatasok" hash={l.id}>
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
              {pagesAfter.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} activeProps={active}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        {menu && (
          <nav className="mobile-nav" id="mobile-nav" aria-label="Mobil navigáció">
            <ul className="mobile-list">
              <li>
                <Link to="/">Kezdőlap</Link>
              </li>
              <li className="mobile-group">
                <div className="mobile-group-head">
                  <Link to="/termekek">Termékek</Link>
                  <button
                    type="button"
                    aria-expanded={open === "products"}
                    aria-controls="mobile-products"
                    aria-label="Termékek almenü"
                    onClick={() => setOpen(open === "products" ? null : "products")}
                  >
                    <ChevronDown
                      size={18}
                      aria-hidden
                      className={open === "products" ? "rotate-180" : ""}
                    />
                  </button>
                </div>
                {open === "products" && (
                  <ul id="mobile-products" className="mobile-list">
                    {productAreas.map((key) => (
                      <li key={key}>
                        <ul className="mobile-sub-group">
                          <li>
                            <Link
                              className="dropdown-title"
                              to="/$terulet"
                              params={{ terulet: key }}
                            >
                              {areas[key].label}
                            </Link>
                          </li>
                          {areas[key].sections.map((sec) => (
                            <li key={sec.slug}>
                              <Link
                                className="mobile-sub"
                                to="/$terulet/$kategoria"
                                params={{
                                  terulet: key,
                                  kategoria: sectionTarget(areas[key], sec.slug),
                                }}
                              >
                                {sec.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              <li>
                <Link to="/szolgaltatasok">Szolgáltatások</Link>
              </li>
              {pagesAfter.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
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
    <aside className="floating-actions" aria-label="Gyors elérés">
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
    </aside>
  );
}

export function SiteFooter() {
  const areas = useAreas();
  const { phone, href } = usePhone();
  const email = useText("contact.email", "");
  const address = useText(
    "contact.address",
    "8000 Székesfehérvár, Seregélyesi út 98, 26-os épület",
  );
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
        <nav aria-labelledby="footer-products">
          <h2 id="footer-products">
            <Text id="footer.products">{"Termékek"}</Text>
          </h2>
          <ul className="footer-links">
            <li>
              <Link to="/termekek">
                <Text id="footer.allProducts">{"Összes termék"}</Text>
              </Link>
            </li>
            {productAreas.map((k) => (
              <li key={k}>
                <Link to="/$terulet" params={{ terulet: k }}>
                  {areas[k].label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-labelledby="footer-info">
          <h2 id="footer-info">
            <Text id="footer.info">{"Információ"}</Text>
          </h2>
          <ul className="footer-links">
            <li>
              <Link to="/szolgaltatasok">Szolgáltatások</Link>
            </li>
            <li>
              <Link to="/biomassza">Biomassza</Link>
            </li>
            <li>
              <Link to="/blog">Tudástár</Link>
            </li>
            <li>
              <Link to="/rolunk">Rólunk</Link>
            </li>
            <li>
              <Link to="/kalkulator">Kazánkalkulátor</Link>
            </li>
            <li>
              <Link to="/kereso">Keresés</Link>
            </li>
            <li>
              <Link to="/adatkezeles">Adatkezelési tájékoztató</Link>
            </li>
          </ul>
        </nav>
        <section aria-labelledby="footer-contact">
          <h2 id="footer-contact">
            <Text id="footer.contact">{"Kapcsolat"}</Text>
          </h2>
          <address className="footer-links">
            {phone && (
              <a href={href}>
                <Phone size={13} aria-hidden />
                {phone}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`}>
                <Mail size={13} aria-hidden />
                {email}
              </a>
            )}
            {address && (
              <span>
                <MapPin size={13} aria-hidden />
                {address}
              </span>
            )}
            {hours && <span className="whitespace-pre-line">{hours}</span>}
          </address>
          <Link to="/kapcsolat" className="footer-more">
            <Text id="footer.contactLink">{"Elérhetőségek és térkép"}</Text>{" "}
            <ChevronRight size={13} aria-hidden />
          </Link>
        </section>
      </div>
      <p className="container footer-bottom">
        <small>
          © {new Date().getFullYear()} Pellet Centrum Kft. ·{" "}
          <Text id="footer.slogan">{"Természetes energia. Megbízható meleg."}</Text>
        </small>
      </p>
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
        <p className="eyebrow">{label}</p>
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
