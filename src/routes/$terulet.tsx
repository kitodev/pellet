import { createFileRoute, notFound, Outlet, redirect } from "@tanstack/react-router";
import { isAreaKey, renamedTarget } from "@/lib/content/catalog";

// /futoanyagok, /takarmanyok, /futesi-megoldasok (static pages like /rolunk take precedence)
export const Route = createFileRoute("/$terulet")({
  beforeLoad: ({ params }) => {
    if (isAreaKey(params.terulet)) return;
    // renamed in the 2026-11 restructure (e.g. /kalyhak-kandallok/...) → permanent redirect
    const kategoria = (params as { kategoria?: string }).kategoria;
    const target = renamedTarget(params.terulet, kategoria);
    if (target?.category)
      throw redirect({
        to: "/$terulet/$kategoria",
        params: { terulet: target.area, kategoria: target.category },
        statusCode: 301,
      });
    if (target)
      throw redirect({ to: "/$terulet", params: { terulet: target.area }, statusCode: 301 });
    throw notFound();
  },
  component: Outlet,
});
