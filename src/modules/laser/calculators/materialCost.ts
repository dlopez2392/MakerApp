interface MaterialCostInput {
  sheetWidthMm: number;
  sheetHeightMm: number;
  pieceWidthMm: number;
  pieceHeightMm: number;
  quantityNeeded: number;
  sheetCost: number;
  kerfWidthMm: number;
}

interface MaterialCostResult {
  piecesPerSheet: number;
  sheetsNeeded: number;
  costPerPiece: number;
  wastePct: number;
  totalCost: number;
}

function gridFit(sheetW: number, sheetH: number, pieceW: number, pieceH: number, kerf: number): number {
  const cols = Math.floor((sheetW + kerf) / (pieceW + kerf));
  const rows = Math.floor((sheetH + kerf) / (pieceH + kerf));
  return cols * rows;
}

export function calculateMaterialCost(input: MaterialCostInput): MaterialCostResult {
  const k = input.kerfWidthMm;

  const fitNormal = gridFit(input.sheetWidthMm, input.sheetHeightMm, input.pieceWidthMm, input.pieceHeightMm, k);
  const fitRotated = gridFit(input.sheetWidthMm, input.sheetHeightMm, input.pieceHeightMm, input.pieceWidthMm, k);
  const piecesPerSheet = Math.max(fitNormal, fitRotated);

  if (piecesPerSheet === 0) {
    return { piecesPerSheet: 0, sheetsNeeded: 0, costPerPiece: 0, wastePct: 100, totalCost: 0 };
  }

  const sheetsNeeded = Math.ceil(input.quantityNeeded / piecesPerSheet);
  const totalCost = Math.round(sheetsNeeded * input.sheetCost * 100) / 100;
  const costPerPiece = Math.round((totalCost / input.quantityNeeded) * 100) / 100;

  const sheetArea = input.sheetWidthMm * input.sheetHeightMm;
  const usedArea = input.quantityNeeded * input.pieceWidthMm * input.pieceHeightMm;
  const totalSheetArea = sheetsNeeded * sheetArea;
  const wastePct = Math.round(((totalSheetArea - usedArea) / totalSheetArea) * 1000) / 10;

  return { piecesPerSheet, sheetsNeeded, costPerPiece, wastePct, totalCost };
}
