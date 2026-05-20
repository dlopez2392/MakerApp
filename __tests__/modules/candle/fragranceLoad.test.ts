import { calculateFragranceLoad } from "../../../src/modules/candle/calculators/fragranceLoad";

describe("Fragrance Load Calculator", () => {
  test("basic load calculation", () => {
    const r = calculateFragranceLoad({ waxWeightG: 500, fragrancePct: 8, maxLoadPct: 12 });
    expect(r.fragranceWeightG).toBeCloseTo(40, 5);
  });

  test("no warning within max", () => {
    const r = calculateFragranceLoad({ waxWeightG: 500, fragrancePct: 8, maxLoadPct: 12 });
    expect(r.warnings).toHaveLength(0);
  });

  test("warning when exceeding max load", () => {
    const r = calculateFragranceLoad({ waxWeightG: 500, fragrancePct: 15, maxLoadPct: 12 });
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  test("remaining capacity correct", () => {
    const r = calculateFragranceLoad({ waxWeightG: 500, fragrancePct: 8, maxLoadPct: 12 });
    expect(r.remainingCapacityPct).toBe(4);
    expect(r.remainingCapacityG).toBeCloseTo(20, 5);
  });
});
