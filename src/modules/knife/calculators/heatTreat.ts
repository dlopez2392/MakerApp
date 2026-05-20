export interface MathStep {
  label: string;
  formula: string;
  result: number;
  unit: string;
}

export interface HeatTreatInput {
  steelName: string;
}

export interface HeatTreatResult {
  normalizeTempF: number | null;
  normalizeCycles: number;
  hardenTempF: number;
  soakMinutes: number;
  quenchMedium: string;
  temperLowF: number;
  temperHighF: number;
  expectedRockwellLow: number;
  expectedRockwellHigh: number;
  mathSteps: MathStep[];
}

const STEEL_LOOKUP: Record<string, Omit<HeatTreatResult, "mathSteps">> = {
  "1095": { normalizeTempF: 1600, normalizeCycles: 3, hardenTempF: 1475, soakMinutes: 5, quenchMedium: "oil", temperLowF: 350, temperHighF: 450, expectedRockwellLow: 57, expectedRockwellHigh: 60 },
  "1084": { normalizeTempF: 1600, normalizeCycles: 3, hardenTempF: 1475, soakMinutes: 5, quenchMedium: "oil", temperLowF: 350, temperHighF: 450, expectedRockwellLow: 58, expectedRockwellHigh: 62 },
  "1080": { normalizeTempF: 1600, normalizeCycles: 3, hardenTempF: 1475, soakMinutes: 5, quenchMedium: "oil", temperLowF: 350, temperHighF: 450, expectedRockwellLow: 56, expectedRockwellHigh: 60 },
  "O1": { normalizeTempF: 1550, normalizeCycles: 2, hardenTempF: 1475, soakMinutes: 10, quenchMedium: "oil", temperLowF: 300, temperHighF: 400, expectedRockwellLow: 60, expectedRockwellHigh: 64 },
  "W2": { normalizeTempF: 1600, normalizeCycles: 3, hardenTempF: 1475, soakMinutes: 5, quenchMedium: "water", temperLowF: 350, temperHighF: 450, expectedRockwellLow: 62, expectedRockwellHigh: 65 },
  "5160": { normalizeTempF: 1650, normalizeCycles: 3, hardenTempF: 1525, soakMinutes: 10, quenchMedium: "oil", temperLowF: 375, temperHighF: 450, expectedRockwellLow: 56, expectedRockwellHigh: 60 },
  "80CrV2": { normalizeTempF: 1600, normalizeCycles: 3, hardenTempF: 1500, soakMinutes: 8, quenchMedium: "oil", temperLowF: 350, temperHighF: 425, expectedRockwellLow: 58, expectedRockwellHigh: 62 },
  "D2": { normalizeTempF: null, normalizeCycles: 0, hardenTempF: 1850, soakMinutes: 30, quenchMedium: "air", temperLowF: 400, temperHighF: 500, expectedRockwellLow: 59, expectedRockwellHigh: 62 },
  "A2": { normalizeTempF: null, normalizeCycles: 0, hardenTempF: 1775, soakMinutes: 20, quenchMedium: "air", temperLowF: 350, temperHighF: 450, expectedRockwellLow: 60, expectedRockwellHigh: 63 },
  "M2": { normalizeTempF: null, normalizeCycles: 0, hardenTempF: 2200, soakMinutes: 5, quenchMedium: "air", temperLowF: 1000, temperHighF: 1050, expectedRockwellLow: 63, expectedRockwellHigh: 66 },
  "S30V": { normalizeTempF: null, normalizeCycles: 0, hardenTempF: 1900, soakMinutes: 20, quenchMedium: "plate", temperLowF: 350, temperHighF: 500, expectedRockwellLow: 58, expectedRockwellHigh: 61 },
  "S35VN": { normalizeTempF: null, normalizeCycles: 0, hardenTempF: 1900, soakMinutes: 20, quenchMedium: "plate", temperLowF: 350, temperHighF: 500, expectedRockwellLow: 58, expectedRockwellHigh: 61 },
  "440C": { normalizeTempF: null, normalizeCycles: 0, hardenTempF: 1875, soakMinutes: 30, quenchMedium: "air", temperLowF: 300, temperHighF: 450, expectedRockwellLow: 57, expectedRockwellHigh: 60 },
  "AEB-L": { normalizeTempF: null, normalizeCycles: 0, hardenTempF: 1975, soakMinutes: 15, quenchMedium: "plate", temperLowF: 300, temperHighF: 400, expectedRockwellLow: 60, expectedRockwellHigh: 63 },
  "154CM": { normalizeTempF: null, normalizeCycles: 0, hardenTempF: 1900, soakMinutes: 20, quenchMedium: "plate", temperLowF: 350, temperHighF: 500, expectedRockwellLow: 58, expectedRockwellHigh: 61 },
};

export function calculateHeatTreat(input: HeatTreatInput): HeatTreatResult {
  const s = STEEL_LOOKUP[input.steelName];
  if (!s) throw new Error(`Steel "${input.steelName}" not found`);

  const mathSteps: MathStep[] = [
    { label: "Normalize", formula: s.normalizeTempF ? `${s.normalizeCycles} cycles at ${s.normalizeTempF}°F` : "Not required", result: s.normalizeTempF ?? 0, unit: "°F" },
    { label: "Harden", formula: `Heat to ${s.hardenTempF}°F, soak ${s.soakMinutes} min, quench in ${s.quenchMedium}`, result: s.hardenTempF, unit: "°F" },
    { label: "Temper Low", formula: `Minimum temper temperature`, result: s.temperLowF, unit: "°F" },
    { label: "Temper High", formula: `Maximum temper temperature`, result: s.temperHighF, unit: "°F" },
    { label: "Expected HRC Low", formula: `Minimum expected Rockwell C hardness`, result: s.expectedRockwellLow, unit: "HRC" },
    { label: "Expected HRC High", formula: `Maximum expected Rockwell C hardness`, result: s.expectedRockwellHigh, unit: "HRC" },
  ];

  return { ...s, mathSteps };
}
