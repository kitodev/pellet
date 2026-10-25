import { Text } from "@/components/features/content/ContentProvider";
import { useAreas, useProducts } from "@/hooks/useContent";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs, PageHero } from "@/components/layouts/SiteChrome";
import { groupedCategories, type AreaKey } from "@/lib/content/catalog";
import { areaImage } from "./images";
import { ProductGrid } from "./ProductCard";

/** /futoanyagok etc. – subcategories grouped, with product counts. */
export function AreaOverview({ area: key }: { area: AreaKey }) {
  const area = useAreas()[key];
  const products = useProducts({ area: key });
  const featured = products.filter((p) => p.featured || p.sale_price !== null).slice(0, 6);
  return (
    <>
      <PageHero id={null} eyebrow="Termékek" title={area.label} text={area.intro}>
        <Breadcrumbs items={[{ label: area.label }]} />
      </PageHero>
      <section className="section soft-section">
        <div className="container">
          {groupedCategories(area).map((g) => (
            <div key={g.group || key} className="category-group">
              {g.group && <h2 className="group-title">{g.group}</h2>}
              <div className="category-grid">
                {g.categories.map((c) => {
                  const count = products.filter((p) => p.category === c.slug).length;
                  return (
                    <Link
                      key={c.slug}
                      to="/$terulet/$kategoria"
                      params={{ terulet: key, kategoria: c.slug }}
                      className="category-card"
                    >
                      <img src={areaImage[key]} alt="" loading="lazy" width={1024} height={768} />
                      <div>
                        <span className="product-category">{c.short}</span>
                        <h3>{c.name}</h3>
                        <p>{c.description}</p>
                        <span className="choice-cta">
                          {count ? (
                            `${count} termék`
                          ) : (
                            <Text id="catalog.ask">{"Érdeklődjön"}</Text>
                          )}{" "}
                          <ArrowRight size={14} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  <Text id="catalog.featured.eyebrow">{"Ajánlatunk"}</Text>
                </div>
                <h2>
                  <Text id="catalog.featured.title">{"Kiemelt termékek"}</Text>
                </h2>
              </div>
            </div>
            <ProductGrid products={featured} />
          </div>
        </section>
      )}
    </>
  );
}
