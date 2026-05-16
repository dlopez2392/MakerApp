import { calculateCoverage, calculateShellacRatio, calculateDryTime } from "../../../src/modules/woodworking/calculators/finishing";

describe("Finishing Calculator", () => {
  describe("Coverage", () => {
    test("basic coverage: 100 sqft, 500 sqft/gal, 3 coats", () => {
      const result = calculateCoverage({ areaSqFt: 100, coverageRatePerUnit: 500, coats: 3 });
      expect(result.volumePerCoat).toBe(0.2);
      expect(result.volumeNeeded).toBe(0.6);
      expect(result.totalWithWaste).toBe(0.6);
    });
    test("with waste factor", () => {
      const result = calculateCoverage({ areaSqFt: 100, coverageRatePerUnit: 500, coats: 3, wasteFactor: 1.1 });
      expect(result.totalWithWaste).toBeCloseTo(0.66, 2);
    });
    test("single coat on large area", () => {
      const result = calculateCoverage({ areaSqFt: 400, coverageRatePerUnit: 350, coats: 1 });
      expect(result.volumeNeeded).toBeCloseTo(1.143, 2);
    });
  });

  describe("Shellac Ratio", () => {
    test("2-lb cut with 32oz alcohol", () => {
      const result = calculateShellacRatio({ poundCut: 2, alcoholOz: 32 });
      expect(result.flakeOz).toBe(4);
      expect(result.flakeLbs).toBe(0.25);
    });
    test("3-lb cut with 16oz alcohol", () => {
      const result = calculateShellacRatio({ poundCut: 3, alcoholOz: 16 });
      expect(result.flakeOz).toBe(3);
    });
    test("1-lb cut with 8oz alcohol", () => {
      const result = calculateShellacRatio({ poundCut: 1, alcoholOz: 8 });
      expect(result.flakeOz).toBe(0.5);
    });
  });

  describe("Dry Time", () => {
    test("baseline conditions: 70F, 50% humidity", () => {
      const result = calculateDryTime({ baseTimeMinutes: 60, temperatureF: 70, humidityPercent: 50 });
      expect(result.adjustedTimeMinutes).toBe(60);
      expect(result.tempMultiplier).toBe(1);
      expect(result.humidityMultiplier).toBe(1);
    });
    test("cold temperature increases dry time", () => {
      const result = calculateDryTime({ baseTimeMinutes: 60, temperatureF: 50, humidityPercent: 50 });
      expect(result.tempMultiplier).toBe(2);
      expect(result.adjustedTimeMinutes).toBe(120);
    });
    test("high humidity increases dry time", () => {
      const result = calculateDryTime({ baseTimeMinutes: 60, temperatureF: 70, humidityPercent: 100 });
      expect(result.humidityMultiplier).toBe(2);
      expect(result.adjustedTimeMinutes).toBe(120);
    });
    test("warm and dry speeds up", () => {
      const result = calculateDryTime({ baseTimeMinutes: 60, temperatureF: 90, humidityPercent: 30 });
      expect(result.tempMultiplier).toBe(0.5);
      expect(result.humidityMultiplier).toBe(0.8);
      expect(result.adjustedTimeMinutes).toBe(24);
    });
  });
});
