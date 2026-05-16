const CUBIC_INCHES_PER_OZ = 1.805;

interface EpoxyVolumeInput {
  lengthIn: number;
  widthIn: number;
  depthIn: number;
}

interface EpoxyMixInput {
  totalOz: number;
  ratioA: number;
  ratioB: number;
}

interface EpoxyMixResult {
  partAOz: number;
  partBOz: number;
}

interface EpoxyMultiPourInput {
  totalDepthIn: number;
  maxPourDepthIn: number;
}

interface EpoxyMultiPourResult {
  numPours: number;
  depthPerPour: number;
  lastPourDepth: number;
}

interface EpoxyColorantInput {
  totalOz: number;
  densityGramsPerOz: number; // typical epoxy ~28.35 g/oz
  percentByWeight: number;
}

interface EpoxyColorantResult {
  pigmentGrams: number;
}

interface EpoxyFullInput {
  lengthIn: number;
  widthIn: number;
  depthIn: number;
  ratioA: number;
  ratioB: number;
  maxPourDepthIn?: number;
  colorantPercent?: number;
  densityGramsPerOz?: number;
}

interface EpoxyFullResult {
  volumeCubicIn: number;
  volumeOz: number;
  mix: EpoxyMixResult;
  multiPour: EpoxyMultiPourResult | null;
  colorant: EpoxyColorantResult | null;
}

export function calculateVolume(input: EpoxyVolumeInput): { cubicInches: number; ounces: number } {
  const cubicInches = input.lengthIn * input.widthIn * input.depthIn;
  const ounces = cubicInches / CUBIC_INCHES_PER_OZ;
  return {
    cubicInches: Math.round(cubicInches * 1000) / 1000,
    ounces: Math.round(ounces * 1000) / 1000,
  };
}

export function calculateMixRatio(input: EpoxyMixInput): EpoxyMixResult {
  const total = input.ratioA + input.ratioB;
  return {
    partAOz: Math.round((input.totalOz * (input.ratioA / total)) * 1000) / 1000,
    partBOz: Math.round((input.totalOz * (input.ratioB / total)) * 1000) / 1000,
  };
}

export function calculateMultiPour(input: EpoxyMultiPourInput): EpoxyMultiPourResult {
  const numPours = Math.ceil(input.totalDepthIn / input.maxPourDepthIn);
  const depthPerPour = Math.round((input.totalDepthIn / numPours) * 1000) / 1000;
  const lastPourDepth = Math.round((input.totalDepthIn - depthPerPour * (numPours - 1)) * 1000) / 1000;
  return { numPours, depthPerPour, lastPourDepth };
}

export function calculateColorant(input: EpoxyColorantInput): EpoxyColorantResult {
  const totalWeightGrams = input.totalOz * input.densityGramsPerOz;
  const pigmentGrams = totalWeightGrams * (input.percentByWeight / 100);
  return { pigmentGrams: Math.round(pigmentGrams * 1000) / 1000 };
}

export function calculateEpoxy(input: EpoxyFullInput): EpoxyFullResult {
  const vol = calculateVolume({ lengthIn: input.lengthIn, widthIn: input.widthIn, depthIn: input.depthIn });
  const mix = calculateMixRatio({ totalOz: vol.ounces, ratioA: input.ratioA, ratioB: input.ratioB });

  const multiPour = input.maxPourDepthIn
    ? calculateMultiPour({ totalDepthIn: input.depthIn, maxPourDepthIn: input.maxPourDepthIn })
    : null;

  const colorant = input.colorantPercent != null
    ? calculateColorant({
        totalOz: vol.ounces,
        densityGramsPerOz: input.densityGramsPerOz ?? 28.35,
        percentByWeight: input.colorantPercent,
      })
    : null;

  return {
    volumeCubicIn: vol.cubicInches,
    volumeOz: vol.ounces,
    mix,
    multiPour,
    colorant,
  };
}
