import { calculateMoldVolume } from "../../../src/modules/resin/calculators/moldVolume";

describe("Mold Volume Calculator", () => {
  test("cylinder volume", () => {
    const r = calculateMoldVolume({ shape: "cylinder", diameterMm: 100, heightMm: 100 });
    expect(r.volumeMl).toBeCloseTo(785.4, 0);
  });

  test("rectangle volume", () => {
    const r = calculateMoldVolume({ shape: "rectangle", lengthMm: 100, widthMm: 50, heightMm: 40 });
    expect(r.volumeMl).toBeCloseTo(200, 2);
  });

  test("sphere volume", () => {
    const r = calculateMoldVolume({ shape: "sphere", diameterMm: 100 });
    expect(r.volumeMl).toBeCloseTo(523.6, 0);
  });

  test("resin weight = volume * 1.1", () => {
    const r = calculateMoldVolume({ shape: "rectangle", lengthMm: 100, widthMm: 100, heightMm: 10 });
    expect(r.resinWeightG).toBeCloseTo(r.volumeMl * 1.1, 5);
  });
});
