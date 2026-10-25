import { createFileRoute } from "@tanstack/react-router";
import { AreaOverview } from "@/components/features/catalog/AreaOverview";
import { areas, type AreaKey } from "@/lib/content/catalog";
import { pageHead } from "@/lib/utils/seo";

export const Route = createFileRoute("/$terulet/")({
  head: ({ params }) => {
    const a = areas[params.terulet as AreaKey];
    return a ? pageHead(a.title, a.intro) : {};
  },
  component: Page,
});
function Page() {
  const { terulet } = Route.useParams();
  return <AreaOverview area={terulet as AreaKey} />;
}
