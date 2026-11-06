import { createFileRoute } from "@tanstack/react-router";
import { CategoryView } from "@/components/features/catalog/CategoryView";
import { SectionView } from "@/components/features/catalog/SectionView";
import { areas, findCategory, findSection, type AreaKey } from "@/lib/content/catalog";
import { pageHead } from "@/lib/utils/seo";

export const Route = createFileRoute("/$terulet/$kategoria/")({
  head: ({ params }) => {
    const area = areas[params.terulet as AreaKey];
    const c =
      area && (findCategory(area.key, params.kategoria) ?? findSection(area.key, params.kategoria));
    return c ? pageHead(`${c.name} – ${area.label}`, c.description) : {};
  },
  component: Page,
});
function Page() {
  const { terulet, kategoria } = Route.useParams();
  const area = terulet as AreaKey;
  return findSection(area, kategoria) ? (
    <SectionView area={area} section={kategoria} />
  ) : (
    <CategoryView area={area} category={kategoria} />
  );
}
