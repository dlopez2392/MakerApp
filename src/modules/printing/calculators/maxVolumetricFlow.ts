import { MathStep } from "./printTime";

export interface MaxVolumetricFlowInput {
  layerHeight: number;
  lineWidth: number;
  printSpeedMms: number;
  hotendMaxFlow: number; // mm³/s
}

export interface MaxVolumetricFlowResult {
  calculatedFlow: number; // mm³/s
  hotendCapacityPct: number;
  maxSafeSpeedMms: number;
  status: "safe" | "warning" | "exceeds";
  mathSteps: MathStep[];
}

export function calculateMaxVolumetricFlow(input: MaxVolumetricFlowInput): MaxVolumetricFlowResult {
  const { layerHeight, lineWidth, printSpeedMms, hotendMaxFlow } = input;

  // Volumetric flow = layer height × line width × print speed
  const calculatedFlow = layerHeight * lineWidth * printSpeedMms;

  // Capacity percentage
  const hotendCapacityPct = (calculatedFlow / hotendMaxFlow) * 100;

  // Max safe speed at this layer/line config
  const maxSafeSpeedMms = hotendMaxFlow / (layerHeight * lineWidth);

  // Status thresholds
  let status: "safe" | "warning" | "exceeds";
  if (hotendCapacityPct > 100) {
    status = "exceeds";
  } else if (hotendCapacityPct >= 80) {
    status = "warning";
  } else {
    status = "safe";
  }

  const mathSteps: MathStep[] = [
    {
      label: "Calculated Volumetric Flow",
      formula: `layerHeight × lineWidth × speed = ${layerHeight} × ${lineWidth} × ${printSpeedMms}`,
      result: Math.round(calculatedFlow * 1000) / 1000,
      unit: "mm³/s",
    },
    {
      label: "Hotend Capacity %",
      formula: `(flow / maxFlow) × 100 = (${Math.round(calculatedFlow * 1000) / 1000} / ${hotendMaxFlow}) × 100`,
      result: Math.round(hotendCapacityPct * 10) / 10,
      unit: "%",
    },
    {
      label: "Max Safe Print Speed",
      formula: `maxFlow / (layerHeight × lineWidth) = ${hotendMaxFlow} / (${layerHeight} × ${lineWidth})`,
      result: Math.round(maxSafeSpeedMms * 10) / 10,
      unit: "mm/s",
    },
  ];

  return {
    calculatedFlow,
    hotendCapacityPct,
    maxSafeSpeedMms,
    status,
    mathSteps,
  };
}
