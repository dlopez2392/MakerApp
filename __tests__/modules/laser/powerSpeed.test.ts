import { calculatePowerSpeed } from "../../../src/modules/laser/calculators/powerSpeed";

describe("Laser Power & Speed Calculator", () => {
  test("returns base settings for 40W laser on known material", () => {
    const result = calculatePowerSpeed({
      powerPctBase: 60,
      speedMmsBase: 8,
      passesBase: 1,
      baseWattage: 40,
      targetWattage: 40,
      thicknessMm: 3.2,
      operation: "cut",
    });
    expect(result.powerPct).toBe(60);
    expect(result.speedMms).toBe(8);
    expect(result.passes).toBe(1);
  });

  test("scales power down for higher wattage laser", () => {
    const result = calculatePowerSpeed({
      powerPctBase: 60,
      speedMmsBase: 8,
      passesBase: 1,
      baseWattage: 40,
      targetWattage: 80,
      thicknessMm: 3.2,
      operation: "cut",
    });
    expect(result.powerPct).toBe(30);
    expect(result.speedMms).toBe(16);
  });

  test("scales power up for lower wattage laser (capped at 100%)", () => {
    const result = calculatePowerSpeed({
      powerPctBase: 60,
      speedMmsBase: 8,
      passesBase: 1,
      baseWattage: 40,
      targetWattage: 20,
      thicknessMm: 3.2,
      operation: "cut",
    });
    expect(result.powerPct).toBe(100);
    expect(result.speedMms).toBe(4);
  });

  test("provides safe ranges", () => {
    const result = calculatePowerSpeed({
      powerPctBase: 60,
      speedMmsBase: 8,
      passesBase: 1,
      baseWattage: 40,
      targetWattage: 40,
      thicknessMm: 3.2,
      operation: "cut",
    });
    expect(result.powerRange.min).toBeLessThan(result.powerPct);
    expect(result.powerRange.max).toBeGreaterThan(result.powerPct);
    expect(result.speedRange.min).toBeLessThan(result.speedMms);
    expect(result.speedRange.max).toBeGreaterThan(result.speedMms);
  });

  test("engrave operation keeps passes at 1", () => {
    const result = calculatePowerSpeed({
      powerPctBase: 20,
      speedMmsBase: 200,
      passesBase: 1,
      baseWattage: 40,
      targetWattage: 40,
      thicknessMm: 3.2,
      operation: "engrave",
    });
    expect(result.passes).toBe(1);
  });
});
