import type { MathStep } from "./lyeCalculator";

export interface OilCostEntry {
  name: string;
  weightOz: number;
  pricePerLb: number;
}

export interface SoapCostEstimatorInput {
  oilEntries: OilCostEntry[];
  lyePricePerLb: number;
  lyeWeightOz: number;
  fragranceCostPerBottle: number;
  fragranceBottleSizeOz: number;
  fragranceAmountUsedOz: number;
  colorantCostPerContainer: number;
  colorantAmountUsedTsp: number;
  colorantContainerSizeTsp: number;
  packagingCostPerBar: number;
  numberOfBars: number;
}

export interface SoapCostEstimatorResult {
  oilCostTotal: number;
  lyeCost: number;
  fragranceCost: number;
  colorantCost: number;
  packagingCostTotal: number;
  totalBatchCost: number;
  costPerBar: number;
  suggestedRetailPrice: number;
  mathSteps: MathStep[];
}

export function calculateSoapCost(input: SoapCostEstimatorInput): SoapCostEstimatorResult {
  const {
    oilEntries, lyePricePerLb, lyeWeightOz,
    fragranceCostPerBottle, fragranceBottleSizeOz, fragranceAmountUsedOz,
    colorantCostPerContainer, colorantAmountUsedTsp, colorantContainerSizeTsp,
    packagingCostPerBar, numberOfBars,
  } = input;

  const oilCostTotal = oilEntries.reduce((sum, oil) => sum + (oil.weightOz / 16) * oil.pricePerLb, 0);
  const lyeCost = (lyeWeightOz / 16) * lyePricePerLb;
  const fragranceCost = fragranceBottleSizeOz > 0
    ? (fragranceAmountUsedOz / fragranceBottleSizeOz) * fragranceCostPerBottle
    : 0;
  const colorantCost = colorantContainerSizeTsp > 0
    ? (colorantAmountUsedTsp / colorantContainerSizeTsp) * colorantCostPerContainer
    : 0;
  const packagingCostTotal = packagingCostPerBar * numberOfBars;

  const totalBatchCost = oilCostTotal + lyeCost + fragranceCost + colorantCost + packagingCostTotal;
  const costPerBar = numberOfBars > 0 ? totalBatchCost / numberOfBars : 0;
  const suggestedRetailPrice = costPerBar * 3;

  const r = (v: number) => Math.round(v * 100) / 100;

  const mathSteps: MathStep[] = [
    { label: "Oil Cost", formula: `Σ (weight/16 x price/lb)`, result: r(oilCostTotal), unit: "$" },
    { label: "Lye Cost", formula: `(${lyeWeightOz} oz / 16) x $${lyePricePerLb}/lb`, result: r(lyeCost), unit: "$" },
    { label: "Fragrance Cost", formula: `(${fragranceAmountUsedOz} / ${fragranceBottleSizeOz}) x $${fragranceCostPerBottle}`, result: r(fragranceCost), unit: "$" },
    { label: "Colorant Cost", formula: `(${colorantAmountUsedTsp} / ${colorantContainerSizeTsp}) x $${colorantCostPerContainer}`, result: r(colorantCost), unit: "$" },
    { label: "Packaging", formula: `$${packagingCostPerBar} x ${numberOfBars} bars`, result: r(packagingCostTotal), unit: "$" },
    { label: "Total Batch", formula: `oil + lye + fragrance + colorant + packaging`, result: r(totalBatchCost), unit: "$" },
    { label: "Cost per Bar", formula: `$${r(totalBatchCost)} / ${numberOfBars}`, result: r(costPerBar), unit: "$" },
    { label: "Suggested Retail", formula: `$${r(costPerBar)} x 3`, result: r(suggestedRetailPrice), unit: "$" },
  ];

  return {
    oilCostTotal: r(oilCostTotal), lyeCost: r(lyeCost), fragranceCost: r(fragranceCost),
    colorantCost: r(colorantCost), packagingCostTotal: r(packagingCostTotal),
    totalBatchCost: r(totalBatchCost), costPerBar: r(costPerBar), suggestedRetailPrice: r(suggestedRetailPrice),
    mathSteps,
  };
}
