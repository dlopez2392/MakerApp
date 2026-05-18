export interface MathStep {
  label: string;
  formula: string;
  result: number;
  unit: string;
}

export interface PrintTimeInput {
  xMm: number;
  yMm: number;
  zMm: number;
  layerHeight: number;
  infillPct: number;
  wallCount: number;
  printSpeedMms: number;
  travelSpeedMms: number;
  nozzleDiameter: number;
}

export interface PrintTimeResult {
  estimatedMinutes: number;
  layerCount: number;
  totalExtrusionMm: number;
  mathSteps: MathStep[];
}

export function calculatePrintTime(input: PrintTimeInput): PrintTimeResult {
  const {
    xMm,
    yMm,
    zMm,
    layerHeight,
    infillPct,
    wallCount,
    printSpeedMms,
    travelSpeedMms,
    nozzleDiameter,
  } = input;

  const lineWidth = nozzleDiameter * 1.2;

  // Layer count
  const layerCount = Math.ceil(zMm / layerHeight);

  // Per-layer extrusion
  const perimeterPerLayer = 2 * (xMm + yMm) * wallCount;
  const infillLinesPerLayer = (xMm * yMm * (infillPct / 100)) / lineWidth;

  // Solid layers: 3 bottom + 3 top (capped at layerCount)
  const solidLayerCount = Math.min(6, layerCount);
  const normalLayerCount = Math.max(0, layerCount - solidLayerCount);

  // Solid layers use 100% infill
  const solidInfillPerLayer = (xMm * yMm) / lineWidth;

  const totalExtrusion =
    perimeterPerLayer * layerCount +
    infillLinesPerLayer * normalLayerCount +
    solidInfillPerLayer * solidLayerCount;

  // Time estimate
  const extrusionTimeSec = totalExtrusion / printSpeedMms;
  // Travel: assume ~20% of extrusion distance is travel
  const travelDistMm = totalExtrusion * 0.2;
  const travelTimeSec = travelDistMm / travelSpeedMms;
  // Layer overhead: 1.5s per layer change
  const overheadSec = layerCount * 1.5;

  const totalSec = extrusionTimeSec + travelTimeSec + overheadSec;
  const estimatedMinutes = totalSec / 60;

  const mathSteps: MathStep[] = [
    {
      label: "Line Width",
      formula: `nozzleDiameter × 1.2 = ${nozzleDiameter} × 1.2`,
      result: Math.round(lineWidth * 1000) / 1000,
      unit: "mm",
    },
    {
      label: "Layer Count",
      formula: `ceil(zMm / layerHeight) = ceil(${zMm} / ${layerHeight})`,
      result: layerCount,
      unit: "layers",
    },
    {
      label: "Perimeter Extrusion per Layer",
      formula: `2 × (x + y) × walls = 2 × (${xMm} + ${yMm}) × ${wallCount}`,
      result: Math.round(perimeterPerLayer * 100) / 100,
      unit: "mm",
    },
    {
      label: "Infill Extrusion per Layer",
      formula: `(x × y × infill%) / lineWidth = (${xMm} × ${yMm} × ${infillPct / 100}) / ${Math.round(lineWidth * 1000) / 1000}`,
      result: Math.round(infillLinesPerLayer * 100) / 100,
      unit: "mm",
    },
    {
      label: "Total Extrusion",
      formula: `perimeter×layers + infill×normalLayers + solidInfill×solidLayers`,
      result: Math.round(totalExtrusion * 100) / 100,
      unit: "mm",
    },
    {
      label: "Estimated Print Time",
      formula: `(extrusion / printSpeed + travel / travelSpeed + overhead) / 60`,
      result: Math.round(estimatedMinutes * 100) / 100,
      unit: "min",
    },
  ];

  return {
    estimatedMinutes,
    layerCount,
    totalExtrusionMm: totalExtrusion,
    mathSteps,
  };
}
