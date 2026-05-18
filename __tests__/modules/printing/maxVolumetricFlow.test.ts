import { calculateMaxVolumetricFlow } from "../../../src/modules/printing/calculators/maxVolumetricFlow";

describe("Max Volumetric Flow Calculator", () => {
  const baseInput = {
    layerHeight: 0.2,
    lineWidth: 0.48,
    printSpeedMms: 60,
    hotendMaxFlow: 15, // mm³/s typical
  };

  test("calculatedFlow = layerHeight × lineWidth × speed", () => {
    const result = calculateMaxVolumetricFlow(baseInput);
    const expected = baseInput.layerHeight * baseInput.lineWidth * baseInput.printSpeedMms;
    expect(result.calculatedFlow).toBeCloseTo(expected, 5);
  });

  test("hotendCapacityPct = (flow / maxFlow) × 100", () => {
    const result = calculateMaxVolumetricFlow(baseInput);
    const flow = baseInput.layerHeight * baseInput.lineWidth * baseInput.printSpeedMms;
    const expected = (flow / baseInput.hotendMaxFlow) * 100;
    expect(result.hotendCapacityPct).toBeCloseTo(expected, 3);
  });

  test("maxSafeSpeedMms = hotendMaxFlow / (layerHeight × lineWidth)", () => {
    const result = calculateMaxVolumetricFlow(baseInput);
    const expected = baseInput.hotendMaxFlow / (baseInput.layerHeight * baseInput.lineWidth);
    expect(result.maxSafeSpeedMms).toBeCloseTo(expected, 3);
  });

  test("status is 'safe' when capacity < 80%", () => {
    // flow = 0.2 × 0.48 × 60 = 5.76 mm³/s, max = 15 → 38.4% → safe
    const result = calculateMaxVolumetricFlow(baseInput);
    expect(result.status).toBe("safe");
  });

  test("status is 'warning' when capacity is 80-100%", () => {
    // need ~80-100% of 15 = 12-15 mm³/s
    // 0.2 × 0.48 × speed = 13 → speed = 13 / (0.2*0.48) = 135.4
    const result = calculateMaxVolumetricFlow({ ...baseInput, printSpeedMms: 135 });
    expect(result.status).toBe("warning");
  });

  test("status is 'exceeds' when capacity > 100%", () => {
    // 0.2 × 0.48 × 200 = 19.2 > 15 → exceeds
    const result = calculateMaxVolumetricFlow({ ...baseInput, printSpeedMms: 200 });
    expect(result.status).toBe("exceeds");
  });

  test("mathSteps are populated", () => {
    const result = calculateMaxVolumetricFlow(baseInput);
    expect(result.mathSteps.length).toBeGreaterThan(0);
    expect(result.mathSteps[0]).toHaveProperty("label");
  });
});
