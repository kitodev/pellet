import { Text } from "@/components/features/content/ContentProvider";
import { pageHead } from "@/lib/utils/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  ContactCtaSection,
  DeliverySection,
  FeaturedSection,
  IntroSection,
  ReasonsSection,
  ReviewsSection,
  SaleSection,
} from "@/components/features/home/HomeSections";
import pelletHome from "@/assets/pellet-home.jpg";
import woodPellets from "@/assets/wood-pellets.jpg";
import feedPellets from "@/assets/feed-pellets.jpg";
import { useAreas } from "@/hooks/useContent";
import { SlideShow } from "@/components/features/slider/SlideShow";
import { homeDefaultSlides } from "@/components/features/slider/defaultSlides";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Pellet Centrum Kft. – Pellet, takarmány, kályhák és kandallók",
      "Fapellet zsákos és raklapos kiszerelésben, brikett, tűzifa, takarmányok, pellet- és fatüzelésű kályhák, kandallók, kiegészítők, telepítés és szerviz.",
    ),
  component: Index,
});

function Index() {
  // First slide: the three product areas as tiles; slides uploaded in the admin (Slide-ok) follow it.
  return (
    <>
      <SlideShow page="home" first={<DefaultHero />} defaults={homeDefaultSlides} />
      <IntroSection />
      <FeaturedSection />
      <SaleSection />
      <ReasonsSection />
      <DeliverySection />
      <ReviewsSection />
      <ContactCtaSection />
    </>
  );
}

/** The three product areas of the first slide (texts editable in the admin). */
const mosaic = [
  {
    area: "futoanyagok",
    image: woodPellets,
    alt: "Fapellet fakanállal",
    eyebrow: "Természetes energia",
    text: "A1 fapellet, ipari és szalmapellet, brikett – zsákos és raklapos kiszerelésben.",
  },
  {
    area: "takarmanyok",
    image: feedPellets,
    alt: "Takarmánypellet az istállóban",
    eyebrow: "Állattartáshoz",
    text: "Cukorrépa-, széna- és lucernapellet, ló müzlik.",
  },
  {
    area: "futesi-megoldasok",
    image: pelletHome,
    alt: "Pelletkályha egy meleg otthonban",
    eyebrow: "Meleg otthon",
    text: "Pellet kályhák és kazánok, biomassza-kazánok, kiegészítők – telepítéssel.",
  },
] as const;

/** First slide of the home page carousel: three tiles – Tüzelőanyagok, Takarmányok, Fűtési megoldások. */
function DefaultHero() {
  const areas = useAreas();
  return (
    <section className="hero-mosaic">
      <h1 className="sr-only">
        <Text id="index.mosaic.h1">
          {"Pellet Centrum – tüzelőanyagok, takarmányok és fűtési megoldások"}
        </Text>
      </h1>
      {mosaic.map((m, i) => (
        <Link key={m.area} to="/$terulet" params={{ terulet: m.area }} className="mosaic-tile">
          <img
            src={m.image}
            alt={m.alt}
            width={1024}
            height={768}
            fetchPriority={i === 0 ? "high" : "auto"}
          />
          <div className="mosaic-body">
            <span className="mosaic-eyebrow">
              <Text id={`index.mosaic.${m.area}.eyebrow`}>{m.eyebrow}</Text>
            </span>
            <h2>{areas[m.area].label}</h2>
            <p>
              <Text id={`index.mosaic.${m.area}.text`}>{m.text}</Text>
            </p>
            <span className="mosaic-button">
              <Text id="index.mosaic.cta">{"Megnézem"}</Text> <ArrowRight size={16} />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
