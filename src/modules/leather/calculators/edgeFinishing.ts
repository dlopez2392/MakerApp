import type { MathStep } from "./leatherArea";

export type FinishType = "edge-paint" | "gum-trag" | "beeswax";
export type EdgeProfile = "flat" | "rounded" | "beveled";

const USAGE_RATES: Record<FinishType, number> = {
  "edge-paint": 0.05,
  "gum-trag": 0.03,
  "beeswax": 0.04,
};

const PROFILE_MULTIPLIERS: Record<EdgeProfile, number> = {
  flat: 1.0,
  rounded: 1.2,
  beveled: 1.1,
};

export interface EdgeFinishingInput {
  totalEdgeLengthIn: number;
  leatherThicknessMm: number;
  numberOfCoats: number;
  finishType: FinishType;
  edgeProfile: EdgeProfile;
}

export interface EdgeFinishingResult {
  totalFinishMl: number;
  totalFinishOz: number;
  bottlesNeeded: number;
  estimatedTimeMin: number;
  mathSteps: MathStep[];
}

export function calculateEdgeFinishing(input: EdgeFinishingInput): EdgeFinishingResult {
  const { totalEdgeLengthIn, leatherThicknessMm, numberOfCoats, finishType, edgeProfile } = input;
  const r = (v: number) => Math.round(v * 100) / 100;

  const baseRate = USAGE_RATES[finishType];
  const profileMultiplier = PROFILE_MULTIPLIERS[edgeProfile];
  const thicknessMultiplier = leatherThicknessMm / 3;
  const mlPerInch = baseRate * profileMultiplier * thicknessMultiplier;
  const totalFinishMl = totalEdgeLengthIn * mlPerInch * numberOfCoats;
  const totalFinishOz = totalFinishMl / 29.5735;
  const bottlesNeeded = Math.ceil(totalFinishOz / 4);
  const estimatedTimeMin = Math.ceil((totalEdgeLengthIn * numberOfCoats) / 6);

  const mathSteps: MathStep[] = [
    { label: "Usage Rate", formula: `${baseRate} × ${profileMultiplier} (profile) × ${r(thicknessMultiplier)} (thickness)`, result: r(mlPerInch), unit: "ml/in" },
    { label: "Total Finish", formula: `${totalEdgeLengthIn} in × ${r(mlPerInch)} × ${numberOfCoats} coats`, result: r(totalFinishMl), unit: "ml" },
    { label: "Total Finish", formula: `${r(totalFinishMl)} / 29.57`, result: r(totalFinishOz), unit: "oz" },
    { label: "Bottles (4oz)", formula: `ceil(${r(totalFinishOz)} / 4)`, result: bottlesNeeded, unit: "bottles" },
    { label: "Estimated Time", formula: `ceil(${totalEdgeLengthIn} × ${numberOfCoats} / 6 in/min)`, result: estimatedTimeMin, unit: "min" },
  ];

  return { totalFinishMl: r(totalFinishMl), totalFinishOz: r(totalFinishOz), bottlesNeeded, estimatedTimeMin, mathSteps };
}
