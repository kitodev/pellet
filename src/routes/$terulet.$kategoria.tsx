import { createFileRoute, notFound, Outlet } from '@tanstack/react-router';
import { findCategory, isAreaKey } from '@/lib/content/catalog';

export const Route = createFileRoute('/$terulet/$kategoria')({
  beforeLoad: ({ params }) => { if (!isAreaKey(params.terulet) || !findCategory(params.terulet, params.kategoria)) throw notFound(); },
  component: Outlet,
});
