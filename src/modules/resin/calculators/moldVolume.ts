import type { MathStep } from "./resinRatio";

export interface MoldVolumeInput {
  shape: "cylinder" | "rectangle" | "sphere";
  diameterMm?: number;
  heightMm?: number;
  lengthMm?: number;
  widthMm?: number;
}

export interface MoldVolumeResult {
  volumeMl: number;
  resinWeightG: number;
  mathSteps: MathStep[];
}

const RESIN_DENSITY = 1.1;

export function calculateMoldVolume(input: MoldVolumeInput): MoldVolumeResult {
  const { shape } = input;
  let volumeMl = 0;
  const steps: MathStep[] = [];

  if (shape === "cylinder") {
    const r = (input.diameterMm ?? 0) / 2;
    const h = input.heightMm ?? 0;
    volumeMl = (Math.PI * r * r * h) / 1000;
    steps.push({ label: "Cylinder Volume", formula: `π × r² × h / 1000 = π × ${r}² × ${h} / 1000`, result: Math.round(volumeMl * 100) / 100, unit: "ml" });
  } else if (shape === "rectangle") {
    const l = input.lengthMm ?? 0;
    const w = input.widthMm ?? 0;
    const h = input.heightMm ?? 0;
    volumeMl = (l * w * h) / 1000;
    steps.push({ label: "Rectangle Volume", formula: `l × w × h / 1000 = ${l} × ${w} × ${h} / 1000`, result: Math.round(volumeMl * 100) / 100, unit: "ml" });
  } else {
    const r = (input.diameterMm ?? 0) / 2;
    volumeMl = ((4 / 3) * Math.PI * r * r * r) / 1000;
    steps.push({ label: "Sphere Volume", formula: `(4/3) × π × r³ / 1000 = (4/3) × π × ${r}³ / 1000`, result: Math.round(volumeMl * 100) / 100, unit: "ml" });
  }

  const resinWeightG = volumeMl * RESIN_DENSITY;
  steps.push({ label: "Resin Weight", formula: `volumeMl × ${RESIN_DENSITY} density`, result: Math.round(resinWeightG * 100) / 100, unit: "g" });

  return { volumeMl, resinWeightG, mathSteps: steps };
}
