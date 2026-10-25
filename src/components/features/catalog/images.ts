import pellets from "@/assets/wood-pellets.jpg";
import feed from "@/assets/feed-pellets.jpg";
import stove from "@/assets/pellet-home.jpg";
import workshop from "@/assets/pellet-workshop.jpg";
import type { AreaKey } from "@/lib/content/catalog";
import { uploadUrl } from "@/lib/utils/urls";
import type { Product } from "@/types";

/** Default picture of each area (used when a product has no photo). */
export const areaImage: Record<AreaKey, string> = {
  futoanyagok: pellets,
  takarmanyok: feed,
  "kalyhak-kandallok": stove,
  kiegeszitok: workshop,
};

export const productImage = (p: Product) =>
  uploadUrl("products", p.image_path) || areaImage[p.area as AreaKey] || pellets;

/** Price, sale price, or "Ajánlatkérés" when there is no price. */
