// ─── Types ────────────────────────────────────────────────────────────────────

export interface StockPiece1D {
  length: number;
  label?: string;
  cost?: number;
  quantity?: number;
}

export interface CutPiece {
  length: number;
  label?: string;
  quantity?: number;
}

export interface PlacedCut {
  length: number;
  label: string;
  position: number;
}

export interface StockResult {
  stockLength: number;
  stockLabel: string;
  cuts: PlacedCut[];
  usedLength: number;
  wasteLength: number;
  cost: number | null;
}

export interface CutList1DInput {
  cuts: CutPiece[];
  stocks: StockPiece1D[];
  kerfWidth?: number;
}

export interface CutList1DResult {
  stockPieces: StockResult[];
  totalStockNeeded: number;
  totalWaste: number;
  wastePercent: number;
  totalCost: number | null;
  totalCutCount: number;
  unplacedPieces: string[];
}

// ─── Optimizer (First-Fit Decreasing with multiple stock sizes) ───────────────

export function optimizeCutList1D(input: CutList1DInput): CutList1DResult {
  const kerf = input.kerfWidth ?? 0;

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

  expandedCuts.sort((a, b) => b.length - a.length);

  const stockUsed: number[] = new Array(input.stocks.length).fill(0);
  const openBins: {
    stockIdx: number;
    remaining: number;
    cuts: PlacedCut[];
    usedLength: number;
  }[] = [];
  const unplacedPieces: string[] = [];

  for (const cut of expandedCuts) {
    let placed = false;

    // Try existing bins (First-Fit Decreasing)
    for (const bin of openBins) {
      const neededSpace = bin.cuts.length > 0 ? cut.length + kerf : cut.length;
      if (neededSpace <= bin.remaining + 0.0001) {
        const stock = input.stocks[bin.stockIdx];
        const position =
          stock.length - bin.remaining + (bin.cuts.length > 0 ? kerf : 0);
        bin.cuts.push({ length: cut.length, label: cut.label, position });
        bin.remaining -= neededSpace;
        bin.usedLength += neededSpace;
        placed = true;
        break;
      }
    }

    if (!placed) {
      // Open a new bin — prefer smallest stock that fits
      const candidates = input.stocks
        .map((stock, idx) => ({ stock, idx }))
        .filter(({ stock, idx }) => {
          const maxQty = stock.quantity ?? Infinity;
          if (stockUsed[idx] >= maxQty) return false;
          return cut.length <= stock.length + 0.0001;
        })
        .sort((a, b) => a.stock.length - b.stock.length);

      if (candidates.length === 0) {
        unplacedPieces.push(cut.label);
        continue;
      }

      const { stock, idx } = candidates[0];
      stockUsed[idx]++;

      openBins.push({
        stockIdx: idx,
        remaining: stock.length - cut.length,
        cuts: [{ length: cut.length, label: cut.label, position: 0 }],
        usedLength: cut.length,
      });
      placed = true;
    }
  }

  const results: StockResult[] = openBins.map((bin) => {
    const stock = input.stocks[bin.stockIdx];
    return {
      stockLength: stock.length,
      stockLabel: stock.label ?? `${stock.length}"`,
      cuts: bin.cuts,
      usedLength: round3(bin.usedLength),
      wasteLength: round3(bin.remaining),
      cost: stock.cost ?? null,
    };
  });

  const totalStockNeeded = results.length;
  const totalWaste = results.reduce((sum, r) => sum + r.wasteLength, 0);
  const totalMaterial = results.reduce((sum, r) => sum + r.stockLength, 0);
  const wastePercent =
    totalMaterial > 0 ? Math.round((totalWaste / totalMaterial) * 10000) / 100 : 0;

  let totalCost: number | null = 0;
  for (const r of results) {
    if (r.cost !== null && totalCost !== null) {
      totalCost += r.cost;
    } else {
      totalCost = null;
      break;
    }
  }
  if (totalCost !== null) totalCost = Math.round(totalCost * 100) / 100;

  const totalCutCount = expandedCuts.length - unplacedPieces.length;

  return {
    stockPieces: results,
    totalStockNeeded,
    totalWaste: round3(totalWaste),
    wastePercent,
    totalCost,
    totalCutCount,
    unplacedPieces,
  };
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
