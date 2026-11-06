import { Text } from "@/components/features/content/ContentProvider";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/useContent";
import { sectionTarget, type AreaKey, type Category, type Section } from "@/lib/content/catalog";
import { areaImage, productImage } from "./images";
import type { Product } from "@/types";

/** Photo of the first product (with a photo) among `items`, else the area's default picture. */
const tileImage = (area: AreaKey, items: Product[]) => {
  const withPhoto = items.find((p) => p.image_path);
  return withPhoto ? productImage(withPhoto) : areaImage[area];
};

function Tile({
  area,
  slug,
  name,
  count,
  image,
}: {
  area: AreaKey;
  slug: string;
  name: string;
  count: number;
  image: string;
}) {
  return (
    <Link
      to="/$terulet/$kategoria"
      params={{ terulet: area, kategoria: slug }}
      className="product-tile"
    >
      <div className="product-tile-img">
        <img src={image} alt="" loading="lazy" width={600} height={450} />
      </div>
      <div className="product-tile-body">
        <h3>{name}</h3>
        <span>
          {count ? `${count} termék` : <Text id="catalog.ask">{"Érdeklődjön"}</Text>}
          <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}

/** Tiles of the sections of an area (Termékek page, area page). */
export function SectionTiles({
  area,
  sections,
  categories,
}: {
  area: AreaKey;
  sections: Section[];
  categories: Category[];
}) {
  const products = useProducts({ area });
  return (
    <div className="tile-grid">
      {sections.map((s) => {
        const slugs = categories.filter((c) => c.section === s.slug).map((c) => c.slug);
        const items = products.filter((p) => slugs.includes(p.category));
        return (
          <Tile
            key={s.slug}
            area={area}
            slug={sectionTarget({ categories }, s.slug)}
            name={s.name}
            count={items.length}
            image={tileImage(area, items)}
          />
        );
      })}
    </div>
  );
}

/** Tiles of categories (section page). */
export function CategoryTiles({ area, categories }: { area: AreaKey; categories: Category[] }) {
  const products = useProducts({ area });
  return (
    <div className="tile-grid">
      {categories.map((c) => {
        const items = products.filter((p) => p.category === c.slug);
        return (
          <Tile
            key={c.slug}
            area={area}
            slug={c.slug}
            name={c.name}
            count={items.length}
            image={tileImage(area, items)}
          />
        );
      })}
    </div>
  );
}
