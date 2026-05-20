import { calculateThreadStitch } from "../../../src/modules/leather/calculators/threadStitch";

describe("Thread Stitch Calculator", () => {
  const base = { seamLengthIn: 10, stitchesPerInch: 7, leatherThicknessMm: 3, threadPasses: 2 as const };

  test("stitch count = length * SPI", () => {
    const r = calculateThreadStitch(base);
    expect(r.mathSteps[0].result).toBe(70);
  });

  test("saddle stitch uses 2 passes", () => {
    const single = calculateThreadStitch({ ...base, threadPasses: 1 });
    const double = calculateThreadStitch({ ...base, threadPasses: 2 });
    expect(double.threadLengthIn).toBeGreaterThan(single.threadLengthIn);
  });

  test("needle #0 for thin leather", () => {
    const r = calculateThreadStitch({ ...base, leatherThicknessMm: 1.5 });
    expect(r.needleSizeRec).toBe("#0");
  });

  test("needle #2 for medium leather", () => {
    const r = calculateThreadStitch({ ...base, leatherThicknessMm: 3 });
    expect(r.needleSizeRec).toBe("#2");
  });

  test("needle #4 for thick leather", () => {
    const r = calculateThreadStitch({ ...base, leatherThicknessMm: 5 });
    expect(r.needleSizeRec).toBe("#4");
  });
});
