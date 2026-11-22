import { SITE_URL } from "./site";

/**
 * URL of an uploaded file: Vercel Blob URLs as they are, built-in website pictures ("/termekkepek/…")
 * from the website, local file names via /uploads/<folder>/.
 */
export const fileUrl = (folder: string, name: string) =>
  /^https?:\/\//.test(name)
    ? name
    : name.startsWith("/")
      ? `${SITE_URL}${name}`
      : `/uploads/${folder}/${encodeURIComponent(name)}`;
