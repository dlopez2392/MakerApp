import { calculateColorantMix } from "../../../src/modules/resin/calculators/colorantMix";

describe("Colorant Mix Calculator", () => {
  test("basic pigment load", () => {
    const r = calculateColorantMix({ resinWeightG: 100, colorantType: "pigment", loadPct: 5 });
    expect(r.colorantWeightG).toBeCloseTo(5, 5);
  });

  test("no warning within safe load", () => {
    const r = calculateColorantMix({ resinWeightG: 100, colorantType: "pigment", loadPct: 10 });
    expect(r.warnings).toHaveLength(0);
  });

  test("warning when exceeding pigment max (10%)", () => {
    const r = calculateColorantMix({ resinWeightG: 100, colorantType: "pigment", loadPct: 11 });
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  test("dye max safe load is 5%", () => {
    const r = calculateColorantMix({ resinWeightG: 100, colorantType: "dye", loadPct: 6 });
    expect(r.maxSafeLoad).toBe(5);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  test("drops = weight / 0.05", () => {
    const r = calculateColorantMix({ resinWeightG: 200, colorantType: "mica", loadPct: 4 });
    expect(r.colorantDrops).toBeCloseTo(8 / 0.05, 0);
  });
});
