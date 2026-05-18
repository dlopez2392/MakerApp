import { MathStep } from "./printTime";

export interface FlowRateInput {
  requestedLengthMm: number;
  measuredLengthMm: number;
  currentESteps: number;
}

export interface FlowRateResult {
  newESteps: number;
  flowMultiplier: number; // percentage
  deviationPct: number;
  mathSteps: MathStep[];
}

export function calculateFlowRate(input: FlowRateInput): FlowRateResult {
  const { requestedLengthMm, measuredLengthMm, currentESteps } = input;

  // Correction ratio: how much to scale e-steps
  const ratio = requestedLengthMm / measuredLengthMm;

  // New e-steps
  const newESteps = currentESteps * ratio;

  // Flow multiplier as percentage (100% = perfect)
  const flowMultiplier = ratio * 100;

  // Deviation from perfect
  const deviationPct = Math.abs(ratio - 1) * 100;

  const mathSteps: MathStep[] = [
    {
      label: "Correction Ratio",
      formula: `requested / measured = ${requestedLengthMm} / ${measuredLengthMm}`,
      result: Math.round(ratio * 10000) / 10000,
      unit: "ratio",
    },
    {
      label: "New E-Steps",
      formula: `currentESteps × ratio = ${currentESteps} × ${Math.round(ratio * 10000) / 10000}`,
      result: Math.round(newESteps * 100) / 100,
      unit: "steps/mm",
    },
    {
      label: "Flow Multiplier",
      formula: `ratio × 100 = ${Math.round(ratio * 10000) / 10000} × 100`,
      result: Math.round(flowMultiplier * 100) / 100,
      unit: "%",
    },
    {
      label: "Deviation",
      formula: `|ratio - 1| × 100 = |${Math.round(ratio * 10000) / 10000} - 1| × 100`,
      result: Math.round(deviationPct * 100) / 100,
      unit: "%",
    },
  ];

  return {
    newESteps,
    flowMultiplier,
    deviationPct,
    mathSteps,
  };
}
