import type { MathStep } from "./lyeCalculator";

export type ColorantType = "mica" | "oxide" | "clay" | "liquid-dye";

export interface ColorAdditiveInput {
  colorantType: ColorantType;
  totalOilWeight: number;
  usageRate: number;
  numberOfColorSplits: number;
  unit: "oz" | "g";
}

export interface ColorAdditiveResult {
  totalColorantTsp: number;
  totalColorantG: number;
  perColorTsp: number;
  perColorG: number;
  maxSafeRate: number;
  warnings: string[];
  mathSteps: MathStep[];
}

const DEFAULT_RATES: Record<ColorantType, number> = { mica: 1.0, oxide: 0.5, clay: 1.0, "liquid-dye": 0.5 };
const MAX_SAFE_RATES: Record<ColorantType, number> = { mica: 2.0, oxide: 1.0, clay: 2.0, "liquid-dye": 1.5 };
const G_PER_TSP: Record<ColorantType, number> = { mica: 3, oxide: 4, clay: 3.5, "liquid-dye": 5 };

const OZ_PER_LB = 16;
const G_PER_LB = 453.6;

export { DEFAULT_RATES };

export function calculateColorAdditive(input: ColorAdditiveInput): ColorAdditiveResult {
  const { colorantType, totalOilWeight, usageRate, numberOfColorSplits, unit } = input;
  const maxSafeRate = MAX_SAFE_RATES[colorantType];

  const oilWeightLbs = unit === "oz" ? totalOilWeight / OZ_PER_LB : totalOilWeight / G_PER_LB;
  const totalColorantTsp = oilWeightLbs * usageRate;
  const totalColorantG = totalColorantTsp * G_PER_TSP[colorantType];

  const splits = Math.max(1, numberOfColorSplits);
  const perColorTsp = totalColorantTsp / splits;
  const perColorG = totalColorantG / splits;

  const warnings: string[] = [];
  if (usageRate > maxSafeRate) {
    warnings.push(`Usage rate ${usageRate} tsp/lb exceeds max safe rate of ${maxSafeRate} tsp/lb for ${colorantType}. May cause seizing or skin irritation.`);
  }

  const r = (v: number) => Math.round(v * 100) / 100;

  const mathSteps: MathStep[] = [
    { label: "Oil Weight", formula: `${totalOilWeight} ${unit} / ${unit === "oz" ? OZ_PER_LB : G_PER_LB}`, result: r(oilWeightLbs), unit: "lbs" },
    { label: "Total Colorant", formula: `${r(oilWeightLbs)} lbs x ${usageRate} tsp/lb`, result: r(totalColorantTsp), unit: "tsp" },
    { label: "Total Colorant (g)", formula: `${r(totalColorantTsp)} tsp x ${G_PER_TSP[colorantType]} g/tsp`, result: r(totalColorantG), unit: "g" },
    ...(splits > 1 ? [{ label: "Per Color", formula: `${r(totalColorantTsp)} tsp / ${splits} colors`, result: r(perColorTsp), unit: "tsp" }] : []),
  ];

  return { totalColorantTsp: r(totalColorantTsp), totalColorantG: r(totalColorantG), perColorTsp: r(perColorTsp), perColorG: r(perColorG), maxSafeRate, warnings, mathSteps };
}
