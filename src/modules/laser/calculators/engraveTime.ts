interface EngraveTimeInput {
  widthMm: number;
  heightMm: number;
  lpi: number;
  speedMms: number;
  bidirectional: boolean;
}

interface EngraveTimeResult {
  lineCount: number;
  totalDistanceMm: number;
  estimatedSeconds: number;
  formattedTime: string;
}

const MAX_RETURN_SPEED_MMS = 500;

export function calculateEngraveTime(input: EngraveTimeInput): EngraveTimeResult {
  const lineCount = Math.ceil(input.heightMm * (input.lpi / 25.4));
  const engraveDistance = lineCount * input.widthMm;
  let totalDistanceMm = engraveDistance;

  if (!input.bidirectional) {
    totalDistanceMm += lineCount * input.widthMm;
  }

  const engraveTime = engraveDistance / input.speedMms;
  const returnTime = input.bidirectional ? 0 : (lineCount * input.widthMm) / MAX_RETURN_SPEED_MMS;
  const estimatedSeconds = Math.round((engraveTime + returnTime) * 10) / 10;

  const mins = Math.floor(estimatedSeconds / 60);
  const secs = Math.round(estimatedSeconds % 60);
  const formattedTime = `${mins}:${secs.toString().padStart(2, "0")}`;

  return { lineCount, totalDistanceMm, estimatedSeconds, formattedTime };
}
