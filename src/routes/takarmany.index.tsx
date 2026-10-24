import { createFileRoute, redirect } from '@tanstack/react-router';
import { legacyCategories } from '@/lib/content/catalog';

// Old URL → permanent redirect to the new section.
export const Route = createFileRoute('/takarmany/')({
  beforeLoad: () => { throw redirect({ to: '/$terulet', params: { terulet: legacyCategories['takarmany']!.area }, statusCode: 301 }); },
});
