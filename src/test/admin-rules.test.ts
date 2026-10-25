import { describe, it, expect } from "vitest";
import { assertAdmin, productSchema } from "@/lib/validations/content";
describe("administrator permissions", () => {
  it("rejects users without administrator permission", () =>
    expect(() => assertAdmin(false)).toThrow());
  it("rejects missing permissions", () => expect(() => assertAdmin(null)).toThrow());
  it("accepts an approved administrator", () => expect(() => assertAdmin(true)).not.toThrow());
});
describe("editable products", () => {
  it("allows an empty description so administrators can remove it", () =>
    expect(
      productSchema.parse({
        area: "futoanyagok",
        category: "fa-pellet",
        name: "Fapellet",
        description: "",
        image_path: "",
      }).description,
    ).toBe(""));
  it("accepts the feed product area", () =>
    expect(
      productSchema.parse({
        area: "takarmanyok",
        category: "lo-takarmany",
        name: "Alom",
        description: "",
        image_path: "",
      }).area,
    ).toBe("takarmanyok"));
  it("rejects an unknown product area", () =>
    expect(
      productSchema.safeParse({
        area: "other",
        category: "pellet",
        name: "Pellet",
        description: "",
        image_path: "",
      }).success,
    ).toBe(false));
});
