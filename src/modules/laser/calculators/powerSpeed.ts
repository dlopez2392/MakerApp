export type LaserOperationType = "cut" | "engrave" | "score";

interface PowerSpeedInput {
  powerPctBase: number;
  speedMmsBase: number;
  passesBase: number;
  baseWattage: number;
  targetWattage: number;
  thicknessMm: number;
  operation: LaserOperationType;
}

interface PowerSpeedResult {
  powerPct: number;
  speedMms: number;
  passes: number;
  powerRange: { min: number; max: number };
  speedRange: { min: number; max: number };
}

export function calculatePowerSpeed(input: PowerSpeedInput): PowerSpeedResult {
  const wattageRatio = input.baseWattage / input.targetWattage;

  let powerPct = Math.round(input.powerPctBase * wattageRatio);
  let speedMms = Math.round((input.speedMmsBase / wattageRatio) * 10) / 10;
  let passes = input.passesBase;

  powerPct = Math.min(100, Math.max(1, powerPct));
  speedMms = Math.max(0.5, speedMms);

  const powerRange = {
    min: Math.max(1, Math.round(powerPct * 0.85)),
    max: Math.min(100, Math.round(powerPct * 1.15)),
  };
  const speedRange = {
    min: Math.round(speedMms * 0.8 * 10) / 10,
    max: Math.round(speedMms * 1.2 * 10) / 10,
  };

  return { powerPct, speedMms, passes, powerRange, speedRange };
}
