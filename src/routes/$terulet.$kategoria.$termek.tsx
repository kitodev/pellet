import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductDetail } from "@/components/features/catalog/ProductDetail";
import { productImage } from "@/components/features/catalog/images";
import { contentOptions } from "@/lib/content/queries";
import { pageHead } from "@/lib/utils/seo";

export const Route = createFileRoute("/$terulet/$kategoria/$termek")({
  loader: async ({ context, params }) => {
    const content = await context.queryClient.ensureQueryData(contentOptions);
    const product = content.products.find(
      (p) =>
        p.slug === params.termek && p.area === params.terulet && p.category === params.kategoria,
    );
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData: p }) =>
    p
      ? pageHead(
          p.seo_title || `${p.name}${p.brand ? ` – ${p.brand}` : ""}`,
          p.meta_description || p.short_description || p.description.slice(0, 160) || p.name,
          { image: productImage(p), type: "product", keywords: p.keywords },
        )
      : {},
  component: Page,
});
function Page() {
  return <ProductDetail product={Route.useLoaderData()} />;
}
