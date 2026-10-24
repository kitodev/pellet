import { createFileRoute, redirect } from '@tanstack/react-router';
import { legacyCategories } from '@/lib/content/catalog';

// Old URL (before the menu redesign) → permanent redirect to the new category.
export const Route = createFileRoute('/biomassza/$kategoria')({
  beforeLoad: ({ params }) => {
    const target = legacyCategories[`biomassza/${params.kategoria}`] ?? legacyCategories['biomassza']!;
    if (target.category) throw redirect({ to: '/$terulet/$kategoria', params: { terulet: target.area, kategoria: target.category }, statusCode: 301 });
    throw redirect({ to: '/$terulet', params: { terulet: target.area }, statusCode: 301 });
  },
});
