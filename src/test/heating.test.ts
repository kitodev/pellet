import { describe, expect, it } from "vitest";
import { estimateHeating } from "@/lib/utils/heating";
describe("heating estimates", () => {
  it("estimates a 120 m² home with medium insulation and three residents", () => {
    expect(estimateHeating(120, "medium", 3)).toBe(20);
  });
  it("reduces the estimate for good insulation", () => {
    expect(estimateHeating(120, "good", 3)).toBe(14);
  });
});
