import { Text } from "@/components/features/content/ContentProvider";
import { useAreas, useProducts } from "@/hooks/useContent";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layouts/SiteChrome";
import type { AreaKey } from "@/lib/content/catalog";
import { jsonLd } from "@/lib/utils/seo";
import { uploadUrl } from "@/lib/utils/urls";
import type { Product } from "@/types";
import { areaImage } from "./images";
import { PriceTag } from "./PriceTag";
import { ProductGrid } from "./ProductCard";

/** Product page: gallery, price/quote, technical data, datasheet, description. */
export function ProductDetail({ product }: { product: Product }) {
  const key = product.area as AreaKey;
  const area = useAreas()[key];
  const category = area.categories.find((c) => c.slug === product.category);
  const photos = [
    uploadUrl("products", product.image_path),
    ...product.images.map((i) => uploadUrl("products", i)),
  ].filter(Boolean);
  const gallery = photos.length ? photos : [areaImage[key]];
  const specs = area.specFields.filter((f) => product.specs[f.key]);
  const related = useProducts({ area: key, category: product.category })
    .filter((p) => p.id !== product.id)
    .slice(0, 3);
  const price = product.sale_price ?? product.price;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description || product.description.slice(0, 300),
    image: gallery,
    category: category?.name ?? area.label,
    brand: { "@type": "Brand", name: "Pellet Centrum" },
    ...(price !== null
      ? {
          offers: {
            "@type": "Offer",
            price,
            priceCurrency: "HUF",
            availability: "https://schema.org/InStock",
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
              { label: area.label, to: "/$terulet", params: { terulet: key } },
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
            <Gallery photos={gallery} name={product.name} />
            <div className="product-info">
              <div className="eyebrow">{category?.name ?? area.label}</div>
              <h1>{product.name}</h1>
              {product.short_description && <p className="lead">{product.short_description}</p>}
              <div className="buy-box">
                <PriceTag product={product} large />
                <div className="buy-actions">
                  <Button asChild>
                    <Link to="/arajanlat" search={{ targy: product.name }}>
                      {product.price === null && product.sale_price === null ? (
                        <Text id="product.quote">{"Ajánlatot kérek"}</Text>
                      ) : (
                        <Text id="product.order">{"Rendelés / érdeklődés"}</Text>
                      )}
                      <ArrowRight />
                    </Link>
                  </Button>
                  {product.datasheet_path && (
                    <Button variant="outline" asChild>
                      <a
                        href={uploadUrl("datasheets", product.datasheet_path)}
                        target="_blank"
                        rel="noopener"
                      >
                        <FileDown />
                        <Text id="product.datasheet">{"Műszaki adatlap (PDF)"}</Text>
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              {specs.length > 0 && (
                <table className="spec-table">
                  <caption>
                    <Text id="product.specs">{"Műszaki adatok"}</Text>
                  </caption>
                  <tbody>
                    {specs.map((f) => (
                      <tr key={f.key}>
                        <th scope="row">{f.label}</th>
                        <td className={f.type === "textarea" ? "whitespace-pre-line" : ""}>
                          {product.specs[f.key]}
                          {f.unit && f.type === "number" ? ` ${f.unit}` : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          {product.description && (
            <div className="product-description">
              <h2>
                <Text id="product.description">{"Termékleírás"}</Text>
              </h2>
              <p className="whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </section>
      {related.length > 0 && (
        <section className="section soft-section">
          <div className="container">
            <h2>
              <Text id="product.related">{"Hasonló termékek"}</Text>
            </h2>
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </>
  );
}

function Gallery({ photos, name }: { photos: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  return (
    <div className="gallery">
      <img className="gallery-main" src={photos[index]} alt={name} width={1024} height={768} />
      {photos.length > 1 && (
        <div className="gallery-thumbs">
          {photos.map((src, i) => (
            <button
              type="button"
              key={src}
              className={i === index ? "active" : ""}
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}. kép`}
            >
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
