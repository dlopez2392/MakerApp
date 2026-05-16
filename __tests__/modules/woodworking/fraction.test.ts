import { parseFraction, toDecimal, add, subtract, multiply, divide, reduce, decimalToNearestFraction } from "../../../src/modules/woodworking/calculators/fraction";

describe("Fraction Engine", () => {
  test("parses whole number", () => {
    expect(parseFraction("5")).toEqual({ whole: 5, numerator: 0, denominator: 1 });
  });
  test("parses simple fraction", () => {
    expect(parseFraction("3/8")).toEqual({ whole: 0, numerator: 3, denominator: 8 });
  });
  test("parses mixed number", () => {
    expect(parseFraction("3 5/8")).toEqual({ whole: 3, numerator: 5, denominator: 8 });
  });
  test("converts to decimal", () => {
    expect(toDecimal({ whole: 3, numerator: 5, denominator: 8 })).toBe(3.625);
  });
  test("adds fractions: 1/4 + 3/8 = 5/8", () => {
    const a = { whole: 0, numerator: 1, denominator: 4 };
    const b = { whole: 0, numerator: 3, denominator: 8 };
    const result = add(a, b);
    expect(toDecimal(result)).toBe(0.625);
    expect(result).toEqual({ whole: 0, numerator: 5, denominator: 8 });
  });
  test("subtracts: 3 1/2 - 1 3/4 = 1 3/4", () => {
    const a = { whole: 3, numerator: 1, denominator: 2 };
    const b = { whole: 1, numerator: 3, denominator: 4 };
    const result = subtract(a, b);
    expect(toDecimal(result)).toBe(1.75);
  });
  test("multiplies: 2 1/2 * 3 = 7 1/2", () => {
    const a = { whole: 2, numerator: 1, denominator: 2 };
    const b = { whole: 3, numerator: 0, denominator: 1 };
    const result = multiply(a, b);
    expect(toDecimal(result)).toBe(7.5);
  });
  test("divides: 3/4 / 1/2 = 1 1/2", () => {
    const a = { whole: 0, numerator: 3, denominator: 4 };
    const b = { whole: 0, numerator: 1, denominator: 2 };
    const result = divide(a, b);
    expect(toDecimal(result)).toBe(1.5);
  });
  test("reduces 6/8 to 3/4", () => {
    expect(reduce({ whole: 0, numerator: 6, denominator: 8 })).toEqual({ whole: 0, numerator: 3, denominator: 4 });
  });
  test("converts decimal to nearest 1/64 fraction", () => {
    const result = decimalToNearestFraction(3.625, 64);
    expect(result).toEqual({ whole: 3, numerator: 5, denominator: 8 });
  });
  test("converts 0.3125 to 5/16", () => {
    const result = decimalToNearestFraction(0.3125, 64);
    expect(result).toEqual({ whole: 0, numerator: 5, denominator: 16 });
  });
});
