import { createFileRoute, notFound } from '@tanstack/react-router';
import { ProductDetail, productImage } from '@/components/features/catalog/AreaPages';
import { contentOptions } from '@/lib/content/queries';
import { pageHead } from '@/lib/utils/seo';

export const Route = createFileRoute('/$terulet/$kategoria/$termek')({
  loader: async ({ context, params }) => {
    const content = await context.queryClient.ensureQueryData(contentOptions);
    const product = content.products.find(p => p.slug === params.termek && p.area === params.terulet && p.category === params.kategoria);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => (loaderData ? pageHead(loaderData.name, loaderData.short_description || loaderData.description.slice(0, 160) || loaderData.name, { image: productImage(loaderData), type: 'product' }) : {}),
  component: Page,
});
function Page() { return <ProductDetail product={Route.useLoaderData()} />; }
