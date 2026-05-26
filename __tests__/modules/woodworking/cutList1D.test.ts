import { optimizeCutList1D } from "../../../src/modules/woodworking/calculators/cutList1D";

describe("1D Cut List Optimizer", () => {
  test("simple packing: two cuts fit in one stock piece", () => {
    const result = optimizeCutList1D({
      cuts: [{ length: 30, label: "A" }, { length: 40, label: "B" }],
      stocks: [{ length: 96 }],
    });
    expect(result.totalStockNeeded).toBe(1);
    expect(result.stockPieces[0].cuts).toHaveLength(2);
    expect(result.stockPieces[0].wasteLength).toBe(26);
  });

  test("cuts requiring multiple stock pieces", () => {
    const result = optimizeCutList1D({
      cuts: [{ length: 60 }, { length: 60 }, { length: 60 }],
      stocks: [{ length: 96 }],
    });
    expect(result.totalStockNeeded).toBe(3);
  });

  test("FFD packing: large then small fills better", () => {
    const result = optimizeCutList1D({
      cuts: [
        { length: 20, quantity: 3 },
        { length: 50, quantity: 2 },
      ],
      stocks: [{ length: 96 }],
    });
    expect(result.totalStockNeeded).toBe(2);
  });

  test("kerf subtraction between cuts", () => {
    const result = optimizeCutList1D({
      cuts: [{ length: 46 }, { length: 46 }],
      stocks: [{ length: 96 }],
      kerfWidth: 0.125,
    });
    expect(result.totalStockNeeded).toBe(1);
    expect(result.stockPieces[0].wasteLength).toBeCloseTo(3.875, 2);
  });

  test("kerf pushes to second stock piece", () => {
    const result = optimizeCutList1D({
      cuts: [{ length: 48 }, { length: 48 }],
      stocks: [{ length: 96 }],
      kerfWidth: 0.125,
    });
    expect(result.totalStockNeeded).toBe(2);
  });

  test("waste percentage calculation", () => {
    const result = optimizeCutList1D({
      cuts: [{ length: 48 }],
      stocks: [{ length: 96 }],
    });
    expect(result.wastePercent).toBe(50);
  });

  test("cost calculation", () => {
    const result = optimizeCutList1D({
      cuts: [{ length: 60 }, { length: 60 }],
      stocks: [{ length: 96, cost: 12.50 }],
    });
    expect(result.totalStockNeeded).toBe(2);
    expect(result.totalCost).toBe(25);
  });

  test("multiple stock sizes: prefers smallest that fits", () => {
    const result = optimizeCutList1D({
      cuts: [{ length: 30 }, { length: 70 }],
      stocks: [
        { length: 48, cost: 6 },
        { length: 96, cost: 12 },
      ],
    });
    // 70" needs the 96" stock, 30" fits in 48"
    expect(result.totalStockNeeded).toBe(2);
    expect(result.totalCost).toBe(18);
  });

  test("stock quantity limit respected", () => {
    const result = optimizeCutList1D({
      cuts: [{ length: 60, quantity: 3 }],
      stocks: [{ length: 96, quantity: 2 }, { length: 120 }],
    });
    // Only 2 of the 96" available, third cut goes on 120"
    expect(result.stockPieces.filter((s) => s.stockLength === 96)).toHaveLength(2);
    expect(result.stockPieces.filter((s) => s.stockLength === 120)).toHaveLength(1);
  });
});
