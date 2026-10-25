import { Text } from "@/components/features/content/ContentProvider";
import { useAreas, useProducts } from "@/hooks/useContent";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, PageHero } from "@/components/layouts/SiteChrome";
import type { AreaKey } from "@/lib/content/catalog";
import { ProductGrid } from "./ProductCard";

/** /futoanyagok/fa-pellet – product list of one subcategory. */
export function CategoryView({ area: key, category: slug }: { area: AreaKey; category: string }) {
  const area = useAreas()[key];
  const category = area.categories.find((c) => c.slug === slug)!;
  const products = useProducts({ area: key, category: slug });
  return (
    <>
      <PageHero
        id={null}
        eyebrow={category.group ?? area.label}
        title={category.name}
        text={category.description}
      >
        <Breadcrumbs
          items={[
            { label: area.label, to: "/$terulet", params: { terulet: key } },
            { label: category.name },
          ]}
        />
      </PageHero>
      <section className="section soft-section">
        <div className="container">
          <nav className="subtabs" aria-label={`${area.label} kategóriák`}>
            {area.categories.map((c) => (
              <Link
                key={c.slug}
                to="/$terulet/$kategoria"
                params={{ terulet: key, kategoria: c.slug }}
                className={c.slug === slug ? "active" : ""}
              >
                {c.name}
              </Link>
            ))}
          </nav>
          {products.length ? (
            <ProductGrid products={products} />
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
                <Link to="/arajanlat" search={{ targy: `${category.name} (${area.label})` }}>
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
