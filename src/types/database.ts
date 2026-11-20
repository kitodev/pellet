// Row types of the MySQL tables (see database/migrations).

export type ProductSpecs = Record<string, string>;

/** How the price is shown: public gross price / "Árért érdeklődjön" / quantity-based quote. */
export type PriceMode = "public" | "ask" | "quantity";
/** Raktáron / Korlátozott készlet / Rendelésre / Jelenleg nem elérhető */
export type StockStatus = "in_stock" | "limited" | "on_order" | "out_of_stock";
export type DocumentKind = "certificate" | "manual" | "other";

/** Downloadable PDF besides the Műszaki adatlap (uploads/datasheets). */
export type ProductDocument = { id: string; kind: DocumentKind; title: string; path: string };

export type Product = {
  id: string;
  slug: string;
  area: string;
  category: string;
  name: string;
  /** Gyártó / márka */
  brand: string;
  short_description: string;
  description: string;
  /** Price in HUF; null = "Ajánlatot kérek" */
  price: number | null;
  /** Discounted price in HUF; set = shown under "Aktuális akciók" */
  sale_price: number | null;
  /** e.g. "Ft/zsák", "Ft/raklap", "Ft/db" */
  price_unit: string;
  specs: ProductSpecs;
  /** Main photo file name in uploads/products */
  image_path: string;
  /** Extra photo file names in uploads/products */
  images: string[];
  /** PDF file name in uploads/datasheets */
  datasheet_path: string;
  /** Kiszerelés / méret / teljesítmény in one line, e.g. "15 kg/zsák" or "10 kW" */
  packaging: string;
  /** Key features, one per line (4–6) */
  highlights: string;
  stock_status: StockStatus;
  price_mode: PriceMode;
  /** e.g. "Az ár a szállítási díjat nem tartalmazza." */
  price_note: string;
  seo_title: string;
  meta_description: string;
  keywords: string;
  /** Alt text of the main photo (default: product name) */
  image_alt: string;
  documents: ProductDocument[];
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type SiteText = { key: string; value: string };

export type Review = {
  id: string;
  author: string;
  location: string;
  rating: number;
  body: string;
  source: string;
  review_date: string | null;
  published: boolean;
  sort_order: number;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_path: string;
  meta_description: string;
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string | null;
  created_at: string;
};

/** Carousel slide (admin: Slide-ok). page = where it is shown. */
export type Slide = {
  id: string;
  page: "home" | "termekek";
  title: string;
  subtitle: string;
  button_label: string;
  link_url: string;
  /** Image file name in uploads/slides */
  image_path: string;
  published: boolean;
  sort_order: number;
};

export type User = { id: string; email: string; created_at: string };
export type AppRole = "admin";
