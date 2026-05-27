import type { MathStep } from "./resinRatio";

export interface CoatingCoverageInput {
  shape: "rectangle" | "circle";
  lengthMm?: number;
  widthMm?: number;
  diameterMm?: number;
  depthMm: number;
  numberOfCoats: number;
  mixRatioResin: number;
  mixRatioHardener: number;
  inputUnit: "mm" | "in";
}

export interface CoatingCoverageResult {
  surfaceAreaMm2: number;
  volumePerCoatMl: number;
  totalVolumeMl: number;
  resinAmountMl: number;
  hardenerAmountMl: number;
  totalWeightG: number;
  mathSteps: MathStep[];
}

const MM_PER_IN = 25.4;
const RESIN_DENSITY = 1.1;

function toMm(value: number, unit: "mm" | "in"): number {
  return unit === "in" ? value * MM_PER_IN : value;
}

export function calculateCoatingCoverage(input: CoatingCoverageInput): CoatingCoverageResult {
  const { shape, numberOfCoats, mixRatioResin, mixRatioHardener, inputUnit } = input;
  const depthMm = toMm(input.depthMm, inputUnit);

  let surfaceAreaMm2 = 0;
  const steps: MathStep[] = [];
  const r = (v: number) => Math.round(v * 100) / 100;

  if (shape === "rectangle") {
    const l = toMm(input.lengthMm ?? 0, inputUnit);
    const w = toMm(input.widthMm ?? 0, inputUnit);
    surfaceAreaMm2 = l * w;
    steps.push({ label: "Surface Area", formula: `${r(l)} mm x ${r(w)} mm`, result: r(surfaceAreaMm2), unit: "mm²" });
  } else {
    const d = toMm(input.diameterMm ?? 0, inputUnit);
    const radius = d / 2;
    surfaceAreaMm2 = Math.PI * radius * radius;
    steps.push({ label: "Surface Area", formula: `π x (${r(d)}/2)²`, result: r(surfaceAreaMm2), unit: "mm²" });
  }

  const volumePerCoatMl = (surfaceAreaMm2 * depthMm) / 1000;
  steps.push({ label: "Volume per Coat", formula: `${r(surfaceAreaMm2)} mm² x ${r(depthMm)} mm / 1000`, result: r(volumePerCoatMl), unit: "ml" });

  const totalVolumeMl = volumePerCoatMl * numberOfCoats;
  if (numberOfCoats > 1) {
    steps.push({ label: "Total Volume", formula: `${r(volumePerCoatMl)} ml x ${numberOfCoats} coats`, result: r(totalVolumeMl), unit: "ml" });
  }

  const totalRatio = mixRatioResin + mixRatioHardener;
  const resinAmountMl = totalVolumeMl * (mixRatioResin / totalRatio);
  const hardenerAmountMl = totalVolumeMl - resinAmountMl;
  steps.push({ label: "Resin Amount", formula: `${r(totalVolumeMl)} ml x (${mixRatioResin}/${totalRatio})`, result: r(resinAmountMl), unit: "ml" });
  steps.push({ label: "Hardener Amount", formula: `${r(totalVolumeMl)} ml - ${r(resinAmountMl)} ml`, result: r(hardenerAmountMl), unit: "ml" });

  const totalWeightG = totalVolumeMl * RESIN_DENSITY;
  steps.push({ label: "Total Weight", formula: `${r(totalVolumeMl)} ml x ${RESIN_DENSITY} g/ml`, result: r(totalWeightG), unit: "g" });

  return {
    surfaceAreaMm2: r(surfaceAreaMm2),
    volumePerCoatMl: r(volumePerCoatMl),
    totalVolumeMl: r(totalVolumeMl),
    resinAmountMl: r(resinAmountMl),
    hardenerAmountMl: r(hardenerAmountMl),
    totalWeightG: r(totalWeightG),
    mathSteps: steps,
  };
}
