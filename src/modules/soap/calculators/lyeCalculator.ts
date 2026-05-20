import { oilData, type SoapOil } from "../data/oilDatabase";

export interface MathStep {
  label: string;
  formula: string;
  result: number;
  unit: string;
}

export interface OilEntry {
  name: string;
  weightOz: number;
}

export interface LyeCalculatorInput {
  oils: OilEntry[];
  superfattPct: number;
  waterLyeRatio: number;
  soapType: "bar" | "liquid";
}

export interface OilBreakdown {
  name: string;
  weightOz: number;
  lyeRequired: number;
}

export interface FattyAcidProfile {
  hardness: number;
  cleansing: number;
  conditioning: number;
  bubbly: number;
  creamy: number;
}

export interface LyeCalculatorResult {
  lyeWeightOz: number;
  waterWeightOz: number;
  totalBatchWeightOz: number;
  oilBreakdown: OilBreakdown[];
  fattyAcidProfile: FattyAcidProfile;
  warnings: string[];
  mathSteps: MathStep[];
}

function findOil(name: string): SoapOil | undefined {
  return oilData.find(o => o.name.toLowerCase() === name.toLowerCase());
}

export function calculateLye(input: LyeCalculatorInput): LyeCalculatorResult {
  const { oils, superfattPct, waterLyeRatio, soapType } = input;
  const warnings: string[] = [];
  const totalOilWeight = oils.reduce((s, o) => s + o.weightOz, 0);
  const oilBreakdown: OilBreakdown[] = [];
  let totalLyeBeforeSF = 0;
  const profile: FattyAcidProfile = { hardness: 0, cleansing: 0, conditioning: 0, bubbly: 0, creamy: 0 };

  for (const oil of oils) {
    const ref = findOil(oil.name);
    if (!ref) {
      warnings.push(`Oil "${oil.name}" not found in database. Skipped.`);
      continue;
    }
    const sapValue = soapType === "bar" ? ref.sapNaOH : ref.sapKOH;
    const lyeNeeded = oil.weightOz * sapValue;
    totalLyeBeforeSF += lyeNeeded;
    oilBreakdown.push({ name: oil.name, weightOz: oil.weightOz, lyeRequired: Math.round(lyeNeeded * 1000) / 1000 });

    const pct = oil.weightOz / totalOilWeight;
    profile.hardness += ref.hardness * pct;
    profile.cleansing += ref.cleansing * pct;
    profile.conditioning += ref.conditioning * pct;
    profile.bubbly += ref.bubbly * pct;
    profile.creamy += ref.creamy * pct;
  }

  const lyeWeightOz = totalLyeBeforeSF * (1 - superfattPct / 100);
  const waterWeightOz = lyeWeightOz * waterLyeRatio;
  const totalBatchWeightOz = totalOilWeight + lyeWeightOz + waterWeightOz;

  if (profile.hardness < 29) warnings.push("Low hardness. Consider adding coconut or palm oil.");
  if (superfattPct > 10) warnings.push("Superfat > 10%. Bar may be soft or rancid over time.");

  profile.hardness = Math.round(profile.hardness);
  profile.cleansing = Math.round(profile.cleansing);
  profile.conditioning = Math.round(profile.conditioning);
  profile.bubbly = Math.round(profile.bubbly);
  profile.creamy = Math.round(profile.creamy);

  const mathSteps: MathStep[] = [
    { label: "Total Oil Weight", formula: `Σ oil weights`, result: Math.round(totalOilWeight * 100) / 100, unit: "oz" },
    { label: "Lye (before superfat)", formula: `Σ(oil × SAP)`, result: Math.round(totalLyeBeforeSF * 1000) / 1000, unit: "oz" },
    { label: "Superfat Reduction", formula: `× (1 - ${superfattPct}/100)`, result: Math.round(lyeWeightOz * 1000) / 1000, unit: "oz" },
    { label: "Water", formula: `lye × ${waterLyeRatio}`, result: Math.round(waterWeightOz * 100) / 100, unit: "oz" },
    { label: "Total Batch", formula: `oils + lye + water`, result: Math.round(totalBatchWeightOz * 100) / 100, unit: "oz" },
  ];

  return { lyeWeightOz, waterWeightOz, totalBatchWeightOz, oilBreakdown, fattyAcidProfile: profile, warnings, mathSteps };
}
