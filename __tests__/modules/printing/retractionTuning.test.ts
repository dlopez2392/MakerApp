import { calculateRetraction } from "../../../src/modules/printing/calculators/retractionTuning";

describe("Retraction Tuning Calculator", () => {
  test("direct drive PLA has short retraction (≤ 2mm)", () => {
    const result = calculateRetraction({
      filamentCategory: "pla",
      extruderType: "direct",
      bowdenLengthMm: null,
      nozzleDiameter: 0.4,
    });
    expect(result.retractionDistMm).toBeGreaterThan(0);
    expect(result.retractionDistMm).toBeLessThanOrEqual(2);
  });

  test("bowden PLA has longer retraction (> 2mm, ≤ 7mm)", () => {
    const result = calculateRetraction({
      filamentCategory: "pla",
      extruderType: "bowden",
      bowdenLengthMm: 400,
      nozzleDiameter: 0.4,
    });
    expect(result.retractionDistMm).toBeGreaterThan(2);
    expect(result.retractionDistMm).toBeLessThanOrEqual(7);
  });

  test("longer bowden tube increases retraction distance", () => {
    const short = calculateRetraction({
      filamentCategory: "pla",
      extruderType: "bowden",
      bowdenLengthMm: 200,
      nozzleDiameter: 0.4,
    });
    const long = calculateRetraction({
      filamentCategory: "pla",
      extruderType: "bowden",
      bowdenLengthMm: 600,
      nozzleDiameter: 0.4,
    });
    expect(long.retractionDistMm).toBeGreaterThanOrEqual(short.retractionDistMm);
  });

  test("TPU/flex triggers a warning", () => {
    const result = calculateRetraction({
      filamentCategory: "tpu",
      extruderType: "direct",
      bowdenLengthMm: null,
      nozzleDiameter: 0.4,
    });
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  test("bowden + TPU results in 0 retraction", () => {
    const result = calculateRetraction({
      filamentCategory: "tpu",
      extruderType: "bowden",
      bowdenLengthMm: 400,
      nozzleDiameter: 0.4,
    });
    expect(result.retractionDistMm).toBe(0);
  });

  test("z-hop = nozzle * 0.5", () => {
    const result = calculateRetraction({
      filamentCategory: "pla",
      extruderType: "direct",
      bowdenLengthMm: null,
      nozzleDiameter: 0.4,
    });
    expect(result.zHopMm).toBeCloseTo(0.4 * 0.5, 5);
  });

  test("prime amount = retraction * 0.05", () => {
    const result = calculateRetraction({
      filamentCategory: "pla",
      extruderType: "direct",
      bowdenLengthMm: null,
      nozzleDiameter: 0.4,
    });
    expect(result.primeAmountMm).toBeCloseTo(result.retractionDistMm * 0.05, 5);
  });

  test("mathSteps are populated", () => {
    const result = calculateRetraction({
      filamentCategory: "pla",
      extruderType: "direct",
      bowdenLengthMm: null,
      nozzleDiameter: 0.4,
    });
    expect(result.mathSteps.length).toBeGreaterThan(0);
    expect(result.mathSteps[0]).toHaveProperty("label");
  });
});
