import { calculateFocusOffset } from "../../../src/modules/laser/calculators/focusOffset";

describe("Focus Offset Calculator", () => {
  test("cut: focus at material midpoint", () => {
    const result = calculateFocusOffset({ thicknessMm: 6, focalLengthMm: 50.8, operation: "cut" });
    expect(result.zOffsetMm).toBe(-3);
    expect(result.description).toContain("below surface");
  });

  test("engrave: focus on surface", () => {
    const result = calculateFocusOffset({ thicknessMm: 6, focalLengthMm: 50.8, operation: "engrave" });
    expect(result.zOffsetMm).toBe(0);
  });

  test("defocused engrave: focus above surface", () => {
    const result = calculateFocusOffset({ thicknessMm: 3, focalLengthMm: 50.8, operation: "defocused-engrave", defocusAmountMm: 2 });
    expect(result.zOffsetMm).toBe(2);
    expect(result.description).toContain("above surface");
  });

  test("defaults focal length to 50.8mm (2\" lens)", () => {
    const result = calculateFocusOffset({ thicknessMm: 6, operation: "cut" });
    expect(result.focalLengthMm).toBe(50.8);
  });
});
