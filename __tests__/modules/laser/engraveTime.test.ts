import { calculateEngraveTime } from "../../../src/modules/laser/calculators/engraveTime";

describe("Engrave Time Estimator", () => {
  test("calculates bidirectional engrave time", () => {
    const result = calculateEngraveTime({
      widthMm: 100,
      heightMm: 50,
      lpi: 225,
      speedMms: 200,
      bidirectional: true,
    });
    expect(result.lineCount).toBe(443);
    expect(result.totalDistanceMm).toBeCloseTo(44300, -1);
    expect(result.estimatedSeconds).toBeCloseTo(221.5, 0);
  });

  test("unidirectional adds return travel", () => {
    const bidir = calculateEngraveTime({
      widthMm: 100, heightMm: 50, lpi: 225, speedMms: 200, bidirectional: true,
    });
    const unidir = calculateEngraveTime({
      widthMm: 100, heightMm: 50, lpi: 225, speedMms: 200, bidirectional: false,
    });
    expect(unidir.estimatedSeconds).toBeGreaterThan(bidir.estimatedSeconds);
  });

  test("returns formatted time string", () => {
    const result = calculateEngraveTime({
      widthMm: 100, heightMm: 50, lpi: 225, speedMms: 200, bidirectional: true,
    });
    expect(result.formattedTime).toMatch(/^\d+:\d{2}$/);
  });
});
