import { createFileRoute } from "@tanstack/react-router";
import { ProductsOverview } from "@/components/features/catalog/ProductsOverview";
import { pageHead } from "@/lib/utils/seo";

// /termekek – all product categories as tiles (main menu: TERMÉKEK)
export const Route = createFileRoute("/termekek")({
  head: () =>
    pageHead(
      "Termékek – fűtőanyagok, takarmányok, kályhák, kiegészítők | Pellet Centrum",
      "Fapellet, brikett, tűzifa, takarmányok, pellet- és fatüzelésű kályhák, kandallók, kiegészítők – minden termékkategória egy helyen.",
    ),
  component: ProductsOverview,
});
