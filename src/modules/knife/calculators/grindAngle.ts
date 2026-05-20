import type { MathStep } from "./heatTreat";

export interface GrindAngleInput {
  bladeThicknessIn: number;
  bevelHeightIn: number;
  desiredEdgeAngleDeg: number;
}

export interface GrindAngleResult {
  grindAnglePerSideDeg: number;
  edgeThicknessIn: number;
  steelRemovalIn: number;
  mathSteps: MathStep[];
}

export function calculateGrindAngle(input: GrindAngleInput): GrindAngleResult {
  const { bladeThicknessIn, bevelHeightIn, desiredEdgeAngleDeg } = input;
  const grindAnglePerSideDeg = desiredEdgeAngleDeg / 2;
  const grindAngleRad = (grindAnglePerSideDeg * Math.PI) / 180;
  const edgeThicknessIn = 2 * bevelHeightIn * Math.tan(grindAngleRad);
  const steelRemovalIn = (bladeThicknessIn - edgeThicknessIn) / 2;

  const mathSteps: MathStep[] = [
    { label: "Grind Angle Per Side", formula: `desiredEdgeAngle / 2 = ${desiredEdgeAngleDeg} / 2`, result: Math.round(grindAnglePerSideDeg * 100) / 100, unit: "°" },
    { label: "Edge Thickness", formula: `2 × bevelHeight × tan(grindAngle) = 2 × ${bevelHeightIn} × tan(${grindAnglePerSideDeg}°)`, result: Math.round(edgeThicknessIn * 10000) / 10000, unit: "in" },
    { label: "Steel Removal Per Side", formula: `(bladeThickness - edgeThickness) / 2 = (${bladeThicknessIn} - ${Math.round(edgeThicknessIn * 10000) / 10000}) / 2`, result: Math.round(steelRemovalIn * 10000) / 10000, unit: "in" },
  ];

  return { grindAnglePerSideDeg, edgeThicknessIn, steelRemovalIn, mathSteps };
}
