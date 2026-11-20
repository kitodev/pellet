import { Text } from "@/components/features/content/ContentProvider";
import { formatPrice } from "@/lib/utils/format";
import type { Product } from "@/types";

/** Is a price shown for this product? (price mode "public" and a price is set) */
export const showsPrice = (p: Product) =>
  p.price_mode === "public" && (p.price !== null || p.sale_price !== null);

/**
 * Price according to the product's price mode:
 * public → gross price (+ sale price), ask → "Árért érdeklődjön",
 * quantity → "Mennyiségtől függő egyedi ár".
 */
export function PriceTag({ product, large = false }: { product: Product; large?: boolean }) {
  if (!showsPrice(product))
    return (
      <span className={`price-tag quote${large ? " large" : ""}`}>
        {product.price_mode === "quantity" ? (
          <Text id="catalog.quantityPrice">{"Mennyiségtől függő egyedi ár"}</Text>
        ) : (
          <Text id="catalog.quoteOnly">{"Árért érdeklődjön"}</Text>
        )}
      </span>
    );
  const onSale =
    product.sale_price !== null && (product.price === null || product.sale_price < product.price);
  return (
    <span className={`price-tag${large ? " large" : ""}`}>
      {onSale && product.price !== null && (
        <del>{formatPrice(product.price, product.price_unit)}</del>
      )}
      <strong className={onSale ? "sale" : ""}>
        {formatPrice((onSale ? product.sale_price : product.price) ?? 0, product.price_unit)}
      </strong>
      {large && (
        <small className="price-gross">
          <Text id="catalog.gross">{"bruttó fogyasztói ár"}</Text>
        </small>
      )}
    </span>
  );
}
