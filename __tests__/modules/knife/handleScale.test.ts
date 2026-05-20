import { calculateHandleScale } from "../../../src/modules/knife/calculators/handleScale";

describe("Handle Scale Calculator", () => {
  test("handle length equals tang length", () => {
    const r = calculateHandleScale({ bladeLengthIn: 6, tangLengthIn: 4.5, handSize: "medium" });
    expect(r.handleLengthIn).toBe(4.5);
  });

  test("medium hand size dimensions", () => {
    const r = calculateHandleScale({ bladeLengthIn: 6, tangLengthIn: 4, handSize: "medium" });
    expect(r.handleWidthIn).toBe(1.15);
    expect(r.handleThicknessIn).toBe(0.85);
  });

  test("2 pins for handle <= 5in", () => {
    const r = calculateHandleScale({ bladeLengthIn: 5, tangLengthIn: 4, handSize: "large" });
    expect(r.pinPositions).toHaveLength(2);
  });

  test("3 pins for handle > 5in", () => {
    const r = calculateHandleScale({ bladeLengthIn: 8, tangLengthIn: 5.5, handSize: "large" });
    expect(r.pinPositions).toHaveLength(3);
  });

  test("pin at 20% and 80% of handle length", () => {
    const r = calculateHandleScale({ bladeLengthIn: 6, tangLengthIn: 4, handSize: "small" });
    expect(r.pinPositions[0]).toBeCloseTo(0.8, 2);
    expect(r.pinPositions[1]).toBeCloseTo(3.2, 2);
  });
});
