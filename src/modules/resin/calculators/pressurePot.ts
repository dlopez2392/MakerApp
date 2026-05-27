import type { MathStep } from "./resinRatio";

export type FitVerdict = "fits" | "too-tall" | "too-wide" | "too-many";

export interface PressurePotInput {
  potDiameter: number;
  potHeight: number;
  potUnit: "in" | "cm";
  moldDiameter: number;
  moldHeight: number;
  moldUnit: "in" | "cm";
  numberOfMolds: number;
  heightClearance: number;
}

export interface PressurePotResult {
  potVolumeMl: number;
  singleMoldVolumeMl: number;
  maxMoldsFit: number;
  fitVerdict: FitVerdict;
  failReason: string | null;
  heightClearanceRemaining: number;
  totalResinMl: number;
  totalResinWeightG: number;
  mathSteps: MathStep[];
}

const CM_PER_IN = 2.54;
const RESIN_DENSITY = 1.1;

function toCm(value: number, unit: "in" | "cm"): number {
  return unit === "in" ? value * CM_PER_IN : value;
}

function r(v: number): number {
  return Math.round(v * 100) / 100;
}

export function calculatePressurePot(input: PressurePotInput): PressurePotResult {
  const potDCm = toCm(input.potDiameter, input.potUnit);
  const potHCm = toCm(input.potHeight, input.potUnit);
  const moldDCm = toCm(input.moldDiameter, input.moldUnit);
  const moldHCm = toCm(input.moldHeight, input.moldUnit);
  const clearanceCm = toCm(input.heightClearance, input.potUnit);

  const potR = potDCm / 2;
  const potVolumeMl = Math.PI * potR * potR * potHCm;

  const moldR = moldDCm / 2;
  const singleMoldVolumeMl = Math.PI * moldR * moldR * moldHCm;

  const usableHeight = potHCm - clearanceCm;

  let fitVerdict: FitVerdict = "fits";
  let failReason: string | null = null;

  if (moldDCm > potDCm) {
    fitVerdict = "too-wide";
    failReason = `Mold diameter (${r(moldDCm)} cm) exceeds pot diameter (${r(potDCm)} cm)`;
  } else if (moldHCm > usableHeight) {
    fitVerdict = "too-tall";
    failReason = `Mold height (${r(moldHCm)} cm) exceeds usable pot height (${r(usableHeight)} cm)`;
  }

  const maxMoldsFit = moldDCm > 0 ? Math.floor(potDCm / moldDCm) : 0;

  if (fitVerdict === "fits" && input.numberOfMolds > maxMoldsFit) {
    fitVerdict = "too-many";
    failReason = `Requested ${input.numberOfMolds} molds but max ${maxMoldsFit} fit across pot diameter`;
  }

  const heightClearanceRemaining = usableHeight - moldHCm;
  const totalResinMl = singleMoldVolumeMl * input.numberOfMolds;
  const totalResinWeightG = totalResinMl * RESIN_DENSITY;

  const steps: MathStep[] = [
    { label: "Pot Volume", formula: `π x (${r(potDCm)}/2)² x ${r(potHCm)}`, result: r(potVolumeMl), unit: "ml" },
    { label: "Usable Height", formula: `${r(potHCm)} - ${r(clearanceCm)} clearance`, result: r(usableHeight), unit: "cm" },
    { label: "Mold Volume", formula: `π x (${r(moldDCm)}/2)² x ${r(moldHCm)}`, result: r(singleMoldVolumeMl), unit: "ml" },
    { label: "Max Molds Across", formula: `floor(${r(potDCm)} / ${r(moldDCm)})`, result: maxMoldsFit, unit: "molds" },
    { label: "Total Resin", formula: `${r(singleMoldVolumeMl)} ml x ${input.numberOfMolds}`, result: r(totalResinMl), unit: "ml" },
    { label: "Total Weight", formula: `${r(totalResinMl)} ml x ${RESIN_DENSITY}`, result: r(totalResinWeightG), unit: "g" },
  ];

  return {
    potVolumeMl: r(potVolumeMl),
    singleMoldVolumeMl: r(singleMoldVolumeMl),
    maxMoldsFit,
    fitVerdict,
    failReason,
    heightClearanceRemaining: r(heightClearanceRemaining),
    totalResinMl: r(totalResinMl),
    totalResinWeightG: r(totalResinWeightG),
    mathSteps: steps,
  };
}
