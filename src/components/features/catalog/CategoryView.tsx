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
  const section = area.sections.find((s) => s.slug === category.section);
  const siblings = area.categories.filter((c) => c.section === category.section);
  const products = useProducts({ area: key, category: slug });
  // Grouped by manufacturer (Gyártó) when the products have one, e.g. Pellet kazánok.
  const makers = [...new Set(products.map((p) => p.specs["gyarto"]?.trim() ?? ""))];
  const byMaker = makers.some(Boolean)
    ? makers
        .sort((a, b) => (a ? (b ? a.localeCompare(b, "hu") : -1) : 1))
        .map((m) => ({
          maker: m,
          items: products.filter((p) => (p.specs["gyarto"]?.trim() ?? "") === m),
        }))
    : null;
  return (
    <>
      <PageHero
        id={null}
        eyebrow={category.subgroup ?? section?.name ?? area.label}
        title={category.name}
        text={category.description}
      >
        <Breadcrumbs
          items={[
            { label: "Termékek", to: "/termekek" },
            { label: area.label, to: "/$terulet", params: { terulet: key } },
            ...(section && siblings.length > 1
              ? [
                  {
                    label: section.name,
                    to: "/$terulet/$kategoria",
                    params: { terulet: key, kategoria: section.slug },
                  },
                ]
              : []),
            { label: category.name },
          ]}
        />
      </PageHero>
      <section className="section soft-section">
        <div className="container">
          {siblings.length > 1 && (
            <nav className="subtabs" aria-label={`${section?.name ?? area.label} kategóriák`}>
              {siblings.map((c) => (
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
          )}
          {byMaker ? (
            byMaker.map((g) => (
              <div key={g.maker || "-"} className="tile-area">
                <div className="tile-area-head">
                  <h2>{g.maker || "Egyéb gyártók"}</h2>
                </div>
                <ProductGrid products={g.items} />
              </div>
            ))
          ) : products.length ? (
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
