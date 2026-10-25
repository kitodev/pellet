import { Text } from "@/components/features/content/ContentProvider";
import { formatPrice } from "@/lib/utils/format";
import type { Product } from "@/types";

/** Price, sale price, or "Ajánlatkérés" when there is no price. */
export function PriceTag({ product, large = false }: { product: Product; large?: boolean }) {
  if (product.price === null && product.sale_price === null)
    return (
      <span className={`price-tag quote${large ? " large" : ""}`}>
        <Text id="catalog.quoteOnly">{"Ár: ajánlatkérés alapján"}</Text>
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
    </span>
  );
}
