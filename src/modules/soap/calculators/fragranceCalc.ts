import type { MathStep } from "./lyeCalculator";

export interface FragranceCalcInput {
  oilType: "fragrance" | "essential";
  totalOilWeight: number;
  usageRate: number;
  unit: "oz" | "g";
}

export interface FragranceCalcResult {
  fragranceWeight: number;
  fragranceTeaspoons: number;
  maxSafeRate: number;
  warnings: string[];
  mathSteps: MathStep[];
}

const OZ_PER_TSP = 0.17;
const G_PER_TSP = 4.7;
const MAX_RATES: Record<string, number> = { fragrance: 6, essential: 3 };

export function calculateFragrance(input: FragranceCalcInput): FragranceCalcResult {
  const { oilType, totalOilWeight, usageRate, unit } = input;
  const maxSafeRate = MAX_RATES[oilType];
  const fragranceWeight = totalOilWeight * (usageRate / 100);
  const fragranceTeaspoons = unit === "oz"
    ? fragranceWeight / OZ_PER_TSP
    : fragranceWeight / G_PER_TSP;

  const warnings: string[] = [];
  if (usageRate > maxSafeRate) {
    warnings.push(`Usage rate ${usageRate}% exceeds max safe rate of ${maxSafeRate}% for ${oilType === "fragrance" ? "fragrance oils" : "essential oils"}. May cause skin irritation.`);
  }

  const r = (v: number) => Math.round(v * 100) / 100;

  const mathSteps: MathStep[] = [
    { label: "Fragrance Weight", formula: `${totalOilWeight} ${unit} x (${usageRate} / 100)`, result: r(fragranceWeight), unit },
    { label: "Teaspoons", formula: `${r(fragranceWeight)} ${unit} / ${unit === "oz" ? OZ_PER_TSP : G_PER_TSP} ${unit}/tsp`, result: r(fragranceTeaspoons), unit: "tsp" },
  ];

  return { fragranceWeight: r(fragranceWeight), fragranceTeaspoons: r(fragranceTeaspoons), maxSafeRate, warnings, mathSteps };
}
