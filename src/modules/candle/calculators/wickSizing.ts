import type { MathStep } from "./waxVolume";

export type WaxType = "soy" | "paraffin" | "coconut" | "blend";

export interface WickSizingInput {
  containerDiameterIn: number;
  waxType: WaxType;
}

export interface WickSizingResult {
  wickSeries: string;
  burnPoolDiameterIn: number;
  warnings: string[];
  mathSteps: MathStep[];
}

const WICK_TABLE: Record<WaxType, { maxDia: number; wick: string }[]> = {
  soy: [
    { maxDia: 2, wick: "CD 6" },
    { maxDia: 2.5, wick: "CD 8" },
    { maxDia: 3, wick: "CD 10" },
    { maxDia: 3.5, wick: "CD 12" },
    { maxDia: 4, wick: "CD 14" },
  ],
  paraffin: [
    { maxDia: 2, wick: "LX 10" },
    { maxDia: 2.5, wick: "LX 12" },
    { maxDia: 3, wick: "LX 14" },
    { maxDia: 3.5, wick: "LX 16" },
    { maxDia: 4, wick: "LX 18" },
  ],
  coconut: [
    { maxDia: 2, wick: "ECO 4" },
    { maxDia: 2.5, wick: "ECO 6" },
    { maxDia: 3, wick: "ECO 8" },
    { maxDia: 3.5, wick: "ECO 10" },
    { maxDia: 4, wick: "ECO 12" },
  ],
  blend: [
    { maxDia: 2, wick: "CD 5" },
    { maxDia: 2.5, wick: "CD 7" },
    { maxDia: 3, wick: "CD 10" },
    { maxDia: 3.5, wick: "CD 12" },
    { maxDia: 4, wick: "ECO 10" },
  ],
};

export function calculateWickSizing(input: WickSizingInput): WickSizingResult {
  const { containerDiameterIn, waxType } = input;
  const table = WICK_TABLE[waxType];
  const warnings: string[] = [];

  let wickSeries = table[table.length - 1].wick;
  for (const entry of table) {
    if (containerDiameterIn <= entry.maxDia) {
      wickSeries = entry.wick;
      break;
    }
  }

  if (containerDiameterIn > 4) {
    warnings.push("Container diameter > 4\". Consider using multiple wicks for even burn pool coverage.");
  }

  const burnPoolDiameterIn = containerDiameterIn;

  const mathSteps: MathStep[] = [
    { label: "Container Diameter", formula: `${containerDiameterIn}"`, result: containerDiameterIn, unit: "in" },
    { label: "Wax Type", formula: waxType, result: 0, unit: "" },
    { label: "Recommended Wick", formula: `Lookup: ${waxType} @ ${containerDiameterIn}"`, result: 0, unit: wickSeries },
  ];

  return { wickSeries, burnPoolDiameterIn, warnings, mathSteps };
}
