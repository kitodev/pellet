import { createFileRoute } from "@tanstack/react-router";
import { CategoryView } from "@/components/features/catalog/CategoryView";
import { areas, findCategory, type AreaKey } from "@/lib/content/catalog";
import { pageHead } from "@/lib/utils/seo";

export const Route = createFileRoute("/$terulet/$kategoria/")({
  head: ({ params }) => {
    const area = areas[params.terulet as AreaKey];
    const c = area && findCategory(area.key, params.kategoria);
    return c ? pageHead(`${c.name} – ${area.label}`, c.description) : {};
  },
  component: Page,
});
function Page() {
  const { terulet, kategoria } = Route.useParams();
  return <CategoryView area={terulet as AreaKey} category={kategoria} />;
}
