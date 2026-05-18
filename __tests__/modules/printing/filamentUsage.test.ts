import { calculateFilamentUsage } from "../../../src/modules/printing/calculators/filamentUsage";

describe("Filament Usage & Cost Calculator", () => {
  const baseInput = {
    xMm: 50,
    yMm: 50,
    zMm: 20,
    infillPct: 20,
    wallCount: 3,
    layerHeight: 0.2,
    nozzleDiameter: 0.4,
    filamentDensity: 1.24, // PLA g/cm³
    filamentCostPerKg: 25,
    filamentDiameter: 1.75,
  };

  test("volume is positive", () => {
    const result = calculateFilamentUsage(baseInput);
    expect(result.volumeCm3).toBeGreaterThan(0);
  });

  test("weight = volume × density", () => {
    const result = calculateFilamentUsage(baseInput);
    expect(result.weightG).toBeCloseTo(result.volumeCm3 * baseInput.filamentDensity, 3);
  });

  test("filament length is positive", () => {
    const result = calculateFilamentUsage(baseInput);
    expect(result.filamentLengthM).toBeGreaterThan(0);
  });

  test("cost = weight / 1000 × costPerKg", () => {
    const result = calculateFilamentUsage(baseInput);
    const expectedCost = (result.weightG / 1000) * baseInput.filamentCostPerKg!;
    expect(result.estimatedCost).toBeCloseTo(expectedCost, 4);
  });

  test("estimatedCost is null when costPerKg is null", () => {
    const result = calculateFilamentUsage({ ...baseInput, filamentCostPerKg: null });
    expect(result.estimatedCost).toBeNull();
  });

  test("mathSteps are populated", () => {
    const result = calculateFilamentUsage(baseInput);
    expect(result.mathSteps.length).toBeGreaterThan(0);
    expect(result.mathSteps[0]).toHaveProperty("label");
  });

  test("higher infill increases weight", () => {
    const low = calculateFilamentUsage({ ...baseInput, infillPct: 10 });
    const high = calculateFilamentUsage({ ...baseInput, infillPct: 80 });
    expect(high.weightG).toBeGreaterThan(low.weightG);
  });
});
