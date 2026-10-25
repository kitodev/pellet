"use client";
import { useState } from "react";
import { EyeOff, ExternalLink, Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { areas, isAreaKey } from "@/lib/content/menu";
import { formatPrice } from "@/lib/utils/format";
import { siteUrl } from "@/lib/utils/site";
import type { Product } from "@/types";

type Props = {
  products: Product[];
  busy: boolean;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
};

export function ProductList({ products, busy, onEdit, onDelete }: Props) {
  const [confirming, setConfirming] = useState<string | null>(null);
  if (!products.length) return <p className="muted">Nincs a szűrésnek megfelelő termék.</p>;

  return (
    <div className="admin-list">
      {products.map((p) => {
        const area = isAreaKey(p.area) ? areas[p.area] : null;
        const category = area?.categories.find((c) => c.slug === p.category);
        return (
          <article key={p.id}>
            {p.image_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="admin-thumb"
                src={`/uploads/products/${encodeURIComponent(p.image_path)}`}
                alt=""
                width={72}
                height={72}
                loading="lazy"
              />
            ) : (
              <span className="admin-thumb" aria-hidden="true" />
            )}
            <div>
              <strong>{p.name}</strong>
              <small>
                {area?.label ?? p.area} ·{" "}
                {category?.name ?? `${p.category} (ismeretlen kategória!)`}
              </small>
              <p className="tags">
                {p.price === null && p.sale_price === null ? (
                  <span>Ajánlatkérés</span>
                ) : (
                  <span>{formatPrice(p.price ?? p.sale_price ?? 0, p.price_unit)}</span>
                )}
                {p.sale_price !== null && (
                  <span className="tag sale">Akció: {formatPrice(p.sale_price, p.price_unit)}</span>
                )}
                {p.featured && (
                  <span className="tag">
                    <Star size={11} /> Kiemelt
                  </span>
                )}
                {!p.published && (
                  <span className="tag muted-tag">
                    <EyeOff size={11} /> Rejtett
                  </span>
                )}
                {p.datasheet_path && <span className="tag">PDF</span>}
                {p.images.length > 0 && <span className="tag">+{p.images.length} kép</span>}
              </p>
            </div>
            <div className="row">
              {p.published && p.slug && (
                <a
                  className="btn btn-ghost btn-icon"
                  href={siteUrl(`/${p.area}/${p.category}/${p.slug}`)}
                  target="_blank"
                  rel="noopener"
                  aria-label={`${p.name} megnyitása a weboldalon`}
                >
                  <ExternalLink size={16} />
                </a>
              )}
              <Button
                variant="outline"
                icon
                aria-label={`${p.name} szerkesztése`}
                onClick={() => onEdit(p)}
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="outline"
                icon
                aria-label={`${p.name} törlése`}
                onClick={() => setConfirming(p.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
            {confirming === p.id && (
              <div className="admin-confirm">
                <p>Végleg törli ezt a terméket és a képeit?</p>
                <Button
                  variant="danger"
                  disabled={busy}
                  onClick={() => {
                    onDelete(p);
                    setConfirming(null);
                  }}
                >
                  Törlés
                </Button>
                <Button variant="outline" onClick={() => setConfirming(null)}>
                  Mégse
                </Button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
