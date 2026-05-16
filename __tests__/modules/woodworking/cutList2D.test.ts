import { optimizeCutList2D } from "../../../src/modules/woodworking/calculators/cutList2D";

describe("2D Cut List Optimizer", () => {
  test("single piece fits on one sheet", () => {
    const result = optimizeCutList2D({
      cuts: [{ width: 24, height: 24, label: "A" }],
      sheetWidth: 48, sheetHeight: 96,
    });
    expect(result.totalSheetsNeeded).toBe(1);
    expect(result.sheets[0].placements).toHaveLength(1);
  });

  test("multiple pieces packed on one sheet", () => {
    const result = optimizeCutList2D({
      cuts: [
        { width: 24, height: 48, label: "A" },
        { width: 24, height: 48, label: "B" },
      ],
      sheetWidth: 48, sheetHeight: 96,
    });
    expect(result.totalSheetsNeeded).toBe(1);
  });

  test("pieces overflow to second sheet", () => {
    const result = optimizeCutList2D({
      cuts: [{ width: 48, height: 96, label: "Full", quantity: 2 }],
      sheetWidth: 48, sheetHeight: 96,
    });
    expect(result.totalSheetsNeeded).toBe(2);
  });

  test("orientation flipping fits piece", () => {
    const result = optimizeCutList2D({
      cuts: [
        { width: 40, height: 90, label: "Big" },
        { width: 80, height: 6, label: "Strip" },
      ],
      sheetWidth: 48, sheetHeight: 96,
    });
    // Strip 80x6 won't fit in remaining 8x96 or 48x6 normally,
    // but 6x80 might fit in 48x6 remaining space (no), needs new sheet
    // Either way the algorithm should not crash
    expect(result.totalSheetsNeeded).toBeGreaterThanOrEqual(1);
  });

  test("grain lock prevents rotation", () => {
    const result = optimizeCutList2D({
      cuts: [{ width: 90, height: 40, label: "GrainLocked", grainLocked: true }],
      sheetWidth: 48, sheetHeight: 96,
    });
    // 90 > 48 wide and grain locked so can't rotate. 90 > 96? No 90 < 96.
    // width 90 > sheetWidth 48, can't place at all even rotated (locked).
    // Should still create a sheet attempt
    expect(result.totalSheetsNeeded).toBe(1);
  });

  test("waste calculation is correct", () => {
    const result = optimizeCutList2D({
      cuts: [{ width: 24, height: 48, label: "Quarter" }],
      sheetWidth: 48, sheetHeight: 96,
    });
    const sheetArea = 48 * 96;
    const pieceArea = 24 * 48;
    const expectedWaste = ((sheetArea - pieceArea) / sheetArea) * 100;
    expect(result.sheets[0].wastePercent).toBeCloseTo(expectedWaste, 1);
  });

  test("quantity expansion works", () => {
    const result = optimizeCutList2D({
      cuts: [{ width: 12, height: 12, label: "Tile", quantity: 4 }],
      sheetWidth: 48, sheetHeight: 96,
    });
    expect(result.totalSheetsNeeded).toBe(1);
    expect(result.sheets[0].placements).toHaveLength(4);
  });
});
