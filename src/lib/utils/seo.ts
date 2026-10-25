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

/** Standard <head> tags for a public page. */
export function pageHead(
  title: string,
  description: string,
  extra: { image?: string; type?: string } = {},
) {
  const full = title.includes("Pellet Centrum") ? title : `${title} – Pellet Centrum Kft.`;
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      { property: "og:type", content: extra.type ?? "website" },
      ...(extra.image ? [{ property: "og:image", content: extra.image }] : []),
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
