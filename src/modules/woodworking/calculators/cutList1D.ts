interface CutPiece {
  length: number;
  label?: string;
  quantity?: number;
}

interface StockPiece {
  length: number;
  cost?: number;
}

interface PlacedCut {
  length: number;
  label: string;
  position: number;
}

interface StockResult {
  stockLength: number;
  cuts: PlacedCut[];
  usedLength: number;
  wasteLength: number;
}

interface CutList1DInput {
  cuts: CutPiece[];
  stockLength: number;
  kerfWidth?: number;
  stockCost?: number;
}

interface CutList1DResult {
  stockPieces: StockResult[];
  totalStockNeeded: number;
  totalWaste: number;
  wastePercent: number;
  totalCost: number | null;
}

export function optimizeCutList1D(input: CutList1DInput): CutList1DResult {
  const kerf = input.kerfWidth ?? 0;

  // Expand quantities
  const expandedCuts: { length: number; label: string }[] = [];
  for (const cut of input.cuts) {
    const qty = cut.quantity ?? 1;
    for (let i = 0; i < qty; i++) {
      expandedCuts.push({
        length: cut.length,
        label: cut.label ?? `${cut.length}`,
      });
    }
  }

  // Sort descending (First-Fit Decreasing)
  expandedCuts.sort((a, b) => b.length - a.length);

  const stockPieces: { remaining: number; cuts: PlacedCut[]; usedLength: number }[] = [];

  for (const cut of expandedCuts) {
    let placed = false;

    for (const stock of stockPieces) {
      const neededSpace = stock.cuts.length > 0 ? cut.length + kerf : cut.length;
      if (neededSpace <= stock.remaining + 0.0001) {
        const position = input.stockLength - stock.remaining + (stock.cuts.length > 0 ? kerf : 0);
        stock.cuts.push({ length: cut.length, label: cut.label, position });
        stock.remaining -= neededSpace;
        stock.usedLength += neededSpace;
        placed = true;
        break;
      }
    }

    if (!placed) {
      stockPieces.push({
        remaining: input.stockLength - cut.length,
        cuts: [{ length: cut.length, label: cut.label, position: 0 }],
        usedLength: cut.length,
      });
    }
  }

  const results: StockResult[] = stockPieces.map((sp) => ({
    stockLength: input.stockLength,
    cuts: sp.cuts,
    usedLength: Math.round(sp.usedLength * 1000) / 1000,
    wasteLength: Math.round(sp.remaining * 1000) / 1000,
  }));

  const totalStockNeeded = results.length;
  const totalWaste = results.reduce((sum, r) => sum + r.wasteLength, 0);
  const totalMaterial = totalStockNeeded * input.stockLength;
  const wastePercent = totalMaterial > 0 ? Math.round((totalWaste / totalMaterial) * 10000) / 100 : 0;
  const totalCost = input.stockCost != null ? Math.round(totalStockNeeded * input.stockCost * 100) / 100 : null;

  return { stockPieces: results, totalStockNeeded, totalWaste: Math.round(totalWaste * 1000) / 1000, wastePercent, totalCost };
}
