import { describe, expect, it } from "vitest";
import {
  areas,
  areaKeys,
  findCategory,
  groupedCategories,
  legacyCategories,
  searchSite,
} from "@/lib/content/catalog";

describe("catalog (main menu)", () => {
  it("has the four product menus in order", () => {
    expect(areaKeys).toEqual(["futoanyagok", "takarmanyok", "kalyhak-kandallok", "kiegeszitok"]);
  });
  it("fuel menu groups pellets and other fuels", () => {
    const groups = groupedCategories(areas.futoanyagok);
    expect(groups.map((g) => g.group)).toEqual(["Pellet", "Egyéb tüzelőanyagok"]);
    expect(groups[0]!.categories.map((c) => c.slug)).toEqual([
      "fa-pellet",
      "premium-pellet",
      "ipari-pellet",
      "zsakos-pellet",
      "raklapos-pellet",
    ]);
    expect(groups[1]!.categories.map((c) => c.slug)).toEqual(["brikett", "tuzifa", "apritek"]);
  });
  it("feed menu covers the animal species", () => {
    expect(areas.takarmanyok.categories.map((c) => c.name)).toEqual([
      "Ló takarmány",
      "Szarvasmarha takarmány",
      "Sertés takarmány",
      "Baromfi takarmány",
      "Nyúl és egyéb állatok",
    ]);
  });
  it("stove products show power and heatable volume", () => {
    expect(areas["kalyhak-kandallok"].specFields.map((f) => f.key)).toEqual(
      expect.arrayContaining(["teljesitmeny", "legkobmeter", "uzemanyag"]),
    );
  });
  it("every legacy URL points to an existing category", () => {
    for (const target of Object.values(legacyCategories))
      if (target.category) expect(findCategory(target.area, target.category)).toBeDefined();
  });
  it("category slugs are unique within an area", () => {
    for (const a of Object.values(areas))
      expect(new Set(a.categories.map((c) => c.slug)).size).toBe(a.categories.length);
  });
  it("unknown category is not found", () => {
    expect(findCategory("takarmanyok", "fa-pellet")).toBeUndefined();
  });
  it("search ignores accents", () => {
    expect(searchSite("kalyha").some((h) => h.params?.["kategoria"] === "pellet-kalyhak")).toBe(
      true,
    );
  });
});
