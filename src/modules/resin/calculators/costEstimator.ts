import type { MathStep } from "./resinRatio";

export interface CostEstimatorInput {
  resinPricePerUnit: number;
  priceUnit: "L" | "gal";
  volumeNeeded: number;
  volumeUnit: "ml" | "oz";
  mixRatioResin: number;
  mixRatioHardener: number;
  colorantCostPerBottle: number;
  colorantAmountUsed: number;
  colorantBottleSize: number;
  wasteFactor: number;
}

export interface CostEstimatorResult {
  resinCost: number;
  hardenerCost: number;
  colorantCost: number;
  wasteCost: number;
  totalCost: number;
  costPerMl: number;
  mathSteps: MathStep[];
}

const ML_PER_GAL = 3785.41;
const ML_PER_L = 1000;
const ML_PER_OZ = 29.5735;

export function calculateCost(input: CostEstimatorInput): CostEstimatorResult {
  const {
    resinPricePerUnit, priceUnit, volumeNeeded, volumeUnit,
    mixRatioResin, mixRatioHardener,
    colorantCostPerBottle, colorantAmountUsed, colorantBottleSize,
    wasteFactor,
  } = input;

  const mlPerPriceUnit = priceUnit === "gal" ? ML_PER_GAL : ML_PER_L;
  const costPerMlRaw = resinPricePerUnit / mlPerPriceUnit;

  const volumeMl = volumeUnit === "oz" ? volumeNeeded * ML_PER_OZ : volumeNeeded;

  const totalRatio = mixRatioResin + mixRatioHardener;
  const resinPortionMl = volumeMl * (mixRatioResin / totalRatio);
  const hardenerPortionMl = volumeMl - resinPortionMl;

  const resinCost = resinPortionMl * costPerMlRaw;
  const hardenerCost = hardenerPortionMl * costPerMlRaw;

  const colorantCost = colorantBottleSize > 0
    ? (colorantAmountUsed / colorantBottleSize) * colorantCostPerBottle
    : 0;

  const subtotal = resinCost + hardenerCost + colorantCost;
  const wasteCost = subtotal * (wasteFactor / 100);
  const totalCost = subtotal + wasteCost;
  const costPerMl = volumeMl > 0 ? totalCost / volumeMl : 0;

  const r = (v: number) => Math.round(v * 100) / 100;

  const mathSteps: MathStep[] = [
    { label: "Cost per ml", formula: `$${resinPricePerUnit} / ${mlPerPriceUnit} ml`, result: r(costPerMlRaw), unit: "$/ml" },
    { label: "Resin portion", formula: `${r(volumeMl)} ml x (${mixRatioResin}/${totalRatio})`, result: r(resinPortionMl), unit: "ml" },
    { label: "Resin cost", formula: `${r(resinPortionMl)} ml x $${r(costPerMlRaw)}/ml`, result: r(resinCost), unit: "$" },
    { label: "Hardener cost", formula: `${r(hardenerPortionMl)} ml x $${r(costPerMlRaw)}/ml`, result: r(hardenerCost), unit: "$" },
    { label: "Colorant cost", formula: `(${colorantAmountUsed} / ${colorantBottleSize}) x $${colorantCostPerBottle}`, result: r(colorantCost), unit: "$" },
    { label: "Waste cost", formula: `$${r(subtotal)} x ${wasteFactor}%`, result: r(wasteCost), unit: "$" },
    { label: "Total", formula: `$${r(subtotal)} + $${r(wasteCost)}`, result: r(totalCost), unit: "$" },
  ];

  return { resinCost: r(resinCost), hardenerCost: r(hardenerCost), colorantCost: r(colorantCost), wasteCost: r(wasteCost), totalCost: r(totalCost), costPerMl: r(costPerMl), mathSteps };
}
