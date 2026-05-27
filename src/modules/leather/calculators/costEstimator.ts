import type { MathStep } from "./leatherArea";

export interface LeatherCostInput {
  hideCost: number;
  hideAreaSqFt: number;
  hardwareCount: number;
  hardwareCostPer: number;
  threadSpoolCost: number;
  threadSpoolsUsed: number;
  dyeFinishCost: number;
  numberOfItems: number;
}

export interface LeatherCostResult {
  hideCostTotal: number;
  hardwareCostTotal: number;
  threadCostTotal: number;
  dyeCostTotal: number;
  totalProjectCost: number;
  costPerItem: number;
  suggestedRetail: number;
  mathSteps: MathStep[];
}

export function calculateLeatherCost(input: LeatherCostInput): LeatherCostResult {
  const { hideCost, hardwareCount, hardwareCostPer, threadSpoolCost, threadSpoolsUsed, dyeFinishCost, numberOfItems } = input;
  const r = (v: number) => Math.round(v * 100) / 100;

  const hideCostTotal = hideCost;
  const hardwareCostTotal = hardwareCount * hardwareCostPer;
  const threadCostTotal = threadSpoolsUsed * threadSpoolCost;
  const dyeCostTotal = dyeFinishCost;
  const totalProjectCost = hideCostTotal + hardwareCostTotal + threadCostTotal + dyeCostTotal;
  const costPerItem = numberOfItems > 0 ? totalProjectCost / numberOfItems : 0;
  const suggestedRetail = costPerItem * 3;

  const mathSteps: MathStep[] = [
    { label: "Hide Cost", formula: `$${hideCost}`, result: r(hideCostTotal), unit: "$" },
    { label: "Hardware", formula: `${hardwareCount} × $${hardwareCostPer}`, result: r(hardwareCostTotal), unit: "$" },
    { label: "Thread", formula: `${threadSpoolsUsed} × $${threadSpoolCost}`, result: r(threadCostTotal), unit: "$" },
    { label: "Dye/Finish", formula: `$${dyeFinishCost}`, result: r(dyeCostTotal), unit: "$" },
    { label: "Total Project", formula: `hide + hardware + thread + dye`, result: r(totalProjectCost), unit: "$" },
    { label: "Cost per Item", formula: `$${r(totalProjectCost)} / ${numberOfItems}`, result: r(costPerItem), unit: "$" },
    { label: "Suggested Retail", formula: `$${r(costPerItem)} × 3`, result: r(suggestedRetail), unit: "$" },
  ];

  return { hideCostTotal: r(hideCostTotal), hardwareCostTotal: r(hardwareCostTotal), threadCostTotal: r(threadCostTotal), dyeCostTotal: r(dyeCostTotal), totalProjectCost: r(totalProjectCost), costPerItem: r(costPerItem), suggestedRetail: r(suggestedRetail), mathSteps };
}
