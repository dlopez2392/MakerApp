import { calculateBatchScale } from "../../../src/modules/soap/calculators/batchScaler";

describe("Batch Scaler Calculator", () => {
  const oils = [
    { name: "Olive Oil", weightOz: 16 },
    { name: "Coconut Oil 76", weightOz: 8 },
  ];

  test("factor mode doubles weights", () => {
    const r = calculateBatchScale({ originalOils: oils, scaleMode: "factor", scaleValue: 2 });
    expect(r.scaledOils[0].weightOz).toBe(32);
    expect(r.scaledOils[1].weightOz).toBe(16);
    expect(r.scaleFactor).toBe(2);
  });

  test("totalWeight mode calculates factor", () => {
    const r = calculateBatchScale({ originalOils: oils, scaleMode: "totalWeight", scaleValue: 48 });
    expect(r.scaleFactor).toBe(2);
    expect(r.scaledOils[0].weightOz).toBe(32);
  });

  test("preserves oil ratios", () => {
    const r = calculateBatchScale({ originalOils: oils, scaleMode: "factor", scaleValue: 3 });
    const ratio = r.scaledOils[0].weightOz / r.scaledOils[1].weightOz;
    expect(ratio).toBeCloseTo(2, 5);
  });

  test("scale factor 1 preserves weights", () => {
    const r = calculateBatchScale({ originalOils: oils, scaleMode: "factor", scaleValue: 1 });
    expect(r.scaledOils[0].weightOz).toBe(16);
    expect(r.scaledOils[1].weightOz).toBe(8);
  });
});
