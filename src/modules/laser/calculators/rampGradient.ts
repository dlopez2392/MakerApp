interface RampGradientInput {
  startPowerPct: number;
  endPowerPct: number;
  lengthMm: number;
  steps: number;
}

interface GradientStep {
  stepIndex: number;
  positionMm: number;
  powerPct: number;
}

interface RampGradientResult {
  steps: GradientStep[];
  totalLengthMm: number;
}

export function calculateRampGradient(input: RampGradientInput): RampGradientResult {
  const segmentLength = input.lengthMm / input.steps;
  const steps: GradientStep[] = [];

  for (let i = 0; i < input.steps; i++) {
    const segmentStart = i * segmentLength;
    const segmentEnd = (i + 1) * segmentLength;
    const midpoint = (segmentStart + segmentEnd) / 2;
    const t = midpoint / input.lengthMm;
    const powerPct = Math.round(input.startPowerPct + (input.endPowerPct - input.startPowerPct) * t);

    steps.push({
      stepIndex: i,
      positionMm: Math.round(midpoint * 10) / 10,
      powerPct: Math.min(100, Math.max(1, powerPct)),
    });
  }

  return { steps, totalLengthMm: input.lengthMm };
}
