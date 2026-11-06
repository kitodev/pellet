import { Calculator, Truck } from "lucide-react";
import woodPellets from "@/assets/wood-pellets.jpg";
import feedPellets from "@/assets/feed-pellets.jpg";
import workshop from "@/assets/pellet-workshop.jpg";
import type { ShownSlide } from "./SlideShow";

// Built-in slides: shown until slides are uploaded in the admin (Slide-ok tab).
// The first uploaded slide of a page replaces all of them.

const fapellet: ShownSlide = {
  id: "default-fapellet",
  title: "A1 fapellet zsákos és raklapos kiszerelésben",
  subtitle: "Alacsony hamutartalmú, prémium minőségű pellet – egész szezonra, házhoz szállítva.",
  button_label: "Fűtő pelletek",
  link_url: "/futoanyagok/futo-pelletek",
  src: woodPellets,
};
const takarmany: ShownSlide = {
  id: "default-takarmany",
  title: "Takarmányok raktárról",
  subtitle: "Cukorrépa-, széna- és lucernapellet, ló müzlik – zsákos kiszerelésben.",
  button_label: "Takarmányok",
  link_url: "/takarmanyok",
  src: feedPellets,
};
const futes: ShownSlide = {
  id: "default-futes",
  title: "Kályhák és kazánok telepítéssel",
  subtitle: "Pellet- és biomassza-tüzelésű fűtési megoldások, beüzemeléssel és szervizzel.",
  button_label: "Fűtési megoldások",
  link_url: "/futesi-megoldasok",
  src: workshop,
};
const kalkulator: ShownSlide = {
  id: "default-kalkulator",
  title: "Mekkora kazánra van szüksége?",
  subtitle:
    "A kazánkalkulátor az alapterület, a szigetelés és a melegvíz-igény alapján megbecsüli a szükséges teljesítményt.",
  button_label: "Kazánkalkulátor",
  link_url: "/kalkulator",
  graphic: { icon: Calculator, tone: "green" },
};
const szallitas: ShownSlide = {
  id: "default-szallitas",
  title: "Házhoz szállítás egyeztetett időpontban",
  subtitle: "Pellet, takarmány, kályhák és kiegészítők – kérjen ajánlatot, és mi kiszállítjuk.",
  button_label: "Árajánlatot kérek",
  link_url: "/arajanlat",
  graphic: { icon: Truck, tone: "dark" },
};

/** Home page: after the original hero picture. */
export const homeDefaultSlides = [fapellet, takarmany, futes, kalkulator, szallitas];
/** Termékek page: above the category tiles. */
export const productsDefaultSlides = [fapellet, takarmany, futes];
