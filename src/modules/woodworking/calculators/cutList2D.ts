// ─── Types ────────────────────────────────────────────────────────────────────

export interface StockSheet {
  width: number;
  height: number;
  label?: string;
  material?: string;
  cost?: number;
  quantity?: number;
}

export interface EdgeBanding {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export interface CutPiece2D {
  width: number;
  height: number;
  label?: string;
  quantity?: number;
  grainLocked?: boolean;
  material?: string;
  edgeBanding?: EdgeBanding;
}

export interface PlacedPiece {
  width: number;
  height: number;
  x: number;
  y: number;
  label: string;
  rotated: boolean;
  material?: string;
  edgeBanding?: EdgeBanding;
  originalWidth: number;
  originalHeight: number;
}

export interface SheetResult {
  stockLabel: string;
  stockMaterial?: string;
  sheetWidth: number;
  sheetHeight: number;
  placements: PlacedPiece[];
  usedArea: number;
  wasteArea: number;
  wastePercent: number;
  totalCutLength: number;
  cutCount: number;
  cost: number | null;
}

export interface CutList2DInput {
  cuts: CutPiece2D[];
  stocks: StockSheet[];
  kerfWidth?: number;
  edgeBandingThickness?: number;
}

export interface CutList2DResult {
  sheets: SheetResult[];
  totalSheetsNeeded: number;
  totalWastePercent: number;
  totalCutCount: number;
  totalCutLength: number;
  totalCost: number | null;
  unplacedPieces: string[];
}

// ─── Free-rect bin packing ────────────────────────────────────────────────────

interface FreeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function tryPlace(
  freeRects: FreeRect[],
  w: number,
  h: number,
): { rectIndex: number; x: number; y: number } | null {
  let bestIndex = -1;
  let bestShortSide = Infinity;
  let bestX = 0;
  let bestY = 0;

  for (let i = 0; i < freeRects.length; i++) {
    const rect = freeRects[i];
    if (w <= rect.width + 0.0001 && h <= rect.height + 0.0001) {
      const leftoverW = rect.width - w;
      const leftoverH = rect.height - h;
      const shortSide = Math.min(leftoverW, leftoverH);
      if (shortSide < bestShortSide) {
        bestShortSide = shortSide;
        bestIndex = i;
        bestX = rect.x;
        bestY = rect.y;
      }
    }
  }

  if (bestIndex === -1) return null;
  return { rectIndex: bestIndex, x: bestX, y: bestY };
}

function splitRect(rect: FreeRect, w: number, h: number, kerf: number): FreeRect[] {
  const result: FreeRect[] = [];
  const wk = w + kerf;
  const hk = h + kerf;

  if (rect.width - wk > 0.0001) {
    result.push({ x: rect.x + wk, y: rect.y, width: rect.width - wk, height: rect.height });
  }
  if (rect.height - hk > 0.0001) {
    result.push({ x: rect.x, y: rect.y + hk, width: w, height: rect.height - hk });
  }

  return result;
}

// ─── Effective dimensions with edge banding ───────────────────────────────────

function getEffectiveDimensions(
  w: number,
  h: number,
  eb: EdgeBanding | undefined,
  thickness: number,
): { effectiveW: number; effectiveH: number } {
  if (!eb || thickness <= 0) return { effectiveW: w, effectiveH: h };
  const effectiveW = w + (eb.left ? thickness : 0) + (eb.right ? thickness : 0);
  const effectiveH = h + (eb.top ? thickness : 0) + (eb.bottom ? thickness : 0);
  return { effectiveW, effectiveH };
}

// ─── Main optimizer ───────────────────────────────────────────────────────────

export function optimizeCutList2D(input: CutList2DInput): CutList2DResult {
  const kerf = input.kerfWidth ?? 0;
  const ebThickness = input.edgeBandingThickness ?? 0;

  const expanded: {
    width: number;
    height: number;
    effectiveW: number;
    effectiveH: number;
    label: string;
    grainLocked: boolean;
    material?: string;
    edgeBanding?: EdgeBanding;
  }[] = [];

  for (const cut of input.cuts) {
    const qty = cut.quantity ?? 1;
    const { effectiveW, effectiveH } = getEffectiveDimensions(
      cut.width,
      cut.height,
      cut.edgeBanding,
      ebThickness,
    );
    for (let i = 0; i < qty; i++) {
      expanded.push({
        width: cut.width,
        height: cut.height,
        effectiveW,
        effectiveH,
        label: cut.label ?? `${cut.width}x${cut.height}`,
        grainLocked: cut.grainLocked ?? false,
        material: cut.material,
        edgeBanding: cut.edgeBanding,
      });
    }
  }

  expanded.sort((a, b) => b.effectiveW * b.effectiveH - a.effectiveW * a.effectiveH);

  const sheets: SheetResult[] = [];
  const sheetFreeRects: FreeRect[][] = [];
  const sheetStockIndex: number[] = [];
  const stockUsed: number[] = new Array(input.stocks.length).fill(0);
  const unplacedPieces: string[] = [];

  for (const piece of expanded) {
    let placed = false;

    // Try existing sheets
    for (let s = 0; s < sheets.length; s++) {
      const si = sheetStockIndex[s];
      const stock = input.stocks[si];
      if (piece.material && stock.material && piece.material !== stock.material) continue;

      const freeRects = sheetFreeRects[s];
      const chosen = bestFit(freeRects, piece);

      if (chosen) {
        applyPlacement(freeRects, sheets[s], piece, chosen, kerf);
        placed = true;
        break;
      }
    }

    if (!placed) {
      // Try opening a new sheet — prefer smallest stock that fits
      const candidates = input.stocks
        .map((stock, idx) => ({ stock, idx }))
        .filter(({ stock, idx }) => {
          if (piece.material && stock.material && piece.material !== stock.material) return false;
          const maxQty = stock.quantity ?? Infinity;
          if (stockUsed[idx] >= maxQty) return false;
          const fits =
            (piece.effectiveW <= stock.width + 0.0001 && piece.effectiveH <= stock.height + 0.0001) ||
            (!piece.grainLocked &&
              piece.effectiveH <= stock.width + 0.0001 &&
              piece.effectiveW <= stock.height + 0.0001);
          return fits;
        })
        .sort((a, b) => a.stock.width * a.stock.height - b.stock.width * b.stock.height);

      if (candidates.length === 0) {
        unplacedPieces.push(piece.label);
        continue;
      }

      const { stock, idx } = candidates[0];
      stockUsed[idx]++;

      const newFreeRects: FreeRect[] = [
        { x: 0, y: 0, width: stock.width, height: stock.height },
      ];

      const newSheet: SheetResult = {
        stockLabel: stock.label ?? `${stock.width}" × ${stock.height}"`,
        stockMaterial: stock.material,
        sheetWidth: stock.width,
        sheetHeight: stock.height,
        placements: [],
        usedArea: 0,
        wasteArea: 0,
        wastePercent: 0,
        totalCutLength: 0,
        cutCount: 0,
        cost: stock.cost ?? null,
      };

      sheets.push(newSheet);
      sheetFreeRects.push(newFreeRects);
      sheetStockIndex.push(idx);

      const chosen = bestFit(newFreeRects, piece);
      if (chosen) {
        applyPlacement(newFreeRects, newSheet, piece, chosen, kerf);
        placed = true;
      } else {
        unplacedPieces.push(piece.label);
      }
    }
  }

  // Calculate final stats
  let totalUsed = 0;
  let totalArea = 0;
  let totalCutCount = 0;
  let totalCutLength = 0;
  let totalCost: number | null = 0;

  for (const sheet of sheets) {
    const sheetArea = sheet.sheetWidth * sheet.sheetHeight;
    sheet.wasteArea = round3(sheetArea - sheet.usedArea);
    sheet.wastePercent = Math.round((sheet.wasteArea / sheetArea) * 10000) / 100;
    sheet.usedArea = round3(sheet.usedArea);

    let cutLen = 0;
    let cuts = 0;
    for (const p of sheet.placements) {
      cutLen += (p.width + p.height) * 2;
      cuts += 2;
    }
    sheet.totalCutLength = round3(cutLen);
    sheet.cutCount = cuts;

    totalUsed += sheet.usedArea;
    totalArea += sheetArea;
    totalCutCount += cuts;
    totalCutLength += cutLen;

    if (sheet.cost !== null && totalCost !== null) {
      totalCost += sheet.cost;
    } else if (sheet.cost === null) {
      totalCost = null;
    }
  }

  const totalWastePercent =
    totalArea > 0 ? Math.round(((totalArea - totalUsed) / totalArea) * 10000) / 100 : 0;

  return {
    sheets,
    totalSheetsNeeded: sheets.length,
    totalWastePercent,
    totalCutCount,
    totalCutLength: round3(totalCutLength),
    totalCost: totalCost !== null ? Math.round(totalCost * 100) / 100 : null,
    unplacedPieces,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bestFit(
  freeRects: FreeRect[],
  piece: {
    effectiveW: number;
    effectiveH: number;
    grainLocked: boolean;
  },
): { rectIndex: number; x: number; y: number; w: number; h: number; rotated: boolean } | null {
  const normalResult = tryPlace(freeRects, piece.effectiveW, piece.effectiveH);
  const rotatedResult = !piece.grainLocked
    ? tryPlace(freeRects, piece.effectiveH, piece.effectiveW)
    : null;

  if (normalResult && rotatedResult) {
    const nRect = freeRects[normalResult.rectIndex];
    const rRect = freeRects[rotatedResult.rectIndex];
    const nShort = Math.min(nRect.width - piece.effectiveW, nRect.height - piece.effectiveH);
    const rShort = Math.min(rRect.width - piece.effectiveH, rRect.height - piece.effectiveW);
    if (nShort <= rShort) {
      return { ...normalResult, w: piece.effectiveW, h: piece.effectiveH, rotated: false };
    }
    return { ...rotatedResult, w: piece.effectiveH, h: piece.effectiveW, rotated: true };
  }
  if (normalResult) {
    return { ...normalResult, w: piece.effectiveW, h: piece.effectiveH, rotated: false };
  }
  if (rotatedResult) {
    return { ...rotatedResult, w: piece.effectiveH, h: piece.effectiveW, rotated: true };
  }
  return null;
}

function applyPlacement(
  freeRects: FreeRect[],
  sheet: SheetResult,
  piece: {
    width: number;
    height: number;
    effectiveW: number;
    effectiveH: number;
    label: string;
    material?: string;
    edgeBanding?: EdgeBanding;
  },
  chosen: { rectIndex: number; x: number; y: number; w: number; h: number; rotated: boolean },
  kerf: number,
) {
  const removedRect = freeRects[chosen.rectIndex];
  const newRects = splitRect(removedRect, chosen.w, chosen.h, kerf);
  freeRects.splice(chosen.rectIndex, 1, ...newRects);

  sheet.placements.push({
    width: chosen.w,
    height: chosen.h,
    x: chosen.x,
    y: chosen.y,
    label: piece.label,
    rotated: chosen.rotated,
    material: piece.material,
    edgeBanding: piece.edgeBanding,
    originalWidth: piece.width,
    originalHeight: piece.height,
  });
  sheet.usedArea += piece.width * piece.height;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
