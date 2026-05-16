// Equilibrium Moisture Content calculator using Hailwood-Horrobin formula

export function calculateEMC(relativeHumidity: number, temperatureF: number): number {
  const T = (temperatureF - 32) * 5 / 9;
  const h = relativeHumidity / 100;

  const W = 349 + 1.29 * T + 0.0135 * T * T;
  const K = 0.805 + 0.000736 * T - 0.00000273 * T * T;
  const K1 = 6.27 - 0.00938 * T - 0.000303 * T * T;
  const K2 = 1.91 + 0.0407 * T - 0.000293 * T * T;

  const emc =
    (1800 / W) *
    ((K * h) / (1 - K * h) +
      (K1 * K * h + 2 * K1 * K2 * K * K * h * h) /
        (1 + K1 * K * h + K1 * K2 * K * K * h * h));

  return Math.round(emc * 10) / 10;
}
