import { createFileRoute, notFound, Outlet, redirect } from "@tanstack/react-router";
import { findCategory, findSection, isAreaKey, renamedTarget } from "@/lib/content/catalog";

// $kategoria is either a section (e.g. fuso-pelletek → tiles) or a category (→ products).
export const Route = createFileRoute("/$terulet/$kategoria")({
  beforeLoad: ({ params }) => {
    const { terulet, kategoria } = params;
    if (isAreaKey(terulet) && (findCategory(terulet, kategoria) || findSection(terulet, kategoria)))
      return;
    // renamed in the 2026-11 restructure → permanent redirect to the new place
    const target = renamedTarget(terulet, kategoria);
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
