import { optimizeCutList1D } from "../../../src/modules/woodworking/calculators/cutList1D";

describe("1D Cut List Optimizer", () => {
  test("simple packing: two cuts fit in one stock piece", () => {
    const result = optimizeCutList1D({
      cuts: [{ length: 30, label: "A" }, { length: 40, label: "B" }],
      stockLength: 96,
    });
    expect(result.totalStockNeeded).toBe(1);
    expect(result.stockPieces[0].cuts).toHaveLength(2);
    expect(result.stockPieces[0].wasteLength).toBe(26);
  });

  test("cuts requiring multiple stock pieces", () => {
    const result = optimizeCutList1D({
      cuts: [{ length: 60 }, { length: 60 }, { length: 60 }],
      stockLength: 96,
    });
    expect(result.totalStockNeeded).toBe(3);
  });

  test("FFD packing: large then small fills better", () => {
    const result = optimizeCutList1D({
      cuts: [
        { length: 20, quantity: 3 },
        { length: 50, quantity: 2 },
      ],
      stockLength: 96,
    });
    // 50+20+20=90 fits in one, 50+20=70 fits in another
    expect(result.totalStockNeeded).toBe(2);
  });

  test("kerf subtraction between cuts", () => {
    const result = optimizeCutList1D({
      cuts: [{ length: 46 }, { length: 46 }],
      stockLength: 96,
      kerfWidth: 0.125,
    });
    // 46 + 0.125 + 46 = 92.125 <= 96, fits in one
    expect(result.totalStockNeeded).toBe(1);
    expect(result.stockPieces[0].wasteLength).toBeCloseTo(3.875, 2);
  });

  test("kerf pushes to second stock piece", () => {
    const result = optimizeCutList1D({
      cuts: [{ length: 48 }, { length: 48 }],
      stockLength: 96,
      kerfWidth: 0.125,
    });
    // 48 + 0.125 + 48 = 96.125 > 96, needs 2
    expect(result.totalStockNeeded).toBe(2);
  });

  test("waste percentage calculation", () => {
    const result = optimizeCutList1D({
      cuts: [{ length: 48 }],
      stockLength: 96,
    });
    expect(result.wastePercent).toBe(50);
  });

  test("cost calculation", () => {
    const result = optimizeCutList1D({
      cuts: [{ length: 60 }, { length: 60 }],
      stockLength: 96,
      stockCost: 12.50,
    });
    expect(result.totalStockNeeded).toBe(2);
    expect(result.totalCost).toBe(25);
  });
});
