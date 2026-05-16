import { calculateBoardFeet } from "../../../src/modules/woodworking/calculators/boardFoot";

describe("Board Foot Calculator", () => {
  test("calculates basic board feet: 1x6x96 = 4 BF", () => {
    const result = calculateBoardFeet({ thickness: 1, width: 6, length: 96, quantity: 1 });
    expect(result.boardFeetPerPiece).toBe(4);
    expect(result.totalBoardFeet).toBe(4);
  });
  test("calculates with quantity", () => {
    const result = calculateBoardFeet({ thickness: 2, width: 8, length: 48, quantity: 5 });
    expect(result.boardFeetPerPiece).toBeCloseTo(5.333, 2);
    expect(result.totalBoardFeet).toBeCloseTo(26.667, 2);
  });
  test("calculates cost when price provided", () => {
    const result = calculateBoardFeet({ thickness: 1, width: 6, length: 96, quantity: 1, pricePerBF: 5.50 });
    expect(result.totalCost).toBe(22);
  });
  test("adjusts for S2S: subtracts 1/4 from thickness", () => {
    const result = calculateBoardFeet({ thickness: 1, width: 6, length: 96, quantity: 1, surfaceType: "s2s" });
    expect(result.boardFeetPerPiece).toBe(3);
  });
  test("adjusts for S3S: subtracts 1/4 thickness + 1/4 width", () => {
    const result = calculateBoardFeet({ thickness: 1, width: 6, length: 96, quantity: 1, surfaceType: "s3s" });
    expect(result.boardFeetPerPiece).toBeCloseTo(2.875, 2);
  });
  test("adjusts for S4S: subtracts 1/4 thickness + 1/2 width", () => {
    const result = calculateBoardFeet({ thickness: 1, width: 6, length: 96, quantity: 1, surfaceType: "s4s" });
    expect(result.boardFeetPerPiece).toBeCloseTo(2.75, 2);
  });
  test("returns zero for zero dimensions", () => {
    const result = calculateBoardFeet({ thickness: 0, width: 6, length: 96, quantity: 1 });
    expect(result.boardFeetPerPiece).toBe(0);
    expect(result.totalBoardFeet).toBe(0);
  });
});
