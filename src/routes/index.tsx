import { Text } from "@/components/features/content/ContentProvider";
import { pageHead } from "@/lib/utils/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Flame, Leaf, Wheat } from "lucide-react";
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

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Pellet Centrum Kft. – Pellet, takarmány, kályhák és kandallók",
      "Fapellet zsákos és raklapos kiszerelésben, brikett, tűzifa, takarmányok, pellet- és fatüzelésű kályhák, kandallók, kiegészítők, telepítés és szerviz.",
    ),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="pellet-hero">
        <img
          src={pelletHome}
          width={1920}
          height={1024}
          alt="Zsákos fapellet egy meleg, kandallós otthonban"
          className="pellet-hero-image"
          fetchPriority="high"
        />
        <div className="container pellet-hero-inner">
          <div className="pellet-promise">
            <Text id="index.text.1">{"Meleg otthon,"}</Text>
            <br />
            <span>
              <Text id="index.text.2">{"biztos holnap!"}</Text>
            </span>
          </div>
          <div className="pellet-offer">
            <div className="offer-heading">
              <span>
                <Text id="index.text.3">{"TERMÉSZETES ENERGIA"}</Text>
              </span>
              <h1>
                <Text id="index.text.4">{"PRÉMIUM"}</Text> <br />
                <Text id="index.text.5">{"PELLET"}</Text>
              </h1>
            </div>
            <Link to="/arajanlat" className="offer-price">
              <span>
                <Text id="index.text.6">{"JÓ ÁR. VALÓDI MINŐSÉG."}</Text>
              </span>
              <strong>
                <Text id="index.text.7">{"KÉRJEN ÁRAT"}</Text>
                <ArrowRight />
              </strong>
            </Link>
            <div className="offer-benefits">
              <div>
                <Leaf />
                <span>
                  <Text id="index.text.8">{"Természetes"}</Text>
                  <br />
                  <Text id="index.text.9">{"alapanyag"}</Text>
                </span>
              </div>
              <div>
                <Flame />
                <span>
                  <Text id="index.text.10">{"Fűtéshez"}</Text>
                </span>
              </div>
              <div>
                <Wheat />
                <span>
                  <Text id="index.text.11">{"Takarmányozáshoz"}</Text>
                </span>
              </div>
            </div>
            <p className="offer-copy">
              <Text id="index.text.12">{"Tüzelőanyag és takarmány – egy helyen."}</Text>
            </p>
          </div>
          <div className="pellet-photo-caption">
            <Text id="index.text.13">{"Tiszta energia,"}</Text>
            <br />
            <Text id="index.text.14">{"természetesen!"}</Text>
            <Leaf />
          </div>
        </div>
      </section>
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
