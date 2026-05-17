import { calculateVCarve } from "../../../src/modules/cnc/calculators/vCarve";

describe("CNC V-Carve Calculator", () => {
  test("90° V-bit: depth = half of groove width", () => {
    // 90° bit: halfAngle=45°, tan(45)=1 → depth = (width/2)/1 = width/2
    const result = calculateVCarve({ grooveWidthIn: 0.5, vbitAngleDeg: 90 });
    expect(result.depthIn).toBeCloseTo(0.25, 4);
  });

  test("60° V-bit: depth is deeper than 90°", () => {
    // 60° bit: halfAngle=30°, tan(30)=0.577 → depth = 0.25/0.577 ≈ 0.433
    const result60 = calculateVCarve({ grooveWidthIn: 0.5, vbitAngleDeg: 60 });
    const result90 = calculateVCarve({ grooveWidthIn: 0.5, vbitAngleDeg: 90 });
    expect(result60.depthIn).toBeGreaterThan(result90.depthIn);
    expect(result60.depthIn).toBeCloseTo(0.25 / Math.tan(30 * Math.PI / 180), 3);
  });

  test("max depth clamps effective depth and sets depthLimited flag", () => {
    const result = calculateVCarve({
      grooveWidthIn: 0.5,
      vbitAngleDeg: 90,
      maxDepthIn: 0.1,
    });
    expect(result.depthLimited).toBe(true);
    expect(result.effectiveDepthIn).toBe(0.1);
    expect(result.achievedWidthIn).toBeLessThan(0.5);
  });

  test("flat-bottom tip adjusts depth calculation", () => {
    // 90° bit with 0.1" tip: only (0.5-0.1)/2 = 0.2" of half-width from tip edge
    // depth = 0.2 / tan(45°) = 0.2
    const result = calculateVCarve({
      grooveWidthIn: 0.5,
      vbitAngleDeg: 90,
      tipWidthIn: 0.1,
    });
    expect(result.flatBottomEngaged).toBe(true);
    expect(result.depthIn).toBeCloseTo(0.2, 4);
  });
});
