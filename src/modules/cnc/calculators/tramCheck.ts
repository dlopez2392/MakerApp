export interface TramReadings {
  /** Indicator reading at front of spindle in inches (positive = high) */
  frontIn: number;
  /** Indicator reading at back of spindle in inches */
  backIn: number;
  /** Indicator reading at left of spindle in inches */
  leftIn: number;
  /** Indicator reading at right of spindle in inches */
  rightIn: number;
}

export interface TramAxis {
  /** Difference in thousandths of an inch (front - back or left - right) */
  tiltThousandths: number;
  /** Direction the spindle is tilted ("level", "front-high", "back-high", "left-high", "right-high") */
  direction: string;
  /** Whether this axis is within tolerance */
  inTolerance: boolean;
  /** Adjustment instructions */
  adjustmentInstruction: string;
}

export interface TramCheckResult {
  frontBack: TramAxis;
  leftRight: TramAxis;
  /** Overall tram status */
  isPerfect: boolean;
  /** Summary of adjustments needed */
  summary: string;
}

const TOLERANCE_THOUSANDTHS = 0.5; // 0.0005"

export function calculateTramCheck(readings: TramReadings): TramCheckResult {
  // Front-back tilt: positive means front is higher than back
  const fbDiff = readings.frontIn - readings.backIn;
  const fbThousandths = Math.round(fbDiff * 10000) / 10; // convert to thousandths

  // Left-right tilt: positive means left is higher than right
  const lrDiff = readings.leftIn - readings.rightIn;
  const lrThousandths = Math.round(lrDiff * 10000) / 10;

  const fbInTolerance = Math.abs(fbThousandths) <= TOLERANCE_THOUSANDTHS;
  const lrInTolerance = Math.abs(lrThousandths) <= TOLERANCE_THOUSANDTHS;

  const frontBack: TramAxis = {
    tiltThousandths: fbThousandths,
    direction: getFBDirection(fbThousandths),
    inTolerance: fbInTolerance,
    adjustmentInstruction: getFBInstruction(fbThousandths, fbInTolerance),
  };

  const leftRight: TramAxis = {
    tiltThousandths: lrThousandths,
    direction: getLRDirection(lrThousandths),
    inTolerance: lrInTolerance,
    adjustmentInstruction: getLRInstruction(lrThousandths, lrInTolerance),
  };

  const isPerfect = fbInTolerance && lrInTolerance;

  const summary = isPerfect
    ? "Router is trammed. No adjustment needed."
    : buildSummary(frontBack, leftRight);

  return { frontBack, leftRight, isPerfect, summary };
}

function getFBDirection(thousandths: number): string {
  if (Math.abs(thousandths) <= TOLERANCE_THOUSANDTHS) return "level";
  return thousandths > 0 ? "front-high" : "back-high";
}

function getLRDirection(thousandths: number): string {
  if (Math.abs(thousandths) <= TOLERANCE_THOUSANDTHS) return "level";
  return thousandths > 0 ? "left-high" : "right-high";
}

function getFBInstruction(thousandths: number, inTolerance: boolean): string {
  if (inTolerance) return "Front-back axis is level. No adjustment needed.";
  const abs = Math.abs(thousandths);
  const direction = thousandths > 0 ? "front" : "back";
  return `Tilt is ${abs} thou (${direction}-high). Lower the ${direction} of the gantry or shim the ${direction}-opposite side to level.`;
}

function getLRInstruction(thousandths: number, inTolerance: boolean): string {
  if (inTolerance) return "Left-right axis is level. No adjustment needed.";
  const abs = Math.abs(thousandths);
  const direction = thousandths > 0 ? "left" : "right";
  return `Tilt is ${abs} thou (${direction}-high). Adjust the ${direction}-opposite Y-axis eccentric or shim to level.`;
}

function buildSummary(fb: TramAxis, lr: TramAxis): string {
  const parts: string[] = [];
  if (!fb.inTolerance) parts.push(`F/B: ${fb.direction} by ${Math.abs(fb.tiltThousandths)} thou`);
  if (!lr.inTolerance) parts.push(`L/R: ${lr.direction} by ${Math.abs(lr.tiltThousandths)} thou`);
  return `Out of tram — ${parts.join(", ")}. Adjust and re-measure.`;
}
