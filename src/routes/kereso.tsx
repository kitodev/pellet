import { pageHead } from "@/lib/utils/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageHero } from "@/components/layouts/SiteChrome";
import { searchSite } from "@/lib/content/catalog";
import { useContent } from "@/hooks/useContent";
export const Route = createFileRoute("/kereso")({
  validateSearch: (s: Record<string, unknown>): { q?: string } =>
    typeof s["q"] === "string" ? { q: s["q"] } : {},
  head: () => pageHead("Kereső", "Keressen termékeink, szolgáltatásaink és cikkeink között."),
  component: Page,
});
function Page() {
  const { q = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const hits = searchSite(q);
  const content = useContent();
  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  if (q.trim())
    for (const p of content?.products ?? [])
      if (norm(`${p.name} ${p.description}`).includes(norm(q.trim())))
        hits.push({
          title: p.name,
          text: p.short_description || p.description,
          to: "/$terulet/$kategoria/$termek",
          params: { terulet: p.area, kategoria: p.category, termek: p.slug },
        });
  return (
    <>
      <PageHero eyebrow="Keresés" title="Mit keres?" />
      <section className="section" aria-labelledby="search-title">
        <div className="container narrow">
          <h2 id="search-title" className="sr-only">
            Keresés a termékek és cikkek között
          </h2>
          <form role="search" onSubmit={(e) => e.preventDefault()}>
            <label className="search-box">
              <Search aria-hidden />
              <input
                type="search"
                aria-label="Keresés"
                autoFocus
                value={q}
                placeholder="pl. pellet, lótáp, kályha, füstcső…"
                onChange={(e) =>
                  navigate({ search: e.target.value ? { q: e.target.value } : {}, replace: true })
                }
              />
            </label>
            <button type="submit" className="sr-only">
              Keresés
            </button>
          </form>
          {q && (
            <p className="section-copy" role="status">
              {hits.length} találat
            </p>
          )}
          <ul className="search-results">
            {hits.map((h) => (
              <li key={`${h.to}${h.title}`}>
                <Link to={h.to} params={h.params ?? {}}>
                  <strong>{h.title}</strong>
                  <span>{h.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
