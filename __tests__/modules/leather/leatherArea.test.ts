import { calculateLeatherArea } from "../../../src/modules/leather/calculators/leatherArea";

describe("Leather Area Calculator", () => {
  test("single piece area", () => {
    const r = calculateLeatherArea({ pieces: [{ lengthIn: 12, widthIn: 12, quantity: 1 }], wastePct: 0 });
    expect(r.totalAreaSqIn).toBe(144);
    expect(r.totalAreaSqFt).toBeCloseTo(1, 5);
  });

  test("multiple pieces sum correctly", () => {
    const r = calculateLeatherArea({
      pieces: [
        { lengthIn: 12, widthIn: 6, quantity: 2 },
        { lengthIn: 8, widthIn: 4, quantity: 3 },
      ],
      wastePct: 0,
    });
    expect(r.totalAreaSqIn).toBe(12 * 6 * 2 + 8 * 4 * 3);
  });

  test("waste adds correct percentage", () => {
    const r = calculateLeatherArea({ pieces: [{ lengthIn: 12, widthIn: 12, quantity: 1 }], wastePct: 15 });
    expect(r.withWasteSqFt).toBeCloseTo(1 * 1.15, 5);
  });

  test("shoulder for < 6 sqft", () => {
    const r = calculateLeatherArea({ pieces: [{ lengthIn: 12, widthIn: 12, quantity: 1 }], wastePct: 15 });
    expect(r.hideRecommendation).toBe("shoulder");
  });

  test("half hide for 6-12 sqft", () => {
    const r = calculateLeatherArea({ pieces: [{ lengthIn: 36, widthIn: 36, quantity: 1 }], wastePct: 0 });
    expect(r.hideRecommendation).toBe("half hide");
  });

  test("full hide for > 12 sqft", () => {
    const r = calculateLeatherArea({ pieces: [{ lengthIn: 48, widthIn: 48, quantity: 1 }], wastePct: 0 });
    expect(r.hideRecommendation).toBe("full hide");
  });
});
