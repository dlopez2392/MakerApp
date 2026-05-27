import type { MathStep } from "./lyeCalculator";

export type SoapMethod = "cold-process" | "hot-process" | "melt-and-pour";
export type Humidity = "low" | "moderate" | "high";

export interface CureTrackerInput {
  soapMethod: SoapMethod;
  batchDate: string;
  humidity: Humidity;
}

export interface CureTrackerResult {
  unmoldDate: string;
  cutDate: string | null;
  useDate: string;
  fullCureDate: string;
  currentStage: string;
  daysToNextMilestone: number;
  mathSteps: MathStep[];
}

interface CurePreset {
  unmoldHr: number;
  cutHr: number;
  useHr: number;
  fullCureHr: number;
}

const PRESETS: Record<SoapMethod, CurePreset> = {
  "cold-process": { unmoldHr: 36, cutHr: 48, useHr: 672, fullCureHr: 1008 },
  "hot-process": { unmoldHr: 18, cutHr: 24, useHr: 168, fullCureHr: 504 },
  "melt-and-pour": { unmoldHr: 3, cutHr: 0, useHr: 24, fullCureHr: 24 },
};

const HUMIDITY_FACTORS: Record<Humidity, number> = { low: 0.85, moderate: 1.0, high: 1.25 };

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function daysBetween(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateCureTime(input: CureTrackerInput): CureTrackerResult {
  const { soapMethod, batchDate, humidity } = input;
  const preset = PRESETS[soapMethod];
  const factor = HUMIDITY_FACTORS[humidity];

  const parts = batchDate.split("/");
  const batch = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));

  const unmoldHr = preset.unmoldHr * factor;
  const cutHr = preset.cutHr * factor;
  const useHr = preset.useHr * factor;
  const fullCureHr = preset.fullCureHr * factor;

  const unmoldDate = addHours(batch, unmoldHr);
  const cutDate = cutHr > 0 ? addHours(batch, cutHr) : null;
  const useDate = addHours(batch, useHr);
  const fullCureDate = addHours(batch, fullCureHr);

  const now = new Date();
  let currentStage: string;
  let daysToNextMilestone: number;

  if (now < unmoldDate) {
    currentStage = "Curing in Mold";
    daysToNextMilestone = daysBetween(now, unmoldDate);
  } else if (cutDate && now < cutDate) {
    currentStage = "Ready to Unmold";
    daysToNextMilestone = daysBetween(now, cutDate);
  } else if (now < useDate) {
    currentStage = "Curing";
    daysToNextMilestone = daysBetween(now, useDate);
  } else if (now < fullCureDate) {
    currentStage = "Safe to Use";
    daysToNextMilestone = daysBetween(now, fullCureDate);
  } else {
    currentStage = "Fully Cured";
    daysToNextMilestone = 0;
  }

  const r = (v: number) => Math.round(v * 10) / 10;

  const mathSteps: MathStep[] = [
    { label: "Humidity Factor", formula: `${humidity} → ${factor}x`, result: factor, unit: "x" },
    { label: "Unmold Time", formula: `${preset.unmoldHr} hr x ${factor}`, result: r(unmoldHr), unit: "hr" },
    ...(cutHr > 0 ? [{ label: "Cut Time", formula: `${preset.cutHr} hr x ${factor}`, result: r(cutHr), unit: "hr" }] : []),
    { label: "Safe to Use", formula: `${preset.useHr} hr x ${factor}`, result: r(useHr), unit: "hr" },
    { label: "Full Cure", formula: `${preset.fullCureHr} hr x ${factor}`, result: r(fullCureHr), unit: "hr" },
  ];

  return {
    unmoldDate: formatDate(unmoldDate),
    cutDate: cutDate ? formatDate(cutDate) : null,
    useDate: formatDate(useDate),
    fullCureDate: formatDate(fullCureDate),
    currentStage,
    daysToNextMilestone: Math.max(0, daysToNextMilestone),
    mathSteps,
  };
}
