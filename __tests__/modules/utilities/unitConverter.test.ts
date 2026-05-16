import { convert, CATEGORIES } from "../../../src/modules/utilities/calculators/unitConverter";

describe("Unit Converter", () => {
  test("inches to mm", () => {
    expect(convert(1, "in", "mm", "length")).toBeCloseTo(25.4, 1);
  });
  test("mm to inches", () => {
    expect(convert(25.4, "mm", "in", "length")).toBeCloseTo(1, 4);
  });
  test("Fahrenheit to Celsius", () => {
    expect(convert(212, "°F", "°C", "temperature")).toBeCloseTo(100, 1);
    expect(convert(32, "°F", "°C", "temperature")).toBeCloseTo(0, 1);
  });
  test("Celsius to Fahrenheit", () => {
    expect(convert(100, "°C", "°F", "temperature")).toBeCloseTo(212, 1);
  });
  test("IPM to mm/min", () => {
    expect(convert(100, "ipm", "mm/min", "speed")).toBeCloseTo(2540, 0);
  });
  test("PSI to bar", () => {
    expect(convert(14.696, "psi", "bar", "pressure")).toBeCloseTo(1.013, 2);
  });
  test("gallons to liters", () => {
    expect(convert(1, "gal", "L", "volume")).toBeCloseTo(3.785, 2);
  });
  test("lbs to kg", () => {
    expect(convert(1, "lb", "kg", "weight")).toBeCloseTo(0.4536, 3);
  });
  test("has all 9 categories", () => {
    expect(Object.keys(CATEGORIES).length).toBe(9);
  });
});
