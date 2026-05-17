export type StepoverMode = "roughing" | "finishing" | "3d-finishing";

export interface StepoverInput {
  mode: StepoverMode;
  toolDiameterIn: number;
  /** Required for 3d-finishing mode */
  scallopHeightIn?: number;
}

export interface StepoverResult {
  stepoverPct: number;
  stepoverIn: number;
  scallopHeightIn: number;
  finishQuality: "rough" | "medium" | "fine" | "ultra-fine";
}

export function calculateStepover(input: StepoverInput): StepoverResult {
  const { mode, toolDiameterIn, scallopHeightIn } = input;
  const radius = toolDiameterIn / 2;

  let stepoverPct: number;
  let stepoverIn: number;
  let computedScallop: number;

  if (mode === "roughing") {
    stepoverPct = 40;
    stepoverIn = Math.round(toolDiameterIn * 0.4 * 10000) / 10000;
    // scallop from stepover: h = r - sqrt(r² - (s/2)²)
    const s = stepoverIn;
    computedScallop = radius - Math.sqrt(radius * radius - (s / 2) * (s / 2));
  } else if (mode === "finishing") {
    stepoverPct = 10;
    stepoverIn = Math.round(toolDiameterIn * 0.1 * 10000) / 10000;
    const s = stepoverIn;
    computedScallop = radius - Math.sqrt(radius * radius - (s / 2) * (s / 2));
  } else {
    // 3d-finishing: derive stepover from target scallop height
    // scallop = h, radius = r
    // h = r - sqrt(r² - (s/2)²)
    // => (s/2)² = r² - (r-h)²  = 2rh - h²
    // => s = 2 * sqrt(2rh - h²) = sqrt(8*h*r - 4*h²)
    const h = scallopHeightIn ?? 0.001;
    stepoverIn = Math.sqrt(8 * h * radius - 4 * h * h);
    stepoverIn = Math.round(stepoverIn * 10000) / 10000;
    stepoverPct = Math.round((stepoverIn / toolDiameterIn) * 1000) / 10;
    computedScallop = h;
  }

  // Quality rating based on scallop height
  let finishQuality: StepoverResult["finishQuality"];
  if (computedScallop < 0.0005) {
    finishQuality = "ultra-fine";
  } else if (computedScallop < 0.002) {
    finishQuality = "fine";
  } else if (computedScallop < 0.005) {
    finishQuality = "medium";
  } else {
    finishQuality = "rough";
  }

  return {
    stepoverPct,
    stepoverIn,
    scallopHeightIn: Math.round(computedScallop * 1000000) / 1000000,
    finishQuality,
  };
}
