import { Text } from "@/components/features/content/ContentProvider";
import { pageHead } from "@/lib/utils/seo";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/layouts/SiteChrome";
import { Calculator } from "@/components/features/calculator/Calculator";
import { BoilerAnimation, type CalcValues } from "@/components/features/calculator/BoilerAnimation";
import { estimateHeating } from "@/lib/utils/heating";
import { useState } from "react";
export const Route = createFileRoute("/kalkulator")({
  head: () =>
    pageHead(
      "Kazánkalkulátor",
      "Becsülje meg otthona hőigényét és a szükséges kályha- vagy kazánteljesítményt.",
    ),
  component: Page,
});
function Page() {
  const [values, setValues] = useState<CalcValues>(() => ({
    area: 120,
    insulation: "medium",
    people: 3,
    power: estimateHeating(120, "medium", 3),
  }));
  return (
    <>
      <PageHero eyebrow="Kezdjük a megfelelő méretezéssel" title="Kazánkalkulátor" />
      <section className="section">
        <div className="container">
          <div className="calc-intro">
            <h2>
              <Text id="kalkulator.text.1">{"Mekkora kazánra"}</Text>
              <br />
              <Text id="kalkulator.text.2">{"van szüksége?"}</Text>
            </h2>
            <div>
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
          </div>
          <div className="calc-stage">
            <BoilerAnimation {...values} />
            <Calculator onChange={setValues} />
          </div>
        </div>
      </section>
    </>
  );
}
