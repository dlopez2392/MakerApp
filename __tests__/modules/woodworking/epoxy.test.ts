import { calculateVolume, calculateMixRatio, calculateMultiPour, calculateColorant, calculateEpoxy } from "../../../src/modules/woodworking/calculators/epoxy";

describe("Epoxy Resin Calculator", () => {
  test("calculates volume: 12x6x2 = 144 in³, ~79.78 oz", () => {
    const result = calculateVolume({ lengthIn: 12, widthIn: 6, depthIn: 2 });
    expect(result.cubicInches).toBe(144);
    expect(result.ounces).toBeCloseTo(79.778, 1);
  });

  test("mix ratio 2:1 with 90 oz", () => {
    const result = calculateMixRatio({ totalOz: 90, ratioA: 2, ratioB: 1 });
    expect(result.partAOz).toBe(60);
    expect(result.partBOz).toBe(30);
  });

  test("mix ratio 1:1 with 50 oz", () => {
    const result = calculateMixRatio({ totalOz: 50, ratioA: 1, ratioB: 1 });
    expect(result.partAOz).toBe(25);
    expect(result.partBOz).toBe(25);
  });

  test("multi-pour: 3 inch depth, 1 inch max = 3 pours", () => {
    const result = calculateMultiPour({ totalDepthIn: 3, maxPourDepthIn: 1 });
    expect(result.numPours).toBe(3);
    expect(result.depthPerPour).toBe(1);
  });

  test("multi-pour: 2.5 inch depth, 1 inch max = 3 pours", () => {
    const result = calculateMultiPour({ totalDepthIn: 2.5, maxPourDepthIn: 1 });
    expect(result.numPours).toBe(3);
    expect(result.depthPerPour).toBeCloseTo(0.833, 2);
  });

  test("colorant: 80oz epoxy, 28.35 g/oz, 3% = ~68.04g", () => {
    const result = calculateColorant({ totalOz: 80, densityGramsPerOz: 28.35, percentByWeight: 3 });
    expect(result.pigmentGrams).toBeCloseTo(68.04, 1);
  });

  test("full calculation with all options", () => {
    const result = calculateEpoxy({
      lengthIn: 12, widthIn: 6, depthIn: 2,
      ratioA: 2, ratioB: 1,
      maxPourDepthIn: 1,
      colorantPercent: 3,
    });
    expect(result.volumeCubicIn).toBe(144);
    expect(result.volumeOz).toBeCloseTo(79.778, 1);
    expect(result.mix.partAOz).toBeCloseTo(53.185, 1);
    expect(result.mix.partBOz).toBeCloseTo(26.593, 1);
    expect(result.multiPour).not.toBeNull();
    expect(result.multiPour!.numPours).toBe(2);
    expect(result.colorant).not.toBeNull();
    expect(result.colorant!.pigmentGrams).toBeGreaterThan(0);
  });
});
