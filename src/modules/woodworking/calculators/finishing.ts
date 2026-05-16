interface CoverageInput {
  areaSqFt: number;
  coverageRatePerUnit: number; // sq ft per unit (quart, gallon, etc.)
  coats: number;
  wasteFactor?: number; // e.g. 1.1 for 10% waste, default 1.0
}

interface CoverageResult {
  volumeNeeded: number;
  volumePerCoat: number;
  totalWithWaste: number;
}

export function calculateCoverage(input: CoverageInput): CoverageResult {
  const waste = input.wasteFactor ?? 1.0;
  const volumePerCoat = input.areaSqFt / input.coverageRatePerUnit;
  const volumeNeeded = volumePerCoat * input.coats;
  const totalWithWaste = volumeNeeded * waste;

  return {
    volumePerCoat: Math.round(volumePerCoat * 1000) / 1000,
    volumeNeeded: Math.round(volumeNeeded * 1000) / 1000,
    totalWithWaste: Math.round(totalWithWaste * 1000) / 1000,
  };
}

interface ShellacInput {
  poundCut: number; // e.g. 2 for 2-lb cut
  alcoholOz: number; // fluid ounces of alcohol
}

interface ShellacResult {
  flakeOz: number; // weight in ounces of shellac flakes
  flakeLbs: number;
}

export function calculateShellacRatio(input: ShellacInput): ShellacResult {
  const flakeOz = (input.poundCut * input.alcoholOz) / 16;
  return {
    flakeOz: Math.round(flakeOz * 1000) / 1000,
    flakeLbs: Math.round((flakeOz / 16) * 1000) / 1000,
  };
}

interface DryTimeInput {
  baseTimeMinutes: number;
  temperatureF: number;
  humidityPercent: number;
}

interface DryTimeResult {
  adjustedTimeMinutes: number;
  tempMultiplier: number;
  humidityMultiplier: number;
}

export function calculateDryTime(input: DryTimeInput): DryTimeResult {
  // Temperature: baseline 70F. Below 70 slows, above 70 speeds up.
  // Rough model: every 10F below 70 adds 50% time, every 10F above 70 reduces 25%
  let tempMultiplier: number;
  if (input.temperatureF < 70) {
    const degBelow = 70 - input.temperatureF;
    tempMultiplier = 1 + (degBelow / 10) * 0.5;
  } else {
    const degAbove = input.temperatureF - 70;
    tempMultiplier = Math.max(0.25, 1 - (degAbove / 10) * 0.25);
  }

  // Humidity: baseline 50%. Above 50 slows, below 50 speeds up.
  let humidityMultiplier: number;
  if (input.humidityPercent > 50) {
    const pctAbove = input.humidityPercent - 50;
    humidityMultiplier = 1 + (pctAbove / 50) * 1.0;
  } else {
    const pctBelow = 50 - input.humidityPercent;
    humidityMultiplier = Math.max(0.5, 1 - (pctBelow / 50) * 0.5);
  }

  const adjustedTimeMinutes = input.baseTimeMinutes * tempMultiplier * humidityMultiplier;

  return {
    adjustedTimeMinutes: Math.round(adjustedTimeMinutes * 100) / 100,
    tempMultiplier: Math.round(tempMultiplier * 1000) / 1000,
    humidityMultiplier: Math.round(humidityMultiplier * 1000) / 1000,
  };
}
