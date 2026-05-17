import { calculateKerfComp } from "../../../src/modules/laser/calculators/kerfComp";

describe("Kerf Compensation Calculator", () => {
  test("inlay: male shrinks by half-kerf, female grows by half-kerf", () => {
    const result = calculateKerfComp({
      designDimension: 50,
      kerfWidth: 0.2,
      jointType: "inlay",
      affectedEdges: 2,
    });
    expect(result.maleDimension).toBeCloseTo(49.8, 2);
    expect(result.femaleDimension).toBeCloseTo(50.2, 2);
  });

  test("press-fit: male shrinks by full kerf per edge", () => {
    const result = calculateKerfComp({
      designDimension: 25,
      kerfWidth: 0.15,
      jointType: "press-fit",
      affectedEdges: 2,
    });
    expect(result.maleDimension).toBeCloseTo(24.7, 2);
    expect(result.totalOffset).toBeCloseTo(0.3, 2);
  });

  test("box-joint: adjusts by half-kerf per finger edge", () => {
    const result = calculateKerfComp({
      designDimension: 10,
      kerfWidth: 0.2,
      jointType: "box-joint",
      affectedEdges: 2,
    });
    expect(result.maleDimension).toBeCloseTo(9.8, 2);
  });

  test("zero kerf returns original dimension", () => {
    const result = calculateKerfComp({
      designDimension: 50,
      kerfWidth: 0,
      jointType: "inlay",
      affectedEdges: 2,
    });
    expect(result.maleDimension).toBe(50);
    expect(result.femaleDimension).toBe(50);
  });
});
