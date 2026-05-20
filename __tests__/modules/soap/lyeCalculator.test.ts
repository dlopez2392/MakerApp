import { calculateLye } from "../../../src/modules/soap/calculators/lyeCalculator";

describe("Lye Calculator", () => {
  const base = {
    oils: [
      { name: "Olive Oil", weightOz: 16 },
      { name: "Coconut Oil 76", weightOz: 8 },
    ],
    superfattPct: 5,
    waterLyeRatio: 2.0,
    soapType: "bar" as const,
  };

  test("calculates lye for known oils", () => {
    const r = calculateLye(base);
    expect(r.lyeWeightOz).toBeGreaterThan(0);
    expect(r.oilBreakdown).toHaveLength(2);
  });

  test("superfat reduces lye", () => {
    const noSF = calculateLye({ ...base, superfattPct: 0 });
    const withSF = calculateLye({ ...base, superfattPct: 5 });
    expect(withSF.lyeWeightOz).toBeLessThan(noSF.lyeWeightOz);
  });

  test("water = lye * ratio", () => {
    const r = calculateLye(base);
    expect(r.waterWeightOz).toBeCloseTo(r.lyeWeightOz * 2.0, 2);
  });

  test("fatty acid profile populated", () => {
    const r = calculateLye(base);
    expect(r.fattyAcidProfile.hardness).toBeGreaterThan(0);
    expect(r.fattyAcidProfile.conditioning).toBeGreaterThan(0);
  });

  test("warning for unknown oil", () => {
    const r = calculateLye({ ...base, oils: [{ name: "Fake Oil", weightOz: 10 }] });
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  test("warning for high superfat", () => {
    const r = calculateLye({ ...base, superfattPct: 12 });
    expect(r.warnings).toEqual(expect.arrayContaining([expect.stringContaining("Superfat")]));
  });

  test("liquid soap uses KOH", () => {
    const bar = calculateLye(base);
    const liquid = calculateLye({ ...base, soapType: "liquid" });
    expect(liquid.lyeWeightOz).toBeGreaterThan(bar.lyeWeightOz);
  });
});
