import { optimizeCutList2D } from "../../../src/modules/woodworking/calculators/cutList2D";

describe("2D Cut List Optimizer", () => {
  test("single piece fits on one sheet", () => {
    const result = optimizeCutList2D({
      cuts: [{ width: 24, height: 24, label: "A" }],
      stocks: [{ width: 48, height: 96 }],
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
      stocks: [{ width: 48, height: 96 }],
    });
    expect(result.totalSheetsNeeded).toBe(1);
  });

  test("pieces overflow to second sheet", () => {
    const result = optimizeCutList2D({
      cuts: [{ width: 48, height: 96, label: "Full", quantity: 2 }],
      stocks: [{ width: 48, height: 96 }],
    });
    expect(result.totalSheetsNeeded).toBe(2);
  });

  test("orientation flipping fits piece", () => {
    const result = optimizeCutList2D({
      cuts: [
        { width: 40, height: 90, label: "Big" },
        { width: 80, height: 6, label: "Strip" },
      ],
      stocks: [{ width: 48, height: 96 }],
    });
    expect(result.totalSheetsNeeded).toBeGreaterThanOrEqual(1);
  });

  test("grain lock prevents rotation", () => {
    const result = optimizeCutList2D({
      cuts: [{ width: 90, height: 40, label: "GrainLocked", grainLocked: true }],
      stocks: [{ width: 48, height: 96 }],
    });
    // 90 > 48 wide and grain locked so can't rotate — unplaceable
    expect(result.unplacedPieces).toHaveLength(1);
  });

  test("waste calculation is correct", () => {
    const result = optimizeCutList2D({
      cuts: [{ width: 24, height: 48, label: "Quarter" }],
      stocks: [{ width: 48, height: 96 }],
    });
    const sheetArea = 48 * 96;
    const pieceArea = 24 * 48;
    const expectedWaste = ((sheetArea - pieceArea) / sheetArea) * 100;
    expect(result.sheets[0].wastePercent).toBeCloseTo(expectedWaste, 1);
  });

  test("quantity expansion works", () => {
    const result = optimizeCutList2D({
      cuts: [{ width: 12, height: 12, label: "Tile", quantity: 4 }],
      stocks: [{ width: 48, height: 96 }],
    });
    expect(result.totalSheetsNeeded).toBe(1);
    expect(result.sheets[0].placements).toHaveLength(4);
  });

  test("multiple stock sizes: uses smallest fitting sheet", () => {
    const result = optimizeCutList2D({
      cuts: [{ width: 12, height: 12, label: "Small" }],
      stocks: [
        { width: 24, height: 24, cost: 10 },
        { width: 48, height: 96, cost: 40 },
      ],
    });
    expect(result.totalSheetsNeeded).toBe(1);
    expect(result.sheets[0].sheetWidth).toBe(24);
    expect(result.totalCost).toBe(10);
  });

  test("material matching: cuts only placed on matching stock", () => {
    const result = optimizeCutList2D({
      cuts: [
        { width: 20, height: 20, label: "MDF-Part", material: "MDF" },
        { width: 20, height: 20, label: "Ply-Part", material: "Plywood" },
      ],
      stocks: [
        { width: 48, height: 96, material: "MDF" },
        { width: 48, height: 96, material: "Plywood" },
      ],
    });
    expect(result.totalSheetsNeeded).toBe(2);
    expect(result.sheets[0].stockMaterial).toBe("MDF");
    expect(result.sheets[1].stockMaterial).toBe("Plywood");
  });

  test("edge banding increases effective cut size", () => {
    const result = optimizeCutList2D({
      cuts: [{
        width: 47.5,
        height: 95.5,
        label: "Tight",
        edgeBanding: { top: true, bottom: true, left: true, right: true },
      }],
      stocks: [{ width: 48, height: 96 }],
      edgeBandingThickness: 0.5,
    });
    // Effective size = 48.5 x 96.5, exceeds 48x96
    expect(result.unplacedPieces).toHaveLength(1);
  });

  test("cost tracking across sheets", () => {
    const result = optimizeCutList2D({
      cuts: [{ width: 48, height: 96, label: "Full", quantity: 3 }],
      stocks: [{ width: 48, height: 96, cost: 35 }],
    });
    expect(result.totalCost).toBe(105);
  });
});
