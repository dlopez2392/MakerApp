import { calculateRampGradient } from "../../../src/modules/laser/calculators/rampGradient";

describe("Ramp/Power Gradient Calculator", () => {
  test("linear gradient from 10% to 90% over 100mm", () => {
    const result = calculateRampGradient({ startPowerPct: 10, endPowerPct: 90, lengthMm: 100, steps: 5 });
    expect(result.steps).toHaveLength(5);
    expect(result.steps[0].powerPct).toBe(18);
    expect(result.steps[4].powerPct).toBe(82);
  });

  test("single step returns midpoint power", () => {
    const result = calculateRampGradient({ startPowerPct: 20, endPowerPct: 80, lengthMm: 50, steps: 1 });
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].powerPct).toBe(50);
  });

  test("reversed gradient (high to low)", () => {
    const result = calculateRampGradient({ startPowerPct: 80, endPowerPct: 20, lengthMm: 100, steps: 3 });
    expect(result.steps[0].powerPct).toBeGreaterThan(result.steps[2].powerPct);
  });

  test("step positions span the full length", () => {
    const result = calculateRampGradient({ startPowerPct: 10, endPowerPct: 90, lengthMm: 200, steps: 4 });
    expect(result.steps[0].positionMm).toBe(25);
    expect(result.steps[3].positionMm).toBe(175);
  });
});
