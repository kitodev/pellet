import { createFileRoute } from "@tanstack/react-router";
import { areas } from "@/lib/content/catalog";
import { listProducts, listPublishedPosts } from "@/lib/db/server/queries";

// /sitemap.xml – every public page, category, product and published article (for Google).
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = process.env["SITE_URL"]?.replace(/\/+$/, "") || new URL(request.url).origin;
        const [products, posts] = await Promise.all([
          listProducts({ publishedOnly: true }),
          listPublishedPosts(),
        ]).catch((error: unknown) => {
          console.error("[pellet] sitemap: adatbázis nem elérhető", error);
          return [[], []] as [
            Awaited<ReturnType<typeof listProducts>>,
            Awaited<ReturnType<typeof listPublishedPosts>>,
          ];
        });
        const urls: { loc: string; lastmod?: string }[] = [
          ...[
            "/",
            "/szolgaltatasok",
            "/blog",
            "/rolunk",
            "/kapcsolat",
            "/arajanlat",
            "/kalkulator",
          ].map((loc) => ({ loc })),
          ...Object.values(areas).flatMap((a) => [
            { loc: `/${a.key}` },
            ...a.categories.map((c) => ({ loc: `/${a.key}/${c.slug}` })),
          ]),
          ...products.map((p) => ({ loc: `/${p.area}/${p.category}/${p.slug}` })),
          ...posts.map((p) => ({
            loc: `/blog/${p.slug}`,
            ...(p.updated_at || p.published_at
              ? { lastmod: (p.updated_at ?? p.published_at)!.slice(0, 10) }
              : {}),
          })),
        ];
        const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${esc(origin + u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>\n`;
        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
