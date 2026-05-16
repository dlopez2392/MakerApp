import { calculateEMC } from "../../../src/modules/utilities/calculators/emc";

describe("EMC Calculator", () => {
  test("70°F / 50% RH ≈ 9.2%", () => {
    expect(calculateEMC(50, 70)).toBeCloseTo(9.2, 0);
  });
  test("70°F / 30% RH ≈ 6.2%", () => {
    expect(calculateEMC(30, 70)).toBeCloseTo(6.2, 0);
  });
  test("70°F / 80% RH ≈ 15.7%", () => {
    expect(calculateEMC(80, 70)).toBeCloseTo(15.7, 0);
  });
  test("32°F / 50% RH (cold)", () => {
    const emc = calculateEMC(50, 32);
    expect(emc).toBeGreaterThan(8);
    expect(emc).toBeLessThan(11);
  });
  test("100°F / 50% RH (hot)", () => {
    const emc = calculateEMC(50, 100);
    expect(emc).toBeGreaterThan(7);
    expect(emc).toBeLessThan(10);
  });
});
