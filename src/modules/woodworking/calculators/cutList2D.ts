interface CutPiece2D {
  width: number;
  height: number;
  label?: string;
  quantity?: number;
  grainLocked?: boolean;
}

interface PlacedPiece {
  width: number;
  height: number;
  x: number;
  y: number;
  label: string;
  rotated: boolean;
}

interface SheetResult {
  sheetWidth: number;
  sheetHeight: number;
  placements: PlacedPiece[];
  usedArea: number;
  wasteArea: number;
  wastePercent: number;
}

interface CutList2DInput {
  cuts: CutPiece2D[];
  sheetWidth: number;
  sheetHeight: number;
  kerfWidth?: number;
}

interface CutList2DResult {
  sheets: SheetResult[];
  totalSheetsNeeded: number;
  totalWastePercent: number;
}

interface FreeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function tryPlace(
  freeRects: FreeRect[],
  w: number,
  h: number
): { rectIndex: number; x: number; y: number } | null {
  let bestIndex = -1;
  let bestArea = Infinity;
  let bestX = 0;
  let bestY = 0;

  for (let i = 0; i < freeRects.length; i++) {
    const rect = freeRects[i];
    if (w <= rect.width + 0.0001 && h <= rect.height + 0.0001) {
      const area = rect.width * rect.height;
      if (area < bestArea) {
        bestArea = area;
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

  // Right remainder
  if (rect.width - wk > 0.0001) {
    result.push({ x: rect.x + wk, y: rect.y, width: rect.width - wk, height: rect.height });
  }
  // Bottom remainder
  if (rect.height - hk > 0.0001) {
    result.push({ x: rect.x, y: rect.y + hk, width: w, height: rect.height - hk });
  }

  return result;
}

export function optimizeCutList2D(input: CutList2DInput): CutList2DResult {
  const kerf = input.kerfWidth ?? 0;

  // Expand quantities
  const expanded: { width: number; height: number; label: string; grainLocked: boolean }[] = [];
  for (const cut of input.cuts) {
    const qty = cut.quantity ?? 1;
    for (let i = 0; i < qty; i++) {
      expanded.push({
        width: cut.width,
        height: cut.height,
        label: cut.label ?? `${cut.width}x${cut.height}`,
        grainLocked: cut.grainLocked ?? false,
      });
    }
  }

  // Sort by area descending
  expanded.sort((a, b) => (b.width * b.height) - (a.width * a.height));

  const sheets: SheetResult[] = [];
  const sheetFreeRects: FreeRect[][] = [];

  for (const piece of expanded) {
    let placed = false;

    for (let s = 0; s < sheets.length; s++) {
      const freeRects = sheetFreeRects[s];

      // Try normal orientation
      const normalResult = tryPlace(freeRects, piece.width, piece.height);

      // Try rotated if not grain-locked
      const rotatedResult = !piece.grainLocked
        ? tryPlace(freeRects, piece.height, piece.width)
        : null;

      // Pick best fit (smaller area rect wins)
      let chosen: { rectIndex: number; x: number; y: number; w: number; h: number; rotated: boolean } | null = null;

      if (normalResult && rotatedResult) {
        const normalArea = freeRects[normalResult.rectIndex].width * freeRects[normalResult.rectIndex].height;
        const rotatedArea = freeRects[rotatedResult.rectIndex].width * freeRects[rotatedResult.rectIndex].height;
        if (normalArea <= rotatedArea) {
          chosen = { ...normalResult, w: piece.width, h: piece.height, rotated: false };
        } else {
          chosen = { ...rotatedResult, w: piece.height, h: piece.width, rotated: true };
        }
      } else if (normalResult) {
        chosen = { ...normalResult, w: piece.width, h: piece.height, rotated: false };
      } else if (rotatedResult) {
        chosen = { ...rotatedResult, w: piece.height, h: piece.width, rotated: true };
      }

      if (chosen) {
        const removedRect = freeRects[chosen.rectIndex];
        const newRects = splitRect(removedRect, chosen.w, chosen.h, kerf);
        freeRects.splice(chosen.rectIndex, 1, ...newRects);

        sheets[s].placements.push({
          width: chosen.w,
          height: chosen.h,
          x: chosen.x,
          y: chosen.y,
          label: piece.label,
          rotated: chosen.rotated,
        });
        sheets[s].usedArea += piece.width * piece.height;
        placed = true;
        break;
      }
    }

    if (!placed) {
      // New sheet
      const newFreeRects: FreeRect[] = [{ x: 0, y: 0, width: input.sheetWidth, height: input.sheetHeight }];
      const sheetIndex = sheets.length;

      // Try normal first
      const normalResult = tryPlace(newFreeRects, piece.width, piece.height);
      const rotatedResult = !piece.grainLocked ? tryPlace(newFreeRects, piece.height, piece.width) : null;

      let w = piece.width;
      let h = piece.height;
      let rotated = false;
      let result = normalResult;

      if (!normalResult && rotatedResult) {
        w = piece.height;
        h = piece.width;
        rotated = true;
        result = rotatedResult;
      }

      if (result) {
        const removedRect = newFreeRects[result.rectIndex];
        const newRects = splitRect(removedRect, w, h, kerf);
        newFreeRects.splice(result.rectIndex, 1, ...newRects);
      }

      const newSheet: SheetResult = {
        sheetWidth: input.sheetWidth,
        sheetHeight: input.sheetHeight,
        placements: [{
          width: w,
          height: h,
          x: 0,
          y: 0,
          label: piece.label,
          rotated,
        }],
        usedArea: piece.width * piece.height,
        wasteArea: 0,
        wastePercent: 0,
      };

      sheets.push(newSheet);
      sheetFreeRects.push(newFreeRects);
    }
  }

  // Calculate waste
  const sheetArea = input.sheetWidth * input.sheetHeight;
  let totalUsed = 0;
  let totalArea = 0;

  for (const sheet of sheets) {
    sheet.wasteArea = Math.round((sheetArea - sheet.usedArea) * 1000) / 1000;
    sheet.wastePercent = Math.round((sheet.wasteArea / sheetArea) * 10000) / 100;
    sheet.usedArea = Math.round(sheet.usedArea * 1000) / 1000;
    totalUsed += sheet.usedArea;
    totalArea += sheetArea;
  }

  const totalWastePercent = totalArea > 0 ? Math.round(((totalArea - totalUsed) / totalArea) * 10000) / 100 : 0;

  return {
    sheets,
    totalSheetsNeeded: sheets.length,
    totalWastePercent,
  };
}
