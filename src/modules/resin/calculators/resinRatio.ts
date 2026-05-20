export interface MathStep {
  label: string;
  formula: string;
  result: number;
  unit: string;
}

export interface ResinRatioInput {
  totalVolumeMl: number;
  mixRatioResin: number;
  mixRatioHardener: number;
  unit: "ml" | "oz";
}

export interface ResinRatioResult {
  resinAmount: number;
  hardenerAmount: number;
  mathSteps: MathStep[];
}

export function calculateResinRatio(input: ResinRatioInput): ResinRatioResult {
  const { totalVolumeMl, mixRatioResin, mixRatioHardener } = input;
  const totalRatio = mixRatioResin + mixRatioHardener;
  const resinAmount = totalVolumeMl * (mixRatioResin / totalRatio);
  const hardenerAmount = totalVolumeMl - resinAmount;

  const mathSteps: MathStep[] = [
    {
      label: "Total Ratio Parts",
      formula: `ratioResin + ratioHardener = ${mixRatioResin} + ${mixRatioHardener}`,
      result: totalRatio,
      unit: "parts",
    },
    {
      label: "Resin Amount",
      formula: `total × (ratioResin / totalRatio) = ${totalVolumeMl} × (${mixRatioResin} / ${totalRatio})`,
      result: Math.round(resinAmount * 100) / 100,
      unit: input.unit,
    },
    {
      label: "Hardener Amount",
      formula: `total - resin = ${totalVolumeMl} - ${Math.round(resinAmount * 100) / 100}`,
      result: Math.round(hardenerAmount * 100) / 100,
      unit: input.unit,
    },
  ];

  return { resinAmount, hardenerAmount, mathSteps };
}
