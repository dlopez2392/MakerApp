import { calculateResinRatio } from "../../../src/modules/resin/calculators/resinRatio";

describe("Resin Ratio Calculator", () => {
  const base = { totalVolumeMl: 300, mixRatioResin: 2, mixRatioHardener: 1, unit: "ml" as const };

  test("2:1 ratio splits 300ml into 200/100", () => {
    const r = calculateResinRatio(base);
    expect(r.resinAmount).toBeCloseTo(200, 2);
    expect(r.hardenerAmount).toBeCloseTo(100, 2);
  });

  test("amounts sum to total", () => {
    const r = calculateResinRatio(base);
    expect(r.resinAmount + r.hardenerAmount).toBeCloseTo(base.totalVolumeMl, 5);
  });

  test("1:1 ratio splits equally", () => {
    const r = calculateResinRatio({ ...base, mixRatioResin: 1, mixRatioHardener: 1 });
    expect(r.resinAmount).toBeCloseTo(150, 2);
  });

  test("mathSteps populated", () => {
    const r = calculateResinRatio(base);
    expect(r.mathSteps.length).toBe(3);
    expect(r.mathSteps[0]).toHaveProperty("label");
  });
});
