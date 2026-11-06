import { useAreas } from "@/hooks/useContent";
import { Breadcrumbs, PageHero } from "@/components/layouts/SiteChrome";
import { subgroupsOf, type AreaKey } from "@/lib/content/catalog";
import { CategoryTiles } from "./CategoryTiles";

/** /futoanyagok/futo-pelletek – the categories of one section as tiles (grouped by subgroup). */
export function SectionView({ area: key, section: slug }: { area: AreaKey; section: string }) {
  const area = useAreas()[key];
  const section = area.sections.find((s) => s.slug === slug)!;
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
          {subgroupsOf(area, slug).map((g) => (
            <div key={g.subgroup || slug} className="tile-area">
              {g.subgroup && (
                <div className="tile-area-head">
                  <h2>{g.subgroup}</h2>
                </div>
              )}
              <CategoryTiles area={key} categories={g.categories} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
