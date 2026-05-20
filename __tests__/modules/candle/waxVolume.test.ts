import { calculateWaxVolume } from "../../../src/modules/candle/calculators/waxVolume";

describe("Wax Volume Calculator", () => {
  test("cylinder volume", () => {
    const r = calculateWaxVolume({ diameterIn: 3, heightIn: 4, shape: "cylinder", taperRatio: 1.0 });
    const R = (3 * 2.54) / 2;
    const h = 4 * 2.54;
    expect(r.volumeMl).toBeCloseTo(Math.PI * R * R * h, 0);
  });

  test("wax weight uses 0.86 density", () => {
    const r = calculateWaxVolume({ diameterIn: 3, heightIn: 4, shape: "cylinder", taperRatio: 1.0 });
    expect(r.waxWeightG).toBeCloseTo(r.volumeMl * 0.86, 1);
  });

  test("pour weight is 10% more than wax weight", () => {
    const r = calculateWaxVolume({ diameterIn: 3, heightIn: 4, shape: "cylinder", taperRatio: 1.0 });
    expect(r.pourWeightG).toBeCloseTo(r.waxWeightG * 1.1, 1);
  });

  test("tapered volume less than cylinder", () => {
    const cyl = calculateWaxVolume({ diameterIn: 3, heightIn: 4, shape: "cylinder", taperRatio: 1.0 });
    const tap = calculateWaxVolume({ diameterIn: 3, heightIn: 4, shape: "tapered", taperRatio: 0.7 });
    expect(tap.volumeMl).toBeLessThan(cyl.volumeMl);
  });

  test("oz conversion", () => {
    const r = calculateWaxVolume({ diameterIn: 3, heightIn: 4, shape: "cylinder", taperRatio: 1.0 });
    expect(r.waxWeightOz).toBeCloseTo(r.waxWeightG / 28.3495, 1);
  });
});
