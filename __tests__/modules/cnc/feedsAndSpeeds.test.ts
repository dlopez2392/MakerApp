import { calculateFeedsAndSpeeds } from "../../../src/modules/cnc/calculators/feedsAndSpeeds";

describe("CNC Feeds & Speeds Calculator", () => {
  const baseInput = {
    sfm: 500,
    toolDiameterIn: 0.25,
    chiploadIn: 0.006,
    flutes: 2,
    cutType: "profile" as const,
    routerMinRpm: 10000,
    routerMaxRpm: 30000,
  };

  test("RPM calculated from SFM and diameter", () => {
    // RPM = (500 × 3.82) / 0.25 = 7640 → clamped to routerMin 10000
    // Use SFM that keeps RPM in range: sfm=800 → (800*3.82)/0.25 = 12224
    const result = calculateFeedsAndSpeeds({ ...baseInput, sfm: 800 });
    const expected = Math.round((800 * 3.82) / 0.25);
    expect(result.rpm).toBe(expected);
  });

  test("feed rate = RPM × chipload × flutes", () => {
    const result = calculateFeedsAndSpeeds({ ...baseInput, sfm: 800 });
    const rpm = Math.round((800 * 3.82) / 0.25);
    const expected = Math.round(rpm * 0.006 * 2 * 10) / 10;
    expect(result.feedRateIpm).toBe(expected);
  });

  test("pocket WOC is 40% of diameter", () => {
    const result = calculateFeedsAndSpeeds({ ...baseInput, sfm: 800, cutType: "pocket" });
    expect(result.wocPct).toBe(40);
    expect(result.wocIn).toBeCloseTo(0.25 * 0.4, 4);
  });

  test("mathSteps array has 4 entries", () => {
    const result = calculateFeedsAndSpeeds({ ...baseInput, sfm: 800 });
    expect(result.mathSteps).toHaveLength(4);
  });

  test("warning when RPM is below router minimum", () => {
    // Low SFM will produce RPM below routerMin
    const result = calculateFeedsAndSpeeds({ ...baseInput, sfm: 100, routerMinRpm: 10000 });
    // (100 * 3.82) / 0.25 = 1528 → below 10000
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toMatch(/below router minimum/i);
  });

  test("plunge rate is 50% of feed rate", () => {
    const result = calculateFeedsAndSpeeds({ ...baseInput, sfm: 800 });
    expect(result.plungeRateIpm).toBeCloseTo(result.feedRateIpm * 0.5, 0);
  });
});
