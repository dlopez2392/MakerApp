// Unit Converter Engine — 9 categories with maker-focused units

type ConversionTable = Record<string, number>;

interface CategoryConfig {
  label: string;
  units: string[];
  base: string;
  factors: ConversionTable;
}

// For ratio-based categories, factors represent: 1 unit = factor * base_unit
export const CATEGORIES: Record<string, CategoryConfig> = {
  length: {
    label: "Length",
    base: "m",
    units: ["in", "ft", "yd", "mm", "cm", "m"],
    factors: { in: 0.0254, ft: 0.3048, yd: 0.9144, mm: 0.001, cm: 0.01, m: 1 },
  },
  weight: {
    label: "Weight",
    base: "kg",
    units: ["oz", "lb", "g", "kg"],
    factors: { oz: 0.028349523125, lb: 0.45359237, g: 0.001, kg: 1 },
  },
  volume: {
    label: "Volume",
    base: "L",
    units: ["fl_oz", "cup", "pt", "qt", "gal", "mL", "L"],
    factors: { fl_oz: 0.0295735, cup: 0.236588, pt: 0.473176, qt: 0.946353, gal: 3.78541, mL: 0.001, L: 1 },
  },
  area: {
    label: "Area",
    base: "sq_m",
    units: ["sq_in", "sq_ft", "sq_m", "sq_cm"],
    factors: { sq_in: 0.00064516, sq_ft: 0.092903, sq_m: 1, sq_cm: 0.0001 },
  },
  temperature: {
    label: "Temperature",
    base: "K",
    units: ["°F", "°C", "K"],
    factors: {}, // special handling
  },
  speed: {
    label: "Speed",
    base: "m/min",
    units: ["ipm", "fpm", "mm/min", "m/min"],
    factors: { ipm: 0.0254, fpm: 0.3048, "mm/min": 0.001, "m/min": 1 },
  },
  pressure: {
    label: "Pressure",
    base: "kPa",
    units: ["psi", "bar", "kPa", "atm"],
    factors: { psi: 6.89476, bar: 100, kPa: 1, atm: 101.325 },
  },
  angle: {
    label: "Angle",
    base: "rad",
    units: ["deg", "rad"],
    factors: { deg: Math.PI / 180, rad: 1 },
  },
  hardness: {
    label: "Hardness",
    base: "brinell",
    units: ["janka", "brinell"],
    // Approximate: Janka ≈ Brinell * 56.2 (rough lumber correlation)
    factors: { janka: 1 / 56.2, brinell: 1 },
  },
};

function toKelvin(value: number, unit: string): number {
  switch (unit) {
    case "°C": return value + 273.15;
    case "°F": return (value - 32) * 5 / 9 + 273.15;
    case "K": return value;
    default: throw new Error(`Unknown temperature unit: ${unit}`);
  }
}

function fromKelvin(kelvin: number, unit: string): number {
  switch (unit) {
    case "°C": return kelvin - 273.15;
    case "°F": return (kelvin - 273.15) * 9 / 5 + 32;
    case "K": return kelvin;
    default: throw new Error(`Unknown temperature unit: ${unit}`);
  }
}

export function convert(value: number, from: string, to: string, category: string): number {
  const cat = CATEGORIES[category];
  if (!cat) throw new Error(`Unknown category: ${category}`);

  if (category === "temperature") {
    const kelvin = toKelvin(value, from);
    return fromKelvin(kelvin, to);
  }

  const fromFactor = cat.factors[from];
  const toFactor = cat.factors[to];
  if (fromFactor === undefined) throw new Error(`Unknown unit: ${from}`);
  if (toFactor === undefined) throw new Error(`Unknown unit: ${to}`);

  // Convert: value * fromFactor gives base units, divide by toFactor
  return (value * fromFactor) / toFactor;
}
