import { calculateProportions } from "../../../src/modules/utilities/calculators/goldenRatio";

describe("Golden Ratio / Proportions", () => {
  test("golden ratio of 10", () => {
    expect(calculateProportions(10).golden).toBeCloseTo(16.18, 1);
  });
  test("golden inverse of 10", () => {
    expect(calculateProportions(10).goldenInverse).toBeCloseTo(6.18, 1);
  });
  test("sqrt2 of 10", () => {
    expect(calculateProportions(10).sqrt2).toBeCloseTo(14.14, 1);
  });
  test("double of 7", () => {
    expect(calculateProportions(7).double).toBe(14);
  });
  test("returns all 6 keys", () => {
    expect(Object.keys(calculateProportions(1)).length).toBe(6);
  });
});
