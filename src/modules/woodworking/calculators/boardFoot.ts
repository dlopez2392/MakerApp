export type SurfaceType = "rough" | "s2s" | "s3s" | "s4s";

interface BoardFootInput {
  thickness: number;
  width: number;
  length: number;
  quantity: number;
  pricePerBF?: number;
  surfaceType?: SurfaceType;
}

interface BoardFootResult {
  boardFeetPerPiece: number;
  totalBoardFeet: number;
  totalCost: number | null;
  adjustedThickness: number;
  adjustedWidth: number;
}

export function calculateBoardFeet(input: BoardFootInput): BoardFootResult {
  let adjustedThickness = input.thickness;
  let adjustedWidth = input.width;

  switch (input.surfaceType) {
    case "s2s":
      adjustedThickness -= 0.25;
      break;
    case "s3s":
      adjustedThickness -= 0.25;
      adjustedWidth -= 0.25;
      break;
    case "s4s":
      adjustedThickness -= 0.25;
      adjustedWidth -= 0.5;
      break;
  }

  adjustedThickness = Math.max(0, adjustedThickness);
  adjustedWidth = Math.max(0, adjustedWidth);

  const boardFeetPerPiece = (adjustedThickness * adjustedWidth * input.length) / 144;
  const totalBoardFeet = boardFeetPerPiece * input.quantity;
  const totalCost = input.pricePerBF != null ? Math.round(totalBoardFeet * input.pricePerBF * 100) / 100 : null;

  return {
    boardFeetPerPiece: Math.round(boardFeetPerPiece * 1000) / 1000,
    totalBoardFeet: Math.round(totalBoardFeet * 1000) / 1000,
    totalCost,
    adjustedThickness,
    adjustedWidth,
  };
}
