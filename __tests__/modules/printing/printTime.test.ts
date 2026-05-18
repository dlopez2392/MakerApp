import { calculatePrintTime } from "../../../src/modules/printing/calculators/printTime";

describe("Print Time Calculator", () => {
  const baseInput = {
    xMm: 50,
    yMm: 50,
    zMm: 20,
    layerHeight: 0.2,
    infillPct: 20,
    wallCount: 3,
    printSpeedMms: 60,
    travelSpeedMms: 120,
    nozzleDiameter: 0.4,
  };

  test("layer count = ceil(z / layerHeight)", () => {
    const result = calculatePrintTime({ ...baseInput, zMm: 20, layerHeight: 0.2 });
    expect(result.layerCount).toBe(100);
  });

  test("layer count rounds up", () => {
    const result = calculatePrintTime({ ...baseInput, zMm: 20.1, layerHeight: 0.2 });
    expect(result.layerCount).toBe(Math.ceil(20.1 / 0.2));
  });

  test("returns positive estimated time", () => {
    const result = calculatePrintTime(baseInput);
    expect(result.estimatedMinutes).toBeGreaterThan(0);
  });

  test("higher infill increases time", () => {
    const low = calculatePrintTime({ ...baseInput, infillPct: 10 });
    const high = calculatePrintTime({ ...baseInput, infillPct: 80 });
    expect(high.estimatedMinutes).toBeGreaterThan(low.estimatedMinutes);
  });

  test("faster print speed reduces time", () => {
    const slow = calculatePrintTime({ ...baseInput, printSpeedMms: 40 });
    const fast = calculatePrintTime({ ...baseInput, printSpeedMms: 100 });
    expect(fast.estimatedMinutes).toBeLessThan(slow.estimatedMinutes);
  });

  test("mathSteps array is populated", () => {
    const result = calculatePrintTime(baseInput);
    expect(result.mathSteps.length).toBeGreaterThan(0);
    expect(result.mathSteps[0]).toHaveProperty("label");
    expect(result.mathSteps[0]).toHaveProperty("formula");
    expect(result.mathSteps[0]).toHaveProperty("result");
    expect(result.mathSteps[0]).toHaveProperty("unit");
  });

  test("total extrusion is positive", () => {
    const result = calculatePrintTime(baseInput);
    expect(result.totalExtrusionMm).toBeGreaterThan(0);
  });
});
