import { Text } from "@/components/features/content/ContentProvider";
import { useAreas, useProducts, useText } from "@/hooks/useContent";
import { useContactDetails } from "@/hooks/useContactDetails";
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Award,
  Boxes,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Flame,
  Layers,
  Leaf,
  Mail,
  Phone,
  Ruler,
  Send,
  Settings,
  ShieldCheck,
  Truck,
  ZoomIn,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Breadcrumbs } from "@/components/layouts/SiteChrome";
import { QuoteForm } from "@/components/features/quote/QuoteForm";
import {
  areas as catalogAreas,
  installationSections,
  relatedCategories,
  type AreaKey,
} from "@/lib/content/catalog";
import { jsonLd } from "@/lib/utils/seo";
import { relatedProducts } from "@/lib/utils/related";
import { productPath, uploadUrl } from "@/lib/utils/urls";
import type { Product, StockStatus } from "@/types";
import { areaImage, productImage } from "./images";
import { PriceTag, showsPrice } from "./PriceTag";

const STOCK: Record<StockStatus, { label: string; schema: string }> = {
  in_stock: { label: "Raktáron", schema: "InStock" },
  limited: { label: "Korlátozott készlet – érdeklődjön", schema: "LimitedAvailability" },
  on_order: { label: "Rendelésre", schema: "PreOrder" },
  out_of_stock: { label: "Jelenleg nem elérhető", schema: "OutOfStock" },
};
const DOC_LABEL = {
  datasheet: "Műszaki adatlap",
  certificate: "Minőségi tanúsítvány",
  manual: "Használati útmutató",
  other: "Termékdokumentáció",
} as const;

/** Icon for a key-feature line, picked from its words (minősítés → award, raklap → boxes…). */
function featureIcon(text: string): LucideIcon {
  const t = text.toLowerCase();
  if (/enplus|minős|tanúsít|garancia/.test(t)) return Award;
  if (/szállít|kiszáll/.test(t)) return Truck;
  if (/átmérő|\bmm\b|méret/.test(t)) return Ruler;
  if (/kw|teljesítmény|láng|fűtőérték|hő/.test(t)) return Flame;
  if (/hamu|tiszta|természetes|bio/.test(t)) return Leaf;
  if (/raklap|zsák|kiszerel|kg\b|csomag/.test(t)) return Boxes;
  if (/vezérl|program|wifi|wi-fi|digitális/.test(t)) return Settings;
  if (/hatásfok|biztonság|megbízható/.test(t)) return ShieldCheck;
  if (/réteg|alom/.test(t)) return Layers;
  return Check;
}

const TABS = [
  { id: "leiras", label: "Termékleírás" },
  { id: "muszaki-adatok", label: "Műszaki adatok" },
  { id: "szallitas", label: "Szállítás" },
  { id: "dokumentumok", label: "Dokumentumok" },
] as const;

/**
 * Product page: gallery | name, packaging, availability, short text, key features,
 * price box (quantity + unit → ÁRAJÁNLATOT KÉREK pop-up, phone);
 * then tab bar → description + technical data side by side → delivery / documents / related cards.
 */
export function ProductDetail({ product }: { product: Product }) {
  const key = product.area as AreaKey;
  const area = useAreas()[key];
  const all = useProducts();
  const contact = useContactDetails();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const units = catalogAreas[key]?.quoteUnits ?? ["db"];
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState(units[0] ?? "db");
  const [tab, setTab] = useState<string>("leiras");
  // the block chosen in the tab bar is highlighted until another one is chosen
  const [focus, setFocus] = useState<string | null>(null);
  const hl = (id: string) => (focus === id ? " pd-focus" : "");
  const category = area.categories.find((c) => c.slug === product.category);
  const section = category && area.sections.find((s) => s.slug === category.section);
  const installation = !!category && installationSections.includes(category.section);

  const alt = product.image_alt || product.name;
  const photos = [
    product.image_path && { src: uploadUrl("products", product.image_path), alt },
    ...product.images.map((i, n) => ({
      src: uploadUrl("products", i),
      alt: `${product.name} – ${n + 2}. kép`,
    })),
  ].filter(Boolean) as { src: string; alt: string }[];
  const gallery = photos.length ? photos : [{ src: areaImage[key], alt }];

  const highlights = product.highlights
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 6);
  const specs = area.specFields.filter((f) => product.specs[f.key]);
  const documents = [
    ...(product.datasheet_path
      ? [{ id: "datasheet", kind: "datasheet" as const, title: "", path: product.datasheet_path }]
      : []),
    ...product.documents,
  ];
  const related = relatedProducts(product, all, 3);
  // No related products yet → link the related categories instead (e.g. pellet → stoves, brikett).
  const allAreas = useAreas();
  const relatedCats = (category ? (relatedCategories[category.section] ?? []) : [])
    .flatMap((slug) =>
      (Object.keys(allAreas) as AreaKey[]).flatMap((a) => {
        const cat = allAreas[a].categories.find((c) => c.slug === slug);
        return cat ? [{ area: a, cat }] : [];
      }),
    )
    .slice(0, 3);
  const stock = STOCK[product.stock_status];
  const phoneHref = contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : "";
  const email = contact.email || "pelletcentrumkft@gmail.com";
  const pickupLine = useText(
    "product.delivery.pickupLine",
    "Telephelyi átvétel egyeztetés szerint",
  );
  const shippingLine = useText(
    "product.delivery.shippingLine",
    "Országos, raklapos kiszállítás megbízható partnerrel",
  );
  const feeLine = useText(
    "product.delivery.feeLine",
    "A szállítási díjat az árajánlatban pontosan feltüntetjük",
  );

  const price = product.sale_price ?? product.price;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.meta_description || product.short_description || product.description.slice(0, 300),
    image: gallery.map((g) => g.src),
    category: category?.name ?? area.label,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(showsPrice(product) && price !== null
      ? {
          offers: {
            "@type": "Offer",
            price,
            priceCurrency: "HUF",
            availability: `https://schema.org/${stock.schema}`,
          },
        }
      : {}),
  };

  const goTab = (id: string) => {
    setTab(id);
    setFocus(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <section className="product-page pd">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: "Termékek", to: "/termekek" },
              { label: area.label, to: "/$terulet", params: { terulet: key } },
              ...(section && area.categories.filter((c) => c.section === section.slug).length > 1
                ? [
                    {
                      label: section.name,
                      to: "/$terulet/$kategoria",
                      params: { terulet: key, kategoria: section.slug },
                    },
                  ]
                : []),
              ...(category
                ? [
                    {
                      label: category.name,
                      to: "/$terulet/$kategoria",
                      params: { terulet: key, kategoria: category.slug },
                    },
                  ]
                : []),
              { label: product.name },
            ]}
          />

          {/* ---- top: gallery | summary ---- */}
          <div className="pd-top">
            <Gallery photos={gallery} />
            <div className="pd-summary">
              <h1>{product.name}</h1>
              {(product.packaging || product.brand) && (
                <p className="pd-sub">
                  {[product.packaging, product.brand].filter(Boolean).join(" | ")}
                </p>
              )}
              <span className={`pd-stock ${product.stock_status}`}>
                {product.stock_status === "out_of_stock" ? (
                  <Clock size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                {stock.label}
              </span>
              {product.short_description && <p className="pd-lead">{product.short_description}</p>}
              {highlights.length > 0 && (
                <ul className="pd-features">
                  {highlights.map((h) => {
                    const Icon = featureIcon(h);
                    return (
                      <li key={h}>
                        <span className="pd-feature-icon">
                          <Icon size={18} />
                        </span>
                        {h}
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="pd-pricebox">
                <div className="pd-price">
                  {showsPrice(product) ? (
                    <PriceTag product={product} large />
                  ) : (
                    <strong>
                      <Text id="product.priceLabel">{"Ár:"}</Text>{" "}
                      {product.price_mode === "quantity" ? (
                        <Text id="product.priceQuantity">{"egyedi ajánlat alapján"}</Text>
                      ) : (
                        <Text id="product.priceAsk">{"érdeklődjön"}</Text>
                      )}
                    </strong>
                  )}
                  {product.price_note && <small>{product.price_note}</small>}
                </div>
                <div className="pd-qty">
                  <label htmlFor="pd-qty">
                    <Text id="product.quantity">{"Mennyiség:"}</Text>
                  </label>
                  <input
                    id="pd-qty"
                    type="number"
                    min={1}
                    inputMode="decimal"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  <select
                    aria-label="Mértékegység"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    {units.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="pd-actions">
                  <button type="button" className="pd-quote" onClick={() => setQuoteOpen(true)}>
                    <Send size={20} />
                    <Text id="product.quoteCta">{"Árajánlatot kérek"}</Text>
                  </button>
                  {phoneHref ? (
                    <a className="pd-call" href={phoneHref}>
                      <Phone size={20} />
                      <span>
                        <Text id="product.phoneLabel">{"Telefonos érdeklődés"}</Text>
                        <strong>{contact.phone}</strong>
                      </span>
                    </a>
                  ) : (
                    <a
                      className="pd-call"
                      href={`mailto:${email}?subject=${encodeURIComponent(product.name)}`}
                    >
                      <Mail size={20} />
                      <span>
                        <Text id="product.mailLabel">{"E-mailes érdeklődés"}</Text>
                        <strong>{email}</strong>
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---- tab bar ---- */}
          <nav className="pd-tabs" aria-label="A termékoldal részei">
            {TABS.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className={tab === t.id ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  goTab(t.id);
                }}
              >
                {t.label}
              </a>
            ))}
          </nav>

          {/* ---- description | technical data ---- */}
          <div className="pd-info">
            <section id="leiras" className={`pd-col${hl("leiras")}`}>
              <h2>
                <Leaf />
                <Text id="product.description">{"Termékleírás"}</Text>
              </h2>
              {product.description ? (
                <div className="pd-text whitespace-pre-line">{product.description}</div>
              ) : (
                <p className="pd-text">{product.short_description}</p>
              )}
            </section>
            <section id="muszaki-adatok" className={`pd-col${hl("muszaki-adatok")}`}>
              <h2>
                <Settings />
                <Text id="product.specs">{"Műszaki adatok"}</Text>
              </h2>
              <table className="pd-specs">
                <tbody>
                  {product.brand && (
                    <tr>
                      <th scope="row">Gyártó / márka:</th>
                      <td>{product.brand}</td>
                    </tr>
                  )}
                  {specs.map((f) => (
                    <tr key={f.key}>
                      <th scope="row">{f.label}:</th>
                      <td className={f.type === "textarea" ? "whitespace-pre-line" : ""}>
                        {product.specs[f.key]}
                        {f.unit && !product.specs[f.key]!.includes(f.unit) ? ` ${f.unit}` : ""}
                      </td>
                    </tr>
                  ))}
                  {product.packaging && !product.specs["kiszereles"] && (
                    <tr>
                      <th scope="row">Kiszerelés:</th>
                      <td>{product.packaging}</td>
                    </tr>
                  )}
                  {!product.brand && !specs.length && !product.packaging && (
                    <tr>
                      <td colSpan={2}>
                        <Text id="product.specsSoon">
                          {"A műszaki adatokat kérésre elküldjük."}
                        </Text>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>

          {/* ---- delivery | documents | related ---- */}
          <div className="pd-cards">
            <section id="szallitas" className={`pd-card${hl("szallitas")}`}>
              <h2>
                <Truck />
                <Text id="product.delivery.title">{"Szállítás és átvétel"}</Text>
              </h2>
              <ul className="pd-checks">
                <li>
                  <Check size={18} />
                  <span>
                    {pickupLine}
                    {contact.address && <small>{contact.address}</small>}
                  </span>
                </li>
                <li>
                  <Check size={18} />
                  <span>{shippingLine}</span>
                </li>
                <li>
                  <Check size={18} />
                  <span>{feeLine}</span>
                </li>
                {installation && (
                  <li>
                    <Check size={18} />
                    <span>
                      <Text id="product.delivery.installLine">
                        {"Telepítés és beüzemelés szakembereinkkel"}
                      </Text>{" "}
                      <Link to="/szolgaltatasok" className="pd-more">
                        <ChevronRight size={14} />
                      </Link>
                    </span>
                  </li>
                )}
              </ul>
            </section>

            <section id="dokumentumok" className={`pd-card${hl("dokumentumok")}`}>
              <h2>
                <FileText />
                <Text id="product.documents">{"Dokumentumok"}</Text>
              </h2>
              {documents.length ? (
                <ul className="pd-docs">
                  {documents.map((d) => (
                    <li key={d.id}>
                      <span>
                        <strong>{d.title || DOC_LABEL[d.kind]}</strong>
                        <small>{DOC_LABEL[d.kind]} · PDF</small>
                      </span>
                      <a
                        className="pd-download"
                        href={uploadUrl("datasheets", d.path)}
                        target="_blank"
                        rel="noopener"
                      >
                        <Download size={16} />
                        <Text id="product.download">{"Letöltés"}</Text>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <p className="pd-muted">
                    <Text id="product.docsOnRequest">
                      {"A műszaki adatlapot és a tanúsítványt kérésre e-mailben elküldjük."}
                    </Text>
                  </p>
                  <a
                    className="pd-download"
                    href={`mailto:${email}?subject=${encodeURIComponent(`Adatlap: ${product.name}`)}`}
                  >
                    <Mail size={16} />
                    <Text id="product.askDatasheet">{"Adatlap kérése"}</Text>
                  </a>
                </>
              )}
            </section>

            <section className="pd-card">
              <h2>
                <Layers />
                <Text id="product.related">{"Kapcsolódó termékek"}</Text>
              </h2>
              {related.length ? (
                <div className="pd-related">
                  {related.map((p) => (
                    <a key={p.id} href={productPath(p)}>
                      <img src={productImage(p)} alt="" loading="lazy" />
                      <span>{p.name}</span>
                      <ChevronRight size={16} />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="pd-related">
                  {relatedCats.map(({ area: a, cat }) => (
                    <Link
                      key={cat.slug}
                      to="/$terulet/$kategoria"
                      params={{ terulet: a, kategoria: cat.slug }}
                    >
                      <img src={areaImage[a]} alt="" loading="lazy" />
                      <span>{cat.name}</span>
                      <ChevronRight size={16} />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>

      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="quote-dialog max-h-[94vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <Text id="product.quoteTitle">{"Árajánlatkérés"}</Text>
            </DialogTitle>
            <DialogDescription>
              <Text id="product.quoteText">
                {"Töltse ki az űrlapot, és hamarosan elküldjük személyre szabott ajánlatunkat."}
              </Text>
            </DialogDescription>
          </DialogHeader>
          <QuoteForm
            product={product}
            initialQuantity={quantity}
            initialUnit={unit}
            onDone={() => setQuoteOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Main photo + thumbnails; clicking the photo opens a full-screen, swipeable view. */
function Gallery({ photos }: { photos: { src: string; alt: string }[] }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const go = useCallback(
    (d: number) => setIndex((i) => (i + d + photos.length) % photos.length),
    [photos.length],
  );
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, go]);
  const photo = photos[index]!;
  return (
    <div className="gallery">
      <button
        type="button"
        className="gallery-main-btn"
        onClick={() => setZoom(true)}
        aria-label="Kép nagyítása"
      >
        <img className="gallery-main" src={photo.src} alt={photo.alt} width={1024} height={768} />
        <span className="gallery-zoom">
          <ZoomIn size={18} />
        </span>
      </button>
      {photos.length > 1 && (
        <div className="gallery-thumbs">
          {photos.map((p, i) => (
            <button
              type="button"
              key={p.src}
              className={i === index ? "active" : ""}
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}. kép`}
            >
              <img src={p.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="lightbox max-w-[min(1200px,96vw)] border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{photo.alt}</DialogTitle>
          <img src={photo.src} alt={photo.alt} />
          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="lb-nav prev"
                onClick={() => go(-1)}
                aria-label="Előző kép"
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                className="lb-nav next"
                onClick={() => go(1)}
                aria-label="Következő kép"
              >
                <ChevronRight />
              </button>
              <span className="lb-count">
                {index + 1} / {photos.length}
              </span>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
