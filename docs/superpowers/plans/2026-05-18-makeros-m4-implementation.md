# M4 Implementation Plan: Craft Modules (Part 1)

## Goal
Add 5 craft modules (Resin Art, Knife Making, Leatherworking, Candle Making, Soap Making) with 13 calculators, 1 SQLite table, and 2 reference databases. Replace all M4 placeholder screens.

## Architecture
Vertical slice per module. Calculators are pure functions with typed Input/Result + MathStep[]. Modules never import cross-module. Reference data in `data/` subdirectory. DB seed functions called from `app/_layout.tsx`.

## Tech Stack
- TypeScript strict, React Native / Expo
- expo-sqlite (knife_steels table)
- Jest for all calculator tests
- Pattern: MathStep interface defined per module (no cross-module imports)

---

## File Structure

```
src/modules/
  resin/calculators/  resinRatio.ts  moldVolume.ts  colorantMix.ts
  knife/
    calculators/      heatTreat.ts  grindAngle.ts  handleScale.ts
    data/             steelDatabase.ts  seedKnifeSteels.ts
  leather/calculators/ leatherArea.ts  threadStitch.ts
  candle/calculators/  waxVolume.ts  fragranceLoad.ts  wickSizing.ts
  soap/
    calculators/       lyeCalculator.ts  batchScaler.ts
    data/              oilDatabase.ts

__tests__/modules/
  resin/    resinRatio.test.ts  moldVolume.test.ts  colorantMix.test.ts
  knife/    heatTreat.test.ts   grindAngle.test.ts  handleScale.test.ts
  leather/  leatherArea.test.ts threadStitch.test.ts
  candle/   waxVolume.test.ts   fragranceLoad.test.ts  wickSizing.test.ts
  soap/     lyeCalculator.test.ts  batchScaler.test.ts

app/(tabs)/make/
  resin/   _layout.tsx  index.tsx  resin-ratio.tsx  mold-volume.tsx  colorant-mix.tsx
  knife/   _layout.tsx  index.tsx  heat-treat.tsx   grind-angle.tsx  handle-scale.tsx  steel-db.tsx
  leather/ _layout.tsx  index.tsx  leather-area.tsx thread-stitch.tsx
  candle/  _layout.tsx  index.tsx  wax-volume.tsx   fragrance-load.tsx  wick-sizing.tsx
  soap/    _layout.tsx  index.tsx  lye-calculator.tsx  batch-scaler.tsx
```

Current schema table count: **18 tables** (projects, inventory_items, inventory_deductions, clients, journal_entries, quotes, quote_line_items, invoices, invoice_line_items, invoice_payments, calculator_results, saved_recipes, wood_species, laser_materials, cnc_materials, cnc_tools, cnc_tool_usage, user_settings, printer_profiles, printing_filaments — actually 20). Adding `knife_steels` → **21 tables**.

---

## Task 1: Schema — `knife_steels` table

### 1a. Edit `src/core/database/schema.ts`

Add to `TABLE_SCHEMAS`:

```typescript
  knife_steels: `CREATE TABLE IF NOT EXISTS knife_steels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  harden_temp_f INTEGER NOT NULL,
  soak_minutes INTEGER NOT NULL,
  quench_medium TEXT NOT NULL,
  temper_low_f INTEGER NOT NULL,
  temper_high_f INTEGER NOT NULL,
  rockwell_low REAL NOT NULL,
  rockwell_high REAL NOT NULL,
  normalize_temp_f INTEGER,
  normalize_cycles INTEGER DEFAULT 3,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'built-in',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
```

Add to `INDEX_SCHEMAS`:

```typescript
  "CREATE INDEX IF NOT EXISTS idx_knife_steels_category ON knife_steels(category)",
```

### 1b. Test: `__tests__/core/schema.test.ts` (update existing or add assertion)

```typescript
import { TABLE_SCHEMAS, INDEX_SCHEMAS } from "../../../src/core/database/schema";

test("knife_steels table exists in schema", () => {
  expect(TABLE_SCHEMAS).toHaveProperty("knife_steels");
  expect(TABLE_SCHEMAS.knife_steels).toContain("harden_temp_f");
});

test("knife_steels category index exists", () => {
  const hasIndex = INDEX_SCHEMAS.some(s => s.includes("idx_knife_steels_category"));
  expect(hasIndex).toBe(true);
});
```

---

## Task 2: Knife Steel Database + Seed

### 2a. `src/modules/knife/data/steelDatabase.ts`

```typescript
export interface KnifeSteel {
  name: string;
  category: "carbon" | "tool" | "stainless";
  hardenTempF: number;
  soakMinutes: number;
  quenchMedium: "oil" | "water" | "air" | "plate";
  temperLowF: number;
  temperHighF: number;
  rockwellLow: number;
  rockwellHigh: number;
  normalizeTempF: number | null;
  normalizeCycles: number;
  notes: string | null;
  source: "built-in" | "user";
}

export const steelData: KnifeSteel[] = [
  { name: "1095", category: "carbon", hardenTempF: 1475, soakMinutes: 5, quenchMedium: "oil", temperLowF: 350, temperHighF: 450, rockwellLow: 57, rockwellHigh: 60, normalizeTempF: 1600, normalizeCycles: 3, notes: "Classic high-carbon. Forgiving, great edge. Oil quench preferred.", source: "built-in" },
  { name: "1084", category: "carbon", hardenTempF: 1475, soakMinutes: 5, quenchMedium: "oil", temperLowF: 350, temperHighF: 450, rockwellLow: 58, rockwellHigh: 62, normalizeTempF: 1600, normalizeCycles: 3, notes: "Beginner-friendly. Simple heat treat, excellent toughness.", source: "built-in" },
  { name: "1080", category: "carbon", hardenTempF: 1475, soakMinutes: 5, quenchMedium: "oil", temperLowF: 350, temperHighF: 450, rockwellLow: 56, rockwellHigh: 60, normalizeTempF: 1600, normalizeCycles: 3, notes: "Similar to 1084. Good toughness, slightly lower carbon.", source: "built-in" },
  { name: "O1", category: "tool", hardenTempF: 1475, soakMinutes: 10, quenchMedium: "oil", temperLowF: 300, temperHighF: 400, rockwellLow: 60, rockwellHigh: 64, normalizeTempF: 1550, normalizeCycles: 2, notes: "Oil-hardening tool steel. Fine grain, good wear resistance.", source: "built-in" },
  { name: "W2", category: "tool", hardenTempF: 1475, soakMinutes: 5, quenchMedium: "water", temperLowF: 350, temperHighF: 450, rockwellLow: 62, rockwellHigh: 65, normalizeTempF: 1600, normalizeCycles: 3, notes: "Water quench. Produces hamon. Very high hardness possible.", source: "built-in" },
  { name: "5160", category: "carbon", hardenTempF: 1525, soakMinutes: 10, quenchMedium: "oil", temperLowF: 375, temperHighF: 450, rockwellLow: 56, rockwellHigh: 60, normalizeTempF: 1650, normalizeCycles: 3, notes: "Spring steel. Outstanding toughness for choppers and swords.", source: "built-in" },
  { name: "80CrV2", category: "carbon", hardenTempF: 1500, soakMinutes: 8, quenchMedium: "oil", temperLowF: 350, temperHighF: 425, rockwellLow: 58, rockwellHigh: 62, normalizeTempF: 1600, normalizeCycles: 3, notes: "European spring steel. Fine grain, excellent toughness.", source: "built-in" },
  { name: "D2", category: "tool", hardenTempF: 1850, soakMinutes: 30, quenchMedium: "air", temperLowF: 400, temperHighF: 500, rockwellLow: 59, rockwellHigh: 62, normalizeTempF: null, normalizeCycles: 0, notes: "Semi-stainless tool steel. Wear resistant but tough to grind.", source: "built-in" },
  { name: "A2", category: "tool", hardenTempF: 1775, soakMinutes: 20, quenchMedium: "air", temperLowF: 350, temperHighF: 450, rockwellLow: 60, rockwellHigh: 63, normalizeTempF: null, normalizeCycles: 0, notes: "Air-hardening. More toughness than D2, less wear resistance.", source: "built-in" },
  { name: "M2", category: "tool", hardenTempF: 2200, soakMinutes: 5, quenchMedium: "air", temperLowF: 1000, temperHighF: 1050, rockwellLow: 63, rockwellHigh: 66, normalizeTempF: null, normalizeCycles: 0, notes: "High-speed steel. Triple temper required. Excellent wear.", source: "built-in" },
  { name: "S30V", category: "stainless", hardenTempF: 1900, soakMinutes: 20, quenchMedium: "plate", temperLowF: 350, temperHighF: 500, rockwellLow: 58, rockwellHigh: 61, normalizeTempF: null, normalizeCycles: 0, notes: "Premium stainless. Good balance of toughness/edge retention.", source: "built-in" },
  { name: "S35VN", category: "stainless", hardenTempF: 1900, soakMinutes: 20, quenchMedium: "plate", temperLowF: 350, temperHighF: 500, rockwellLow: 58, rockwellHigh: 61, normalizeTempF: null, normalizeCycles: 0, notes: "Improved S30V. Better toughness, easier to sharpen.", source: "built-in" },
  { name: "440C", category: "stainless", hardenTempF: 1875, soakMinutes: 30, quenchMedium: "air", temperLowF: 300, temperHighF: 450, rockwellLow: 57, rockwellHigh: 60, normalizeTempF: null, normalizeCycles: 0, notes: "High-chromium stainless. Good corrosion resistance.", source: "built-in" },
  { name: "AEB-L", category: "stainless", hardenTempF: 1975, soakMinutes: 15, quenchMedium: "plate", temperLowF: 300, temperHighF: 400, rockwellLow: 60, rockwellHigh: 63, normalizeTempF: null, normalizeCycles: 0, notes: "Fine-grain stainless. Excellent for razors and kitchen knives.", source: "built-in" },
  { name: "154CM", category: "stainless", hardenTempF: 1900, soakMinutes: 20, quenchMedium: "plate", temperLowF: 350, temperHighF: 500, rockwellLow: 58, rockwellHigh: 61, normalizeTempF: null, normalizeCycles: 0, notes: "American equivalent of ATS-34. Good wear and corrosion resistance.", source: "built-in" },
];
```

### 2b. `src/modules/knife/data/seedKnifeSteels.ts`

```typescript
import { steelData } from "./steelDatabase";
import { getDatabase } from "../../../core/database/connection";

export function seedKnifeSteels(): { count: number } {
  const db = getDatabase();
  const row = db.getFirstSync("SELECT COUNT(*) as cnt FROM knife_steels") as { cnt: number } | null;
  if ((row?.cnt ?? 0) > 0) return { count: steelData.length };

  for (const s of steelData) {
    db.runSync(
      `INSERT INTO knife_steels (
        id, name, category, harden_temp_f, soak_minutes, quench_medium,
        temper_low_f, temper_high_f, rockwell_low, rockwell_high,
        normalize_temp_f, normalize_cycles, notes, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Math.random().toString(36).slice(2) + Date.now().toString(36),
        s.name, s.category, s.hardenTempF, s.soakMinutes, s.quenchMedium,
        s.temperLowF, s.temperHighF, s.rockwellLow, s.rockwellHigh,
        s.normalizeTempF, s.normalizeCycles, s.notes, s.source,
      ],
    );
  }
  return { count: steelData.length };
}
```

### 2c. `app/_layout.tsx` — add seed call

Find the existing seed block (after `seedCncData()`) and add:

```typescript
import { seedKnifeSteels } from "../src/modules/knife/data/seedKnifeSteels";
// in the useEffect seed block:
seedKnifeSteels();
```

---

## Task 3: Soap Oil SAP Database (in-memory only)

### `src/modules/soap/data/oilDatabase.ts`

```typescript
export interface SoapOil {
  name: string;
  sapNaOH: number;
  sapKOH: number;
  iodine: number;
  ins: number;
  hardness: number;
  cleansing: number;
  conditioning: number;
  bubbly: number;
  creamy: number;
  notes: string | null;
}

export const oilData: SoapOil[] = [
  { name: "Olive Oil", sapNaOH: 0.134, sapKOH: 0.188, iodine: 85, ins: 109, hardness: 17, cleansing: 0, conditioning: 82, bubbly: 0, creamy: 17, notes: "Castile base. High conditioning, low lather." },
  { name: "Coconut Oil 76", sapNaOH: 0.190, sapKOH: 0.266, iodine: 10, ins: 258, hardness: 79, cleansing: 67, conditioning: 6, bubbly: 67, creamy: 12, notes: "High cleansing and lather. Cap at 33% to avoid dryness." },
  { name: "Coconut Oil 92", sapNaOH: 0.190, sapKOH: 0.266, iodine: 10, ins: 258, hardness: 79, cleansing: 67, conditioning: 6, bubbly: 67, creamy: 12, notes: "Refined high-melt coconut. Same SAP as 76." },
  { name: "Palm Oil", sapNaOH: 0.141, sapKOH: 0.198, iodine: 53, ins: 145, hardness: 50, cleansing: 0, conditioning: 44, bubbly: 0, creamy: 50, notes: "Hardness and stable lather. Sustainability concerns." },
  { name: "Castor Oil", sapNaOH: 0.128, sapKOH: 0.180, iodine: 86, ins: 95, hardness: 0, cleansing: 0, conditioning: 90, bubbly: 46, creamy: 0, notes: "Lather booster. Use 5-10%. Sticky at high %." },
  { name: "Avocado Oil", sapNaOH: 0.133, sapKOH: 0.187, iodine: 86, ins: 99, hardness: 10, cleansing: 0, conditioning: 84, bubbly: 0, creamy: 10, notes: "Nourishing. Good for sensitive skin." },
  { name: "Sweet Almond Oil", sapNaOH: 0.136, sapKOH: 0.190, iodine: 99, ins: 97, hardness: 11, cleansing: 0, conditioning: 79, bubbly: 0, creamy: 11, notes: "Mild and conditioning." },
  { name: "Sunflower Oil", sapNaOH: 0.134, sapKOH: 0.188, iodine: 133, ins: 63, hardness: 11, cleansing: 0, conditioning: 79, bubbly: 0, creamy: 11, notes: "High oleic preferred for longer shelf life." },
  { name: "Soybean Oil", sapNaOH: 0.135, sapKOH: 0.190, iodine: 130, ins: 61, hardness: 16, cleansing: 0, conditioning: 78, bubbly: 0, creamy: 16, notes: "Inexpensive. Prone to rancidity—use antioxidant." },
  { name: "Lard", sapNaOH: 0.138, sapKOH: 0.194, iodine: 67, ins: 139, hardness: 47, cleansing: 0, conditioning: 47, bubbly: 0, creamy: 47, notes: "Traditional. Creamy lather, hard bar." },
  { name: "Tallow", sapNaOH: 0.140, sapKOH: 0.196, iodine: 47, ins: 147, hardness: 56, cleansing: 0, conditioning: 40, bubbly: 0, creamy: 56, notes: "Hard bar, creamy lather. Excellent for shaving soap." },
  { name: "Shea Butter", sapNaOH: 0.128, sapKOH: 0.180, iodine: 64, ins: 116, hardness: 45, cleansing: 0, conditioning: 50, bubbly: 0, creamy: 45, notes: "Adds conditioning. Use 5-15%." },
  { name: "Cocoa Butter", sapNaOH: 0.137, sapKOH: 0.193, iodine: 36, ins: 157, hardness: 60, cleansing: 0, conditioning: 34, bubbly: 0, creamy: 60, notes: "Hardness and skin feel. Cap at 15%." },
  { name: "Jojoba Oil", sapNaOH: 0.069, sapKOH: 0.097, iodine: 82, ins: 11, hardness: 0, cleansing: 0, conditioning: 96, bubbly: 0, creamy: 0, notes: "Technically a wax ester. Use 3-8% as superfat booster." },
  { name: "Hemp Seed Oil", sapNaOH: 0.135, sapKOH: 0.190, iodine: 166, ins: 39, hardness: 0, cleansing: 0, conditioning: 80, bubbly: 0, creamy: 0, notes: "High linolenic. Use with antioxidants. Skin-loving." },
  { name: "Grapeseed Oil", sapNaOH: 0.135, sapKOH: 0.190, iodine: 131, ins: 66, hardness: 0, cleansing: 0, conditioning: 85, bubbly: 0, creamy: 0, notes: "Light, conditioning. Prone to rancidity." },
  { name: "Rice Bran Oil", sapNaOH: 0.128, sapKOH: 0.180, iodine: 105, ins: 70, hardness: 19, cleansing: 0, conditioning: 75, bubbly: 0, creamy: 19, notes: "Good for skin. Similar to olive in behavior." },
  { name: "Mango Butter", sapNaOH: 0.137, sapKOH: 0.193, iodine: 55, ins: 146, hardness: 50, cleansing: 0, conditioning: 43, bubbly: 0, creamy: 50, notes: "Hard butter, adds skin feel. Use 5-15%." },
  { name: "Apricot Kernel Oil", sapNaOH: 0.135, sapKOH: 0.190, iodine: 100, ins: 91, hardness: 10, cleansing: 0, conditioning: 80, bubbly: 0, creamy: 10, notes: "Similar to sweet almond. Good for sensitive skin." },
  { name: "Canola Oil", sapNaOH: 0.124, sapKOH: 0.174, iodine: 110, ins: 56, hardness: 0, cleansing: 0, conditioning: 85, bubbly: 0, creamy: 0, notes: "Inexpensive olive substitute. Adds conditioning." },
];

export function findOil(name: string): SoapOil | undefined {
  return oilData.find(o => o.name.toLowerCase() === name.toLowerCase());
}
```

---

## Task 4: Resin Art Calculators

### 4a. `src/modules/resin/calculators/resinRatio.ts`

```typescript
export interface MathStep {
  label: string;
  formula: string;
  result: number;
  unit: string;
}

export interface ResinRatioInput {
  totalVolumeMl: number;
  mixRatioResin: number;
  mixRatioHardener: number;
  unit: "ml" | "oz";
}

export interface ResinRatioResult {
  resinAmount: number;
  hardenerAmount: number;
  mathSteps: MathStep[];
}

export function calculateResinRatio(input: ResinRatioInput): ResinRatioResult {
  const { totalVolumeMl, mixRatioResin, mixRatioHardener } = input;
  const totalRatio = mixRatioResin + mixRatioHardener;
  const resinAmount = totalVolumeMl * (mixRatioResin / totalRatio);
  const hardenerAmount = totalVolumeMl - resinAmount;

  const mathSteps: MathStep[] = [
    {
      label: "Total Ratio Parts",
      formula: `ratioResin + ratioHardener = ${mixRatioResin} + ${mixRatioHardener}`,
      result: totalRatio,
      unit: "parts",
    },
    {
      label: "Resin Amount",
      formula: `total × (ratioResin / totalRatio) = ${totalVolumeMl} × (${mixRatioResin} / ${totalRatio})`,
      result: Math.round(resinAmount * 100) / 100,
      unit: input.unit,
    },
    {
      label: "Hardener Amount",
      formula: `total - resin = ${totalVolumeMl} - ${Math.round(resinAmount * 100) / 100}`,
      result: Math.round(hardenerAmount * 100) / 100,
      unit: input.unit,
    },
  ];

  return { resinAmount, hardenerAmount, mathSteps };
}
```

### 4b. `src/modules/resin/calculators/moldVolume.ts`

```typescript
import type { MathStep } from "./resinRatio";

export interface MoldVolumeInput {
  shape: "cylinder" | "rectangle" | "sphere";
  diameterMm?: number;
  heightMm?: number;
  lengthMm?: number;
  widthMm?: number;
}

export interface MoldVolumeResult {
  volumeMl: number;
  resinWeightG: number;
  mathSteps: MathStep[];
}

const RESIN_DENSITY = 1.1;

export function calculateMoldVolume(input: MoldVolumeInput): MoldVolumeResult {
  const { shape } = input;
  let volumeMl = 0;
  const steps: MathStep[] = [];

  if (shape === "cylinder") {
    const r = (input.diameterMm ?? 0) / 2;
    const h = input.heightMm ?? 0;
    volumeMl = (Math.PI * r * r * h) / 1000;
    steps.push({ label: "Cylinder Volume", formula: `π × r² × h / 1000 = π × ${r}² × ${h} / 1000`, result: Math.round(volumeMl * 100) / 100, unit: "ml" });
  } else if (shape === "rectangle") {
    const l = input.lengthMm ?? 0;
    const w = input.widthMm ?? 0;
    const h = input.heightMm ?? 0;
    volumeMl = (l * w * h) / 1000;
    steps.push({ label: "Rectangle Volume", formula: `l × w × h / 1000 = ${l} × ${w} × ${h} / 1000`, result: Math.round(volumeMl * 100) / 100, unit: "ml" });
  } else {
    const r = (input.diameterMm ?? 0) / 2;
    volumeMl = ((4 / 3) * Math.PI * r * r * r) / 1000;
    steps.push({ label: "Sphere Volume", formula: `(4/3) × π × r³ / 1000 = (4/3) × π × ${r}³ / 1000`, result: Math.round(volumeMl * 100) / 100, unit: "ml" });
  }

  const resinWeightG = volumeMl * RESIN_DENSITY;
  steps.push({ label: "Resin Weight", formula: `volumeMl × ${RESIN_DENSITY} density`, result: Math.round(resinWeightG * 100) / 100, unit: "g" });

  return { volumeMl, resinWeightG, mathSteps: steps };
}
```

### 4c. `src/modules/resin/calculators/colorantMix.ts`

```typescript
import type { MathStep } from "./resinRatio";

export interface ColorantMixInput {
  resinWeightG: number;
  colorantType: "pigment" | "dye" | "mica";
  loadPct: number;
}

export interface ColorantMixResult {
  colorantWeightG: number;
  colorantDrops: number;
  maxSafeLoad: number;
  warnings: string[];
  mathSteps: MathStep[];
}

const MAX_LOADS: Record<string, number> = { pigment: 10, dye: 5, mica: 8 };

export function calculateColorantMix(input: ColorantMixInput): ColorantMixResult {
  const { resinWeightG, colorantType, loadPct } = input;
  const maxSafeLoad = MAX_LOADS[colorantType];
  const colorantWeightG = resinWeightG * (loadPct / 100);
  const colorantDrops = colorantWeightG / 0.05;
  const warnings: string[] = [];

  if (loadPct > maxSafeLoad) {
    warnings.push(`${colorantType} load ${loadPct}% exceeds max safe load of ${maxSafeLoad}%. May affect cure.`);
  }

  const mathSteps: MathStep[] = [
    { label: "Colorant Weight", formula: `resinWeight × (loadPct / 100) = ${resinWeightG} × (${loadPct} / 100)`, result: Math.round(colorantWeightG * 100) / 100, unit: "g" },
    { label: "Colorant Drops (liquid)", formula: `colorantWeight / 0.05g per drop`, result: Math.round(colorantDrops), unit: "drops" },
  ];

  return { colorantWeightG, colorantDrops, maxSafeLoad, warnings, mathSteps };
}
```

### 4d. Tests: `__tests__/modules/resin/resinRatio.test.ts`

```typescript
import { calculateResinRatio } from "../../../src/modules/resin/calculators/resinRatio";

describe("Resin Ratio Calculator", () => {
  const base = { totalVolumeMl: 300, mixRatioResin: 2, mixRatioHardener: 1, unit: "ml" as const };

  test("2:1 ratio splits 300ml into 200/100", () => {
    const r = calculateResinRatio(base);
    expect(r.resinAmount).toBeCloseTo(200, 2);
    expect(r.hardenerAmount).toBeCloseTo(100, 2);
  });

  test("amounts sum to total", () => {
    const r = calculateResinRatio(base);
    expect(r.resinAmount + r.hardenerAmount).toBeCloseTo(base.totalVolumeMl, 5);
  });

  test("1:1 ratio splits equally", () => {
    const r = calculateResinRatio({ ...base, mixRatioResin: 1, mixRatioHardener: 1 });
    expect(r.resinAmount).toBeCloseTo(150, 2);
  });

  test("mathSteps populated", () => {
    const r = calculateResinRatio(base);
    expect(r.mathSteps.length).toBe(3);
    expect(r.mathSteps[0]).toHaveProperty("label");
  });
});
```

### 4e. Tests: `__tests__/modules/resin/moldVolume.test.ts`

```typescript
import { calculateMoldVolume } from "../../../src/modules/resin/calculators/moldVolume";

describe("Mold Volume Calculator", () => {
  test("cylinder volume", () => {
    // r=50mm, h=100mm → π*2500*100/1000 = 785.4ml
    const r = calculateMoldVolume({ shape: "cylinder", diameterMm: 100, heightMm: 100 });
    expect(r.volumeMl).toBeCloseTo(785.4, 0);
  });

  test("rectangle volume", () => {
    const r = calculateMoldVolume({ shape: "rectangle", lengthMm: 100, widthMm: 50, heightMm: 40 });
    expect(r.volumeMl).toBeCloseTo(200, 2);
  });

  test("sphere volume", () => {
    // r=50mm → (4/3)*π*125000/1000 = 523.6ml
    const r = calculateMoldVolume({ shape: "sphere", diameterMm: 100 });
    expect(r.volumeMl).toBeCloseTo(523.6, 0);
  });

  test("resin weight = volume * 1.1", () => {
    const r = calculateMoldVolume({ shape: "rectangle", lengthMm: 100, widthMm: 100, heightMm: 10 });
    expect(r.resinWeightG).toBeCloseTo(r.volumeMl * 1.1, 5);
  });
});
```

### 4f. Tests: `__tests__/modules/resin/colorantMix.test.ts`

```typescript
import { calculateColorantMix } from "../../../src/modules/resin/calculators/colorantMix";

describe("Colorant Mix Calculator", () => {
  test("basic pigment load", () => {
    const r = calculateColorantMix({ resinWeightG: 100, colorantType: "pigment", loadPct: 5 });
    expect(r.colorantWeightG).toBeCloseTo(5, 5);
  });

  test("no warning within safe load", () => {
    const r = calculateColorantMix({ resinWeightG: 100, colorantType: "pigment", loadPct: 10 });
    expect(r.warnings).toHaveLength(0);
  });

  test("warning when exceeding pigment max (10%)", () => {
    const r = calculateColorantMix({ resinWeightG: 100, colorantType: "pigment", loadPct: 11 });
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  test("dye max safe load is 5%", () => {
    const r = calculateColorantMix({ resinWeightG: 100, colorantType: "dye", loadPct: 6 });
    expect(r.maxSafeLoad).toBe(5);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  test("drops = weight / 0.05", () => {
    const r = calculateColorantMix({ resinWeightG: 200, colorantType: "mica", loadPct: 4 });
    expect(r.colorantDrops).toBeCloseTo(8 / 0.05, 0);
  });
});
```

---

## Task 5: Knife Making Calculators

### 5a. `src/modules/knife/calculators/heatTreat.ts`

```typescript
export interface MathStep {
  label: string;
  formula: string;
  result: number;
  unit: string;
}

export interface HeatTreatInput {
  steelName: string;
}

export interface HeatTreatResult {
  normalizeTempF: number | null;
  normalizeCycles: number;
  hardenTempF: number;
  soakMinutes: number;
  quenchMedium: string;
  temperLowF: number;
  temperHighF: number;
  expectedRockwellLow: number;
  expectedRockwellHigh: number;
  mathSteps: MathStep[];
}

// Inline lookup — knife module cannot import from soap/resin/etc.
const STEEL_LOOKUP: Record<string, Omit<HeatTreatResult, "mathSteps">> = {
  "1095": { normalizeTempF: 1600, normalizeCycles: 3, hardenTempF: 1475, soakMinutes: 5, quenchMedium: "oil", temperLowF: 350, temperHighF: 450, expectedRockwellLow: 57, expectedRockwellHigh: 60 },
  "1084": { normalizeTempF: 1600, normalizeCycles: 3, hardenTempF: 1475, soakMinutes: 5, quenchMedium: "oil", temperLowF: 350, temperHighF: 450, expectedRockwellLow: 58, expectedRockwellHigh: 62 },
  "1080": { normalizeTempF: 1600, normalizeCycles: 3, hardenTempF: 1475, soakMinutes: 5, quenchMedium: "oil", temperLowF: 350, temperHighF: 450, expectedRockwellLow: 56, expectedRockwellHigh: 60 },
  "O1":   { normalizeTempF: 1550, normalizeCycles: 2, hardenTempF: 1475, soakMinutes: 10, quenchMedium: "oil", temperLowF: 300, temperHighF: 400, expectedRockwellLow: 60, expectedRockwellHigh: 64 },
  "W2":   { normalizeTempF: 1600, normalizeCycles: 3, hardenTempF: 1475, soakMinutes: 5, quenchMedium: "water", temperLowF: 350, temperHighF: 450, expectedRockwellLow: 62, expectedRockwellHigh: 65 },
  "5160": { normalizeTempF: 1650, normalizeCycles: 3, hardenTempF: 1525, soakMinutes: 10, quenchMedium: "oil", temperLowF: 375, temperHighF: 450, expectedRockwellLow: 56, expectedRockwellHigh: 60 },
  "80CrV2": { normalizeTempF: 1600, normalizeCycles: 3, hardenTempF: 1500, soakMinutes: 8, quenchMedium: "oil", temperLowF: 350, temperHighF: 425, expectedRockwellLow: 58, expectedRockwellHigh: 62 },
  "D2":   { normalizeTempF: null, normalizeCycles: 0, hardenTempF: 1850, soakMinutes: 30, quenchMedium: "air", temperLowF: 400, temperHighF: 500, expectedRockwellLow: 59, expectedRockwellHigh: 62 },
  "A2":   { normalizeTempF: null, normalizeCycles: 0, hardenTempF: 1775, soakMinutes: 20, quenchMedium: "air", temperLowF: 350, temperHighF: 450, expectedRockwellLow: 60, expectedRockwellHigh: 63 },
  "M2":   { normalizeTempF: null, normalizeCycles: 0, hardenTempF: 2200, soakMinutes: 5, quenchMedium: "air", temperLowF: 1000, temperHighF: 1050, expectedRockwellLow: 63, expectedRockwellHigh: 66 },
  "S30V": { normalizeTempF: null, normalizeCycles: 0, hardenTempF: 1900, soakMinutes: 20, quenchMedium: "plate", temperLowF: 350, temperHighF: 500, expectedRockwellLow: 58, expectedRockwellHigh: 61 },
  "S35VN": { normalizeTempF: null, normalizeCycles: 0, hardenTempF: 1900, soakMinutes: 20, quenchMedium: "plate", temperLowF: 350, temperHighF: 500, expectedRockwellLow: 58, expectedRockwellHigh: 61 },
  "440C": { normalizeTempF: null, normalizeCycles: 0, hardenTempF: 1875, soakMinutes: 30, quenchMedium: "air", temperLowF: 300, temperHighF: 450, expectedRockwellLow: 57, expectedRockwellHigh: 60 },
  "AEB-L": { normalizeTempF: null, normalizeCycles: 0, hardenTempF: 1975, soakMinutes: 15, quenchMedium: "plate", temperLowF: 300, temperHighF: 400, expectedRockwellLow: 60, expectedRockwellHigh: 63 },
  "154CM": { normalizeTempF: null, normalizeCycles: 0, hardenTempF: 1900, soakMinutes: 20, quenchMedium: "plate", temperLowF: 350, temperHighF: 500, expectedRockwellLow: 58, expectedRockwellHigh: 61 },
};

export function calculateHeatTreat(input: HeatTreatInput): HeatTreatResult {
  const s = STEEL_LOOKUP[input.steelName];
  if (!s) throw new Error(`Steel "${input.steelName}" not found`);

  const mathSteps: MathStep[] = [
    { label: "Normalize", formula: s.normalizeTempF ? `${s.normalizeCycles} cycles at ${s.normalizeTempF}°F` : "Not required", result: s.normalizeTempF ?? 0, unit: "°F" },
    { label: "Harden", formula: `Heat to ${s.hardenTempF}°F, soak ${s.soakMinutes} min, quench in ${s.quenchMedium}`, result: s.hardenTempF, unit: "°F" },
    { label: "Temper Low", formula: `Minimum temper temperature`, result: s.temperLowF, unit: "°F" },
    { label: "Temper High", formula: `Maximum temper temperature`, result: s.temperHighF, unit: "°F" },
    { label: "Expected HRC Low", formula: `Minimum expected Rockwell C hardness`, result: s.expectedRockwellLow, unit: "HRC" },
    { label: "Expected HRC High", formula: `Maximum expected Rockwell C hardness`, result: s.expectedRockwellHigh, unit: "HRC" },
  ];

  return { ...s, mathSteps };
}
```

### 5b. `src/modules/knife/calculators/grindAngle.ts`

```typescript
import type { MathStep } from "./heatTreat";

export interface GrindAngleInput {
  bladeThicknessIn: number;
  bevelHeightIn: number;
  desiredEdgeAngleDeg: number;
}

export interface GrindAngleResult {
  grindAnglePerSideDeg: number;
  edgeThicknessIn: number;
  steelRemovalIn: number;
  mathSteps: MathStep[];
}

export function calculateGrindAngle(input: GrindAngleInput): GrindAngleResult {
  const { bladeThicknessIn, bevelHeightIn, desiredEdgeAngleDeg } = input;
  const grindAnglePerSideDeg = desiredEdgeAngleDeg / 2;
  const grindAngleRad = (grindAnglePerSideDeg * Math.PI) / 180;
  const edgeThicknessIn = 2 * bevelHeightIn * Math.tan(grindAngleRad);
  const steelRemovalIn = (bladeThicknessIn - edgeThicknessIn) / 2;

  const mathSteps: MathStep[] = [
    { label: "Grind Angle Per Side", formula: `desiredEdgeAngle / 2 = ${desiredEdgeAngleDeg} / 2`, result: Math.round(grindAnglePerSideDeg * 100) / 100, unit: "°" },
    { label: "Edge Thickness", formula: `2 × bevelHeight × tan(grindAngle) = 2 × ${bevelHeightIn} × tan(${grindAnglePerSideDeg}°)`, result: Math.round(edgeThicknessIn * 10000) / 10000, unit: "in" },
    { label: "Steel Removal Per Side", formula: `(bladeThickness - edgeThickness) / 2 = (${bladeThicknessIn} - ${Math.round(edgeThicknessIn * 10000) / 10000}) / 2`, result: Math.round(steelRemovalIn * 10000) / 10000, unit: "in" },
  ];

  return { grindAnglePerSideDeg, edgeThicknessIn, steelRemovalIn, mathSteps };
}
```

### 5c. `src/modules/knife/calculators/handleScale.ts`

```typescript
import type { MathStep } from "./heatTreat";

export interface HandleScaleInput {
  bladeLengthIn: number;
  tangLengthIn: number;
  handSize: "small" | "medium" | "large";
}

export interface HandleScaleResult {
  handleLengthIn: number;
  handleWidthIn: number;
  handleThicknessIn: number;
  pinPositions: number[];
  mathSteps: MathStep[];
}

const HAND_DIMS: Record<string, { width: number; thickness: number }> = {
  small:  { width: 1.00, thickness: 0.75 },
  medium: { width: 1.15, thickness: 0.85 },
  large:  { width: 1.30, thickness: 1.00 },
};

export function calculateHandleScale(input: HandleScaleInput): HandleScaleResult {
  const { tangLengthIn, handSize } = input;
  const dims = HAND_DIMS[handSize];
  const handleLengthIn = tangLengthIn;
  const pinPositions: number[] = [
    Math.round(handleLengthIn * 0.2 * 100) / 100,
    Math.round(handleLengthIn * 0.8 * 100) / 100,
  ];
  if (handleLengthIn > 5) {
    pinPositions.splice(1, 0, Math.round(handleLengthIn * 0.5 * 100) / 100);
  }

  const mathSteps: MathStep[] = [
    { label: "Handle Length", formula: `tang length = ${tangLengthIn}in`, result: handleLengthIn, unit: "in" },
    { label: "Handle Width", formula: `${handSize} hand size → ${dims.width}in`, result: dims.width, unit: "in" },
    { label: "Handle Thickness", formula: `${handSize} hand size → ${dims.thickness}in`, result: dims.thickness, unit: "in" },
    { label: "Pin Count", formula: handleLengthIn > 5 ? "3 pins (handle > 5in)" : "2 pins", result: pinPositions.length, unit: "pins" },
  ];

  return { handleLengthIn, handleWidthIn: dims.width, handleThicknessIn: dims.thickness, pinPositions, mathSteps };
}
```

### 5d. Tests: `__tests__/modules/knife/heatTreat.test.ts`

```typescript
import { calculateHeatTreat } from "../../../src/modules/knife/calculators/heatTreat";

describe("Heat Treat Calculator", () => {
  test("1084 returns correct harden temp", () => {
    const r = calculateHeatTreat({ steelName: "1084" });
    expect(r.hardenTempF).toBe(1475);
    expect(r.quenchMedium).toBe("oil");
  });

  test("D2 has no normalize step", () => {
    const r = calculateHeatTreat({ steelName: "D2" });
    expect(r.normalizeTempF).toBeNull();
    expect(r.normalizeCycles).toBe(0);
  });

  test("M2 air quench + high harden temp", () => {
    const r = calculateHeatTreat({ steelName: "M2" });
    expect(r.hardenTempF).toBe(2200);
    expect(r.quenchMedium).toBe("air");
  });

  test("throws on unknown steel", () => {
    expect(() => calculateHeatTreat({ steelName: "XYZ999" })).toThrow();
  });

  test("mathSteps populated", () => {
    const r = calculateHeatTreat({ steelName: "5160" });
    expect(r.mathSteps.length).toBeGreaterThan(0);
    expect(r.mathSteps[0]).toHaveProperty("unit");
  });
});
```

### 5e. Tests: `__tests__/modules/knife/grindAngle.test.ts`

```typescript
import { calculateGrindAngle } from "../../../src/modules/knife/calculators/grindAngle";

describe("Grind Angle Calculator", () => {
  const base = { bladeThicknessIn: 0.125, bevelHeightIn: 1.0, desiredEdgeAngleDeg: 20 };

  test("grind angle per side = desired / 2", () => {
    const r = calculateGrindAngle(base);
    expect(r.grindAnglePerSideDeg).toBe(10);
  });

  test("edge thickness formula", () => {
    const r = calculateGrindAngle(base);
    const expected = 2 * 1.0 * Math.tan((10 * Math.PI) / 180);
    expect(r.edgeThicknessIn).toBeCloseTo(expected, 6);
  });

  test("steel removal per side", () => {
    const r = calculateGrindAngle(base);
    expect(r.steelRemovalIn).toBeCloseTo((base.bladeThicknessIn - r.edgeThicknessIn) / 2, 6);
  });

  test("mathSteps has 3 entries", () => {
    const r = calculateGrindAngle(base);
    expect(r.mathSteps).toHaveLength(3);
  });
});
```

### 5f. Tests: `__tests__/modules/knife/handleScale.test.ts`

```typescript
import { calculateHandleScale } from "../../../src/modules/knife/calculators/handleScale";

describe("Handle Scale Calculator", () => {
  test("handle length equals tang length", () => {
    const r = calculateHandleScale({ bladeLengthIn: 6, tangLengthIn: 4.5, handSize: "medium" });
    expect(r.handleLengthIn).toBe(4.5);
  });

  test("medium hand size dimensions", () => {
    const r = calculateHandleScale({ bladeLengthIn: 6, tangLengthIn: 4, handSize: "medium" });
    expect(r.handleWidthIn).toBe(1.15);
    expect(r.handleThicknessIn).toBe(0.85);
  });

  test("2 pins for handle <= 5in", () => {
    const r = calculateHandleScale({ bladeLengthIn: 5, tangLengthIn: 4, handSize: "large" });
    expect(r.pinPositions).toHaveLength(2);
  });

  test("3 pins for handle > 5in", () => {
    const r = calculateHandleScale({ bladeLengthIn: 8, tangLengthIn: 5.5, handSize: "large" });
    expect(r.pinPositions).toHaveLength(3);
  });

  test("pin at 20% and 80% of handle length", () => {
    const r = calculateHandleScale({ bladeLengthIn: 6, tangLengthIn: 4, handSize: "small" });
    expect(r.pinPositions[0]).toBeCloseTo(0.8, 2);
    expect(r.pinPositions[1]).toBeCloseTo(3.2, 2);
  });
});
```

<!-- CONTINUED IN NEXT SECTION -->
