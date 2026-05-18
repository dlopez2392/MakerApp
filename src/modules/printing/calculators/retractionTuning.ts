import { MathStep } from "./printTime";

export type FilamentCategory = "pla" | "petg" | "abs" | "asa" | "tpu" | "flex" | "nylon" | "pc";
export type ExtruderType = "bowden" | "direct";

interface BaseRetractionConfig {
  directBase: number;
  bowdenBase: number;
  speedMms: number;
  isFlex?: boolean;
}

const BASE_RETRACTION: Record<string, BaseRetractionConfig> = {
  pla: { directBase: 1.0, bowdenBase: 4.0, speedMms: 45 },
  petg: { directBase: 0.8, bowdenBase: 3.5, speedMms: 35 },
  abs: { directBase: 1.2, bowdenBase: 4.5, speedMms: 40 },
  asa: { directBase: 1.2, bowdenBase: 4.5, speedMms: 40 },
  tpu: { directBase: 0.5, bowdenBase: 0, speedMms: 25, isFlex: true },
  flex: { directBase: 0.5, bowdenBase: 0, speedMms: 20, isFlex: true },
  nylon: { directBase: 1.5, bowdenBase: 5.0, speedMms: 40 },
  pc: { directBase: 1.8, bowdenBase: 5.5, speedMms: 35 },
};

const MAX_BOWDEN_RETRACTION = 7;
const BOWDEN_SCALE_LENGTH = 400; // reference tube length for scaling

export interface RetractionInput {
  filamentCategory: string;
  extruderType: ExtruderType;
  bowdenLengthMm: number | null;
  nozzleDiameter: number;
}

export interface RetractionResult {
  retractionDistMm: number;
  retractionSpeedMms: number;
  zHopMm: number;
  primeAmountMm: number;
  warnings: string[];
  mathSteps: MathStep[];
}

export function calculateRetractionTuning(input: RetractionInput): RetractionResult {
  const { filamentCategory, extruderType, bowdenLengthMm, nozzleDiameter } = input;

  const config = BASE_RETRACTION[filamentCategory.toLowerCase()] ?? BASE_RETRACTION["pla"];
  const warnings: string[] = [];

  // Flex/TPU warnings
  if (config.isFlex) {
    warnings.push(
      `${filamentCategory.toUpperCase()} is flexible — minimal retraction recommended to avoid grinding.`,
    );
    if (extruderType === "bowden") {
      warnings.push(
        "Bowden extruder with flexible filament is not recommended — setting retraction to 0.",
      );
    }
  }

  let retractionDistMm: number;
  let retractionNote = "";

  if (extruderType === "bowden") {
    if (config.isFlex) {
      // Bowden + flex = no retraction
      retractionDistMm = 0;
      retractionNote = "0 (bowden + flex = no retraction)";
    } else {
      // Scale by tube length
      const tubeLength = bowdenLengthMm ?? BOWDEN_SCALE_LENGTH;
      const scaleFactor = tubeLength / BOWDEN_SCALE_LENGTH;
      const scaled = config.bowdenBase * scaleFactor;
      retractionDistMm = Math.min(MAX_BOWDEN_RETRACTION, scaled);
      retractionNote = `${config.bowdenBase} × (${tubeLength} / ${BOWDEN_SCALE_LENGTH}) = ${scaled.toFixed(2)}, capped at ${MAX_BOWDEN_RETRACTION}`;
    }
  } else {
    retractionDistMm = config.directBase;
    retractionNote = `direct drive base for ${filamentCategory}`;
  }

  const retractionSpeedMms = config.speedMms;
  const zHopMm = nozzleDiameter * 0.5;
  const primeAmountMm = retractionDistMm * 0.05;

  const mathSteps: MathStep[] = [
    {
      label: "Base Retraction Distance",
      formula: `${extruderType} base for ${filamentCategory}: ${retractionNote}`,
      result: Math.round(retractionDistMm * 1000) / 1000,
      unit: "mm",
    },
    {
      label: "Retraction Speed",
      formula: `base speed for ${filamentCategory}`,
      result: retractionSpeedMms,
      unit: "mm/s",
    },
    {
      label: "Z-Hop",
      formula: `nozzleDiameter × 0.5 = ${nozzleDiameter} × 0.5`,
      result: Math.round(zHopMm * 1000) / 1000,
      unit: "mm",
    },
    {
      label: "Prime Amount",
      formula: `retraction × 0.05 = ${Math.round(retractionDistMm * 1000) / 1000} × 0.05`,
      result: Math.round(primeAmountMm * 10000) / 10000,
      unit: "mm",
    },
  ];

  return {
    retractionDistMm,
    retractionSpeedMms,
    zHopMm,
    primeAmountMm,
    warnings,
    mathSteps,
  };
}
