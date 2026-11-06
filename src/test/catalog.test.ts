import { describe, expect, it } from "vitest";
import {
  areas,
  areaKeys,
  findCategory,
  findSection,
  groupedCategories,
  legacyCategories,
  renamedCategories,
  renamedTarget,
  searchSite,
  sectionTarget,
  subgroupsOf,
} from "@/lib/content/catalog";

// Structure from "Pelletcentrum weboldal váz.xlsx" (2026-11)
const exists = (t: { area: keyof typeof areas; category?: string }) =>
  !t.category || !!(findCategory(t.area, t.category) ?? findSection(t.area, t.category));

describe("catalog (Termékek menu)", () => {
  it("has the three product areas in order", () => {
    expect(areaKeys).toEqual(["futoanyagok", "takarmanyok", "futesi-megoldasok"]);
    expect(areaKeys.map((k) => areas[k].label)).toEqual([
      "Tüzelőanyagok",
      "Takarmányok",
      "Fűtési megoldások",
    ]);
  });
  it("Tüzelőanyagok: fűtő pelletek and brikettek", () => {
    const groups = groupedCategories(areas.futoanyagok);
    expect(groups.map((g) => g.group)).toEqual(["Fűtő pelletek", "Brikettek"]);
    expect(groups[0]!.categories.map((c) => c.name)).toEqual([
      "A1 fapellet",
      "Ipari pellet",
      "Szalma pellet",
    ]);
  });
  it("Takarmányok: cukorrépa, széna, lucerna pellet and ló müzli", () => {
    expect(areas.takarmanyok.categories.map((c) => c.slug)).toEqual([
      "cukorrepa-pellet",
      "szena-pellet",
      "lucerna-pellet",
      "lo-muzli",
    ]);
  });
  it("Fűtési megoldások: biomassza kazánok grouped lakossági / ipari / nagyipari", () => {
    const area = areas["futesi-megoldasok"];
    expect(area.sections.map((s) => s.name)).toEqual([
      "Pellet tüzelésű kályhák",
      "Pellet tüzelésű kazánok",
      "Biomassza tüzelésű kazánok",
      "Kiegészítők",
    ]);
    expect(subgroupsOf(area, "biomassza-kazanok").map((g) => g.subgroup)).toEqual([
      "Lakossági",
      "Ipari",
      "Nagyipari",
    ]);
    expect(area.specFields.map((f) => f.key)).toEqual(
      expect.arrayContaining(["gyarto", "teljesitmeny", "legkobmeter", "uzemanyag"]),
    );
  });
  it("every category belongs to an existing section and every section has categories", () => {
    for (const a of Object.values(areas)) {
      for (const c of a.categories) expect(findSection(a.key, c.section)).toBeDefined();
      for (const s of a.sections) expect(a.categories.some((c) => c.section === s.slug)).toBe(true);
    }
  });
  it("section and category slugs are unique within an area", () => {
    for (const a of Object.values(areas)) {
      const slugs = [...a.sections, ...a.categories].map((c) => c.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
  it("single-category sections link straight to the category", () => {
    expect(sectionTarget(areas.futoanyagok, "brikettek")).toBe("brikett");
    expect(sectionTarget(areas.futoanyagok, "futo-pelletek")).toBe("futo-pelletek");
  });
  it("every legacy / renamed URL points to an existing page", () => {
    for (const target of Object.values(legacyCategories)) expect(exists(target)).toBe(true);
    for (const target of Object.values(renamedCategories)) expect(exists(target)).toBe(true);
  });
  it("old areas redirect to Fűtési megoldások", () => {
    expect(renamedTarget("kalyhak-kandallok")).toEqual({ area: "futesi-megoldasok" });
    expect(renamedTarget("kiegeszitok", "fustcsovek")).toEqual({
      area: "futesi-megoldasok",
      category: "fustcsovek",
    });
    expect(renamedTarget("futoanyagok", "a1-fapellet")).toBeNull();
  });
  it("unknown category is not found", () => {
    expect(findCategory("takarmanyok", "a1-fapellet")).toBeUndefined();
  });
  it("search ignores accents", () => {
    expect(searchSite("kalyha").some((h) => h.params?.["kategoria"] === "pellet-kalyhak")).toBe(
      true,
    );
  });
});
