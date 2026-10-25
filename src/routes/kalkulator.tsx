import { Text } from "@/components/features/content/ContentProvider";
import { pageHead } from "@/lib/utils/seo";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/layouts/SiteChrome";
import { Calculator } from "@/components/features/calculator/Calculator";
export const Route = createFileRoute("/kalkulator")({
  head: () =>
    pageHead(
      "Kazánkalkulátor",
      "Becsülje meg otthona hőigényét és a szükséges kályha- vagy kazánteljesítményt.",
    ),
  component: Page,
});
function Page() {
  return (
    <>
      <PageHero eyebrow="Kezdjük a megfelelő méretezéssel" title="Kazánkalkulátor" />
      <section className="section">
        <div className="container calc-grid">
          <div>
            <h2>
              <Text id="kalkulator.text.1">{"Mekkora kazánra"}</Text>
              <br />
              <Text id="kalkulator.text.2">{"van szüksége?"}</Text>
            </h2>
            <p className="section-copy">
              <Text id="kalkulator.text.3">
                {
                  "Adja meg a fűtött alapterületet, a szigetelés minőségét és a melegvizet használók számát."
                }
              </Text>
            </p>
            <div className="check-list">
              <span>
                <CheckCircle2 />
                <Text id="kalkulator.text.4">{"Személyre szabott becslés"}</Text>
              </span>
              <span>
                <CheckCircle2 />
                <Text id="kalkulator.text.5">{"Egyszerű tervezés"}</Text>
              </span>
            </div>
          </div>
          <Calculator />
        </div>
      </section>
    </>
  );
}
