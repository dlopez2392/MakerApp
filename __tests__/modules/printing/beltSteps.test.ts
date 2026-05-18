import { calculateBeltSteps } from "../../../src/modules/printing/calculators/beltSteps";

describe("Belt / Steps-per-mm Calculator", () => {
  test("GT2 20-tooth 1.8° 16x microstepping = 80 steps/mm", () => {
    const result = calculateBeltSteps({
      axisType: "belt",
      motorStepAngle: 1.8,
      microstepping: 16,
      pulleyTeeth: 20,
      beltPitch: 2, // GT2
      leadMm: null,
    });
    // stepsPerMm = (360 / 1.8 * 16) / (20 * 2) = (200 * 16) / 40 = 3200 / 40 = 80
    expect(result.stepsPerMm).toBeCloseTo(80, 5);
  });

  test("GT2 20-tooth gives 12.5µm resolution", () => {
    const result = calculateBeltSteps({
      axisType: "belt",
      motorStepAngle: 1.8,
      microstepping: 16,
      pulleyTeeth: 20,
      beltPitch: 2,
      leadMm: null,
    });
    expect(result.resolutionUm).toBeCloseTo(12.5, 3);
  });

  test("GT2 16-tooth = 100 steps/mm", () => {
    const result = calculateBeltSteps({
      axisType: "belt",
      motorStepAngle: 1.8,
      microstepping: 16,
      pulleyTeeth: 16,
      beltPitch: 2,
      leadMm: null,
    });
    // (360/1.8 * 16) / (16 * 2) = 3200 / 32 = 100
    expect(result.stepsPerMm).toBeCloseTo(100, 5);
  });

  test("leadscrew 8mm lead 1.8° 16x = 400 steps/mm", () => {
    const result = calculateBeltSteps({
      axisType: "leadscrew",
      motorStepAngle: 1.8,
      microstepping: 16,
      pulleyTeeth: null,
      beltPitch: null,
      leadMm: 8,
    });
    // (360/1.8 * 16) / 8 = 3200 / 8 = 400
    expect(result.stepsPerMm).toBeCloseTo(400, 5);
  });

  test("leadscrew 8mm gives 2.5µm resolution", () => {
    const result = calculateBeltSteps({
      axisType: "leadscrew",
      motorStepAngle: 1.8,
      microstepping: 16,
      pulleyTeeth: null,
      beltPitch: null,
      leadMm: 8,
    });
    expect(result.resolutionUm).toBeCloseTo(2.5, 3);
  });

  test("0.9° step angle doubles steps/mm compared to 1.8°", () => {
    const base = calculateBeltSteps({
      axisType: "belt",
      motorStepAngle: 1.8,
      microstepping: 16,
      pulleyTeeth: 20,
      beltPitch: 2,
      leadMm: null,
    });
    const highRes = calculateBeltSteps({
      axisType: "belt",
      motorStepAngle: 0.9,
      microstepping: 16,
      pulleyTeeth: 20,
      beltPitch: 2,
      leadMm: null,
    });
    expect(highRes.stepsPerMm).toBeCloseTo(base.stepsPerMm * 2, 5);
  });

  test("mathSteps are populated", () => {
    const result = calculateBeltSteps({
      axisType: "belt",
      motorStepAngle: 1.8,
      microstepping: 16,
      pulleyTeeth: 20,
      beltPitch: 2,
      leadMm: null,
    });
    expect(result.mathSteps.length).toBeGreaterThan(0);
    expect(result.mathSteps[0]).toHaveProperty("label");
  });
});
