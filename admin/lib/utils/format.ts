const huf = new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 0 });

/** 12500 → "12 500 Ft" (+ unit: "12 500 Ft/zsák") */
export function formatPrice(value: number, unit = '') {
  const u = unit.trim();
  return `${huf.format(value)} ${u ? (u.startsWith('Ft') ? u : `Ft/${u}`) : 'Ft'}`;
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Reading time in minutes for a markdown body. */
export function readingMinutes(text: string) {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}
