import { Text } from "@/components/features/content/ContentProvider";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Hammer,
  MessagesSquare,
  PlugZap,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, PageHero } from "@/components/layouts/SiteChrome";
import { pageHead } from "@/lib/utils/seo";
import workshop from "@/assets/pellet-workshop.jpg";

export const Route = createFileRoute("/szolgaltatasok")({
  head: () =>
    pageHead(
      "Szolgáltatások – telepítés, szerviz, szállítás",
      "Kályha telepítés, beüzemelés, karbantartás, szerviz, szállítás és tanácsadás pellet- és fatüzelésű kályhákhoz, kandallókhoz.",
    ),
  component: Page,
});

const services = [
  {
    id: "telepites",
    icon: Hammer,
    t: "Kályha telepítés",
    d: "Kályhák, kandallók és vízteres berendezések szakszerű telepítése, a füstcső és a kémény bekötésével.",
    subject: "Kályha telepítés",
  },
  {
    id: "beuzemeles",
    icon: PlugZap,
    t: "Beüzemelés",
    d: "Az első begyújtás és beállítás szakemberrel, hogy a berendezés hatékonyan és biztonságosan működjön. Megmutatjuk a helyes használatot is.",
    subject: "Beüzemelés",
  },
  {
    id: "karbantartas",
    icon: ShieldCheck,
    t: "Karbantartás",
    d: "Éves átvizsgálás, égőtér- és hőcserélő-tisztítás, tömítések, ventilátorok és érzékelők ellenőrzése.",
    subject: "Karbantartás",
  },
  {
    id: "szerviz",
    icon: Wrench,
    t: "Szerviz",
    d: "Hibaelhárítás és javítás pellet- és fatüzelésű kályhákhoz, kazánokhoz; alkatrészek beszerzése.",
    subject: "Szerviz",
  },
  {
    id: "szallitas",
    icon: Truck,
    t: "Szállítás",
    d: "Pellet zsákos és raklapos kiszerelésben, takarmány, kályhák és kiegészítők házhoz szállítása, egyeztetett időpontban.",
    subject: "Szállítás",
  },
  {
    id: "tanacsadas",
    icon: MessagesSquare,
    t: "Tanácsadás",
    d: "Segítünk kiválasztani a megfelelő kályhát, tüzelőanyagot vagy takarmányt – az épülethez, az igényekhez és a költségkerethez igazítva.",
    subject: "Tanácsadás",
  },
];

function Page() {
  return (
    <>
      <PageHero
        id="/szolgaltatasok"
        eyebrow="Szakértő segítség"
        title="Szolgáltatások"
        text="A kiválasztástól a telepítésen át a karbantartásig mindenben számíthat ránk."
      >
        <Breadcrumbs items={[{ label: "Szolgáltatások" }]} />
      </PageHero>
      <section className="section soft-section">
        <div className="container service-grid">
          {services.map((s, i) => (
            <article className="service-card" id={s.id} key={s.id}>
              <s.icon />
              <h2>
                <Text id={`services.${i}.t`}>{s.t}</Text>
              </h2>
              <p>
                <Text id={`services.${i}.d`}>{s.d}</Text>
              </p>
              <Link to="/arajanlat" search={{ targy: s.subject }} className="choice-cta">
                <Text id="services.cta">{"Ajánlatot kérek"}</Text> <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="container about-grid">
          <div>
            <h2>
              <Text id="services.help.title">
                {"Nem tudja, melyik kályha vagy mennyi pellet kell?"}
              </Text>
            </h2>
            <p className="section-copy">
              <Text id="services.help.text">
                {
                  "Becsülje meg a szükséges teljesítményt kalkulátorunkkal, vagy írja meg az épület adatait, és kollégáink segítenek."
                }
              </Text>
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button asChild>
                <Link to="/kalkulator">
                  <Text id="services.help.calc">{"Kazánkalkulátor"}</Text>
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/kapcsolat">
                  <Text id="services.help.contact">{"Kapcsolat"}</Text>
                </Link>
              </Button>
            </div>
          </div>
          <div className="about-picture">
            <img
              src={workshop}
              width={1024}
              height={768}
              alt="Szakember kályha karbantartása közben"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}
