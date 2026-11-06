"use client";
import { useState } from "react";
import { BookOpen, FileText, Images, MapPin, MessageSquareQuote, Package } from "lucide-react";
import { Button } from "@/components/ui";
import { ProductsPanel } from "@/components/features/products/ProductsPanel";
import { ReviewsPanel } from "@/components/features/reviews/ReviewsPanel";
import { BlogPanel } from "@/components/features/blog/BlogPanel";
import { ContactPanel } from "@/components/features/contact/ContactPanel";
import { TextsPanel } from "@/components/features/texts/TextsPanel";
import { SlidesPanel } from "@/components/features/slides/SlidesPanel";
import type { BlogPost, Product, Review, SiteText, Slide } from "@/types";

type Tab = "products" | "slides" | "reviews" | "blog" | "contact" | "texts";
type Props = {
  products: Product[];
  slides: Slide[];
  reviews: Review[];
  posts: BlogPost[];
  texts: SiteText[];
};

export function AdminTabs({ products, slides, reviews, posts, texts }: Props) {
  const [tab, setTab] = useState<Tab>("products");
  const tabs: { key: Tab; label: string; icon: typeof Package }[] = [
    { key: "products", label: `Termékek (${products.length})`, icon: Package },
    { key: "slides", label: `Slide-ok (${slides.length})`, icon: Images },
    { key: "reviews", label: `Vélemények (${reviews.length})`, icon: MessageSquareQuote },
    { key: "blog", label: `Tudástár (${posts.length})`, icon: BookOpen },
    { key: "contact", label: "Elérhetőségek", icon: MapPin },
    { key: "texts", label: "Weboldalszövegek", icon: FileText },
  ];
  return (
    <>
      <nav className="admin-tabs" role="tablist">
        {tabs.map((t) => (
          <Button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            variant={tab === t.key ? "primary" : "ghost"}
            onClick={() => setTab(t.key)}
          >
            <t.icon size={16} /> {t.label}
          </Button>
        ))}
      </nav>
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
    </>
  );
}
