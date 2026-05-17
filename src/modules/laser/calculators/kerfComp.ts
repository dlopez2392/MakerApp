export type JointType = "inlay" | "press-fit" | "box-joint";

interface KerfCompInput {
  designDimension: number;
  kerfWidth: number;
  jointType: JointType;
  affectedEdges: number;
}

interface KerfCompResult {
  maleDimension: number;
  femaleDimension: number;
  totalOffset: number;
  jointType: JointType;
}

export function calculateKerfComp(input: KerfCompInput): KerfCompResult {
  const halfKerf = input.kerfWidth / 2;
  let maleOffset: number;
  let femaleOffset: number;

  switch (input.jointType) {
    case "inlay":
      maleOffset = halfKerf * input.affectedEdges;
      femaleOffset = halfKerf * input.affectedEdges;
      break;
    case "press-fit":
      maleOffset = input.kerfWidth * input.affectedEdges;
      femaleOffset = 0;
      break;
    case "box-joint":
      maleOffset = halfKerf * input.affectedEdges;
      femaleOffset = halfKerf * input.affectedEdges;
      break;
  }

  const maleDimension = Math.round((input.designDimension - maleOffset) * 10000) / 10000;
  const femaleDimension = Math.round((input.designDimension + femaleOffset) * 10000) / 10000;
  const totalOffset = Math.round(maleOffset * 10000) / 10000;

  return { maleDimension, femaleDimension, totalOffset, jointType: input.jointType };
}
