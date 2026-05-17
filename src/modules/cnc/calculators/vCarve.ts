export interface VCarveInput {
  /** Width of the groove/letter at the surface in inches */
  grooveWidthIn: number;
  /** Full included angle of the V-bit in degrees (e.g., 90) */
  vbitAngleDeg: number;
  /** Maximum allowed depth in inches */
  maxDepthIn?: number;
  /** Flat tip width of V-bit in inches (0 = sharp point) */
  tipWidthIn?: number;
}

export interface VCarveResult {
  /** Calculated depth to reach the desired groove width */
  depthIn: number;
  /** Effective depth after applying maxDepth clamp */
  effectiveDepthIn: number;
  /** Width actually achieved (may be less than requested if maxDepth is hit) */
  achievedWidthIn: number;
  /** Whether the cut was limited by maxDepth */
  depthLimited: boolean;
  /** Whether the flat tip is engaged (tip wider than zero and flat bottom reached) */
  flatBottomEngaged: boolean;
}

export function calculateVCarve(input: VCarveInput): VCarveResult {
  const {
    grooveWidthIn,
    vbitAngleDeg,
    maxDepthIn,
    tipWidthIn = 0,
  } = input;

  // Half-angle in radians
  const halfAngleRad = (vbitAngleDeg / 2) * (Math.PI / 180);

  // depth = (halfWidth) / tan(halfAngle)
  const halfWidth = grooveWidthIn / 2;
  const rawDepth = halfWidth / Math.tan(halfAngleRad);

  // Adjust for flat tip: the tip already occupies tipWidthIn/2 of half-width
  // so depth needed to reach grooveWidth from tip edge:
  const tipHalfWidth = (tipWidthIn ?? 0) / 2;
  const effectiveHalfWidth = halfWidth - tipHalfWidth;
  const depthFromTip = effectiveHalfWidth > 0 ? effectiveHalfWidth / Math.tan(halfAngleRad) : 0;

  // Flat bottom is engaged if the groove width requested is ≥ tipWidth
  const flatBottomEngaged = tipWidthIn > 0 && effectiveHalfWidth >= 0;

  let effectiveDepth = flatBottomEngaged ? depthFromTip : rawDepth;
  effectiveDepth = Math.round(effectiveDepth * 100000) / 100000;
  const unclamped = effectiveDepth;

  let depthLimited = false;
  if (maxDepthIn != null && effectiveDepth > maxDepthIn) {
    effectiveDepth = maxDepthIn;
    depthLimited = true;
  }

  // Achieved width from effective depth
  const achievedHalfWidthFromTool = effectiveDepth * Math.tan(halfAngleRad) + tipHalfWidth;
  const achievedWidthIn = Math.round(achievedHalfWidthFromTool * 2 * 100000) / 100000;

  return {
    depthIn: Math.round(unclamped * 100000) / 100000,
    effectiveDepthIn: effectiveDepth,
    achievedWidthIn,
    depthLimited,
    flatBottomEngaged,
  };
}
