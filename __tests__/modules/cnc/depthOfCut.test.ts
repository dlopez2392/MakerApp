import { calculateDepthOfCut } from "../../../src/modules/cnc/calculators/depthOfCut";

describe("CNC Depth-of-Cut Planner", () => {
  test("creates correct number of roughing passes", () => {
    // 0.75" total, 0.25" maxDoc → 3 roughing passes
    const result = calculateDepthOfCut({
      totalDepthIn: 0.75,
      maxRoughDocIn: 0.25,
    });
    expect(result.roughingPasses).toBe(3);
    expect(result.totalPasses).toBe(3);
  });

  test("includes finishing pass when specified", () => {
    const result = calculateDepthOfCut({
      totalDepthIn: 0.75,
      maxRoughDocIn: 0.25,
      finishingPassIn: 0.03,
    });
    expect(result.hasFinishingPass).toBe(true);
    expect(result.passSchedule[result.totalPasses - 1].passType).toBe("finishing");
    expect(result.passSchedule[result.totalPasses - 1].depthIn).toBeCloseTo(0.03, 4);
  });

  test("last pass cumulative depth equals total depth", () => {
    const result = calculateDepthOfCut({
      totalDepthIn: 0.75,
      maxRoughDocIn: 0.25,
    });
    const lastPass = result.passSchedule[result.passSchedule.length - 1];
    expect(lastPass.cumulativeDepthIn).toBeCloseTo(0.75, 4);
  });

  test("estimates time from feed rate and cut length", () => {
    // 3 passes, 12" length, 60 IPM → 3 * (12/60) = 0.6 min
    const result = calculateDepthOfCut({
      totalDepthIn: 0.75,
      maxRoughDocIn: 0.25,
      feedRateIpm: 60,
      cutLengthIn: 12,
    });
    expect(result.estimatedMinutes).toBeCloseTo(0.6, 2);
  });
});
