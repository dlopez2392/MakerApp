import type { MathStep } from "./leatherArea";

export interface ThreadStitchInput {
  seamLengthIn: number;
  stitchesPerInch: number;
  leatherThicknessMm: number;
  threadPasses: 1 | 2;
}

export interface ThreadStitchResult {
  threadLengthIn: number;
  threadLengthFt: number;
  needleSizeRec: string;
  mathSteps: MathStep[];
}

export function calculateThreadStitch(input: ThreadStitchInput): ThreadStitchResult {
  const { seamLengthIn, stitchesPerInch, leatherThicknessMm, threadPasses } = input;
  const stitchCount = seamLengthIn * stitchesPerInch;
  const thicknessIn = leatherThicknessMm / 25.4;
  const threadPerStitch = (thicknessIn * 2.5) * threadPasses + 0.1;
  const totalThreadIn = stitchCount * threadPerStitch * 1.15;
  const totalThreadFt = totalThreadIn / 12;

  let needleSizeRec: string;
  if (leatherThicknessMm < 2) needleSizeRec = "#0";
  else if (leatherThicknessMm < 4) needleSizeRec = "#2";
  else needleSizeRec = "#4";

  const mathSteps: MathStep[] = [
    { label: "Stitch Count", formula: `seamLength × SPI = ${seamLengthIn} × ${stitchesPerInch}`, result: stitchCount, unit: "stitches" },
    { label: "Thread Per Stitch", formula: `(thickness × 2.5) × passes + spacing`, result: Math.round(threadPerStitch * 1000) / 1000, unit: "in" },
    { label: "Total Thread (with 15% waste)", formula: `${stitchCount} × ${Math.round(threadPerStitch * 1000) / 1000} × 1.15`, result: Math.round(totalThreadIn * 100) / 100, unit: "in" },
    { label: "Total Thread", formula: `${Math.round(totalThreadIn * 100) / 100} / 12`, result: Math.round(totalThreadFt * 100) / 100, unit: "ft" },
  ];

  return { threadLengthIn: totalThreadIn, threadLengthFt: totalThreadFt, needleSizeRec, mathSteps };
}
