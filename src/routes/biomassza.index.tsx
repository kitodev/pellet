import { createFileRoute, redirect } from '@tanstack/react-router';
import { legacyCategories } from '@/lib/content/catalog';

// Old URL → permanent redirect to the new section.
export const Route = createFileRoute('/biomassza/')({
  beforeLoad: () => { throw redirect({ to: '/$terulet', params: { terulet: legacyCategories['biomassza']!.area }, statusCode: 301 }); },
});
