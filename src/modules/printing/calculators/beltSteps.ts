import { MathStep } from "./printTime";

export type AxisType = "belt" | "leadscrew";

export interface BeltStepsInput {
  axisType: AxisType;
  motorStepAngle: number; // degrees (1.8 or 0.9)
  microstepping: number; // 1, 2, 4, 8, 16, 32, etc.
  pulleyTeeth: number | null; // for belt drives
  beltPitch: number | null; // mm, e.g. 2 for GT2
  leadMm: number | null; // mm per revolution for leadscrews
}

export interface BeltStepsResult {
  stepsPerMm: number;
  resolutionUm: number; // microns per step
  mathSteps: MathStep[];
}

export function calculateBeltSteps(input: BeltStepsInput): BeltStepsResult {
  const { axisType, motorStepAngle, microstepping, pulleyTeeth, beltPitch, leadMm } = input;

  // Full steps per revolution = 360 / stepAngle
  const fullStepsPerRev = 360 / motorStepAngle;
  // Microstepped steps per revolution
  const stepsPerRev = fullStepsPerRev * microstepping;

  let stepsPerMm: number;
  let formulaNote: string;

  if (axisType === "belt") {
    const teeth = pulleyTeeth ?? 20;
    const pitch = beltPitch ?? 2;
    // Distance per revolution = teeth × pitch
    const mmPerRev = teeth * pitch;
    stepsPerMm = stepsPerRev / mmPerRev;
    formulaNote = `(360 / ${motorStepAngle} × ${microstepping}) / (${teeth} × ${pitch}) = ${stepsPerRev} / ${mmPerRev}`;
  } else {
    // Leadscrew: distance per revolution = lead
    const lead = leadMm ?? 8;
    stepsPerMm = stepsPerRev / lead;
    formulaNote = `(360 / ${motorStepAngle} × ${microstepping}) / ${lead} = ${stepsPerRev} / ${lead}`;
  }

  // Resolution in microns per step
  const resolutionUm = (1 / stepsPerMm) * 1000;

  const mathSteps: MathStep[] = [
    {
      label: "Full Steps per Revolution",
      formula: `360 / stepAngle = 360 / ${motorStepAngle}`,
      result: fullStepsPerRev,
      unit: "steps/rev",
    },
    {
      label: "Microstepped Steps per Revolution",
      formula: `fullSteps × microstepping = ${fullStepsPerRev} × ${microstepping}`,
      result: stepsPerRev,
      unit: "steps/rev",
    },
    {
      label: "Steps per mm",
      formula: formulaNote,
      result: Math.round(stepsPerMm * 10000) / 10000,
      unit: "steps/mm",
    },
    {
      label: "Resolution",
      formula: `(1 / stepsPerMm) × 1000 = (1 / ${Math.round(stepsPerMm * 10000) / 10000}) × 1000`,
      result: Math.round(resolutionUm * 1000) / 1000,
      unit: "µm",
    },
  ];

  return {
    stepsPerMm,
    resolutionUm,
    mathSteps,
  };
}
