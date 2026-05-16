import { calculateWoodMovement } from "../../../src/modules/woodworking/calculators/woodMovement";

describe("Wood Movement Calculator", () => {
  test("flat-sawn red oak: 6 inch board, 12% to 8% MC", () => {
    const result = calculateWoodMovement({
      width: 6, currentMC: 12, targetMC: 8,
      tangentialShrinkage: 8.6, radialShrinkage: 4.0,
      orientation: "flat-sawn",
    });
    expect(result.movementInches).toBeCloseTo(0.0206, 3);
    expect(result.warningFlag).toBe(false);
  });
  test("quarter-sawn uses radial coefficient", () => {
    const result = calculateWoodMovement({
      width: 6, currentMC: 12, targetMC: 8,
      tangentialShrinkage: 8.6, radialShrinkage: 4.0,
      orientation: "quarter-sawn",
    });
    expect(result.movementInches).toBeCloseTo(0.0096, 3);
  });
  test("flags warning when movement exceeds 1/8 inch", () => {
    const result = calculateWoodMovement({
      width: 24, currentMC: 19, targetMC: 6,
      tangentialShrinkage: 8.6, radialShrinkage: 4.0,
      orientation: "flat-sawn",
    });
    expect(result.warningFlag).toBe(true);
  });
  test("expansion when target MC > current MC", () => {
    const result = calculateWoodMovement({
      width: 6, currentMC: 6, targetMC: 12,
      tangentialShrinkage: 8.6, radialShrinkage: 4.0,
      orientation: "flat-sawn",
    });
    expect(result.movementInches).toBeCloseTo(0.031, 3);
    expect(result.direction).toBe("expansion");
  });
});
