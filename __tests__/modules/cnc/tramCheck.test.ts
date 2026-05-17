import { calculateTramCheck } from "../../../src/modules/cnc/calculators/tramCheck";

describe("CNC Tram Check Calculator", () => {
  test("all equal readings = perfect tram", () => {
    const result = calculateTramCheck({ frontIn: 0, backIn: 0, leftIn: 0, rightIn: 0 });
    expect(result.isPerfect).toBe(true);
    expect(result.frontBack.tiltThousandths).toBe(0);
    expect(result.leftRight.tiltThousandths).toBe(0);
    expect(result.frontBack.direction).toBe("level");
    expect(result.leftRight.direction).toBe("level");
  });

  test("front-back tilt detected correctly", () => {
    // front=0.002, back=0 → front-high by 2 thou
    const result = calculateTramCheck({ frontIn: 0.002, backIn: 0, leftIn: 0, rightIn: 0 });
    expect(result.frontBack.tiltThousandths).toBeCloseTo(2, 1);
    expect(result.frontBack.direction).toBe("front-high");
    expect(result.frontBack.inTolerance).toBe(false);
    expect(result.isPerfect).toBe(false);
  });

  test("left-right tilt detected correctly", () => {
    // left=0, right=0.003 → right-high by 3 thou
    const result = calculateTramCheck({ frontIn: 0, backIn: 0, leftIn: 0, rightIn: 0.003 });
    expect(result.leftRight.tiltThousandths).toBeCloseTo(-3, 1);
    expect(result.leftRight.direction).toBe("right-high");
    expect(result.leftRight.inTolerance).toBe(false);
  });

  test("adjustment instructions are provided when out of tram", () => {
    const result = calculateTramCheck({ frontIn: 0.005, backIn: 0, leftIn: 0, rightIn: 0 });
    expect(result.frontBack.adjustmentInstruction).toMatch(/front/i);
    expect(result.summary).toMatch(/out of tram/i);
  });
});
