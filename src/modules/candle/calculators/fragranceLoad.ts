import type { MathStep } from "./waxVolume";

export interface FragranceLoadInput {
  waxWeightG: number;
  fragrancePct: number;
  maxLoadPct: number;
}

export interface FragranceLoadResult {
  fragranceWeightG: number;
  fragranceWeightOz: number;
  remainingCapacityG: number;
  remainingCapacityPct: number;
  warnings: string[];
  mathSteps: MathStep[];
}

export function calculateFragranceLoad(input: FragranceLoadInput): FragranceLoadResult {
  const { waxWeightG, fragrancePct, maxLoadPct } = input;
  const fragranceWeightG = waxWeightG * (fragrancePct / 100);
  const fragranceWeightOz = fragranceWeightG / 28.3495;
  const maxCapacityG = waxWeightG * (maxLoadPct / 100);
  const remainingCapacityG = maxCapacityG - fragranceWeightG;
  const remainingCapacityPct = maxLoadPct - fragrancePct;
  const warnings: string[] = [];

  if (fragrancePct > maxLoadPct) {
    warnings.push(`Fragrance load ${fragrancePct}% exceeds max capacity of ${maxLoadPct}%. May cause sweating or poor burn.`);
  }

  const mathSteps: MathStep[] = [
    { label: "Fragrance Weight", formula: `waxWeight × (pct / 100) = ${waxWeightG} × (${fragrancePct} / 100)`, result: Math.round(fragranceWeightG * 100) / 100, unit: "g" },
    { label: "Fragrance Weight (oz)", formula: `${Math.round(fragranceWeightG * 100) / 100}g / 28.35`, result: Math.round(fragranceWeightOz * 100) / 100, unit: "oz" },
    { label: "Remaining Capacity", formula: `max ${maxLoadPct}% - used ${fragrancePct}%`, result: Math.round(remainingCapacityG * 100) / 100, unit: "g" },
  ];

  return { fragranceWeightG, fragranceWeightOz, remainingCapacityG, remainingCapacityPct, warnings, mathSteps };
}
