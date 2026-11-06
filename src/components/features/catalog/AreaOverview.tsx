import { Text } from "@/components/features/content/ContentProvider";
import { useAreas, useProducts } from "@/hooks/useContent";
import { Breadcrumbs, PageHero } from "@/components/layouts/SiteChrome";
import type { AreaKey } from "@/lib/content/catalog";
import { SectionTiles } from "./CategoryTiles";
import { ProductGrid } from "./ProductCard";

/** /futoanyagok etc. – the sections of the area as tiles, then featured products. */
export function AreaOverview({ area: key }: { area: AreaKey }) {
  const area = useAreas()[key];
  const products = useProducts({ area: key });
  const featured = products.filter((p) => p.featured || p.sale_price !== null).slice(0, 6);
  return (
    <>
      <PageHero id={null} eyebrow="Termékek" title={area.label} text={area.intro}>
        <Breadcrumbs items={[{ label: "Termékek", to: "/termekek" }, { label: area.label }]} />
      </PageHero>
      <section className="section soft-section">
        <div className="container">
          <SectionTiles area={key} sections={area.sections} categories={area.categories} />
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
