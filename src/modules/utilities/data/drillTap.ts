export interface DrillTapEntry {
  size: string;
  threadsPerInch?: number;
  pitch?: number; // mm for metric
  tapDrill: string;
  tapDrillDecimal: number;
  clearanceDrill: string;
  clearanceDrillDecimal: number;
}

export const imperialTapDrills: DrillTapEntry[] = [
  { size: "#0-80", threadsPerInch: 80, tapDrill: "3/64", tapDrillDecimal: 0.0469, clearanceDrill: "#51", clearanceDrillDecimal: 0.067 },
  { size: "#1-64", threadsPerInch: 64, tapDrill: "#53", tapDrillDecimal: 0.0595, clearanceDrill: "#47", clearanceDrillDecimal: 0.0785 },
  { size: "#1-72", threadsPerInch: 72, tapDrill: "#53", tapDrillDecimal: 0.0595, clearanceDrill: "#47", clearanceDrillDecimal: 0.0785 },
  { size: "#2-56", threadsPerInch: 56, tapDrill: "#50", tapDrillDecimal: 0.07, clearanceDrill: "#42", clearanceDrillDecimal: 0.0935 },
  { size: "#2-64", threadsPerInch: 64, tapDrill: "#50", tapDrillDecimal: 0.07, clearanceDrill: "#42", clearanceDrillDecimal: 0.0935 },
  { size: "#3-48", threadsPerInch: 48, tapDrill: "#47", tapDrillDecimal: 0.0785, clearanceDrill: "#36", clearanceDrillDecimal: 0.1065 },
  { size: "#4-40", threadsPerInch: 40, tapDrill: "#43", tapDrillDecimal: 0.089, clearanceDrill: "#31", clearanceDrillDecimal: 0.12 },
  { size: "#5-40", threadsPerInch: 40, tapDrill: "#38", tapDrillDecimal: 0.1015, clearanceDrill: "#29", clearanceDrillDecimal: 0.136 },
  { size: "#6-32", threadsPerInch: 32, tapDrill: "#36", tapDrillDecimal: 0.1065, clearanceDrill: "#25", clearanceDrillDecimal: 0.1495 },
  { size: "#8-32", threadsPerInch: 32, tapDrill: "#29", tapDrillDecimal: 0.136, clearanceDrill: "#18", clearanceDrillDecimal: 0.1695 },
  { size: "#10-24", threadsPerInch: 24, tapDrill: "#25", tapDrillDecimal: 0.1495, clearanceDrill: "#9", clearanceDrillDecimal: 0.196 },
  { size: "#10-32", threadsPerInch: 32, tapDrill: "#21", tapDrillDecimal: 0.159, clearanceDrill: "#9", clearanceDrillDecimal: 0.196 },
  { size: "#12-24", threadsPerInch: 24, tapDrill: "#16", tapDrillDecimal: 0.177, clearanceDrill: "#2", clearanceDrillDecimal: 0.221 },
  { size: "1/4\"-20", threadsPerInch: 20, tapDrill: "#7", tapDrillDecimal: 0.201, clearanceDrill: "17/64", clearanceDrillDecimal: 0.2656 },
  { size: "1/4\"-28", threadsPerInch: 28, tapDrill: "#3", tapDrillDecimal: 0.213, clearanceDrill: "17/64", clearanceDrillDecimal: 0.2656 },
  { size: "5/16\"-18", threadsPerInch: 18, tapDrill: "F", tapDrillDecimal: 0.257, clearanceDrill: "21/64", clearanceDrillDecimal: 0.3281 },
  { size: "5/16\"-24", threadsPerInch: 24, tapDrill: "I", tapDrillDecimal: 0.272, clearanceDrill: "21/64", clearanceDrillDecimal: 0.3281 },
  { size: "3/8\"-16", threadsPerInch: 16, tapDrill: "5/16", tapDrillDecimal: 0.3125, clearanceDrill: "25/64", clearanceDrillDecimal: 0.3906 },
  { size: "3/8\"-24", threadsPerInch: 24, tapDrill: "Q", tapDrillDecimal: 0.332, clearanceDrill: "25/64", clearanceDrillDecimal: 0.3906 },
  { size: "7/16\"-14", threadsPerInch: 14, tapDrill: "U", tapDrillDecimal: 0.368, clearanceDrill: "29/64", clearanceDrillDecimal: 0.4531 },
  { size: "1/2\"-13", threadsPerInch: 13, tapDrill: "27/64", tapDrillDecimal: 0.4219, clearanceDrill: "33/64", clearanceDrillDecimal: 0.5156 },
];

export const metricTapDrills: DrillTapEntry[] = [
  { size: "M1", pitch: 0.25, tapDrill: "0.75mm", tapDrillDecimal: 0.75, clearanceDrill: "1.1mm", clearanceDrillDecimal: 1.1 },
  { size: "M1.6", pitch: 0.35, tapDrill: "1.25mm", tapDrillDecimal: 1.25, clearanceDrill: "1.7mm", clearanceDrillDecimal: 1.7 },
  { size: "M2", pitch: 0.4, tapDrill: "1.6mm", tapDrillDecimal: 1.6, clearanceDrill: "2.2mm", clearanceDrillDecimal: 2.2 },
  { size: "M2.5", pitch: 0.45, tapDrill: "2.05mm", tapDrillDecimal: 2.05, clearanceDrill: "2.7mm", clearanceDrillDecimal: 2.7 },
  { size: "M3", pitch: 0.5, tapDrill: "2.5mm", tapDrillDecimal: 2.5, clearanceDrill: "3.2mm", clearanceDrillDecimal: 3.2 },
  { size: "M4", pitch: 0.7, tapDrill: "3.3mm", tapDrillDecimal: 3.3, clearanceDrill: "4.3mm", clearanceDrillDecimal: 4.3 },
  { size: "M5", pitch: 0.8, tapDrill: "4.2mm", tapDrillDecimal: 4.2, clearanceDrill: "5.3mm", clearanceDrillDecimal: 5.3 },
  { size: "M6", pitch: 1.0, tapDrill: "5.0mm", tapDrillDecimal: 5.0, clearanceDrill: "6.4mm", clearanceDrillDecimal: 6.4 },
  { size: "M7", pitch: 1.0, tapDrill: "6.0mm", tapDrillDecimal: 6.0, clearanceDrill: "7.4mm", clearanceDrillDecimal: 7.4 },
  { size: "M8", pitch: 1.25, tapDrill: "6.8mm", tapDrillDecimal: 6.8, clearanceDrill: "8.4mm", clearanceDrillDecimal: 8.4 },
  { size: "M9", pitch: 1.25, tapDrill: "7.75mm", tapDrillDecimal: 7.75, clearanceDrill: "9.5mm", clearanceDrillDecimal: 9.5 },
  { size: "M10", pitch: 1.5, tapDrill: "8.5mm", tapDrillDecimal: 8.5, clearanceDrill: "10.5mm", clearanceDrillDecimal: 10.5 },
  { size: "M12", pitch: 1.75, tapDrill: "10.2mm", tapDrillDecimal: 10.2, clearanceDrill: "13.0mm", clearanceDrillDecimal: 13.0 },
  { size: "M14", pitch: 2.0, tapDrill: "12.0mm", tapDrillDecimal: 12.0, clearanceDrill: "15.0mm", clearanceDrillDecimal: 15.0 },
  { size: "M16", pitch: 2.0, tapDrill: "14.0mm", tapDrillDecimal: 14.0, clearanceDrill: "17.0mm", clearanceDrillDecimal: 17.0 },
];

export function findDrillTap(query: string): DrillTapEntry[] {
  const q = query.toLowerCase().trim();
  const allEntries = [...imperialTapDrills, ...metricTapDrills];
  return allEntries.filter((entry) => entry.size.toLowerCase().includes(q));
}
