import { MathStep } from "./printTime";

export interface FilamentUsageInput {
  xMm: number;
  yMm: number;
  zMm: number;
  infillPct: number;
  wallCount: number;
  layerHeight: number;
  nozzleDiameter: number;
  filamentDensity: number; // g/cm³
  filamentCostPerKg: number | null;
  filamentDiameter: number; // mm (1.75 or 2.85)
}

export interface FilamentUsageResult {
  volumeCm3: number;
  weightG: number;
  filamentLengthM: number;
  estimatedCost: number | null;
  mathSteps: MathStep[];
}

export function calculateFilamentUsage(input: FilamentUsageInput): FilamentUsageResult {
  const {
    xMm,
    yMm,
    zMm,
    infillPct,
    wallCount,
    layerHeight,
    nozzleDiameter,
    filamentDensity,
    filamentCostPerKg,
    filamentDiameter,
  } = input;

  const lineWidth = nozzleDiameter * 1.2;
  const layerCount = Math.ceil(zMm / layerHeight);

  // Per-layer extrusion (same as print time)
  const perimeterPerLayer = 2 * (xMm + yMm) * wallCount;
  const infillLinesPerLayer = (xMm * yMm * (infillPct / 100)) / lineWidth;
  const solidLayerCount = Math.min(6, layerCount);
  const normalLayerCount = Math.max(0, layerCount - solidLayerCount);
  const solidInfillPerLayer = (xMm * yMm) / lineWidth;

  const totalExtrusionMm =
    perimeterPerLayer * layerCount +
    infillLinesPerLayer * normalLayerCount +
    solidInfillPerLayer * solidLayerCount;

  // Volume = extrusion length × bead cross-section area
  // Bead area = lineWidth × layerHeight (rectangular approximation)
  const beadAreaMm2 = lineWidth * layerHeight;
  const volumeMm3 = totalExtrusionMm * beadAreaMm2;
  const volumeCm3 = volumeMm3 / 1000;

  // Weight
  const weightG = volumeCm3 * filamentDensity;

  // Filament length from weight
  // crossSection of filament rod = π × (d/2)²
  const filamentRadiusMm = filamentDiameter / 2;
  const filamentCrossSectionMm2 = Math.PI * filamentRadiusMm * filamentRadiusMm;
  // volume of filament used = weightG / density (in cm³) → mm³
  const filamentVolumeMm3 = (weightG / filamentDensity) * 1000;
  const filamentLengthMm = filamentVolumeMm3 / filamentCrossSectionMm2;
  const filamentLengthM = filamentLengthMm / 1000;

  // Cost
  const estimatedCost =
    filamentCostPerKg !== null ? (weightG / 1000) * filamentCostPerKg : null;

  const mathSteps: MathStep[] = [
    {
      label: "Line Width",
      formula: `nozzleDiameter × 1.2 = ${nozzleDiameter} × 1.2`,
      result: Math.round(lineWidth * 1000) / 1000,
      unit: "mm",
    },
    {
      label: "Total Extrusion",
      formula: "perimeter×layers + infill×normalLayers + solidInfill×solidLayers",
      result: Math.round(totalExtrusionMm * 100) / 100,
      unit: "mm",
    },
    {
      label: "Bead Cross-Section Area",
      formula: `lineWidth × layerHeight = ${Math.round(lineWidth * 1000) / 1000} × ${layerHeight}`,
      result: Math.round(beadAreaMm2 * 10000) / 10000,
      unit: "mm²",
    },
    {
      label: "Volume",
      formula: `totalExtrusion × beadArea / 1000 = ${Math.round(totalExtrusionMm)} × ${Math.round(beadAreaMm2 * 10000) / 10000} / 1000`,
      result: Math.round(volumeCm3 * 1000) / 1000,
      unit: "cm³",
    },
    {
      label: "Weight",
      formula: `volume × density = ${Math.round(volumeCm3 * 1000) / 1000} × ${filamentDensity}`,
      result: Math.round(weightG * 100) / 100,
      unit: "g",
    },
    {
      label: "Filament Length",
      formula: `weight / (crossSection × density × 1000) = ...`,
      result: Math.round(filamentLengthM * 100) / 100,
      unit: "m",
    },
    ...(estimatedCost !== null
      ? [
          {
            label: "Estimated Cost",
            formula: `weight / 1000 × costPerKg = ${Math.round(weightG * 100) / 100} / 1000 × ${filamentCostPerKg}`,
            result: Math.round(estimatedCost * 100) / 100,
            unit: "$",
          },
        ]
      : []),
  ];

  return {
    volumeCm3,
    weightG,
    filamentLengthM,
    estimatedCost,
    mathSteps,
  };
}
