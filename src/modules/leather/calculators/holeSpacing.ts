import type { MathStep } from "./leatherArea";

export interface HoleSpacingInput {
  edgeLengthIn: number;
  desiredSpacingIn: number;
  edgeMarginIn: number;
  prongCount: 1 | 2 | 4 | 6;
}

export interface HoleSpacingResult {
  numberOfHoles: number;
  actualSpacing: number;
  chiselPasses: number;
  holePositions: number[];
  mathSteps: MathStep[];
}

export function calculateHoleSpacing(input: HoleSpacingInput): HoleSpacingResult {
  const { edgeLengthIn, desiredSpacingIn, edgeMarginIn, prongCount } = input;
  const r = (v: number) => Math.round(v * 1000) / 1000;

  const usableLength = edgeLengthIn - 2 * edgeMarginIn;
  const rawHoles = Math.round(usableLength / desiredSpacingIn) + 1;
  const numberOfHoles = Math.max(rawHoles, 2);
  const actualSpacing = usableLength / (numberOfHoles - 1);
  const chiselPasses = Math.ceil(numberOfHoles / prongCount);

  const holePositions: number[] = [];
  for (let i = 0; i < numberOfHoles; i++) {
    holePositions.push(r(edgeMarginIn + i * actualSpacing));
  }

  const mathSteps: MathStep[] = [
    { label: "Usable Length", formula: `${edgeLengthIn} - 2 × ${edgeMarginIn}`, result: r(usableLength), unit: "in" },
    { label: "Number of Holes", formula: `round(${r(usableLength)} / ${desiredSpacingIn}) + 1`, result: numberOfHoles, unit: "holes" },
    { label: "Actual Spacing", formula: `${r(usableLength)} / (${numberOfHoles} - 1)`, result: r(actualSpacing), unit: "in" },
    { label: "Chisel Passes", formula: `ceil(${numberOfHoles} / ${prongCount})`, result: chiselPasses, unit: "passes" },
  ];

  return { numberOfHoles, actualSpacing: r(actualSpacing), chiselPasses, holePositions, mathSteps };
}
