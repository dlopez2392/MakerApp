import { calculateWickSizing } from "../../../src/modules/candle/calculators/wickSizing";

describe("Wick Sizing Calculator", () => {
  test("soy 3in returns CD 10", () => {
    const r = calculateWickSizing({ containerDiameterIn: 3, waxType: "soy" });
    expect(r.wickSeries).toBe("CD 10");
  });

  test("paraffin 2in returns LX 10", () => {
    const r = calculateWickSizing({ containerDiameterIn: 2, waxType: "paraffin" });
    expect(r.wickSeries).toBe("LX 10");
  });

  test("warning for large container > 4in", () => {
    const r = calculateWickSizing({ containerDiameterIn: 5, waxType: "soy" });
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  test("no warning for container <= 4in", () => {
    const r = calculateWickSizing({ containerDiameterIn: 3, waxType: "coconut" });
    expect(r.warnings).toHaveLength(0);
  });

  test("burn pool equals container diameter", () => {
    const r = calculateWickSizing({ containerDiameterIn: 3.5, waxType: "blend" });
    expect(r.burnPoolDiameterIn).toBe(3.5);
  });
});
