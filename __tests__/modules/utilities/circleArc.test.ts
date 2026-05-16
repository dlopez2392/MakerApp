import { calculateCircleArc } from "../../../src/modules/utilities/calculators/circleArc";

describe("Circle/Arc Calculator", () => {
  test("circumference of unit circle", () => {
    expect(calculateCircleArc(1).circumference).toBeCloseTo(6.2832, 3);
  });
  test("area of radius 5", () => {
    expect(calculateCircleArc(5).area).toBeCloseTo(78.5398, 2);
  });
  test("arc length 90° on radius 10", () => {
    const r = calculateCircleArc(10, 90);
    expect(r.arcLength).toBeCloseTo(15.708, 2);
  });
  test("chord length 60° on radius 10", () => {
    const r = calculateCircleArc(10, 60);
    expect(r.chordLength).toBeCloseTo(10, 2);
  });
  test("no angle returns null arc/chord", () => {
    const r = calculateCircleArc(5);
    expect(r.arcLength).toBeNull();
    expect(r.chordLength).toBeNull();
  });
});
