/** URL of an uploaded file: Vercel Blob URLs as they are, local file names via /uploads/<folder>/. */
export const fileUrl = (folder: string, name: string) =>
  /^https?:\/\//.test(name) ? name : `/uploads/${folder}/${encodeURIComponent(name)}`;
