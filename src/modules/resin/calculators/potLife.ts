import type { MathStep } from "./resinRatio";

export type ResinType = "standard-epoxy" | "fast-set-epoxy" | "polyester" | "polyurethane";

export interface PotLifeInput {
  resinType: ResinType;
  ambientTemp: number;
  tempUnit: "F" | "C";
  batchVolumeMl: number;
}

export interface CureStage {
  name: string;
  minutes: number;
}

export interface PotLifeResult {
  adjustedPotLifeMin: number;
  gelTimeMin: number;
  demoldTimeMin: number;
  fullCureTimeMin: number;
  tempFactor: number;
  massFactor: number;
  cureStages: CureStage[];
  mathSteps: MathStep[];
}

interface ResinPreset {
  label: string;
  potLifeMin: number;
  gelTimeMin: number;
  demoldTimeMin: number;
  fullCureMin: number;
}

const PRESETS: Record<ResinType, ResinPreset> = {
  "standard-epoxy": { label: "Standard Epoxy", potLifeMin: 45, gelTimeMin: 180, demoldTimeMin: 720, fullCureMin: 4320 },
  "fast-set-epoxy": { label: "Fast-Set Epoxy", potLifeMin: 15, gelTimeMin: 60, demoldTimeMin: 240, fullCureMin: 1440 },
  "polyester": { label: "Polyester", potLifeMin: 10, gelTimeMin: 30, demoldTimeMin: 120, fullCureMin: 1440 },
  "polyurethane": { label: "Polyurethane", potLifeMin: 8, gelTimeMin: 20, demoldTimeMin: 60, fullCureMin: 960 },
};

export function calculatePotLife(input: PotLifeInput): PotLifeResult {
  const { resinType, ambientTemp, tempUnit, batchVolumeMl } = input;
  const preset = PRESETS[resinType];

  const tempF = tempUnit === "C" ? ambientTemp * 9 / 5 + 32 : ambientTemp;
  const delta = tempF - 72;
  const tempFactor = Math.pow(0.5, delta / 18);

  const massFactor = batchVolumeMl > 200
    ? Math.max(0.5, 200 / batchVolumeMl)
    : 1.0;

  const combinedFactor = tempFactor * massFactor;

  const adjustedPotLifeMin = preset.potLifeMin * combinedFactor;
  const gelTimeMin = preset.gelTimeMin * combinedFactor;
  const demoldTimeMin = preset.demoldTimeMin * combinedFactor;
  const fullCureTimeMin = preset.fullCureMin * combinedFactor;

  const r = (v: number) => Math.round(v * 10) / 10;

  const cureStages: CureStage[] = [
    { name: "Working Time", minutes: r(adjustedPotLifeMin) },
    { name: "Gel", minutes: r(gelTimeMin) },
    { name: "Demold", minutes: r(demoldTimeMin) },
    { name: "Full Cure", minutes: r(fullCureTimeMin) },
  ];

  const mathSteps: MathStep[] = [
    { label: "Ambient Temp (°F)", formula: tempUnit === "C" ? `${ambientTemp}°C x 9/5 + 32` : `${ambientTemp}°F`, result: r(tempF), unit: "°F" },
    { label: "Temp Delta", formula: `${r(tempF)}°F - 72°F`, result: r(delta), unit: "°F" },
    { label: "Temp Factor", formula: `0.5 ^ (${r(delta)} / 18)`, result: Math.round(tempFactor * 1000) / 1000, unit: "x" },
    { label: "Mass Factor", formula: batchVolumeMl > 200 ? `max(0.5, 200 / ${batchVolumeMl})` : `1.0 (batch ≤ 200 ml)`, result: Math.round(massFactor * 1000) / 1000, unit: "x" },
    { label: "Adjusted Pot Life", formula: `${preset.potLifeMin} min x ${Math.round(tempFactor * 1000) / 1000} x ${Math.round(massFactor * 1000) / 1000}`, result: r(adjustedPotLifeMin), unit: "min" },
  ];

  return {
    adjustedPotLifeMin: r(adjustedPotLifeMin),
    gelTimeMin: r(gelTimeMin),
    demoldTimeMin: r(demoldTimeMin),
    fullCureTimeMin: r(fullCureTimeMin),
    tempFactor: Math.round(tempFactor * 1000) / 1000,
    massFactor: Math.round(massFactor * 1000) / 1000,
    cureStages,
    mathSteps,
  };
}
