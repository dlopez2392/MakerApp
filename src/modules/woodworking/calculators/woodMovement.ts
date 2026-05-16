import { decimalToNearestFraction, Fraction } from "./fraction";

export type GrainOrientation = "flat-sawn" | "quarter-sawn" | "rift-sawn";

interface WoodMovementInput {
  width: number;
  currentMC: number;
  targetMC: number;
  tangentialShrinkage: number;
  radialShrinkage: number;
  orientation: GrainOrientation;
}

interface WoodMovementResult {
  movementInches: number;
  movementFraction: Fraction;
  direction: "shrinkage" | "expansion" | "none";
  warningFlag: boolean;
  coefficient: number;
}

export function calculateWoodMovement(input: WoodMovementInput): WoodMovementResult {
  const mcDelta = Math.abs(input.currentMC - input.targetMC);

  let coefficient: number;
  switch (input.orientation) {
    case "flat-sawn":
      coefficient = input.tangentialShrinkage / 100;
      break;
    case "quarter-sawn":
      coefficient = input.radialShrinkage / 100;
      break;
    case "rift-sawn":
      coefficient = ((input.tangentialShrinkage + input.radialShrinkage) / 2) / 100;
      break;
  }

  const movementInches = input.width * (mcDelta / 100) * coefficient;

  let direction: "shrinkage" | "expansion" | "none";
  if (input.targetMC < input.currentMC) {
    direction = "shrinkage";
  } else if (input.targetMC > input.currentMC) {
    direction = "expansion";
  } else {
    direction = "none";
  }

  const warningFlag = movementInches > 0.125;
  const movementFraction = decimalToNearestFraction(movementInches, 64);

  return {
    movementInches: Math.round(movementInches * 10000) / 10000,
    movementFraction,
    direction,
    warningFlag,
    coefficient,
  };
}
