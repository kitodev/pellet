// Shared slug helper for the database scripts (same rules as the apps).
export function slugify(text) {
  return (
    String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120) || "termek"
  );
}
