import { Text } from "@/components/features/content/ContentProvider";
import { useAreas, useProducts, useText } from "@/hooks/useContent";
import { useContactDetails } from "@/hooks/useContactDetails";
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Mail,
  MapPin,
  Phone,
  Truck,
  Wrench,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Breadcrumbs } from "@/components/layouts/SiteChrome";
import { QuoteForm } from "@/components/features/quote/QuoteForm";
import { installationSections, type AreaKey } from "@/lib/content/catalog";
import { jsonLd } from "@/lib/utils/seo";
import { relatedProducts } from "@/lib/utils/related";
import { uploadUrl } from "@/lib/utils/urls";
import type { Product, StockStatus } from "@/types";
import { areaImage } from "./images";
import { PriceTag, showsPrice } from "./PriceTag";
import { ProductGrid } from "./ProductCard";

const STOCK: Record<StockStatus, { label: string; schema: string }> = {
  in_stock: { label: "Raktáron", schema: "InStock" },
  limited: { label: "Korlátozott készlet", schema: "LimitedAvailability" },
  on_order: { label: "Rendelésre", schema: "PreOrder" },
  out_of_stock: { label: "Jelenleg nem elérhető", schema: "OutOfStock" },
};
const DOC_LABEL = {
  datasheet: "Műszaki adatlap",
  certificate: "Minőségi tanúsítvány",
  manual: "Használati útmutató",
  other: "Termékdokumentáció",
} as const;

/**
 * Product page: gallery (zoomable), name, brand, short text, key features, packaging, price,
 * availability, ÁRAJÁNLATOT KÉREK (pop-up form), phone; then description, technical data,
 * delivery, documents and related products.
 */
export function ProductDetail({ product }: { product: Product }) {
  const key = product.area as AreaKey;
  const area = useAreas()[key];
  const all = useProducts();
  const contact = useContactDetails();
  const [quoteOpen, setQuoteOpen] = useState(false);
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
    .filter(Boolean);
  const specs = area.specFields.filter((f) => product.specs[f.key]);
  const documents = [
    ...(product.datasheet_path
      ? [{ id: "datasheet", kind: "datasheet" as const, title: "", path: product.datasheet_path }]
      : []),
    ...product.documents,
  ];
  const related = relatedProducts(product, all);
  const stock = STOCK[product.stock_status];
  const phoneHref = contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : "";
  const email = contact.email || "pelletcentrumkft@gmail.com";
  const deliveryText = useText(
    "product.delivery.shipping",
    "Országos kiszállítást vállalunk. A szállítási díj a mennyiségtől és a távolságtól függ – az árajánlatban pontosan feltüntetjük. Raklapos tételeket emelőhátfalas autóval szállítunk.",
  );
  const pickupText = useText(
    "product.delivery.pickup",
    "Előre egyeztetett időpontban telephelyünkön személyesen is átveheti a terméket.",
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <section className="product-page">
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
          <div className="product-layout">
            <Gallery photos={gallery} />
            <div className="product-info">
              <div className="eyebrow">{category?.name ?? area.label}</div>
              <h1>{product.name}</h1>
              {product.brand && (
                <p className="product-brand">
                  <Text id="product.brand">{"Gyártó / márka:"}</Text>{" "}
                  <strong>{product.brand}</strong>
                </p>
              )}
              {product.short_description && <p className="lead">{product.short_description}</p>}
              {highlights.length > 0 && (
                <ul className="product-highlights">
                  {highlights.map((h) => (
                    <li key={h}>
                      <Check size={16} />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
              <div className="buy-box">
                <dl className="product-facts">
                  {product.packaging && (
                    <div>
                      <dt>
                        <Text id="product.packaging">{"Kiszerelés / méret"}</Text>
                      </dt>
                      <dd>{product.packaging}</dd>
                    </div>
                  )}
                  <div>
                    <dt>
                      <Text id="product.stock">{"Elérhetőség"}</Text>
                    </dt>
                    <dd>
                      <span className={`stock-badge ${product.stock_status}`}>{stock.label}</span>
                    </dd>
                  </div>
                </dl>
                <div className="product-price">
                  <PriceTag product={product} large />
                  {product.price_note && <small>{product.price_note}</small>}
                </div>
                <Button className="quote-cta" onClick={() => setQuoteOpen(true)}>
                  <Text id="product.quoteCta">{"Árajánlatot kérek"}</Text>
                  <ArrowRight />
                </Button>
                <div className="product-contact">
                  <span>
                    <Text id="product.question">{"Kérdése van?"}</Text>
                  </span>
                  {phoneHref ? (
                    <a href={phoneHref}>
                      <Phone size={16} /> {contact.phone}
                    </a>
                  ) : null}
                  <a href={`mailto:${email}?subject=${encodeURIComponent(product.name)}`}>
                    <Mail size={16} /> {email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <nav className="product-tabs" aria-label="A termékoldal részei">
            {product.description && <a href="#leiras">Termékleírás</a>}
            {(specs.length > 0 || product.brand) && <a href="#muszaki-adatok">Műszaki adatok</a>}
            <a href="#szallitas">Szállítás és átvétel</a>
            {documents.length > 0 && <a href="#dokumentumok">Dokumentumok</a>}
          </nav>

          {product.description && (
            <section id="leiras" className="product-block">
              <h2>
                <Text id="product.description">{"Termékleírás"}</Text>
              </h2>
              <div className="product-description whitespace-pre-line">{product.description}</div>
            </section>
          )}

          {(specs.length > 0 || product.brand || product.packaging) && (
            <section id="muszaki-adatok" className="product-block">
              <h2>
                <Text id="product.specs">{"Műszaki adatok"}</Text>
              </h2>
              <table className="spec-table">
                <tbody>
                  {product.brand && (
                    <tr>
                      <th scope="row">Gyártó / márka</th>
                      <td>{product.brand}</td>
                    </tr>
                  )}
                  {specs.map((f) => (
                    <tr key={f.key}>
                      <th scope="row">
                        {f.label}
                        {f.unit ? ` (${f.unit})` : ""}
                      </th>
                      <td className={f.type === "textarea" ? "whitespace-pre-line" : ""}>
                        {product.specs[f.key]}
                      </td>
                    </tr>
                  ))}
                  {product.packaging && !product.specs["kiszereles"] && (
                    <tr>
                      <th scope="row">Kiszerelés / méret</th>
                      <td>{product.packaging}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          )}

          <section id="szallitas" className="product-block">
            <h2>
              <Text id="product.delivery.title">{"Szállítás és átvétel"}</Text>
            </h2>
            <div className="delivery-cards">
              <div>
                <MapPin />
                <h3>
                  <Text id="product.delivery.pickupTitle">{"Telephelyi átvétel"}</Text>
                </h3>
                <p>{pickupText}</p>
                <p>
                  <strong>{contact.address}</strong>
                  {contact.hours && (
                    <span className="whitespace-pre-line">
                      <br />
                      {contact.hours}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <Truck />
                <h3>
                  <Text id="product.delivery.shippingTitle">{"Országos kiszállítás"}</Text>
                </h3>
                <p>{deliveryText}</p>
              </div>
              {installation && (
                <div>
                  <Wrench />
                  <h3>
                    <Text id="product.delivery.installTitle">{"Telepítés és beüzemelés"}</Text>
                  </h3>
                  <p>
                    <Text id="product.delivery.install">
                      {
                        "Kérésre a készüléket szakembereink telepítik és beüzemelik, a füstcső és a kémény bekötésével együtt. Az ajánlatkérésnél jelezze, ha erre is szüksége van."
                      }
                    </Text>
                  </p>
                  <Link to="/szolgaltatasok" className="text-link">
                    <Text id="product.delivery.installLink">{"Szolgáltatásaink"}</Text>{" "}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </section>

          {documents.length > 0 && (
            <section id="dokumentumok" className="product-block">
              <h2>
                <Text id="product.documents">{"Dokumentumok"}</Text>
              </h2>
              <ul className="doc-list">
                {documents.map((d) => (
                  <li key={d.id}>
                    <a href={uploadUrl("datasheets", d.path)} target="_blank" rel="noopener">
                      <FileText />
                      <span>
                        <strong>{d.title || DOC_LABEL[d.kind]}</strong>
                        <small>{DOC_LABEL[d.kind]} · PDF</small>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="product-bottom-cta">
            <div>
              <h2>
                <Text id="product.bottom.title">{"Kérjen árajánlatot erre a termékre"}</Text>
              </h2>
              <p>
                <Text id="product.bottom.text">
                  {"Adja meg a mennyiséget és az átvétel módját – hamarosan jelentkezünk."}
                </Text>
              </p>
            </div>
            <Button className="quote-cta" onClick={() => setQuoteOpen(true)}>
              <Text id="product.quoteCta">{"Árajánlatot kérek"}</Text>
              <ArrowRight />
            </Button>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section soft-section">
          <div className="container">
            <h2>
              <Text id="product.related">{"Kapcsolódó termékek"}</Text>
            </h2>
            <ProductGrid products={related} />
          </div>
        </section>
      )}

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
          <QuoteForm product={product} onDone={() => setQuoteOpen(false)} />
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
