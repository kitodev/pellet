import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useSlides } from "@/hooks/useContent";
import { uploadUrl } from "@/lib/utils/urls";
import type { Slide } from "@/types";

const AUTOPLAY_MS = 6000;

/** Internal links ("/termekek") open in place, external ones in a new tab. */
function SlideLink({ slide, children }: { slide: Slide; children: React.ReactNode }) {
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
 * Image carousel managed in the admin (Slide-ok tab). Renders nothing when the page has
 * no slides – the caller then shows its default content (`fallback`).
 */
export function SlideShow({
  page,
  fallback = null,
}: {
  page: Slide["page"];
  fallback?: React.ReactNode;
}) {
  const slides = useSlides(page);
  const [ref, api] = useEmblaCarousel({ loop: slides.length > 1 });
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
    if (!api || paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => api.scrollNext(), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [api, paused, slides.length]);

  if (!slides.length) return <>{fallback}</>;

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
          {slides.map((s, i) => (
            <div
              key={s.id}
              className="slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${slides.length}`}
            >
              <img
                src={uploadUrl("slides", s.image_path)}
                alt={s.title}
                className="slide-image"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
              />
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
          ))}
        </div>
      </div>
      {slides.length > 1 && (
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
            {slides.map((s, i) => (
              <button
                key={s.id}
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
