import { Text } from "@/components/features/content/ContentProvider";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Factory, Flame, Leaf, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, PageHero } from "@/components/layouts/SiteChrome";
import { pageHead } from "@/lib/utils/seo";
import pellets from "@/assets/wood-pellets.jpg";

// /biomassza – information page (main menu: Biomassza). All texts are editable in the admin.
export const Route = createFileRoute("/biomassza/")({
  head: () =>
    pageHead(
      "Biomassza fűtés – pellet, brikett, biomassza-kazánok",
      "Mi a biomassza, és miért érdemes vele fűteni? Tüzelőanyagok és biomassza-kazánok lakossági, ipari és nagyipari felhasználásra.",
    ),
  component: Page,
});

const points = [
  {
    icon: Leaf,
    k: "biomassza.p1",
    t: "Megújuló energia",
    d: "A biomassza növényi eredetű, folyamatosan újratermelődő energiaforrás.",
  },
  {
    icon: Recycle,
    k: "biomassza.p2",
    t: "Közel szén-semleges",
    d: "Elégetésekor annyi szén-dioxid szabadul fel, amennyit a növény a növekedése során megkötött.",
  },
  {
    icon: Flame,
    k: "biomassza.p3",
    t: "Kiszámítható költség",
    d: "A pellet és a brikett ára kevésbé ingadozik, mint a fosszilis energiahordozóké.",
  },
  {
    icon: Factory,
    k: "biomassza.p4",
    t: "Családi háztól az üzemig",
    d: "Lakossági, ipari és nagyipari biomassza-kazánokkal minden méretben megoldható a fűtés.",
  },
];

function Page() {
  return (
    <>
      <PageHero
        id="/biomassza"
        eyebrow="Megújuló energia"
        title="Biomassza"
        text="Fűtés természetes, megújuló tüzelőanyaggal – pellettel, brikettel, korszerű kazánokkal."
      >
        <Breadcrumbs items={[{ label: "Biomassza" }]} />
      </PageHero>
      <section className="section">
        <div className="container about-grid">
          <div>
            <div className="eyebrow">
              <Text id="biomassza.eyebrow">{"Mi a biomassza?"}</Text>
            </div>
            <h2>
              <Text id="biomassza.title">{"Természetes energia, tudatos fűtés"}</Text>
            </h2>
            <p className="section-copy whitespace-pre-line">
              <Text id="biomassza.text">
                {
                  "Biomasszának nevezzük a növényi eredetű anyagokat – fát, fűrészport, szalmát, mezőgazdasági melléktermékeket –, amelyekből préseléssel pellet és brikett készül. Ezek egyenletesen, kevés hamuval égnek, és automatizált kályhákban, kazánokban kényelmes, takarékos fűtést adnak."
                }
              </Text>
            </p>
            <div className="cta-actions page-actions">
              <Button asChild>
                <Link
                  to="/$terulet/$kategoria"
                  params={{ terulet: "futesi-megoldasok", kategoria: "biomassza-kazanok" }}
                >
                  <Text id="biomassza.cta.boilers">{"Biomassza kazánok"}</Text>
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/$terulet" params={{ terulet: "futoanyagok" }}>
                  <Text id="biomassza.cta.fuels">{"Tüzelőanyagok"}</Text>
                </Link>
              </Button>
            </div>
          </div>
          <div className="about-picture">
            <img src={pellets} alt="Fapellet közelről" loading="lazy" width={1024} height={768} />
          </div>
        </div>
      </section>
      <section className="section soft-section">
        <div className="container">
          <div className="reason-grid four">
            {points.map((p) => (
              <article key={p.k} className="reason-card">
                <p.icon />
                <h3>
                  <Text id={`${p.k}.title`}>{p.t}</Text>
                </h3>
                <p>
                  <Text id={`${p.k}.text`}>{p.d}</Text>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
