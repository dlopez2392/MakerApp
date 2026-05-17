export interface SpoilboardSurfacingInput {
  /** Bed dimension in Y (width of surfacing area) in inches */
  bedYIn: number;
  /** Bed dimension in X (length of surfacing area) in inches */
  bedXIn: number;
  /** Stepover per pass in inches */
  stepoverIn: number;
  /** Depth of cut per layer (skim pass) in inches */
  docPerPassIn: number;
  /** Total material to remove in inches */
  totalSkimIn: number;
  /** Feed rate in IPM */
  feedRateIpm?: number;
}

export interface SpoilboardSurfacingResult {
  passesPerLayer: number;
  layers: number;
  totalPasses: number;
  /** Total X distance traveled per layer in inches (including overlaps) */
  totalDistancePerLayerIn: number;
  /** Estimated total time in minutes, null if feedRate not provided */
  estimatedMinutes: number | null;
}

export function calculateSpoilboardSurfacing(input: SpoilboardSurfacingInput): SpoilboardSurfacingResult {
  const { bedYIn, bedXIn, stepoverIn, docPerPassIn, totalSkimIn, feedRateIpm } = input;

  // Number of passes to cover Y dimension
  const passesPerLayer = Math.ceil(bedYIn / stepoverIn);

  // Number of layers to achieve total skim depth
  const layers = Math.ceil(totalSkimIn / docPerPassIn);

  const totalPasses = passesPerLayer * layers;

  // Total distance per layer: each pass traverses bedX in length
  const totalDistancePerLayerIn = passesPerLayer * bedXIn;

  let estimatedMinutes: number | null = null;
  if (feedRateIpm != null && feedRateIpm > 0) {
    const totalDistanceIn = totalDistancePerLayerIn * layers;
    estimatedMinutes = Math.round((totalDistanceIn / feedRateIpm) * 100) / 100;
  }

  return {
    passesPerLayer,
    layers,
    totalPasses,
    totalDistancePerLayerIn,
    estimatedMinutes,
  };
}
