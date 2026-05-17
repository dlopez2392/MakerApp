import { calculateMaterialCost } from "../../../src/modules/laser/calculators/materialCost";

describe("Laser Material Cost Calculator", () => {
  test("calculates pieces per sheet with grid nesting", () => {
    const result = calculateMaterialCost({
      sheetWidthMm: 300,
      sheetHeightMm: 600,
      pieceWidthMm: 100,
      pieceHeightMm: 100,
      quantityNeeded: 10,
      sheetCost: 15,
      kerfWidthMm: 0.2,
    });
    expect(result.piecesPerSheet).toBe(10);
    expect(result.sheetsNeeded).toBe(1);
    expect(result.costPerPiece).toBeCloseTo(1.5, 1);
  });

  test("tries both orientations and picks better fit", () => {
    const result = calculateMaterialCost({
      sheetWidthMm: 300,
      sheetHeightMm: 600,
      pieceWidthMm: 80,
      pieceHeightMm: 150,
      quantityNeeded: 1,
      sheetCost: 10,
      kerfWidthMm: 0.2,
    });
    expect(result.piecesPerSheet).toBeGreaterThanOrEqual(7);
  });

  test("calculates waste percentage", () => {
    const result = calculateMaterialCost({
      sheetWidthMm: 300,
      sheetHeightMm: 300,
      pieceWidthMm: 100,
      pieceHeightMm: 100,
      quantityNeeded: 9,
      sheetCost: 20,
      kerfWidthMm: 0,
    });
    expect(result.wastePct).toBeCloseTo(0, 0);
  });

  test("handles pieces larger than sheet", () => {
    const result = calculateMaterialCost({
      sheetWidthMm: 100,
      sheetHeightMm: 100,
      pieceWidthMm: 200,
      pieceHeightMm: 200,
      quantityNeeded: 1,
      sheetCost: 10,
      kerfWidthMm: 0,
    });
    expect(result.piecesPerSheet).toBe(0);
  });
});
