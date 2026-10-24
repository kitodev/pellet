import { Text } from '@/components/features/content/ContentProvider';
import { useAreas, useProducts } from '@/hooks/useContent';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowRight, BadgePercent, FileDown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs, PageHero } from '@/components/layouts/SiteChrome';
import { groupedCategories, type AreaKey } from '@/lib/content/catalog';
import { formatPrice } from '@/lib/utils/format';
import { uploadUrl } from '@/lib/utils/urls';
import { jsonLd } from '@/lib/utils/seo';
import type { Product } from '@/types';
import pellets from '@/assets/wood-pellets.jpg';
import feed from '@/assets/feed-pellets.jpg';
import stove from '@/assets/pellet-home.jpg';
import workshop from '@/assets/pellet-workshop.jpg';

/** Default picture of each area (used when a product has no photo). */
export const areaImage: Record<AreaKey, string> = { futoanyagok: pellets, takarmanyok: feed, 'kalyhak-kandallok': stove, kiegeszitok: workshop };

export const productImage = (p: Product) => uploadUrl('products', p.image_path) || areaImage[p.area as AreaKey] || pellets;

/** Price, sale price, or "Ajánlatkérés" when there is no price. */
export function PriceTag({ product, large = false }: { product: Product; large?: boolean }) {
  if (product.price === null && product.sale_price === null) return <span className={`price-tag quote${large ? ' large' : ''}`}><Text id="catalog.quoteOnly">{"Ár: ajánlatkérés alapján"}</Text></span>;
  const onSale = product.sale_price !== null && (product.price === null || product.sale_price < product.price);
  return <span className={`price-tag${large ? ' large' : ''}`}>
    {onSale && product.price !== null && <del>{formatPrice(product.price, product.price_unit)}</del>}
    <strong className={onSale ? 'sale' : ''}>{formatPrice((onSale ? product.sale_price : product.price) ?? 0, product.price_unit)}</strong>
  </span>;
}

export function ProductCard({ product }: { product: Product }) {
  const onSale = product.sale_price !== null;
  return <article className="product-card">
    <Link to="/$terulet/$kategoria/$termek" params={{ terulet: product.area, kategoria: product.category, termek: product.slug }} className="product-card-link" aria-label={product.name}>
      <div className="product-img-wrap"><img className="product-img" src={productImage(product)} alt={product.name} loading="lazy" />
        {onSale && <span className="badge sale"><BadgePercent size={13} /> <Text id="catalog.saleBadge">{"Akció"}</Text></span>}
        {!onSale && product.featured && <span className="badge"><Star size={12} /> <Text id="catalog.featuredBadge">{"Kiemelt"}</Text></span>}
      </div>
    </Link>
    <div className="product-body">
      <h3><Link to="/$terulet/$kategoria/$termek" params={{ terulet: product.area, kategoria: product.category, termek: product.slug }}>{product.name}</Link></h3>
      {product.short_description && <p>{product.short_description}</p>}
      <div className="product-footer"><PriceTag product={product} />
        <Button variant="ghost" size="icon" asChild aria-label={`${product.name} részletei`}><Link to="/$terulet/$kategoria/$termek" params={{ terulet: product.area, kategoria: product.category, termek: product.slug }}><ArrowRight /></Link></Button>
      </div>
    </div>
  </article>;
}

export function ProductGrid({ products }: { products: Product[] }) {
  return <div className="product-grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>;
}

/** /futoanyagok etc. – subcategories grouped, with product counts. */
export function AreaOverview({ area: key }: { area: AreaKey }) {
  const area = useAreas()[key];
  const products = useProducts({ area: key });
  const featured = products.filter(p => p.featured || p.sale_price !== null).slice(0, 6);
  return <>
    <PageHero id={null} eyebrow="Termékek" title={area.label} text={area.intro}><Breadcrumbs items={[{ label: area.label }]} /></PageHero>
    <section className="section soft-section"><div className="container">
      {groupedCategories(area).map(g => <div key={g.group || key} className="category-group">
        {g.group && <h2 className="group-title">{g.group}</h2>}
        <div className="category-grid">{g.categories.map(c => { const count = products.filter(p => p.category === c.slug).length; return <Link key={c.slug} to="/$terulet/$kategoria" params={{ terulet: key, kategoria: c.slug }} className="category-card">
          <img src={areaImage[key]} alt="" loading="lazy" width={1024} height={768} />
          <div><span className="product-category">{c.short}</span><h3>{c.name}</h3><p>{c.description}</p><span className="choice-cta">{count ? `${count} termék` : <Text id="catalog.ask">{"Érdeklődjön"}</Text>} <ArrowRight size={14} /></span></div>
        </Link>; })}</div>
      </div>)}
    </div></section>
    {featured.length > 0 && <section className="section"><div className="container"><div className="section-heading"><div><div className="eyebrow"><Text id="catalog.featured.eyebrow">{"Ajánlatunk"}</Text></div><h2><Text id="catalog.featured.title">{"Kiemelt termékek"}</Text></h2></div></div><ProductGrid products={featured} /></div></section>}
  </>;
}

/** /futoanyagok/fa-pellet – product list of one subcategory. */
export function CategoryView({ area: key, category: slug }: { area: AreaKey; category: string }) {
  const area = useAreas()[key];
  const category = area.categories.find(c => c.slug === slug)!;
  const products = useProducts({ area: key, category: slug });
  return <>
    <PageHero id={null} eyebrow={category.group ?? area.label} title={category.name} text={category.description}><Breadcrumbs items={[{ label: area.label, to: '/$terulet', params: { terulet: key } }, { label: category.name }]} /></PageHero>
    <section className="section soft-section"><div className="container">
      <nav className="subtabs" aria-label={`${area.label} kategóriák`}>{area.categories.map(c => <Link key={c.slug} to="/$terulet/$kategoria" params={{ terulet: key, kategoria: c.slug }} className={c.slug === slug ? 'active' : ''}>{c.name}</Link>)}</nav>
      {products.length ? <ProductGrid products={products} /> : <div className="empty-state"><h2><Text id="catalog.empty.title">{"Ebben a kategóriában kérésre szállítunk"}</Text></h2><p><Text id="catalog.empty.text">{"A termékek feltöltése folyamatban van. Írja meg, mire van szüksége, és személyre szabott ajánlatot küldünk."}</Text></p><Button asChild><Link to="/arajanlat" search={{ targy: `${category.name} (${area.label})` }}><Text id="AreaPages.text.5">{"Ajánlatot kérek"}</Text><ArrowRight /></Link></Button></div>}
    </div></section>
  </>;
}

/** Product page: gallery, price/quote, technical data, datasheet, description. */
export function ProductDetail({ product }: { product: Product }) {
  const key = product.area as AreaKey;
  const area = useAreas()[key];
  const category = area.categories.find(c => c.slug === product.category);
  const photos = [uploadUrl('products', product.image_path), ...product.images.map(i => uploadUrl('products', i))].filter(Boolean);
  const gallery = photos.length ? photos : [areaImage[key]];
  const specs = area.specFields.filter(f => product.specs[f.key]);
  const related = useProducts({ area: key, category: product.category }).filter(p => p.id !== product.id).slice(0, 3);
  const price = product.sale_price ?? product.price;
  const schema = { '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.short_description || product.description.slice(0, 300), image: gallery, category: category?.name ?? area.label, brand: { '@type': 'Brand', name: 'Pellet Centrum' },
    ...(price !== null ? { offers: { '@type': 'Offer', price, priceCurrency: 'HUF', availability: 'https://schema.org/InStock' } } : {}) };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    <section className="product-page"><div className="container">
      <Breadcrumbs items={[{ label: area.label, to: '/$terulet', params: { terulet: key } }, ...(category ? [{ label: category.name, to: '/$terulet/$kategoria', params: { terulet: key, kategoria: category.slug } }] : []), { label: product.name }]} />
      <div className="product-layout">
        <Gallery photos={gallery} name={product.name} />
        <div className="product-info">
          <div className="eyebrow">{category?.name ?? area.label}</div>
          <h1>{product.name}</h1>
          {product.short_description && <p className="lead">{product.short_description}</p>}
          <div className="buy-box"><PriceTag product={product} large />
            <div className="buy-actions"><Button asChild><Link to="/arajanlat" search={{ targy: product.name }}>{product.price === null && product.sale_price === null ? <Text id="product.quote">{"Ajánlatot kérek"}</Text> : <Text id="product.order">{"Rendelés / érdeklődés"}</Text>}<ArrowRight /></Link></Button>
              {product.datasheet_path && <Button variant="outline" asChild><a href={uploadUrl('datasheets', product.datasheet_path)} target="_blank" rel="noopener"><FileDown /><Text id="product.datasheet">{"Műszaki adatlap (PDF)"}</Text></a></Button>}</div>
          </div>
          {specs.length > 0 && <table className="spec-table"><caption><Text id="product.specs">{"Műszaki adatok"}</Text></caption><tbody>{specs.map(f => <tr key={f.key}><th scope="row">{f.label}</th><td className={f.type === 'textarea' ? 'whitespace-pre-line' : ''}>{product.specs[f.key]}{f.unit && f.type === 'number' ? ` ${f.unit}` : ''}</td></tr>)}</tbody></table>}
        </div>
      </div>
      {product.description && <div className="product-description"><h2><Text id="product.description">{"Termékleírás"}</Text></h2><p className="whitespace-pre-line">{product.description}</p></div>}
    </div></section>
    {related.length > 0 && <section className="section soft-section"><div className="container"><h2><Text id="product.related">{"Hasonló termékek"}</Text></h2><ProductGrid products={related} /></div></section>}
  </>;
}

function Gallery({ photos, name }: { photos: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  return <div className="gallery"><img className="gallery-main" src={photos[index]} alt={name} width={1024} height={768} />
    {photos.length > 1 && <div className="gallery-thumbs">{photos.map((src, i) => <button type="button" key={src} className={i === index ? 'active' : ''} onClick={() => setIndex(i)} aria-label={`${i + 1}. kép`}><img src={src} alt="" loading="lazy" /></button>)}</div>}
  </div>;
}
