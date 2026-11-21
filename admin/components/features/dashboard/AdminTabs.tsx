"use client";
import { useSyncExternalStore } from "react";
import {
  BookOpen,
  FileText,
  Images,
  Inbox,
  MapPin,
  MessageSquareQuote,
  Package,
} from "lucide-react";
import { ProductsPanel } from "@/components/features/products/ProductsPanel";
import { ReviewsPanel } from "@/components/features/reviews/ReviewsPanel";
import { BlogPanel } from "@/components/features/blog/BlogPanel";
import { ContactPanel } from "@/components/features/contact/ContactPanel";
import { TextsPanel } from "@/components/features/texts/TextsPanel";
import { SlidesPanel } from "@/components/features/slides/SlidesPanel";
import { QuotesPanel } from "@/components/features/quotes/QuotesPanel";
import type { BlogPost, Product, QuoteRequest, Review, SiteText, Slide } from "@/types";

type Tab = "quotes" | "products" | "slides" | "reviews" | "blog" | "contact" | "texts";
type Props = {
  products: Product[];
  quotes: QuoteRequest[];
  slides: Slide[];
  reviews: Review[];
  posts: BlogPost[];
  texts: SiteText[];
};

const TAB_KEYS: Tab[] = ["quotes", "products", "slides", "reviews", "blog", "contact", "texts"];
const isTab = (v: string): v is Tab => (TAB_KEYS as string[]).includes(v);
const readHash = () => window.location.hash.slice(1);
const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

/** Admin: menu on the left (sidebar), the chosen panel on the right. The tab is kept in the URL (#products). */
export function AdminTabs({ products, quotes, slides, reviews, posts, texts }: Props) {
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const tab: Tab = isTab(hash) ? hash : "products";
  const choose = (t: Tab) => {
    window.history.pushState(null, "", `#${t}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    window.scrollTo({ top: 0 });
  };
  const openQuotes = quotes.filter((q) => q.status === "new").length;
  const tabs: { key: Tab; label: string; icon: typeof Package; count?: number; alert?: boolean }[] =
    [
      {
        key: "quotes",
        label: "Ajánlatkérések",
        icon: Inbox,
        count: openQuotes,
        alert: openQuotes > 0,
      },
      { key: "products", label: "Termékek", icon: Package, count: products.length },
      { key: "slides", label: "Slide-ok", icon: Images, count: slides.length },
      { key: "reviews", label: "Vélemények", icon: MessageSquareQuote, count: reviews.length },
      { key: "blog", label: "Tudástár", icon: BookOpen, count: posts.length },
      { key: "contact", label: "Elérhetőségek", icon: MapPin },
      { key: "texts", label: "Weboldalszövegek", icon: FileText },
    ];
  return (
    <div className="admin-layout">
      <nav className="admin-sidebar" aria-label="Admin menü">
        <ul role="tablist" aria-orientation="vertical">
          {tabs.map((t) => (
            <li key={t.key}>
              <button
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={tab === t.key ? "active" : ""}
                onClick={() => choose(t.key)}
              >
                <t.icon size={20} strokeWidth={1.8} />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span className={t.alert ? "badge alert" : "badge"}>{t.count}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <section className="admin-main" role="tabpanel">
        {tab === "quotes" && <QuotesPanel quotes={quotes} />}
        {tab === "products" && <ProductsPanel products={products} />}
        {tab === "slides" && (
          <SlidesPanel
            slides={slides}
            hideHero={texts.some((t) => t.key === "slides.home.hideFirst" && t.value === "1")}
          />
        )}
        {tab === "reviews" && <ReviewsPanel reviews={reviews} />}
        {tab === "blog" && <BlogPanel posts={posts} />}
        {tab === "contact" && <ContactPanel texts={texts} />}
        {tab === "texts" && <TextsPanel texts={texts} />}
      </section>
    </div>
  );
}
