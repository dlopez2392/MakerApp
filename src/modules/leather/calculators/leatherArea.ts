export interface MathStep {
  label: string;
  formula: string;
  result: number;
  unit: string;
}

export interface LeatherPiece {
  lengthIn: number;
  widthIn: number;
  quantity: number;
}

export interface LeatherAreaInput {
  pieces: LeatherPiece[];
  wastePct: number;
}

export interface LeatherAreaResult {
  totalAreaSqIn: number;
  totalAreaSqFt: number;
  withWasteSqFt: number;
  hideRecommendation: string;
  mathSteps: MathStep[];
}

export function calculateLeatherArea(input: LeatherAreaInput): LeatherAreaResult {
  const { pieces, wastePct } = input;
  const totalAreaSqIn = pieces.reduce((sum, p) => sum + p.lengthIn * p.widthIn * p.quantity, 0);
  const totalAreaSqFt = totalAreaSqIn / 144;
  const withWasteSqFt = totalAreaSqFt * (1 + wastePct / 100);

  let hideRecommendation: string;
  if (withWasteSqFt < 6) hideRecommendation = "shoulder";
  else if (withWasteSqFt < 12) hideRecommendation = "half hide";
  else hideRecommendation = "full hide";

  const mathSteps: MathStep[] = [
    { label: "Total Area", formula: `Σ(l × w × qty) = ${totalAreaSqIn}`, result: Math.round(totalAreaSqIn * 100) / 100, unit: "sq in" },
    { label: "Total Area (sq ft)", formula: `${totalAreaSqIn} / 144`, result: Math.round(totalAreaSqFt * 100) / 100, unit: "sq ft" },
    { label: "With Waste", formula: `${Math.round(totalAreaSqFt * 100) / 100} × (1 + ${wastePct}/100)`, result: Math.round(withWasteSqFt * 100) / 100, unit: "sq ft" },
  ];

  return { totalAreaSqIn, totalAreaSqFt, withWasteSqFt, hideRecommendation, mathSteps };
}
