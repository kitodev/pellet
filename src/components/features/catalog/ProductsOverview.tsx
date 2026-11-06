import { Text } from "@/components/features/content/ContentProvider";
import { useAreas } from "@/hooks/useContent";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs, PageHero } from "@/components/layouts/SiteChrome";
import { SlideShow } from "@/components/features/slider/SlideShow";
import { productAreas } from "@/lib/content/catalog";
import { SectionTiles } from "./CategoryTiles";

/**
 * /termekek – the product sections as tiles, grouped by area
 * (Tüzelőanyagok, Takarmányok, Fűtési megoldások).
 */
export function ProductsOverview() {
  const areas = useAreas();
  return (
    <>
      <SlideShow page="termekek" />
      <PageHero
        id="/termekek"
        eyebrow="Termékek"
        title="Termékeink"
        text="Válassza ki a termékkategóriát – tüzelőanyagok, takarmányok és fűtési megoldások."
      >
        <Breadcrumbs items={[{ label: "Termékek" }]} />
      </PageHero>
      <section className="section soft-section">
        <div className="container">
          <nav className="area-jump" aria-label="Termékcsoportok">
            {productAreas.map((key) => (
              <a key={key} href={`#${key}`}>
                {areas[key].label}
              </a>
            ))}
          </nav>
          {productAreas.map((key) => {
            const area = areas[key];
            return (
              <div key={key} id={key} className="tile-area">
                <div className="tile-area-head">
                  <h2>{area.label}</h2>
                  <Link to="/$terulet" params={{ terulet: key }} className="tile-area-all">
                    <Text id="catalog.allIn">{"Összes"}</Text> <ArrowRight size={14} />
                  </Link>
                </div>
                <SectionTiles area={key} sections={area.sections} categories={area.categories} />
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
