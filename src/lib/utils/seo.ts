export function adminHead(title: string, description: string) {
  const full = `${title} – Pellet Centrum Kft.`;
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  };
}

/** Safe JSON for <script type="application/ld+json"> (no "</script>" breakouts). */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

/** Public address of the site (VITE_SITE_URL), used for canonical links and absolute image URLs. */
export const siteUrl = (
  (import.meta.env["VITE_SITE_URL"] as string | undefined) || "https://pellet-541i.vercel.app"
).replace(/\/+$/, "");
const absolute = (u: string) =>
  /^https?:\/\//.test(u) ? u : `${siteUrl}${u.startsWith("/") ? "" : "/"}${u}`;

/** Standard <head> tags for a public page. `path` adds the canonical link and og:url. */
export function pageHead(
  title: string,
  description: string,
  extra: { image?: string; type?: string; keywords?: string; path?: string } = {},
) {
  const full = title.includes("Pellet Centrum") ? title : `${title} – Pellet Centrum Kft.`;
  return {
    ...(extra.path ? { links: [{ rel: "canonical", href: absolute(extra.path) }] } : {}),
    meta: [
      { title: full },
      { name: "description", content: description },
      ...(extra.keywords ? [{ name: "keywords", content: extra.keywords }] : []),
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      { property: "og:type", content: extra.type ?? "website" },
      ...(extra.image ? [{ property: "og:image", content: absolute(extra.image) }] : []),
      ...(extra.path ? [{ property: "og:url", content: absolute(extra.path) }] : []),
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
