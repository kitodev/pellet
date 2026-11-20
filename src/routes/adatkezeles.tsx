import { Text } from "@/components/features/content/ContentProvider";
import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs, PageHero } from "@/components/layouts/SiteChrome";
import { useContactDetails } from "@/hooks/useContactDetails";
import { pageHead } from "@/lib/utils/seo";

// /adatkezeles – privacy notice for the quote / contact forms.
// Every paragraph is editable in the admin (Weboldalszövegek, "privacy.*") – have it checked by a lawyer.
export const Route = createFileRoute("/adatkezeles")({
  head: () =>
    pageHead(
      "Adatkezelési tájékoztató",
      "Hogyan kezeli a Pellet Centrum Kft. az árajánlatkérés és a kapcsolatfelvétel során megadott személyes adatokat.",
    ),
  component: Page,
});

const blocks = [
  {
    k: "privacy.purpose",
    t: "Milyen célból kezeljük az adatokat?",
    d: "Az árajánlatkérő és a kapcsolatfelvételi űrlapon megadott adatokat kizárólag az Ön által kért árajánlat elkészítéséhez, az ezzel kapcsolatos kapcsolattartáshoz, valamint – ha megrendelés lesz belőle – a szerződés teljesítéséhez (szállítás, telepítés) használjuk.",
  },
  {
    k: "privacy.data",
    t: "Milyen adatokat kezelünk?",
    d: "Név, cégnév, e-mail-cím, telefonszám, kiszállítás esetén irányítószám és település, valamint a kért termék, mennyiség és az Ön által írt megjegyzés.",
  },
  {
    k: "privacy.basis",
    t: "Mi az adatkezelés jogalapja?",
    d: "Az Ön hozzájárulása (GDPR 6. cikk (1) a) pont), illetve a szerződés megkötését megelőző lépések megtétele az Ön kérésére (GDPR 6. cikk (1) b) pont).",
  },
  {
    k: "privacy.retention",
    t: "Meddig őrizzük az adatokat?",
    d: "Az ajánlatkérés lezárásáig, de legfeljebb 2 évig; megrendelés esetén a számviteli jogszabályokban előírt ideig. A hozzájárulását bármikor visszavonhatja.",
  },
  {
    k: "privacy.access",
    t: "Kik férnek hozzá az adatokhoz?",
    d: "Kizárólag a Pellet Centrum Kft. munkatársai. Az e-mailek kézbesítéséhez a levelezőszolgáltatónk, a weboldal működtetéséhez a tárhelyszolgáltatónk adatfeldolgozóként vesz részt. Adatait harmadik félnek nem adjuk el és nem adjuk át reklámcélra.",
  },
  {
    k: "privacy.rights",
    t: "Milyen jogai vannak?",
    d: "Kérhet tájékoztatást az adatairól, kérheti azok helyesbítését, törlését vagy kezelésük korlátozását, és tiltakozhat az adatkezelés ellen. Kérését a lent megadott elérhetőségeken jelezze. Panaszával a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH, 1055 Budapest, Falk Miksa utca 9–11., www.naih.hu) fordulhat.",
  },
];

function Page() {
  const c = useContactDetails();
  return (
    <>
      <PageHero
        id="/adatkezeles"
        eyebrow="Adatvédelem"
        title="Adatkezelési tájékoztató"
        text="Az árajánlatkérő és a kapcsolatfelvételi űrlapon megadott adatok kezeléséről."
      >
        <Breadcrumbs items={[{ label: "Adatkezelési tájékoztató" }]} />
      </PageHero>
      <section className="section">
        <div className="container narrow privacy">
          <h2>
            <Text id="privacy.controller.title">{"Az adatkezelő"}</Text>
          </h2>
          <p>
            <strong>{c.company}</strong>
            <br />
            {c.address}
            <br />
            E-mail: {c.email || "pelletcentrumkft@gmail.com"}
            {c.phone && (
              <>
                <br />
                Telefon: {c.phone}
              </>
            )}
          </p>
          {blocks.map((b) => (
            <div key={b.k}>
              <h2>
                <Text id={`${b.k}.title`}>{b.t}</Text>
              </h2>
              <p className="whitespace-pre-line">
                <Text id={b.k}>{b.d}</Text>
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
