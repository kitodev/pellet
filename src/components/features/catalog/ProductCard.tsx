import { Text } from "@/components/features/content/ContentProvider";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgePercent, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import { productImage } from "./images";
import { PriceTag, showsPrice } from "./PriceTag";

export function ProductCard({ product }: { product: Product }) {
  const onSale = showsPrice(product) && product.sale_price !== null;
  return (
    <article className="product-card">
      <Link
        to="/$terulet/$kategoria/$termek"
        params={{ terulet: product.area, kategoria: product.category, termek: product.slug }}
        className="product-card-link"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="product-img-wrap">
          <img
            className="product-img"
            src={productImage(product)}
            alt={product.name}
            loading="lazy"
          />
          {onSale && (
            <span className="badge sale">
              <BadgePercent size={13} /> <Text id="catalog.saleBadge">{"Akció"}</Text>
            </span>
          )}
          {!onSale && product.featured && (
            <span className="badge">
              <Star size={12} /> <Text id="catalog.featuredBadge">{"Kiemelt"}</Text>
            </span>
          )}
        </div>
      </Link>
      <div className="product-body">
        <h3>
          <Link
            to="/$terulet/$kategoria/$termek"
            params={{ terulet: product.area, kategoria: product.category, termek: product.slug }}
          >
            {product.name}
          </Link>
        </h3>
        {product.short_description && <p>{product.short_description}</p>}
        <div className="product-footer">
          <PriceTag product={product} />
          <Button variant="ghost" size="icon" asChild aria-label={`${product.name} részletei`}>
            <Link
              to="/$terulet/$kategoria/$termek"
              params={{ terulet: product.area, kategoria: product.category, termek: product.slug }}
            >
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

/** Product cards as a list; `heading` adds a visually hidden h2 when the page has none above the grid. */
export function ProductGrid({ products, heading }: { products: Product[]; heading?: string }) {
  return (
    <>
      {heading && <h2 className="sr-only">{heading}</h2>}
      <ul className="product-grid">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </>
  );
}
