import { relatedCategories, sectionOf } from "@/lib/content/catalog";
import type { Product } from "@/types";

const kw = (p: Product) => Number((p.specs["teljesitmeny"] ?? "").replace(",", ".")) || null;

/**
 * "Kapcsolódó termékek" for a product page (max. `limit`):
 * similar products of the same section (closest power first, e.g. stoves of similar kW)
 * + cross-selling categories from `relatedCategories` (e.g. stove → flue pipes, A1 pellet).
 */
export function relatedProducts(product: Product, all: Product[], limit = 4): Product[] {
  const others = all.filter((p) => p.id !== product.id && p.published);
  const section = sectionOf(product.area, product.category);
  const power = kw(product);
  const similar = others
    .filter((p) => p.area === product.area && sectionOf(p.area, p.category) === section)
    .sort((a, b) => {
      if (power !== null) {
        const da = Math.abs((kw(a) ?? 1e9) - power);
        const db = Math.abs((kw(b) ?? 1e9) - power);
        if (da !== db) return da - db;
      }
      return Number(b.category === product.category) - Number(a.category === product.category);
    });
  const crossCats = section ? (relatedCategories[section] ?? []) : [];
  const cross = others
    .filter((p) => crossCats.includes(p.category))
    .sort((a, b) => crossCats.indexOf(a.category) - crossCats.indexOf(b.category));
  const picked: Product[] = [];
  const add = (list: Product[], n: number) => {
    for (const p of list) {
      if (picked.length >= limit || n <= 0) break;
      if (!picked.includes(p)) {
        picked.push(p);
        n--;
      }
    }
  };
  add(similar, 2);
  add(cross, 2);
  add([...similar, ...cross], limit);
  return picked;
}
