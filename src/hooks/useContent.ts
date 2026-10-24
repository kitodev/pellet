import { useContext } from 'react';
import { ContentContext } from '@/lib/content/context';
import { areas as baseAreas, type AreaKey } from '@/lib/content/catalog';
import type { Product } from '@/types';

export function useContent() {
  return useContext(ContentContext);
}

export function useText(key: string, fallback: string) {
  const content = useContent();
  return content?.texts.find(t => t.key === key)?.value ?? fallback;
}

/** Catalog areas with admin-edited texts applied. */
export function useAreas() {
  const content = useContent();
  const texts = Object.fromEntries(content?.texts.map(t => [t.key, t.value]) ?? []);
  const read = (key: string, fallback: string) => texts[key] ?? fallback;
  return Object.fromEntries(Object.entries(baseAreas).map(([key, area]) => [key, {
    ...area, title: read(`area.${key}.title`, area.title), label: read(`area.${key}.label`, area.label), intro: read(`area.${key}.intro`, area.intro),
    categories: area.categories.map(c => ({ ...c, name: read(`category.${key}.${c.slug}.name`, c.name), short: read(`category.${key}.${c.slug}.short`, c.short), description: read(`category.${key}.${c.slug}.description`, c.description) })),
  }])) as typeof baseAreas;
}

/** Published products, optionally filtered by area / category. */
export function useProducts(filter: { area?: AreaKey; category?: string } = {}): Product[] {
  const content = useContent();
  return (content?.products ?? []).filter(p => (!filter.area || p.area === filter.area) && (!filter.category || p.category === filter.category));
}
