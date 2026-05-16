export interface ProportionResult {
  golden: number;
  goldenInverse: number;
  sqrt2: number;
  twoThirds: number;
  threeHalves: number;
  double: number;
}

export function calculateProportions(d: number): ProportionResult {
  return {
    golden: d * 1.618,
    goldenInverse: d / 1.618,
    sqrt2: d * 1.414,
    twoThirds: d * 0.667,
    threeHalves: d * 1.5,
    double: d * 2,
  };
}
