import { calculateStepover } from "../../../src/modules/cnc/calculators/stepover";

describe("CNC Stepover Calculator", () => {
  test("roughing mode returns 40% stepover", () => {
    const result = calculateStepover({ mode: "roughing", toolDiameterIn: 0.25 });
    expect(result.stepoverPct).toBe(40);
    expect(result.stepoverIn).toBeCloseTo(0.1, 4);
  });

  test("finishing mode returns 10% stepover", () => {
    const result = calculateStepover({ mode: "finishing", toolDiameterIn: 0.25 });
    expect(result.stepoverPct).toBe(10);
    expect(result.stepoverIn).toBeCloseTo(0.025, 4);
  });

  test("3d-finishing derives stepover from scallop height formula", () => {
    // scallop = 0.001", radius = 0.125" (1/4" ball)
    // s = sqrt(8 * 0.001 * 0.125 - 4 * 0.001²) = sqrt(0.001 - 0.000004) ≈ sqrt(0.000996) ≈ 0.03156
    const result = calculateStepover({
      mode: "3d-finishing",
      toolDiameterIn: 0.25,
      scallopHeightIn: 0.001,
    });
    const expected = Math.sqrt(8 * 0.001 * 0.125 - 4 * 0.001 * 0.001);
    expect(result.stepoverIn).toBeCloseTo(expected, 3);
    expect(result.scallopHeightIn).toBeCloseTo(0.001, 4);
  });

  test("quality rating reflects scallop height", () => {
    const rough = calculateStepover({ mode: "roughing", toolDiameterIn: 0.5 });
    const fine = calculateStepover({ mode: "finishing", toolDiameterIn: 0.25 });
    expect(rough.finishQuality).toBe("rough");
    // fine stepover = 0.025" on 1/4" ball → very small scallop → fine or ultra-fine
    expect(["fine", "ultra-fine"]).toContain(fine.finishQuality);
  });
});
