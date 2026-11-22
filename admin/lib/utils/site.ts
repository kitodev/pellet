/** Public website address (for "view on site" links). Set NEXT_PUBLIC_SITE_URL in .env.local for production. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "production" ? "https://pellet-541i.vercel.app" : "http://localhost:8080")).replace(
  /\/+$/,
  "",
);
export const siteUrl = (path: string) => `${SITE_URL}${path}`;
