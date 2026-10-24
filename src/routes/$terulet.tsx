import { createFileRoute, notFound, Outlet } from '@tanstack/react-router';
import { isAreaKey } from '@/lib/content/catalog';

// /futoanyagok, /takarmanyok, /kalyhak-kandallok, /kiegeszitok (static pages like /rolunk take precedence)
export const Route = createFileRoute('/$terulet')({
  beforeLoad: ({ params }) => { if (!isAreaKey(params.terulet)) throw notFound(); },
  component: Outlet,
});
