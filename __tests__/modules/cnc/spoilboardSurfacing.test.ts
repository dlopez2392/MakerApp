import { calculateSpoilboardSurfacing } from "../../../src/modules/cnc/calculators/spoilboardSurfacing";

describe("CNC Spoilboard Surfacing Calculator", () => {
  const baseInput = {
    bedYIn: 24,
    bedXIn: 48,
    stepoverIn: 0.6,   // 60% of 1" bit
    docPerPassIn: 0.02,
    totalSkimIn: 0.06,
    feedRateIpm: 100,
  };

  test("calculates correct passes per layer", () => {
    // ceil(24 / 0.6) = 40
    const result = calculateSpoilboardSurfacing(baseInput);
    expect(result.passesPerLayer).toBe(40);
  });

  test("calculates layers from total skim depth and DOC", () => {
    // ceil(0.06 / 0.02) = 3
    const result = calculateSpoilboardSurfacing(baseInput);
    expect(result.layers).toBe(3);
  });

  test("estimates time from feed rate and total distance", () => {
    // passesPerLayer=40, bedX=48, layers=3
    // totalDist = 40 * 48 * 3 = 5760 in
    // time = 5760 / 100 = 57.6 min
    const result = calculateSpoilboardSurfacing(baseInput);
    expect(result.estimatedMinutes).toBeCloseTo(57.6, 1);
  });
});
