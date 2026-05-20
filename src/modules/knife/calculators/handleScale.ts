import type { MathStep } from "./heatTreat";

export interface HandleScaleInput {
  bladeLengthIn: number;
  tangLengthIn: number;
  handSize: "small" | "medium" | "large";
}

export interface HandleScaleResult {
  handleLengthIn: number;
  handleWidthIn: number;
  handleThicknessIn: number;
  pinPositions: number[];
  mathSteps: MathStep[];
}

const HAND_DIMS: Record<string, { width: number; thickness: number }> = {
  small: { width: 1.00, thickness: 0.75 },
  medium: { width: 1.15, thickness: 0.85 },
  large: { width: 1.30, thickness: 1.00 },
};

export function calculateHandleScale(input: HandleScaleInput): HandleScaleResult {
  const { tangLengthIn, handSize } = input;
  const dims = HAND_DIMS[handSize];
  const handleLengthIn = tangLengthIn;
  const pinPositions: number[] = [
    Math.round(handleLengthIn * 0.2 * 100) / 100,
    Math.round(handleLengthIn * 0.8 * 100) / 100,
  ];
  if (handleLengthIn > 5) {
    pinPositions.splice(1, 0, Math.round(handleLengthIn * 0.5 * 100) / 100);
  }

  const mathSteps: MathStep[] = [
    { label: "Handle Length", formula: `tang length = ${tangLengthIn}in`, result: handleLengthIn, unit: "in" },
    { label: "Handle Width", formula: `${handSize} hand size → ${dims.width}in`, result: dims.width, unit: "in" },
    { label: "Handle Thickness", formula: `${handSize} hand size → ${dims.thickness}in`, result: dims.thickness, unit: "in" },
    { label: "Pin Count", formula: handleLengthIn > 5 ? "3 pins (handle > 5in)" : "2 pins", result: pinPositions.length, unit: "pins" },
  ];

  return { handleLengthIn, handleWidthIn: dims.width, handleThicknessIn: dims.thickness, pinPositions, mathSteps };
}
