import type { MathStep } from "./leatherArea";

export type DyeType = "spirit" | "oil" | "acrylic";

const DYE_COVERAGE_RATES: Record<DyeType, number> = {
  spirit: 8,
  oil: 6,
  acrylic: 10,
};

export interface DyeCoverageInput {
  areaSqFt: number;
  numberOfCoats: number;
  dyeType: DyeType;
  coverageRateOverride?: number;
  pricePerBottle?: number;
  bottleSizeOz: number;
}

export interface DyeCoverageResult {
  totalDyeOz: number;
  bottlesNeeded: number;
  estimatedCost: number | null;
  coverageRate: number;
  mathSteps: MathStep[];
}

export function calculateDyeCoverage(input: DyeCoverageInput): DyeCoverageResult {
  const { areaSqFt, numberOfCoats, dyeType, coverageRateOverride, pricePerBottle, bottleSizeOz } = input;
  const r = (v: number) => Math.round(v * 100) / 100;

  const coverageRate = coverageRateOverride ?? DYE_COVERAGE_RATES[dyeType];
  const totalAreaToCoat = areaSqFt * numberOfCoats;
  const totalDyeOz = totalAreaToCoat / coverageRate;
  const bottlesNeeded = Math.ceil(totalDyeOz / bottleSizeOz);
  const estimatedCost = pricePerBottle ? bottlesNeeded * pricePerBottle : null;

  const mathSteps: MathStep[] = [
    { label: "Total Area to Coat", formula: `${areaSqFt} sq ft × ${numberOfCoats} coats`, result: r(totalAreaToCoat), unit: "sq ft" },
    { label: "Coverage Rate", formula: `${dyeType} dye`, result: coverageRate, unit: "sq ft/oz" },
    { label: "Dye Needed", formula: `${r(totalAreaToCoat)} / ${coverageRate}`, result: r(totalDyeOz), unit: "oz" },
    { label: "Bottles Needed", formula: `ceil(${r(totalDyeOz)} / ${bottleSizeOz})`, result: bottlesNeeded, unit: "bottles" },
  ];

  if (estimatedCost !== null) {
    mathSteps.push({ label: "Estimated Cost", formula: `${bottlesNeeded} × $${pricePerBottle}`, result: r(estimatedCost), unit: "$" });
  }

  return { totalDyeOz: r(totalDyeOz), bottlesNeeded, estimatedCost: estimatedCost ? r(estimatedCost) : null, coverageRate, mathSteps };
}
