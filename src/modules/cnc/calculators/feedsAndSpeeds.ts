export type CutType = "pocket" | "slot" | "profile";

export interface FeedsAndSpeedsInput {
  sfm: number;
  toolDiameterIn: number;
  chiploadIn: number;
  flutes: number;
  cutType: CutType;
  routerMinRpm?: number;
  routerMaxRpm?: number;
}

export interface MathStep {
  label: string;
  formula: string;
  result: number;
  unit: string;
}

export interface FeedsAndSpeedsResult {
  rpm: number;
  feedRateIpm: number;
  plungeRateIpm: number;
  wocIn: number;
  wocPct: number;
  mathSteps: MathStep[];
  warnings: string[];
}

export function calculateFeedsAndSpeeds(input: FeedsAndSpeedsInput): FeedsAndSpeedsResult {
  const {
    sfm,
    toolDiameterIn,
    chiploadIn,
    flutes,
    cutType,
    routerMinRpm = 10000,
    routerMaxRpm = 30000,
  } = input;

  const warnings: string[] = [];

  // RPM = (SFM × 3.82) / diameter
  const rawRpm = (sfm * 3.82) / toolDiameterIn;
  const rpm = Math.round(Math.min(routerMaxRpm, Math.max(routerMinRpm, rawRpm)));

  if (rawRpm < routerMinRpm) {
    warnings.push(
      `Calculated RPM (${Math.round(rawRpm)}) is below router minimum (${routerMinRpm}). Using ${routerMinRpm} RPM — feed rate adjusted but chipload may be too light.`,
    );
  }

  // Feed = RPM × chipload × flutes
  const feedRateIpm = Math.round(rpm * chiploadIn * flutes * 10) / 10;

  // Plunge = 50% of feed
  const plungeRateIpm = Math.round(feedRateIpm * 0.5 * 10) / 10;

  // WOC based on cut type
  const wocPct = cutType === "pocket" ? 40 : 100;
  const wocIn = Math.round(toolDiameterIn * (wocPct / 100) * 10000) / 10000;

  const mathSteps: MathStep[] = [
    {
      label: "Spindle Speed (RPM)",
      formula: `(SFM × 3.82) / diameter = (${sfm} × 3.82) / ${toolDiameterIn}`,
      result: rpm,
      unit: "RPM",
    },
    {
      label: "Feed Rate",
      formula: `RPM × chipload × flutes = ${rpm} × ${chiploadIn} × ${flutes}`,
      result: feedRateIpm,
      unit: "IPM",
    },
    {
      label: "Plunge Rate",
      formula: `Feed × 0.5 = ${feedRateIpm} × 0.5`,
      result: plungeRateIpm,
      unit: "IPM",
    },
    {
      label: "Width of Cut (WOC)",
      formula: `${cutType === "pocket" ? "Pocket: 40%" : "Slot/Profile: 100%"} × diameter = ${wocPct}% × ${toolDiameterIn}`,
      result: wocIn,
      unit: "in",
    },
  ];

  return { rpm, feedRateIpm, plungeRateIpm, wocIn, wocPct, mathSteps, warnings };
}
