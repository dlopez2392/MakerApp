import { calculateFlowRateCalibration } from "../../../src/modules/printing/calculators/flowRateCalibration";

describe("Flow Rate / E-Steps Calibration Calculator", () => {
  test("perfect calibration returns same e-steps", () => {
    const result = calculateFlowRateCalibration({
      requestedLengthMm: 100,
      measuredLengthMm: 100,
      currentESteps: 93,
    });
    expect(result.newESteps).toBeCloseTo(93, 5);
    expect(result.deviationPct).toBeCloseTo(0, 5);
  });

  test("under-extrusion (measured < requested) increases e-steps", () => {
    // 100mm requested, 95mm measured → printer under-extruded → need more steps
    const result = calculateFlowRateCalibration({
      requestedLengthMm: 100,
      measuredLengthMm: 95,
      currentESteps: 93,
    });
    // newESteps = 93 × (100 / 95) ≈ 97.89
    expect(result.newESteps).toBeCloseTo(93 * (100 / 95), 3);
    expect(result.newESteps).toBeGreaterThan(93);
  });

  test("over-extrusion (measured > requested) decreases e-steps", () => {
    const result = calculateFlowRateCalibration({
      requestedLengthMm: 100,
      measuredLengthMm: 105,
      currentESteps: 93,
    });
    expect(result.newESteps).toBeLessThan(93);
  });

  test("deviation percent is correct", () => {
    const result = calculateFlowRateCalibration({
      requestedLengthMm: 100,
      measuredLengthMm: 95,
      currentESteps: 93,
    });
    // ratio = 100/95, deviation = |ratio - 1| × 100 = 5.26...%
    const ratio = 100 / 95;
    const expectedDeviation = Math.abs(ratio - 1) * 100;
    expect(result.deviationPct).toBeCloseTo(expectedDeviation, 3);
  });

  test("flowMultiplier = (requested / measured) × 100", () => {
    const result = calculateFlowRateCalibration({
      requestedLengthMm: 100,
      measuredLengthMm: 95,
      currentESteps: 93,
    });
    const expected = (100 / 95) * 100;
    expect(result.flowMultiplier).toBeCloseTo(expected, 3);
  });

  test("mathSteps are populated", () => {
    const result = calculateFlowRateCalibration({
      requestedLengthMm: 100,
      measuredLengthMm: 95,
      currentESteps: 93,
    });
    expect(result.mathSteps.length).toBeGreaterThan(0);
    expect(result.mathSteps[0]).toHaveProperty("label");
  });
});
