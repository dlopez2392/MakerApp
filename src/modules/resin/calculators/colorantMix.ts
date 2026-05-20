import type { MathStep } from "./resinRatio";

export interface ColorantMixInput {
  resinWeightG: number;
  colorantType: "pigment" | "dye" | "mica";
  loadPct: number;
}

export interface ColorantMixResult {
  colorantWeightG: number;
  colorantDrops: number;
  maxSafeLoad: number;
  warnings: string[];
  mathSteps: MathStep[];
}

const MAX_LOADS: Record<string, number> = { pigment: 10, dye: 5, mica: 8 };

export function calculateColorantMix(input: ColorantMixInput): ColorantMixResult {
  const { resinWeightG, colorantType, loadPct } = input;
  const maxSafeLoad = MAX_LOADS[colorantType];
  const colorantWeightG = resinWeightG * (loadPct / 100);
  const colorantDrops = colorantWeightG / 0.05;
  const warnings: string[] = [];

  if (loadPct > maxSafeLoad) {
    warnings.push(`${colorantType} load ${loadPct}% exceeds max safe load of ${maxSafeLoad}%. May affect cure.`);
  }

  const mathSteps: MathStep[] = [
    { label: "Colorant Weight", formula: `resinWeight × (loadPct / 100) = ${resinWeightG} × (${loadPct} / 100)`, result: Math.round(colorantWeightG * 100) / 100, unit: "g" },
    { label: "Colorant Drops (liquid)", formula: `colorantWeight / 0.05g per drop`, result: Math.round(colorantDrops), unit: "drops" },
  ];

  return { colorantWeightG, colorantDrops, maxSafeLoad, warnings, mathSteps };
}
