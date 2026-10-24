"use client";
import { useState } from "react";
import { BookOpen, FileText, MapPin, MessageSquareQuote, Package } from "lucide-react";
import { Button } from "@/components/ui";
import { ProductsPanel } from "@/components/features/products/ProductsPanel";
import { ReviewsPanel } from "@/components/features/reviews/ReviewsPanel";
import { BlogPanel } from "@/components/features/blog/BlogPanel";
import { ContactPanel } from "@/components/features/contact/ContactPanel";
import { TextsPanel } from "@/components/features/texts/TextsPanel";
import type { BlogPost, Product, Review, SiteText } from "@/types";

type Tab = "products" | "reviews" | "blog" | "contact" | "texts";
type Props = { products: Product[]; reviews: Review[]; posts: BlogPost[]; texts: SiteText[] };

export function AdminTabs({ products, reviews, posts, texts }: Props) {
  const [tab, setTab] = useState<Tab>("products");
  const tabs: { key: Tab; label: string; icon: typeof Package }[] = [
    { key: "products", label: `Termékek (${products.length})`, icon: Package },
    { key: "reviews", label: `Vélemények (${reviews.length})`, icon: MessageSquareQuote },
    { key: "blog", label: `Tudástár (${posts.length})`, icon: BookOpen },
    { key: "contact", label: "Elérhetőségek", icon: MapPin },
    { key: "texts", label: "Weboldalszövegek", icon: FileText },
  ];
  return (
    <>
      <nav className="admin-tabs" role="tablist">
        {tabs.map((t) => (
          <Button key={t.key} role="tab" aria-selected={tab === t.key} variant={tab === t.key ? "primary" : "ghost"} onClick={() => setTab(t.key)}>
            <t.icon size={16} /> {t.label}
          </Button>
        ))}
      </nav>
      {tab === "products" && <ProductsPanel products={products} />}
      {tab === "reviews" && <ReviewsPanel reviews={reviews} />}
      {tab === "blog" && <BlogPanel posts={posts} />}
      {tab === "contact" && <ContactPanel texts={texts} />}
      {tab === "texts" && <TextsPanel texts={texts} />}
    </>
  );
}
