export interface MathStep {
  label: string;
  formula: string;
  result: number;
  unit: string;
}

export interface WaxVolumeInput {
  diameterIn: number;
  heightIn: number;
  shape: "cylinder" | "tapered";
  taperRatio: number;
}

export interface WaxVolumeResult {
  volumeMl: number;
  waxWeightG: number;
  waxWeightOz: number;
  pourWeightG: number;
  mathSteps: MathStep[];
}

const WAX_DENSITY = 0.86;
const IN_TO_CM = 2.54;

export function calculateWaxVolume(input: WaxVolumeInput): WaxVolumeResult {
  const { diameterIn, heightIn, shape, taperRatio } = input;
  const R = (diameterIn * IN_TO_CM) / 2;
  const h = heightIn * IN_TO_CM;
  let volumeMl: number;
  const steps: MathStep[] = [];

  if (shape === "tapered") {
    const r = R * taperRatio;
    volumeMl = (Math.PI * h / 3) * (R * R + R * r + r * r);
    steps.push({ label: "Tapered Volume", formula: `π × h/3 × (R² + R×r + r²)`, result: Math.round(volumeMl * 100) / 100, unit: "ml" });
  } else {
    volumeMl = Math.PI * R * R * h;
    steps.push({ label: "Cylinder Volume", formula: `π × R² × h = π × ${Math.round(R * 100) / 100}² × ${Math.round(h * 100) / 100}`, result: Math.round(volumeMl * 100) / 100, unit: "ml" });
  }

  const waxWeightG = volumeMl * WAX_DENSITY;
  const waxWeightOz = waxWeightG / 28.3495;
  const pourWeightG = waxWeightG * 1.1;

  steps.push(
    { label: "Wax Weight", formula: `volume × ${WAX_DENSITY} density`, result: Math.round(waxWeightG * 100) / 100, unit: "g" },
    { label: "Wax Weight (oz)", formula: `${Math.round(waxWeightG * 100) / 100}g / 28.35`, result: Math.round(waxWeightOz * 100) / 100, unit: "oz" },
    { label: "Pour Weight (10% shrinkage)", formula: `${Math.round(waxWeightG * 100) / 100} × 1.1`, result: Math.round(pourWeightG * 100) / 100, unit: "g" },
  );

  return { volumeMl, waxWeightG, waxWeightOz, pourWeightG, mathSteps: steps };
}
