import { calculateGrindAngle } from "../../../src/modules/knife/calculators/grindAngle";

describe("Grind Angle Calculator", () => {
  const base = { bladeThicknessIn: 0.125, bevelHeightIn: 1.0, desiredEdgeAngleDeg: 20 };

  test("grind angle per side = desired / 2", () => {
    const r = calculateGrindAngle(base);
    expect(r.grindAnglePerSideDeg).toBe(10);
  });

  test("edge thickness formula", () => {
    const r = calculateGrindAngle(base);
    const expected = 2 * 1.0 * Math.tan((10 * Math.PI) / 180);
    expect(r.edgeThicknessIn).toBeCloseTo(expected, 6);
  });

  test("steel removal per side", () => {
    const r = calculateGrindAngle(base);
    expect(r.steelRemovalIn).toBeCloseTo((base.bladeThicknessIn - r.edgeThicknessIn) / 2, 6);
  });

  test("mathSteps has 3 entries", () => {
    const r = calculateGrindAngle(base);
    expect(r.mathSteps).toHaveLength(3);
  });
});
