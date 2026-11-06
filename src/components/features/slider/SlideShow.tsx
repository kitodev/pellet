import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { useSlides, useText } from "@/hooks/useContent";
import { uploadUrl } from "@/lib/utils/urls";
import type { Slide } from "@/types";

const AUTOPLAY_MS = 6000;

/** Internal links ("/termekek") open in place, external ones in a new tab. */
function SlideLink({
  slide,
  children,
}: {
  slide: { link_url: string };
  children: React.ReactNode;
}) {
  const url = slide.link_url.trim();
  const external = /^https?:\/\//i.test(url);
  return (
    <a
      href={url}
      className="slide-button"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

/**
 * Image carousel managed in the admin (Slide-ok tab).
 * `first`: built-in content shown as the first slide (home page: the original hero picture);
 * the admin can hide it (text key `slides.<page>.hideFirst` = "1").
 * With a single slide it is shown without arrows and dots.
 */
/**
 * A slide to show: uploaded in the admin (uploads/slides) or a built-in default.
 * Built-in slides either have a photo (`src`) or are a graphic slide (`graphic`: coloured
 * background with a big icon) – used where there is no photo yet.
 */
export type ShownSlide = Omit<Slide, "page" | "published" | "sort_order" | "image_path"> & {
  src?: string;
  graphic?: { icon: LucideIcon; tone: "green" | "dark" };
};

export function SlideShow({
  page,
  first = null,
  defaults = [],
}: {
  page: Slide["page"];
  first?: React.ReactNode;
  /** shown while no slide has been uploaded for this page in the admin */
  defaults?: ShownSlide[];
}) {
  const uploaded = useSlides(page);
  const adminSlides: ShownSlide[] = uploaded.length
    ? uploaded.map((u) => ({ ...u, src: uploadUrl("slides", u.image_path) }))
    : defaults;
  const hideFirst = useText(`slides.${page}.hideFirst`, "") === "1" && uploaded.length > 0;
  const lead = first && !hideFirst ? first : null;
  const total = (lead ? 1 : 0) + adminSlides.length;
  const offset = lead ? 1 : 0;
  const slides = adminSlides;
  const [ref, api] = useEmblaCarousel({ loop: total > 1 });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const onSelect = useCallback(() => api && setIndex(api.selectedScrollSnap()), [api]);
  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  useEffect(() => {
    if (!api || paused || total < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => api.scrollNext(), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [api, paused, total]);

  if (!total) return null;
  if (total === 1 && lead) return <>{lead}</>;

  return (
    <section
      className="slideshow"
      aria-roledescription="carousel"
      aria-label="Kiemelt ajánlatok"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="slideshow-viewport" ref={ref}>
        <div className="slideshow-track">
          {lead && (
            <div
              className="slide slide-custom"
              role="group"
              aria-roledescription="slide"
              aria-label={`1 / ${total}`}
            >
              {lead}
            </div>
          )}
          {slides.map((s, j) => {
            const i = j + offset;
            return (
              <div
                key={s.id}
                className={s.graphic ? `slide slide-graphic ${s.graphic.tone}` : "slide"}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${total}`}
              >
                {s.src && (
                  <img
                    src={s.src}
                    alt={s.title}
                    className="slide-image"
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                  />
                )}
                {s.graphic && <s.graphic.icon className="slide-graphic-icon" aria-hidden />}
                {(s.title || s.subtitle || (s.button_label && s.link_url)) && (
                  <div className="container slide-content">
                    <div className="slide-panel">
                      {s.title &&
                        (i === 0 && page === "home" ? <h1>{s.title}</h1> : <h2>{s.title}</h2>)}
                      {s.subtitle && <p>{s.subtitle}</p>}
                      {s.button_label && s.link_url && (
                        <SlideLink slide={s}>
                          {s.button_label} <ArrowRight size={16} />
                        </SlideLink>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {total > 1 && (
        <>
          <button
            type="button"
            className="slide-arrow prev"
            aria-label="Előző"
            onClick={() => api?.scrollPrev()}
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            className="slide-arrow next"
            aria-label="Következő"
            onClick={() => api?.scrollNext()}
          >
            <ChevronRight />
          </button>
          <div className="slide-dots">
            {Array.from({ length: total }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i + 1}. dia`}
                aria-current={i === index}
                onClick={() => api?.scrollTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
