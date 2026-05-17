export interface PassInfo {
  passNumber: number;
  passType: "roughing" | "finishing";
  depthIn: number;
  cumulativeDepthIn: number;
}

export interface DepthOfCutInput {
  totalDepthIn: number;
  maxRoughDocIn: number;
  finishingPassIn?: number;
  /** Optional: feed rate in IPM for time estimate */
  feedRateIpm?: number;
  /** Optional: total cut length in inches for time estimate */
  cutLengthIn?: number;
}

export interface DepthOfCutResult {
  passSchedule: PassInfo[];
  totalPasses: number;
  roughingPasses: number;
  hasFinishingPass: boolean;
  estimatedMinutes: number | null;
}

export function calculateDepthOfCut(input: DepthOfCutInput): DepthOfCutResult {
  const {
    totalDepthIn,
    maxRoughDocIn,
    finishingPassIn = 0,
    feedRateIpm,
    cutLengthIn,
  } = input;

  const passSchedule: PassInfo[] = [];
  const roughingDepth = totalDepthIn - finishingPassIn;

  // Calculate number of roughing passes
  const numRoughing = Math.ceil(roughingDepth / maxRoughDocIn);
  const basePassDepth = roughingDepth / numRoughing;

  let cumulative = 0;
  for (let i = 0; i < numRoughing; i++) {
    // Last roughing pass gets the remainder to hit exact depth
    const isLast = i === numRoughing - 1;
    const passDepth = isLast
      ? Math.round((roughingDepth - cumulative) * 100000) / 100000
      : Math.round(basePassDepth * 100000) / 100000;

    cumulative = Math.round((cumulative + passDepth) * 100000) / 100000;

    passSchedule.push({
      passNumber: i + 1,
      passType: "roughing",
      depthIn: passDepth,
      cumulativeDepthIn: cumulative,
    });
  }

  // Finishing pass
  const hasFinishingPass = finishingPassIn > 0;
  if (hasFinishingPass) {
    cumulative = Math.round((cumulative + finishingPassIn) * 100000) / 100000;
    passSchedule.push({
      passNumber: numRoughing + 1,
      passType: "finishing",
      depthIn: finishingPassIn,
      cumulativeDepthIn: cumulative,
    });
  }

  // Time estimate: each pass traverses cutLengthIn at feedRateIpm
  let estimatedMinutes: number | null = null;
  if (feedRateIpm != null && cutLengthIn != null && feedRateIpm > 0) {
    const timePerPass = cutLengthIn / feedRateIpm;
    estimatedMinutes = Math.round(timePerPass * passSchedule.length * 100) / 100;
  }

  return {
    passSchedule,
    totalPasses: passSchedule.length,
    roughingPasses: numRoughing,
    hasFinishingPass,
    estimatedMinutes,
  };
}
