import { calculateHeatTreat } from "../../../src/modules/knife/calculators/heatTreat";

describe("Heat Treat Calculator", () => {
  test("1084 returns correct harden temp", () => {
    const r = calculateHeatTreat({ steelName: "1084" });
    expect(r.hardenTempF).toBe(1475);
    expect(r.quenchMedium).toBe("oil");
  });

  test("D2 has no normalize step", () => {
    const r = calculateHeatTreat({ steelName: "D2" });
    expect(r.normalizeTempF).toBeNull();
    expect(r.normalizeCycles).toBe(0);
  });

  test("M2 air quench + high harden temp", () => {
    const r = calculateHeatTreat({ steelName: "M2" });
    expect(r.hardenTempF).toBe(2200);
    expect(r.quenchMedium).toBe("air");
  });

  test("throws on unknown steel", () => {
    expect(() => calculateHeatTreat({ steelName: "XYZ999" })).toThrow();
  });

  test("mathSteps populated", () => {
    const r = calculateHeatTreat({ steelName: "5160" });
    expect(r.mathSteps.length).toBeGreaterThan(0);
    expect(r.mathSteps[0]).toHaveProperty("unit");
  });
});
