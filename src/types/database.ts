// Row types of the MySQL tables (see database/migrations).

export type ProductSpecs = Record<string, string>;

export type Product = {
  id: string;
  slug: string;
  area: string;
  category: string;
  name: string;
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
  status: 'draft' | 'published';
  published_at: string | null;
  updated_at: string | null;
  created_at: string;
};

export type User = { id: string; email: string; created_at: string };
export type AppRole = 'admin';
