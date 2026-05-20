import type { MathStep } from "./lyeCalculator";

export interface OilEntry {
  name: string;
  weightOz: number;
}

export interface BatchScalerInput {
  originalOils: OilEntry[];
  scaleMode: "factor" | "totalWeight";
  scaleValue: number;
}

export interface BatchScalerResult {
  scaledOils: OilEntry[];
  scaleFactor: number;
  mathSteps: MathStep[];
}

export function calculateBatchScale(input: BatchScalerInput): BatchScalerResult {
  const { originalOils, scaleMode, scaleValue } = input;
  const originalTotal = originalOils.reduce((s, o) => s + o.weightOz, 0);
  const scaleFactor = scaleMode === "factor" ? scaleValue : scaleValue / originalTotal;

  const scaledOils = originalOils.map(o => ({
    name: o.name,
    weightOz: Math.round(o.weightOz * scaleFactor * 100) / 100,
  }));

  const scaledTotal = scaledOils.reduce((s, o) => s + o.weightOz, 0);

  const mathSteps: MathStep[] = [
    { label: "Original Total", formula: `Σ oil weights`, result: Math.round(originalTotal * 100) / 100, unit: "oz" },
    { label: "Scale Factor", formula: scaleMode === "factor" ? `${scaleValue}×` : `${scaleValue} / ${Math.round(originalTotal * 100) / 100}`, result: Math.round(scaleFactor * 1000) / 1000, unit: "×" },
    { label: "Scaled Total", formula: `${Math.round(originalTotal * 100) / 100} × ${Math.round(scaleFactor * 1000) / 1000}`, result: Math.round(scaledTotal * 100) / 100, unit: "oz" },
  ];

  return { scaledOils, scaleFactor, mathSteps };
}
