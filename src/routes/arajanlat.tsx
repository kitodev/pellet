import { pageHead } from "@/lib/utils/seo";
import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/layouts/SiteChrome";
import { QuoteForm } from "@/components/features/quote/QuoteForm";
export const Route = createFileRoute("/arajanlat")({
  validateSearch: (s: Record<string, unknown>): { targy?: string } =>
    typeof s["targy"] === "string" ? { targy: s["targy"] } : {},
  head: () =>
    pageHead(
      "Árajánlatkérés",
      "Kérjen személyre szabott árajánlatot pelletre, takarmányra, kályhára, kiegészítőkre vagy szolgáltatásra.",
    ),
  component: Page,
});
function Page() {
  const { targy } = Route.useSearch();
  return (
    <>
      <PageHero
        eyebrow="Személyre szabott ajánlat"
        title="Árajánlatkérés"
        text="Adja meg, mire van szüksége és milyen mennyiségben."
      />
      <section className="section soft-section">
        <div className="container narrow">
          <QuoteForm
            key={targy}
            {...(targy ? { initialSubject: targy } : {})}
            kind="Árajánlatkérés"
          />
        </div>
      </section>
    </>
  );
}
