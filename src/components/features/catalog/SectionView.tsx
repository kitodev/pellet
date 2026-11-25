import { Text } from "@/components/features/content/ContentProvider";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAreas, useProducts } from "@/hooks/useContent";
import { Breadcrumbs, PageHero } from "@/components/layouts/SiteChrome";
import { subgroupsOf, type AreaKey } from "@/lib/content/catalog";
import { ProductGrid } from "./ProductCard";

/**
 * /futoanyagok/futo-pelletek – every product of the section at once (A1, ipari, szalma…),
 * side by side in one grid, so visitors reach the products in one click.
 */
export function SectionView({ area: key, section: slug }: { area: AreaKey; section: string }) {
  const area = useAreas()[key];
  const section = area.sections.find((s) => s.slug === slug)!;
  const products = useProducts({ area: key });
  // all products of the section side by side, in category order (A1, ipari, szalma…)
  const order = subgroupsOf(area, slug).flatMap((g) => g.categories.map((c) => c.slug));
  const items = products
    .filter((p) => order.includes(p.category))
    .sort((x, y) => order.indexOf(x.category) - order.indexOf(y.category));

  return (
    <>
      <PageHero id={null} eyebrow={area.label} title={section.name} text={section.description}>
        <Breadcrumbs
          items={[
            { label: "Termékek", to: "/termekek" },
            { label: area.label, to: "/$terulet", params: { terulet: key } },
            { label: section.name },
          ]}
        />
      </PageHero>
      <section className="section soft-section">
        <div className="container">
          {items.length ? (
            <ProductGrid products={items} heading={`${section.name} – termékek`} />
          ) : (
            <div className="empty-state">
              <h2>
                <Text id="catalog.empty.title">{"Ebben a kategóriában kérésre szállítunk"}</Text>
              </h2>
              <p>
                <Text id="catalog.empty.text">
                  {
                    "A termékek feltöltése folyamatban van. Írja meg, mire van szüksége, és személyre szabott ajánlatot küldünk."
                  }
                </Text>
              </p>
              <Button asChild>
                <Link to="/arajanlat" search={{ targy: `${section.name} (${area.label})` }}>
                  <Text id="AreaPages.text.5">{"Ajánlatot kérek"}</Text>
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
