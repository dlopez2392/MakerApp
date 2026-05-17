export type FocusOperation = "cut" | "engrave" | "defocused-engrave";

interface FocusOffsetInput {
  thicknessMm: number;
  focalLengthMm?: number;
  operation: FocusOperation;
  defocusAmountMm?: number;
}

interface FocusOffsetResult {
  zOffsetMm: number;
  focalLengthMm: number;
  description: string;
}

export function calculateFocusOffset(input: FocusOffsetInput): FocusOffsetResult {
  const focalLengthMm = input.focalLengthMm ?? 50.8;
  let zOffsetMm: number;
  let description: string;

  switch (input.operation) {
    case "cut":
      zOffsetMm = -(input.thicknessMm / 2);
      description = `Focus ${Math.abs(zOffsetMm)}mm below surface (material midpoint)`;
      break;
    case "engrave":
      zOffsetMm = 0;
      description = "Focus on material surface";
      break;
    case "defocused-engrave": {
      const amount = input.defocusAmountMm ?? 1;
      zOffsetMm = amount;
      description = `Focus ${amount}mm above surface for wider, softer engrave line`;
      break;
    }
  }

  return {
    zOffsetMm: Math.round(zOffsetMm * 100) / 100,
    focalLengthMm,
    description,
  };
}
