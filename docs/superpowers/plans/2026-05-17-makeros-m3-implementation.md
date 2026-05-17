# M3: 3D Printing Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete FDM 3D Printing module with 6 calculators, filament reference database, and printer profile system.

**Architecture:** Vertical module slice under `src/modules/printing/` with calculator engines (pure functions), reference data, and SQLite-backed profiles. UI screens in `app/(tabs)/make/printing/` using the established Stack + hub grid pattern. All calculators return `MathStep[]` for the ShowMath component.

**Tech Stack:** TypeScript, Expo Router (Stack), expo-sqlite, NativeWind, Zustand (not needed for this module), existing design-system components (CalculatorInput, ResultCard, ActionBar, ShowMath, FilterBar).

---

## File Structure

### New Files (Create)

```
src/modules/printing/
  calculators/
    printTime.ts              — Print time estimation engine
    filamentUsage.ts          — Filament weight/length/cost engine
    maxVolumetricFlow.ts      — Flow rate vs hotend capacity engine
    flowRateCalibration.ts    — E-steps correction engine
    retractionTuning.ts       — Retraction recommendation engine
    beltSteps.ts              — Steps/mm calculation engine
  data/
    filamentDatabase.ts       — Built-in filament reference catalog
    seedPrintingData.ts       — Seed function for filaments table
    printerProfiles.ts        — Profile CRUD helpers

app/(tabs)/make/printing/
  _layout.tsx                 — Stack navigator with screen names
  index.tsx                   — Hub grid (REPLACE existing placeholder)
  print-time.tsx              — Print time calculator screen
  filament-usage.tsx          — Filament usage calculator screen
  max-flow.tsx                — Max volumetric flow screen
  flow-calibration.tsx        — E-steps calibration screen
  retraction.tsx              — Retraction tuning screen
  belt-steps.tsx              — Steps/mm calculator screen
  filament-db.tsx             — Filament database browser screen
  printer-profiles.tsx        — Printer profile CRUD screen

__tests__/modules/printing/
  printTime.test.ts           — Print time engine tests
  filamentUsage.test.ts       — Filament usage engine tests
  maxVolumetricFlow.test.ts   — Max flow engine tests
  flowRateCalibration.test.ts — E-steps engine tests
  retractionTuning.test.ts    — Retraction engine tests
  beltSteps.test.ts           — Belt/steps engine tests
```

### Modified Files

```
src/core/database/schema.ts            — Add printer_profiles + printing_filaments tables + indexes
app/_layout.tsx                         — Import and call seedPrintingData()
__tests__/core/database/schema.test.ts  — Update expected table count
```

---

### Task 1: Database Schema — Printer Profiles & Filaments Tables

**Files:**
- Modify: `src/core/database/schema.ts`
- Modify: `__tests__/core/database/schema.test.ts`

- [ ] **Step 1: Add printer_profiles table to TABLE_SCHEMAS**

In `src/core/database/schema.ts`, add before the closing `};` of `TABLE_SCHEMAS`:

```typescript
  printer_profiles: `CREATE TABLE IF NOT EXISTS printer_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  build_volume_x REAL NOT NULL,
  build_volume_y REAL NOT NULL,
  build_volume_z REAL NOT NULL,
  nozzle_diameter REAL NOT NULL DEFAULT 0.4,
  max_volumetric_flow REAL,
  extruder_type TEXT NOT NULL DEFAULT 'bowden',
  bowden_length_mm REAL,
  steps_per_mm_x REAL,
  steps_per_mm_y REAL,
  steps_per_mm_z REAL,
  steps_per_mm_e REAL,
  default_speed_mms REAL DEFAULT 50,
  default_travel_mms REAL DEFAULT 150,
  is_active INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
  printing_filaments: `CREATE TABLE IF NOT EXISTS printing_filaments (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  print_temp_low INTEGER NOT NULL,
  print_temp_high INTEGER NOT NULL,
  bed_temp_low INTEGER NOT NULL,
  bed_temp_high INTEGER NOT NULL,
  max_flow_rate REAL NOT NULL,
  density REAL NOT NULL,
  retraction_dist_bowden REAL NOT NULL,
  retraction_dist_direct REAL NOT NULL,
  retraction_speed REAL NOT NULL,
  cost_per_kg REAL,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'built-in',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
```

- [ ] **Step 2: Add indexes for new tables**

In `INDEX_SCHEMAS` array, add:

```typescript
  "CREATE INDEX IF NOT EXISTS idx_printer_profiles_active ON printer_profiles(is_active)",
  "CREATE INDEX IF NOT EXISTS idx_printing_filaments_category ON printing_filaments(category)",
```

- [ ] **Step 3: Update schema test expected table count**

In `__tests__/core/database/schema.test.ts`, find the assertion for table count and update from 18 to 20 (adding printer_profiles and printing_filaments).

- [ ] **Step 4: Run tests**

Run: `npx jest __tests__/core/database/schema.test.ts --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/database/schema.ts __tests__/core/database/schema.test.ts
git commit -m "feat(printing): add printer_profiles and printing_filaments schema tables"
```

---

### Task 2: Filament Reference Database

**Files:**
- Create: `src/modules/printing/data/filamentDatabase.ts`
- Create: `src/modules/printing/data/seedPrintingData.ts`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Create filament database catalog**

Create `src/modules/printing/data/filamentDatabase.ts`:

```typescript
export interface Filament {
  category: string;
  name: string;
  printTempLow: number;
  printTempHigh: number;
  bedTempLow: number;
  bedTempHigh: number;
  maxFlowRate: number;
  density: number;
  retractionDist: { bowden: number; direct: number };
  retractionSpeed: number;
  costPerKg: number | null;
  notes: string | null;
  source: "built-in" | "user";
}

export const filamentData: Filament[] = [
  {
    category: "PLA",
    name: "Generic PLA",
    printTempLow: 190,
    printTempHigh: 220,
    bedTempLow: 50,
    bedTempHigh: 60,
    maxFlowRate: 15,
    density: 1.24,
    retractionDist: { bowden: 5, direct: 1 },
    retractionSpeed: 45,
    costPerKg: 20,
    notes: "Most forgiving filament. Good for beginners.",
    source: "built-in",
  },
  {
    category: "PLA",
    name: "PLA+ (Tough PLA)",
    printTempLow: 200,
    printTempHigh: 230,
    bedTempLow: 55,
    bedTempHigh: 65,
    maxFlowRate: 15,
    density: 1.24,
    retractionDist: { bowden: 5, direct: 1 },
    retractionSpeed: 45,
    costPerKg: 25,
    notes: "Higher impact resistance than standard PLA. Slightly higher temps.",
    source: "built-in",
  },
  {
    category: "PETG",
    name: "Generic PETG",
    printTempLow: 220,
    printTempHigh: 250,
    bedTempLow: 70,
    bedTempHigh: 85,
    maxFlowRate: 12,
    density: 1.27,
    retractionDist: { bowden: 6, direct: 1.5 },
    retractionSpeed: 35,
    costPerKg: 22,
    notes: "Strings easily. Reduce retraction speed. Good layer adhesion.",
    source: "built-in",
  },
  {
    category: "ABS",
    name: "Generic ABS",
    printTempLow: 230,
    printTempHigh: 260,
    bedTempLow: 95,
    bedTempHigh: 110,
    maxFlowRate: 14,
    density: 1.04,
    retractionDist: { bowden: 5, direct: 1 },
    retractionSpeed: 40,
    costPerKg: 20,
    notes: "Requires enclosure. Warps without heated chamber. Fumes are toxic.",
    source: "built-in",
  },
  {
    category: "ASA",
    name: "Generic ASA",
    printTempLow: 235,
    printTempHigh: 260,
    bedTempLow: 95,
    bedTempHigh: 110,
    maxFlowRate: 14,
    density: 1.07,
    retractionDist: { bowden: 5, direct: 1 },
    retractionSpeed: 40,
    costPerKg: 28,
    notes: "UV-resistant ABS alternative. Requires enclosure. Good for outdoor parts.",
    source: "built-in",
  },
  {
    category: "TPU",
    name: "TPU 95A",
    printTempLow: 220,
    printTempHigh: 250,
    bedTempLow: 40,
    bedTempHigh: 60,
    maxFlowRate: 5,
    density: 1.21,
    retractionDist: { bowden: 0, direct: 0.5 },
    retractionSpeed: 20,
    costPerKg: 35,
    notes: "Flexible. Direct drive strongly recommended. Slow speeds (20-30mm/s). Minimal retraction.",
    source: "built-in",
  },
  {
    category: "TPU",
    name: "TPU 85A (Soft)",
    printTempLow: 210,
    printTempHigh: 240,
    bedTempLow: 40,
    bedTempHigh: 55,
    maxFlowRate: 3,
    density: 1.15,
    retractionDist: { bowden: 0, direct: 0 },
    retractionSpeed: 15,
    costPerKg: 45,
    notes: "Very flexible. Direct drive required. No retraction. 15-25mm/s max.",
    source: "built-in",
  },
  {
    category: "Nylon",
    name: "Nylon PA6",
    printTempLow: 250,
    printTempHigh: 280,
    bedTempLow: 70,
    bedTempHigh: 90,
    maxFlowRate: 10,
    density: 1.14,
    retractionDist: { bowden: 5, direct: 1.5 },
    retractionSpeed: 35,
    costPerKg: 40,
    notes: "Extremely hygroscopic — must dry before printing. High strength and flexibility.",
    source: "built-in",
  },
  {
    category: "Nylon",
    name: "Nylon PA12",
    printTempLow: 240,
    printTempHigh: 270,
    bedTempLow: 70,
    bedTempHigh: 85,
    maxFlowRate: 10,
    density: 1.02,
    retractionDist: { bowden: 5, direct: 1.5 },
    retractionSpeed: 35,
    costPerKg: 50,
    notes: "Less moisture-sensitive than PA6. Lower warping. Good chemical resistance.",
    source: "built-in",
  },
  {
    category: "PC",
    name: "Polycarbonate",
    printTempLow: 260,
    printTempHigh: 300,
    bedTempLow: 105,
    bedTempHigh: 120,
    maxFlowRate: 8,
    density: 1.20,
    retractionDist: { bowden: 6, direct: 1.5 },
    retractionSpeed: 30,
    costPerKg: 45,
    notes: "Highest impact resistance. Requires all-metal hotend and enclosure. Very high temps.",
    source: "built-in",
  },
  {
    category: "HIPS",
    name: "HIPS",
    printTempLow: 220,
    printTempHigh: 250,
    bedTempLow: 90,
    bedTempHigh: 110,
    maxFlowRate: 14,
    density: 1.04,
    retractionDist: { bowden: 5, direct: 1 },
    retractionSpeed: 40,
    costPerKg: 22,
    notes: "Dissolvable support material for ABS (limonene). Can also be used standalone.",
    source: "built-in",
  },
  {
    category: "PVA",
    name: "PVA",
    printTempLow: 185,
    printTempHigh: 210,
    bedTempLow: 45,
    bedTempHigh: 60,
    maxFlowRate: 8,
    density: 1.23,
    retractionDist: { bowden: 5, direct: 1 },
    retractionSpeed: 35,
    costPerKg: 60,
    notes: "Water-soluble support material for PLA/PETG. Extremely hygroscopic.",
    source: "built-in",
  },
];
```

- [ ] **Step 2: Create seed function**

Create `src/modules/printing/data/seedPrintingData.ts`:

```typescript
import { filamentData } from "./filamentDatabase";
import { getDatabase } from "../../../core/database/connection";

export function seedPrintingData(): { filamentCount: number } {
  const db = getDatabase();

  const row = db.getFirstSync("SELECT COUNT(*) as cnt FROM printing_filaments") as { cnt: number } | null;
  const count = row?.cnt ?? 0;

  if (count === 0) {
    for (const f of filamentData) {
      db.runSync(
        `INSERT INTO printing_filaments (
          id, category, name, print_temp_low, print_temp_high,
          bed_temp_low, bed_temp_high, max_flow_rate, density,
          retraction_dist_bowden, retraction_dist_direct, retraction_speed,
          cost_per_kg, notes, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Math.random().toString(36).slice(2) + Date.now().toString(36),
          f.category,
          f.name,
          f.printTempLow,
          f.printTempHigh,
          f.bedTempLow,
          f.bedTempHigh,
          f.maxFlowRate,
          f.density,
          f.retractionDist.bowden,
          f.retractionDist.direct,
          f.retractionSpeed,
          f.costPerKg,
          f.notes,
          f.source,
        ],
      );
    }
  }

  return { filamentCount: filamentData.length };
}
```

- [ ] **Step 3: Add seed call to app layout**

In `app/_layout.tsx`, add import:

```typescript
import { seedPrintingData } from "../src/modules/printing/data/seedPrintingData";
```

Add call after `seedCncData();`:

```typescript
      seedPrintingData();
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/printing/data/filamentDatabase.ts src/modules/printing/data/seedPrintingData.ts app/_layout.tsx
git commit -m "feat(printing): add filament reference database with 12 built-in materials"
```

---

### Task 3: Printer Profile CRUD Helpers

**Files:**
- Create: `src/modules/printing/data/printerProfiles.ts`

- [ ] **Step 1: Create printer profile data helpers**

Create `src/modules/printing/data/printerProfiles.ts`:

```typescript
import { getDatabase, generateId } from "../../../core/database/connection";

export interface PrinterProfile {
  id: string;
  name: string;
  buildVolumeX: number;
  buildVolumeY: number;
  buildVolumeZ: number;
  nozzleDiameter: number;
  maxVolumetricFlow: number | null;
  extruderType: "bowden" | "direct";
  bowdenLengthMm: number | null;
  stepsPerMmX: number | null;
  stepsPerMmY: number | null;
  stepsPerMmZ: number | null;
  stepsPerMmE: number | null;
  defaultSpeedMms: number;
  defaultTravelMms: number;
  isActive: boolean;
}

interface PrinterProfileRow {
  id: string;
  name: string;
  build_volume_x: number;
  build_volume_y: number;
  build_volume_z: number;
  nozzle_diameter: number;
  max_volumetric_flow: number | null;
  extruder_type: string;
  bowden_length_mm: number | null;
  steps_per_mm_x: number | null;
  steps_per_mm_y: number | null;
  steps_per_mm_z: number | null;
  steps_per_mm_e: number | null;
  default_speed_mms: number;
  default_travel_mms: number;
  is_active: number;
}

function rowToProfile(row: PrinterProfileRow): PrinterProfile {
  return {
    id: row.id,
    name: row.name,
    buildVolumeX: row.build_volume_x,
    buildVolumeY: row.build_volume_y,
    buildVolumeZ: row.build_volume_z,
    nozzleDiameter: row.nozzle_diameter,
    maxVolumetricFlow: row.max_volumetric_flow,
    extruderType: row.extruder_type as "bowden" | "direct",
    bowdenLengthMm: row.bowden_length_mm,
    stepsPerMmX: row.steps_per_mm_x,
    stepsPerMmY: row.steps_per_mm_y,
    stepsPerMmZ: row.steps_per_mm_z,
    stepsPerMmE: row.steps_per_mm_e,
    defaultSpeedMms: row.default_speed_mms,
    defaultTravelMms: row.default_travel_mms,
    isActive: row.is_active === 1,
  };
}

export function getAllProfiles(): PrinterProfile[] {
  const db = getDatabase();
  const rows = db.getAllSync("SELECT * FROM printer_profiles ORDER BY name") as PrinterProfileRow[];
  return rows.map(rowToProfile);
}

export function getActiveProfile(): PrinterProfile | null {
  const db = getDatabase();
  const row = db.getFirstSync("SELECT * FROM printer_profiles WHERE is_active = 1") as PrinterProfileRow | null;
  return row ? rowToProfile(row) : null;
}

export function createProfile(profile: Omit<PrinterProfile, "id" | "isActive">): string {
  const db = getDatabase();
  const id = generateId();
  db.runSync(
    `INSERT INTO printer_profiles (
      id, name, build_volume_x, build_volume_y, build_volume_z,
      nozzle_diameter, max_volumetric_flow, extruder_type, bowden_length_mm,
      steps_per_mm_x, steps_per_mm_y, steps_per_mm_z, steps_per_mm_e,
      default_speed_mms, default_travel_mms, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      id,
      profile.name,
      profile.buildVolumeX,
      profile.buildVolumeY,
      profile.buildVolumeZ,
      profile.nozzleDiameter,
      profile.maxVolumetricFlow,
      profile.extruderType,
      profile.bowdenLengthMm,
      profile.stepsPerMmX,
      profile.stepsPerMmY,
      profile.stepsPerMmZ,
      profile.stepsPerMmE,
      profile.defaultSpeedMms,
      profile.defaultTravelMms,
    ],
  );
  return id;
}

export function updateProfile(id: string, profile: Partial<Omit<PrinterProfile, "id" | "isActive">>): void {
  const db = getDatabase();
  const sets: string[] = [];
  const values: (string | number | null)[] = [];

  if (profile.name !== undefined) { sets.push("name = ?"); values.push(profile.name); }
  if (profile.buildVolumeX !== undefined) { sets.push("build_volume_x = ?"); values.push(profile.buildVolumeX); }
  if (profile.buildVolumeY !== undefined) { sets.push("build_volume_y = ?"); values.push(profile.buildVolumeY); }
  if (profile.buildVolumeZ !== undefined) { sets.push("build_volume_z = ?"); values.push(profile.buildVolumeZ); }
  if (profile.nozzleDiameter !== undefined) { sets.push("nozzle_diameter = ?"); values.push(profile.nozzleDiameter); }
  if (profile.maxVolumetricFlow !== undefined) { sets.push("max_volumetric_flow = ?"); values.push(profile.maxVolumetricFlow); }
  if (profile.extruderType !== undefined) { sets.push("extruder_type = ?"); values.push(profile.extruderType); }
  if (profile.bowdenLengthMm !== undefined) { sets.push("bowden_length_mm = ?"); values.push(profile.bowdenLengthMm); }
  if (profile.stepsPerMmX !== undefined) { sets.push("steps_per_mm_x = ?"); values.push(profile.stepsPerMmX); }
  if (profile.stepsPerMmY !== undefined) { sets.push("steps_per_mm_y = ?"); values.push(profile.stepsPerMmY); }
  if (profile.stepsPerMmZ !== undefined) { sets.push("steps_per_mm_z = ?"); values.push(profile.stepsPerMmZ); }
  if (profile.stepsPerMmE !== undefined) { sets.push("steps_per_mm_e = ?"); values.push(profile.stepsPerMmE); }
  if (profile.defaultSpeedMms !== undefined) { sets.push("default_speed_mms = ?"); values.push(profile.defaultSpeedMms); }
  if (profile.defaultTravelMms !== undefined) { sets.push("default_travel_mms = ?"); values.push(profile.defaultTravelMms); }

  if (sets.length === 0) return;
  values.push(id);
  db.runSync(`UPDATE printer_profiles SET ${sets.join(", ")} WHERE id = ?`, values);
}

export function setActiveProfile(id: string): void {
  const db = getDatabase();
  db.runSync("UPDATE printer_profiles SET is_active = 0 WHERE is_active = 1");
  db.runSync("UPDATE printer_profiles SET is_active = 1 WHERE id = ?", [id]);
}

export function deleteProfile(id: string): void {
  const db = getDatabase();
  db.runSync("DELETE FROM printer_profiles WHERE id = ?", [id]);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/printing/data/printerProfiles.ts
git commit -m "feat(printing): add printer profile CRUD helpers"
```

---

### Task 4: Print Time Calculator Engine

**Files:**
- Create: `src/modules/printing/calculators/printTime.ts`
- Create: `__tests__/modules/printing/printTime.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/modules/printing/printTime.test.ts`:

```typescript
import { calculatePrintTime } from "../../../src/modules/printing/calculators/printTime";

describe("Print Time Calculator", () => {
  const baseInput = {
    xMm: 50,
    yMm: 50,
    zMm: 20,
    layerHeight: 0.2,
    infillPct: 20,
    wallCount: 3,
    printSpeedMms: 50,
    travelSpeedMms: 150,
    nozzleDiameter: 0.4,
  };

  test("calculates layer count from height and layer height", () => {
    const result = calculatePrintTime(baseInput);
    expect(result.layerCount).toBe(100); // 20mm / 0.2mm
  });

  test("returns time in minutes", () => {
    const result = calculatePrintTime(baseInput);
    expect(result.estimatedMinutes).toBeGreaterThan(0);
    expect(Number.isFinite(result.estimatedMinutes)).toBe(true);
  });

  test("higher infill increases print time", () => {
    const low = calculatePrintTime({ ...baseInput, infillPct: 10 });
    const high = calculatePrintTime({ ...baseInput, infillPct: 80 });
    expect(high.estimatedMinutes).toBeGreaterThan(low.estimatedMinutes);
  });

  test("faster speed reduces print time", () => {
    const slow = calculatePrintTime({ ...baseInput, printSpeedMms: 30 });
    const fast = calculatePrintTime({ ...baseInput, printSpeedMms: 100 });
    expect(fast.estimatedMinutes).toBeLessThan(slow.estimatedMinutes);
  });

  test("returns mathSteps array", () => {
    const result = calculatePrintTime(baseInput);
    expect(result.mathSteps.length).toBeGreaterThanOrEqual(4);
    expect(result.mathSteps[0]).toHaveProperty("label");
    expect(result.mathSteps[0]).toHaveProperty("formula");
    expect(result.mathSteps[0]).toHaveProperty("result");
    expect(result.mathSteps[0]).toHaveProperty("unit");
  });

  test("total extrusion length is positive", () => {
    const result = calculatePrintTime(baseInput);
    expect(result.totalExtrusionMm).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest __tests__/modules/printing/printTime.test.ts --no-coverage`
Expected: FAIL — module not found

- [ ] **Step 3: Implement print time calculator**

Create `src/modules/printing/calculators/printTime.ts`:

```typescript
export interface MathStep {
  label: string;
  formula: string;
  result: number;
  unit: string;
}

export interface PrintTimeInput {
  xMm: number;
  yMm: number;
  zMm: number;
  layerHeight: number;
  infillPct: number;
  wallCount: number;
  printSpeedMms: number;
  travelSpeedMms: number;
  nozzleDiameter: number;
}

export interface PrintTimeResult {
  estimatedMinutes: number;
  layerCount: number;
  totalExtrusionMm: number;
  mathSteps: MathStep[];
}

export function calculatePrintTime(input: PrintTimeInput): PrintTimeResult {
  const {
    xMm, yMm, zMm, layerHeight, infillPct, wallCount,
    printSpeedMms, travelSpeedMms, nozzleDiameter,
  } = input;

  const lineWidth = nozzleDiameter * 1.2;
  const layerCount = Math.ceil(zMm / layerHeight);

  const perimeterPerLayer = 2 * (xMm + yMm) * wallCount;
  const infillPerLayer = (xMm * yMm * (infillPct / 100)) / lineWidth;
  const solidLayers = 6; // top 3 + bottom 3
  const solidPerLayer = (xMm * yMm) / lineWidth;

  const infillLayers = Math.max(0, layerCount - solidLayers);
  const totalExtrusion =
    perimeterPerLayer * layerCount +
    infillPerLayer * infillLayers +
    solidPerLayer * Math.min(solidLayers, layerCount);

  const printTimeSec = totalExtrusion / printSpeedMms;
  const travelTimeSec = (layerCount * Math.sqrt(xMm * xMm + yMm * yMm)) / travelSpeedMms;
  const overheadSec = layerCount * 1.5;
  const totalSec = printTimeSec + travelTimeSec + overheadSec;
  const estimatedMinutes = Math.round(totalSec / 60 * 10) / 10;

  const mathSteps: MathStep[] = [
    {
      label: "Layer Count",
      formula: `ceil(${zMm} / ${layerHeight})`,
      result: layerCount,
      unit: "layers",
    },
    {
      label: "Perimeter per Layer",
      formula: `2 × (${xMm} + ${yMm}) × ${wallCount} walls`,
      result: Math.round(perimeterPerLayer * 10) / 10,
      unit: "mm",
    },
    {
      label: "Total Extrusion",
      formula: `perimeter + infill + solid layers`,
      result: Math.round(totalExtrusion),
      unit: "mm",
    },
    {
      label: "Print Time",
      formula: `${Math.round(totalExtrusion)}mm / ${printSpeedMms}mm/s + travel + overhead`,
      result: estimatedMinutes,
      unit: "min",
    },
  ];

  return {
    estimatedMinutes,
    layerCount,
    totalExtrusionMm: Math.round(totalExtrusion),
    mathSteps,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest __tests__/modules/printing/printTime.test.ts --no-coverage`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/modules/printing/calculators/printTime.ts __tests__/modules/printing/printTime.test.ts
git commit -m "feat(printing): add print time estimation calculator with tests"
```

---

### Task 5: Filament Usage & Cost Calculator Engine

**Files:**
- Create: `src/modules/printing/calculators/filamentUsage.ts`
- Create: `__tests__/modules/printing/filamentUsage.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/modules/printing/filamentUsage.test.ts`:

```typescript
import { calculateFilamentUsage } from "../../../src/modules/printing/calculators/filamentUsage";

describe("Filament Usage & Cost Calculator", () => {
  const baseInput = {
    xMm: 50,
    yMm: 50,
    zMm: 20,
    infillPct: 20,
    wallCount: 3,
    layerHeight: 0.2,
    nozzleDiameter: 0.4,
    filamentDensity: 1.24,
    filamentCostPerKg: 20,
    filamentDiameter: 1.75,
  };

  test("volume is positive", () => {
    const result = calculateFilamentUsage(baseInput);
    expect(result.volumeCm3).toBeGreaterThan(0);
  });

  test("weight = volume × density", () => {
    const result = calculateFilamentUsage(baseInput);
    expect(result.weightG).toBeCloseTo(result.volumeCm3 * 1.24, 0);
  });

  test("filament length derived from weight and cross-section", () => {
    const result = calculateFilamentUsage(baseInput);
    expect(result.filamentLengthM).toBeGreaterThan(0);
  });

  test("cost = weight/1000 × costPerKg", () => {
    const result = calculateFilamentUsage(baseInput);
    const expectedCost = (result.weightG / 1000) * 20;
    expect(result.estimatedCost).toBeCloseTo(expectedCost, 1);
  });

  test("cost is null when costPerKg is null", () => {
    const result = calculateFilamentUsage({ ...baseInput, filamentCostPerKg: null });
    expect(result.estimatedCost).toBeNull();
  });

  test("returns mathSteps", () => {
    const result = calculateFilamentUsage(baseInput);
    expect(result.mathSteps.length).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest __tests__/modules/printing/filamentUsage.test.ts --no-coverage`
Expected: FAIL

- [ ] **Step 3: Implement filament usage calculator**

Create `src/modules/printing/calculators/filamentUsage.ts`:

```typescript
import { type MathStep } from "./printTime";

export interface FilamentUsageInput {
  xMm: number;
  yMm: number;
  zMm: number;
  infillPct: number;
  wallCount: number;
  layerHeight: number;
  nozzleDiameter: number;
  filamentDensity: number;
  filamentCostPerKg: number | null;
  filamentDiameter: number;
}

export interface FilamentUsageResult {
  volumeCm3: number;
  weightG: number;
  filamentLengthM: number;
  estimatedCost: number | null;
  mathSteps: MathStep[];
}

export function calculateFilamentUsage(input: FilamentUsageInput): FilamentUsageResult {
  const {
    xMm, yMm, zMm, infillPct, wallCount, layerHeight,
    nozzleDiameter, filamentDensity, filamentCostPerKg, filamentDiameter,
  } = input;

  const lineWidth = nozzleDiameter * 1.2;
  const layerCount = Math.ceil(zMm / layerHeight);

  const perimeterPerLayer = 2 * (xMm + yMm) * wallCount;
  const infillPerLayer = (xMm * yMm * (infillPct / 100)) / lineWidth;
  const solidLayers = 6;
  const solidPerLayer = (xMm * yMm) / lineWidth;

  const infillLayers = Math.max(0, layerCount - solidLayers);
  const totalExtrusionMm =
    perimeterPerLayer * layerCount +
    infillPerLayer * infillLayers +
    solidPerLayer * Math.min(solidLayers, layerCount);

  // Volume = extrusion length × cross-section of deposited bead
  const beadArea = lineWidth * layerHeight; // mm²
  const volumeMm3 = totalExtrusionMm * beadArea;
  const volumeCm3 = Math.round(volumeMm3 / 1000 * 100) / 100;

  const weightG = Math.round(volumeCm3 * filamentDensity * 100) / 100;

  // Filament length: weight / (cross-section area × density)
  const filamentRadiusMm = filamentDiameter / 2;
  const filamentCrossSectionMm2 = Math.PI * filamentRadiusMm * filamentRadiusMm;
  const filamentLengthMm = (weightG * 1000) / (filamentCrossSectionMm2 * filamentDensity);
  const filamentLengthM = Math.round(filamentLengthMm / 1000 * 100) / 100;

  const estimatedCost = filamentCostPerKg !== null
    ? Math.round((weightG / 1000) * filamentCostPerKg * 100) / 100
    : null;

  const mathSteps: MathStep[] = [
    {
      label: "Print Volume",
      formula: `extrusion × bead area = ${Math.round(totalExtrusionMm)}mm × ${lineWidth}×${layerHeight}mm²`,
      result: volumeCm3,
      unit: "cm³",
    },
    {
      label: "Weight",
      formula: `${volumeCm3} cm³ × ${filamentDensity} g/cm³`,
      result: weightG,
      unit: "g",
    },
    {
      label: "Filament Length",
      formula: `weight / (π × (${filamentDiameter}/2)² × density)`,
      result: filamentLengthM,
      unit: "m",
    },
  ];

  if (estimatedCost !== null) {
    mathSteps.push({
      label: "Cost",
      formula: `${weightG}g / 1000 × $${filamentCostPerKg}/kg`,
      result: estimatedCost,
      unit: "$",
    });
  }

  return { volumeCm3, weightG, filamentLengthM, estimatedCost, mathSteps };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest __tests__/modules/printing/filamentUsage.test.ts --no-coverage`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/modules/printing/calculators/filamentUsage.ts __tests__/modules/printing/filamentUsage.test.ts
git commit -m "feat(printing): add filament usage & cost calculator with tests"
```

---

### Task 6: Max Volumetric Flow Calculator Engine

**Files:**
- Create: `src/modules/printing/calculators/maxVolumetricFlow.ts`
- Create: `__tests__/modules/printing/maxVolumetricFlow.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/modules/printing/maxVolumetricFlow.test.ts`:

```typescript
import { calculateMaxVolumetricFlow } from "../../../src/modules/printing/calculators/maxVolumetricFlow";

describe("Max Volumetric Flow Calculator", () => {
  const baseInput = {
    layerHeight: 0.2,
    lineWidth: 0.48,
    printSpeedMms: 50,
    hotendMaxFlow: 15,
  };

  test("calculated flow = layerHeight × lineWidth × speed", () => {
    const result = calculateMaxVolumetricFlow(baseInput);
    expect(result.calculatedFlow).toBeCloseTo(0.2 * 0.48 * 50, 2);
  });

  test("hotend capacity percentage is correct", () => {
    const result = calculateMaxVolumetricFlow(baseInput);
    const expected = (0.2 * 0.48 * 50) / 15 * 100;
    expect(result.hotendCapacityPct).toBeCloseTo(expected, 1);
  });

  test("max safe speed calculated correctly", () => {
    const result = calculateMaxVolumetricFlow(baseInput);
    const expected = 15 / (0.2 * 0.48);
    expect(result.maxSafeSpeedMms).toBeCloseTo(expected, 0);
  });

  test("status is safe when under 80%", () => {
    const result = calculateMaxVolumetricFlow({ ...baseInput, printSpeedMms: 30 });
    expect(result.status).toBe("safe");
  });

  test("status is warning when 80-100%", () => {
    // 0.2 * 0.48 * speed / 15 = 80% → speed = 125
    const result = calculateMaxVolumetricFlow({ ...baseInput, printSpeedMms: 130 });
    expect(result.status).toBe("warning");
  });

  test("status is exceeds when over 100%", () => {
    // 0.2 * 0.48 * speed / 15 > 100% → speed > 156.25
    const result = calculateMaxVolumetricFlow({ ...baseInput, printSpeedMms: 200 });
    expect(result.status).toBe("exceeds");
  });

  test("returns mathSteps", () => {
    const result = calculateMaxVolumetricFlow(baseInput);
    expect(result.mathSteps.length).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest __tests__/modules/printing/maxVolumetricFlow.test.ts --no-coverage`
Expected: FAIL

- [ ] **Step 3: Implement max volumetric flow calculator**

Create `src/modules/printing/calculators/maxVolumetricFlow.ts`:

```typescript
import { type MathStep } from "./printTime";

export interface MaxVolumetricFlowInput {
  layerHeight: number;
  lineWidth: number;
  printSpeedMms: number;
  hotendMaxFlow: number;
}

export interface MaxVolumetricFlowResult {
  calculatedFlow: number;
  hotendCapacityPct: number;
  maxSafeSpeedMms: number;
  status: "safe" | "warning" | "exceeds";
  mathSteps: MathStep[];
}

export function calculateMaxVolumetricFlow(input: MaxVolumetricFlowInput): MaxVolumetricFlowResult {
  const { layerHeight, lineWidth, printSpeedMms, hotendMaxFlow } = input;

  const calculatedFlow = Math.round(layerHeight * lineWidth * printSpeedMms * 100) / 100;
  const hotendCapacityPct = Math.round((calculatedFlow / hotendMaxFlow) * 100 * 10) / 10;
  const maxSafeSpeedMms = Math.round(hotendMaxFlow / (layerHeight * lineWidth) * 10) / 10;

  let status: "safe" | "warning" | "exceeds";
  if (hotendCapacityPct < 80) {
    status = "safe";
  } else if (hotendCapacityPct <= 100) {
    status = "warning";
  } else {
    status = "exceeds";
  }

  const mathSteps: MathStep[] = [
    {
      label: "Volumetric Flow",
      formula: `${layerHeight}mm × ${lineWidth}mm × ${printSpeedMms}mm/s`,
      result: calculatedFlow,
      unit: "mm³/s",
    },
    {
      label: "Hotend Capacity",
      formula: `${calculatedFlow} / ${hotendMaxFlow} × 100`,
      result: hotendCapacityPct,
      unit: "%",
    },
    {
      label: "Max Safe Speed",
      formula: `${hotendMaxFlow} / (${layerHeight} × ${lineWidth})`,
      result: maxSafeSpeedMms,
      unit: "mm/s",
    },
  ];

  return { calculatedFlow, hotendCapacityPct, maxSafeSpeedMms, status, mathSteps };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest __tests__/modules/printing/maxVolumetricFlow.test.ts --no-coverage`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/modules/printing/calculators/maxVolumetricFlow.ts __tests__/modules/printing/maxVolumetricFlow.test.ts
git commit -m "feat(printing): add max volumetric flow calculator with tests"
```

---

### Task 7: Flow Rate / E-Steps Calibration Engine

**Files:**
- Create: `src/modules/printing/calculators/flowRateCalibration.ts`
- Create: `__tests__/modules/printing/flowRateCalibration.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/modules/printing/flowRateCalibration.test.ts`:

```typescript
import { calculateFlowRate } from "../../../src/modules/printing/calculators/flowRateCalibration";

describe("Flow Rate / E-Steps Calibration Calculator", () => {
  test("perfect calibration returns same e-steps", () => {
    const result = calculateFlowRate({
      requestedLengthMm: 100,
      measuredLengthMm: 100,
      currentESteps: 93,
    });
    expect(result.newESteps).toBeCloseTo(93, 1);
    expect(result.flowMultiplier).toBeCloseTo(100, 1);
  });

  test("under-extrusion increases e-steps", () => {
    const result = calculateFlowRate({
      requestedLengthMm: 100,
      measuredLengthMm: 95,
      currentESteps: 93,
    });
    // new = 93 * (100/95) = 97.89
    expect(result.newESteps).toBeCloseTo(97.89, 1);
    expect(result.flowMultiplier).toBeCloseTo(105.26, 0);
  });

  test("over-extrusion decreases e-steps", () => {
    const result = calculateFlowRate({
      requestedLengthMm: 100,
      measuredLengthMm: 105,
      currentESteps: 93,
    });
    // new = 93 * (100/105) = 88.57
    expect(result.newESteps).toBeCloseTo(88.57, 1);
  });

  test("deviation shows percentage off", () => {
    const result = calculateFlowRate({
      requestedLengthMm: 100,
      measuredLengthMm: 95,
      currentESteps: 93,
    });
    expect(result.deviationPct).toBeCloseTo(5.26, 0);
  });

  test("returns mathSteps", () => {
    const result = calculateFlowRate({
      requestedLengthMm: 100,
      measuredLengthMm: 95,
      currentESteps: 93,
    });
    expect(result.mathSteps.length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest __tests__/modules/printing/flowRateCalibration.test.ts --no-coverage`
Expected: FAIL

- [ ] **Step 3: Implement flow rate calibration calculator**

Create `src/modules/printing/calculators/flowRateCalibration.ts`:

```typescript
import { type MathStep } from "./printTime";

export interface FlowRateInput {
  requestedLengthMm: number;
  measuredLengthMm: number;
  currentESteps: number;
}

export interface FlowRateResult {
  newESteps: number;
  flowMultiplier: number;
  deviationPct: number;
  mathSteps: MathStep[];
}

export function calculateFlowRate(input: FlowRateInput): FlowRateResult {
  const { requestedLengthMm, measuredLengthMm, currentESteps } = input;

  const ratio = requestedLengthMm / measuredLengthMm;
  const newESteps = Math.round(currentESteps * ratio * 100) / 100;
  const flowMultiplier = Math.round(ratio * 100 * 100) / 100;
  const deviationPct = Math.round(Math.abs(ratio - 1) * 100 * 100) / 100;

  const mathSteps: MathStep[] = [
    {
      label: "New E-Steps",
      formula: `${currentESteps} × (${requestedLengthMm} / ${measuredLengthMm})`,
      result: newESteps,
      unit: "steps/mm",
    },
    {
      label: "Flow Multiplier",
      formula: `(${requestedLengthMm} / ${measuredLengthMm}) × 100`,
      result: flowMultiplier,
      unit: "%",
    },
    {
      label: "Deviation",
      formula: `|1 - (${requestedLengthMm} / ${measuredLengthMm})| × 100`,
      result: deviationPct,
      unit: "%",
    },
  ];

  return { newESteps, flowMultiplier, deviationPct, mathSteps };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest __tests__/modules/printing/flowRateCalibration.test.ts --no-coverage`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/modules/printing/calculators/flowRateCalibration.ts __tests__/modules/printing/flowRateCalibration.test.ts
git commit -m "feat(printing): add flow rate / e-steps calibration calculator with tests"
```

---

### Task 8: Retraction Tuning Calculator Engine

**Files:**
- Create: `src/modules/printing/calculators/retractionTuning.ts`
- Create: `__tests__/modules/printing/retractionTuning.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/modules/printing/retractionTuning.test.ts`:

```typescript
import { calculateRetraction } from "../../../src/modules/printing/calculators/retractionTuning";

describe("Retraction Tuning Calculator", () => {
  test("direct drive PLA gives short retraction", () => {
    const result = calculateRetraction({
      filamentCategory: "PLA",
      extruderType: "direct",
      bowdenLengthMm: null,
      nozzleDiameter: 0.4,
    });
    expect(result.retractionDistMm).toBeLessThanOrEqual(2);
    expect(result.retractionDistMm).toBeGreaterThan(0);
  });

  test("bowden PLA gives longer retraction", () => {
    const result = calculateRetraction({
      filamentCategory: "PLA",
      extruderType: "bowden",
      bowdenLengthMm: 400,
      nozzleDiameter: 0.4,
    });
    expect(result.retractionDistMm).toBeGreaterThan(2);
    expect(result.retractionDistMm).toBeLessThanOrEqual(7);
  });

  test("longer bowden tube increases retraction distance", () => {
    const short = calculateRetraction({
      filamentCategory: "PLA",
      extruderType: "bowden",
      bowdenLengthMm: 300,
      nozzleDiameter: 0.4,
    });
    const long = calculateRetraction({
      filamentCategory: "PLA",
      extruderType: "bowden",
      bowdenLengthMm: 700,
      nozzleDiameter: 0.4,
    });
    expect(long.retractionDistMm).toBeGreaterThan(short.retractionDistMm);
  });

  test("TPU triggers warning about minimal retraction", () => {
    const result = calculateRetraction({
      filamentCategory: "TPU",
      extruderType: "direct",
      bowdenLengthMm: null,
      nozzleDiameter: 0.4,
    });
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toMatch(/flex|TPU/i);
  });

  test("returns z-hop and prime amount", () => {
    const result = calculateRetraction({
      filamentCategory: "PETG",
      extruderType: "bowden",
      bowdenLengthMm: 400,
      nozzleDiameter: 0.4,
    });
    expect(result.zHopMm).toBeGreaterThan(0);
    expect(result.primeAmountMm).toBeGreaterThan(0);
  });

  test("returns mathSteps", () => {
    const result = calculateRetraction({
      filamentCategory: "PLA",
      extruderType: "direct",
      bowdenLengthMm: null,
      nozzleDiameter: 0.4,
    });
    expect(result.mathSteps.length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest __tests__/modules/printing/retractionTuning.test.ts --no-coverage`
Expected: FAIL

- [ ] **Step 3: Implement retraction tuning calculator**

Create `src/modules/printing/calculators/retractionTuning.ts`:

```typescript
import { type MathStep } from "./printTime";

export interface RetractionInput {
  filamentCategory: string;
  extruderType: "bowden" | "direct";
  bowdenLengthMm: number | null;
  nozzleDiameter: number;
}

export interface RetractionResult {
  retractionDistMm: number;
  retractionSpeedMms: number;
  zHopMm: number;
  primeAmountMm: number;
  warnings: string[];
  mathSteps: MathStep[];
}

const BASE_RETRACTION: Record<string, { direct: number; bowden: number; speed: number }> = {
  PLA: { direct: 1.0, bowden: 4.0, speed: 45 },
  "PLA+": { direct: 1.0, bowden: 4.0, speed: 45 },
  PETG: { direct: 1.5, bowden: 5.0, speed: 35 },
  ABS: { direct: 1.0, bowden: 4.5, speed: 40 },
  ASA: { direct: 1.0, bowden: 4.5, speed: 40 },
  TPU: { direct: 0.5, bowden: 0, speed: 20 },
  Nylon: { direct: 1.5, bowden: 5.0, speed: 35 },
  PC: { direct: 1.5, bowden: 5.5, speed: 30 },
  HIPS: { direct: 1.0, bowden: 4.5, speed: 40 },
  PVA: { direct: 1.0, bowden: 4.5, speed: 35 },
};

export function calculateRetraction(input: RetractionInput): RetractionResult {
  const { filamentCategory, extruderType, bowdenLengthMm, nozzleDiameter } = input;
  const warnings: string[] = [];

  const base = BASE_RETRACTION[filamentCategory] ?? BASE_RETRACTION["PLA"];
  const isFlexible = filamentCategory === "TPU" || filamentCategory === "TPU 95A" || filamentCategory === "TPU 85A";

  let retractionDistMm: number;
  if (extruderType === "direct") {
    retractionDistMm = base.direct;
  } else {
    const tubeLength = bowdenLengthMm ?? 400;
    const scaleFactor = tubeLength / 400;
    retractionDistMm = Math.round(base.bowden * scaleFactor * 10) / 10;
    retractionDistMm = Math.min(7, retractionDistMm);
  }

  let retractionSpeedMms = base.speed;

  if (isFlexible) {
    warnings.push("Flexible filament (TPU): minimize or disable retraction. Direct drive strongly recommended.");
    if (extruderType === "bowden") {
      warnings.push("Bowden + flex is very difficult. Consider disabling retraction entirely.");
      retractionDistMm = 0;
    }
    retractionSpeedMms = Math.min(20, retractionSpeedMms);
  }

  const zHopMm = Math.round(nozzleDiameter * 0.5 * 10) / 10;
  const primeAmountMm = Math.round(retractionDistMm * 0.05 * 100) / 100;

  const mathSteps: MathStep[] = [
    {
      label: "Retraction Distance",
      formula: extruderType === "direct"
        ? `${filamentCategory} direct drive base`
        : `${base.bowden}mm × (${bowdenLengthMm ?? 400}mm / 400mm)`,
      result: retractionDistMm,
      unit: "mm",
    },
    {
      label: "Retraction Speed",
      formula: `${filamentCategory} ${extruderType} recommended`,
      result: retractionSpeedMms,
      unit: "mm/s",
    },
    {
      label: "Z-Hop",
      formula: `nozzle × 0.5 = ${nozzleDiameter} × 0.5`,
      result: zHopMm,
      unit: "mm",
    },
  ];

  return { retractionDistMm, retractionSpeedMms, zHopMm, primeAmountMm, warnings, mathSteps };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest __tests__/modules/printing/retractionTuning.test.ts --no-coverage`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/modules/printing/calculators/retractionTuning.ts __tests__/modules/printing/retractionTuning.test.ts
git commit -m "feat(printing): add retraction tuning calculator with tests"
```

---

### Task 9: Belt / Steps-per-mm Calculator Engine

**Files:**
- Create: `src/modules/printing/calculators/beltSteps.ts`
- Create: `__tests__/modules/printing/beltSteps.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/modules/printing/beltSteps.test.ts`:

```typescript
import { calculateBeltSteps } from "../../../src/modules/printing/calculators/beltSteps";

describe("Belt / Steps-per-mm Calculator", () => {
  test("GT2 belt with 20-tooth pulley, 1.8° motor, 16 microsteps", () => {
    // (360/1.8 * 16) / (20 * 2) = (200 * 16) / 40 = 80 steps/mm
    const result = calculateBeltSteps({
      axisType: "belt",
      motorStepAngle: 1.8,
      microstepping: 16,
      pulleyTeeth: 20,
      beltPitch: 2,
      leadMm: null,
    });
    expect(result.stepsPerMm).toBe(80);
    expect(result.resolutionUm).toBeCloseTo(12.5, 1);
  });

  test("GT2 belt with 16-tooth pulley, 1.8° motor, 16 microsteps", () => {
    // (200 * 16) / (16 * 2) = 3200 / 32 = 100 steps/mm
    const result = calculateBeltSteps({
      axisType: "belt",
      motorStepAngle: 1.8,
      microstepping: 16,
      pulleyTeeth: 16,
      beltPitch: 2,
      leadMm: null,
    });
    expect(result.stepsPerMm).toBe(100);
  });

  test("leadscrew with 8mm lead, 1.8° motor, 16 microsteps", () => {
    // (200 * 16) / 8 = 400 steps/mm
    const result = calculateBeltSteps({
      axisType: "leadscrew",
      motorStepAngle: 1.8,
      microstepping: 16,
      pulleyTeeth: null,
      beltPitch: null,
      leadMm: 8,
    });
    expect(result.stepsPerMm).toBe(400);
    expect(result.resolutionUm).toBeCloseTo(2.5, 1);
  });

  test("0.9° motor doubles steps/mm", () => {
    const result = calculateBeltSteps({
      axisType: "belt",
      motorStepAngle: 0.9,
      microstepping: 16,
      pulleyTeeth: 20,
      beltPitch: 2,
      leadMm: null,
    });
    // (360/0.9 * 16) / (20 * 2) = (400 * 16) / 40 = 160
    expect(result.stepsPerMm).toBe(160);
  });

  test("returns mathSteps", () => {
    const result = calculateBeltSteps({
      axisType: "belt",
      motorStepAngle: 1.8,
      microstepping: 16,
      pulleyTeeth: 20,
      beltPitch: 2,
      leadMm: null,
    });
    expect(result.mathSteps.length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest __tests__/modules/printing/beltSteps.test.ts --no-coverage`
Expected: FAIL

- [ ] **Step 3: Implement belt/steps calculator**

Create `src/modules/printing/calculators/beltSteps.ts`:

```typescript
import { type MathStep } from "./printTime";

export interface BeltStepsInput {
  axisType: "belt" | "leadscrew";
  motorStepAngle: number;
  microstepping: number;
  pulleyTeeth: number | null;
  beltPitch: number | null;
  leadMm: number | null;
}

export interface BeltStepsResult {
  stepsPerMm: number;
  resolutionUm: number;
  mathSteps: MathStep[];
}

export function calculateBeltSteps(input: BeltStepsInput): BeltStepsResult {
  const { axisType, motorStepAngle, microstepping, pulleyTeeth, beltPitch, leadMm } = input;

  const stepsPerRevolution = (360 / motorStepAngle) * microstepping;
  let stepsPerMm: number;
  let formula: string;

  if (axisType === "belt") {
    const teeth = pulleyTeeth ?? 20;
    const pitch = beltPitch ?? 2;
    const mmPerRevolution = teeth * pitch;
    stepsPerMm = stepsPerRevolution / mmPerRevolution;
    formula = `(360/${motorStepAngle} × ${microstepping}) / (${teeth} × ${pitch})`;
  } else {
    const lead = leadMm ?? 8;
    stepsPerMm = stepsPerRevolution / lead;
    formula = `(360/${motorStepAngle} × ${microstepping}) / ${lead}`;
  }

  stepsPerMm = Math.round(stepsPerMm * 1000) / 1000;
  const resolutionUm = Math.round((1 / stepsPerMm) * 1000 * 100) / 100;

  const mathSteps: MathStep[] = [
    {
      label: "Steps per Revolution",
      formula: `360 / ${motorStepAngle}° × ${microstepping}`,
      result: stepsPerRevolution,
      unit: "steps/rev",
    },
    {
      label: "Steps per mm",
      formula,
      result: stepsPerMm,
      unit: "steps/mm",
    },
    {
      label: "Resolution",
      formula: `1 / ${stepsPerMm} × 1000`,
      result: resolutionUm,
      unit: "µm",
    },
  ];

  return { stepsPerMm, resolutionUm, mathSteps };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest __tests__/modules/printing/beltSteps.test.ts --no-coverage`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/modules/printing/calculators/beltSteps.ts __tests__/modules/printing/beltSteps.test.ts
git commit -m "feat(printing): add belt / steps-per-mm calculator with tests"
```

---

### Task 10: Run Full Test Suite

**Files:** None (verification only)

- [ ] **Step 1: Run all printing tests**

Run: `npx jest __tests__/modules/printing/ --no-coverage`
Expected: PASS — all 35 tests across 6 files

- [ ] **Step 2: Run full test suite for regressions**

Run: `npx jest --no-coverage`
Expected: PASS — all ~170+ tests green (138 existing + ~35 new)

---

### Task 11: Printing Stack Layout & Hub Screen

**Files:**
- Create: `app/(tabs)/make/printing/_layout.tsx`
- Modify: `app/(tabs)/make/printing/index.tsx` (replace placeholder)

- [ ] **Step 1: Create Stack layout**

Create `app/(tabs)/make/printing/_layout.tsx`:

```typescript
import { Stack } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function PrintingLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="print-time" options={{ title: "Print Time" }} />
      <Stack.Screen name="filament-usage" options={{ title: "Filament Usage" }} />
      <Stack.Screen name="max-flow" options={{ title: "Max Flow Rate" }} />
      <Stack.Screen name="flow-calibration" options={{ title: "E-Steps Calibration" }} />
      <Stack.Screen name="retraction" options={{ title: "Retraction Tuning" }} />
      <Stack.Screen name="belt-steps" options={{ title: "Steps/mm" }} />
      <Stack.Screen name="filament-db" options={{ title: "Filament Database" }} />
      <Stack.Screen name="printer-profiles" options={{ title: "My Printers" }} />
    </Stack>
  );
}
```

- [ ] **Step 2: Replace placeholder hub screen**

Replace `app/(tabs)/make/printing/index.tsx` with:

```typescript
import { View, Text, Pressable, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const ITEMS = [
  { name: "Print Time", route: "/make/printing/print-time" },
  { name: "Filament Usage", route: "/make/printing/filament-usage" },
  { name: "Max Flow Rate", route: "/make/printing/max-flow" },
  { name: "E-Steps Calibration", route: "/make/printing/flow-calibration" },
  { name: "Retraction Tuning", route: "/make/printing/retraction" },
  { name: "Steps/mm", route: "/make/printing/belt-steps" },
  { name: "Filament Database", route: "/make/printing/filament-db" },
  { name: "My Printers", route: "/make/printing/printer-profiles" },
];

export default function PrintingHome() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          3D Printing
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          {ITEMS.length} tools
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {ITEMS.map((item) => (
            <Pressable
              key={item.name}
              onPress={() => router.push(item.route as any)}
              className="rounded-xl p-4 items-center justify-center"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                width: "47%",
                minHeight: 80,
              }}
            >
              <Text
                className="text-[13px] text-center"
                style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
              >
                {item.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/make/printing/_layout.tsx app/(tabs)/make/printing/index.tsx
git commit -m "feat(printing): add Stack layout and hub screen with 8 tiles"
```

---

### Task 12: Print Time Calculator Screen

**Files:**
- Create: `app/(tabs)/make/printing/print-time.tsx`

- [ ] **Step 1: Create print time screen**

Create `app/(tabs)/make/printing/print-time.tsx`:

```typescript
import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculatePrintTime } from "../../../../src/modules/printing/calculators/printTime";
import { getActiveProfile } from "../../../../src/modules/printing/data/printerProfiles";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { ShowMath } from "../../../../src/design-system/components/ShowMath";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function PrintTimeScreen() {
  const { colors } = useTheme();
  const profile = useMemo(() => getActiveProfile(), []);

  const [xMm, setXMm] = useState("");
  const [yMm, setYMm] = useState("");
  const [zMm, setZMm] = useState("");
  const [layerHeight, setLayerHeight] = useState("0.2");
  const [infillPct, setInfillPct] = useState("20");
  const [wallCount, setWallCount] = useState("3");
  const [printSpeed, setPrintSpeed] = useState(profile?.defaultSpeedMms?.toString() ?? "50");
  const [travelSpeed, setTravelSpeed] = useState(profile?.defaultTravelMms?.toString() ?? "150");

  const results = useMemo(() => {
    const x = parseFloat(xMm);
    const y = parseFloat(yMm);
    const z = parseFloat(zMm);
    const lh = parseFloat(layerHeight);
    const infill = parseFloat(infillPct);
    const walls = parseInt(wallCount, 10);
    const ps = parseFloat(printSpeed);
    const ts = parseFloat(travelSpeed);

    if (!x || !y || !z || !lh || !ps || !ts) return null;
    if (x <= 0 || y <= 0 || z <= 0 || lh <= 0) return null;

    return calculatePrintTime({
      xMm: x, yMm: y, zMm: z, layerHeight: lh,
      infillPct: infill || 0, wallCount: walls || 3,
      printSpeedMms: ps, travelSpeedMms: ts,
      nozzleDiameter: profile?.nozzleDiameter ?? 0.4,
    });
  }, [xMm, yMm, zMm, layerHeight, infillPct, wallCount, printSpeed, travelSpeed, profile]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    const hours = Math.floor(results.estimatedMinutes / 60);
    const mins = Math.round(results.estimatedMinutes % 60);
    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    return [
      { label: "Estimated Time", value: timeStr, unit: "", highlight: true },
      { label: "Layer Count", value: `${results.layerCount}`, unit: "layers" },
      { label: "Total Extrusion", value: `${(results.totalExtrusionMm / 1000).toFixed(1)}`, unit: "m" },
    ];
  }, [results]);

  const mathSteps = useMemo(() => {
    if (!results) return [];
    return results.mathSteps.map((s) => ({
      label: s.label, formula: s.formula, result: `${s.result} ${s.unit}`,
    }));
  }, [results]);

  const handleSave = () => {
    if (!results) { Alert.alert("No Results", "Enter valid inputs to save."); return; }
    try {
      CalculatorService.save({
        module: "printing", calculatorType: "print-time",
        inputsJson: { xMm, yMm, zMm, layerHeight, infillPct, wallCount, printSpeed, travelSpeed },
        outputsJson: results,
        label: `${resultItems[0]?.value} — ${results.layerCount} layers`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch { Alert.alert("Error", "Failed to save result."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          Print Time
        </Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>
          Estimate print duration from part dimensions{profile ? ` • ${profile.name}` : ""}
        </Text>

        <CalculatorInput label="Width (X)" value={xMm} onChangeText={setXMm} unit="mm" placeholder="50" />
        <CalculatorInput label="Depth (Y)" value={yMm} onChangeText={setYMm} unit="mm" placeholder="50" />
        <CalculatorInput label="Height (Z)" value={zMm} onChangeText={setZMm} unit="mm" placeholder="20" />
        <CalculatorInput label="Layer Height" value={layerHeight} onChangeText={setLayerHeight} unit="mm" placeholder="0.2" />
        <CalculatorInput label="Infill" value={infillPct} onChangeText={setInfillPct} unit="%" placeholder="20" />
        <CalculatorInput label="Wall Count" value={wallCount} onChangeText={setWallCount} placeholder="3" />
        <CalculatorInput label="Print Speed" value={printSpeed} onChangeText={setPrintSpeed} unit="mm/s" placeholder="50" />
        <CalculatorInput label="Travel Speed" value={travelSpeed} onChangeText={setTravelSpeed} unit="mm/s" placeholder="150" />

        {results ? (
          <>
            <ResultCard title="Results" results={resultItems} />
            <ShowMath steps={mathSteps} />
          </>
        ) : (
          <View className="rounded-xl p-4 mt-4 items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
              Enter part dimensions to estimate print time
            </Text>
          </View>
        )}

        <ActionBar onSaveToHistory={handleSave} onAddToQuote={() => Alert.alert("Coming Soon", "Quote feature coming soon.")} onLogToProject={() => Alert.alert("Coming Soon", "Project logging coming soon.")} />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/make/printing/print-time.tsx
git commit -m "feat(printing): add print time calculator screen"
```

---

### Task 13: Filament Usage, Max Flow, Flow Calibration Screens

**Files:**
- Create: `app/(tabs)/make/printing/filament-usage.tsx`
- Create: `app/(tabs)/make/printing/max-flow.tsx`
- Create: `app/(tabs)/make/printing/flow-calibration.tsx`

- [ ] **Step 1: Create filament usage screen**

Create `app/(tabs)/make/printing/filament-usage.tsx`:

```typescript
import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateFilamentUsage } from "../../../../src/modules/printing/calculators/filamentUsage";
import { getActiveProfile } from "../../../../src/modules/printing/data/printerProfiles";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { ShowMath } from "../../../../src/design-system/components/ShowMath";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function FilamentUsageScreen() {
  const { colors } = useTheme();
  const profile = useMemo(() => getActiveProfile(), []);

  const [xMm, setXMm] = useState("");
  const [yMm, setYMm] = useState("");
  const [zMm, setZMm] = useState("");
  const [infillPct, setInfillPct] = useState("20");
  const [wallCount, setWallCount] = useState("3");
  const [layerHeight, setLayerHeight] = useState("0.2");
  const [density, setDensity] = useState("1.24");
  const [costPerKg, setCostPerKg] = useState("20");
  const [filDiameter, setFilDiameter] = useState("1.75");

  const results = useMemo(() => {
    const x = parseFloat(xMm); const y = parseFloat(yMm); const z = parseFloat(zMm);
    const lh = parseFloat(layerHeight); const d = parseFloat(density); const fd = parseFloat(filDiameter);
    if (!x || !y || !z || !lh || !d || !fd || x <= 0 || y <= 0 || z <= 0) return null;
    const cost = parseFloat(costPerKg);
    return calculateFilamentUsage({
      xMm: x, yMm: y, zMm: z, infillPct: parseFloat(infillPct) || 0,
      wallCount: parseInt(wallCount, 10) || 3, layerHeight: lh,
      nozzleDiameter: profile?.nozzleDiameter ?? 0.4,
      filamentDensity: d, filamentCostPerKg: isNaN(cost) ? null : cost, filamentDiameter: fd,
    });
  }, [xMm, yMm, zMm, infillPct, wallCount, layerHeight, density, costPerKg, filDiameter, profile]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    const items = [
      { label: "Volume", value: `${results.volumeCm3}`, unit: "cm³" },
      { label: "Weight", value: `${results.weightG}`, unit: "g", highlight: true },
      { label: "Filament Length", value: `${results.filamentLengthM}`, unit: "m" },
    ];
    if (results.estimatedCost !== null) {
      items.push({ label: "Cost", value: `$${results.estimatedCost}`, unit: "", highlight: false });
    }
    return items;
  }, [results]);

  const mathSteps = useMemo(() => {
    if (!results) return [];
    return results.mathSteps.map((s) => ({ label: s.label, formula: s.formula, result: `${s.result} ${s.unit}` }));
  }, [results]);

  const handleSave = () => {
    if (!results) { Alert.alert("No Results", "Enter valid inputs."); return; }
    try {
      CalculatorService.save({ module: "printing", calculatorType: "filament-usage", inputsJson: { xMm, yMm, zMm, infillPct, wallCount, layerHeight, density, costPerKg, filDiameter }, outputsJson: results, label: `${results.weightG}g — ${results.filamentLengthM}m` });
      Alert.alert("Saved", "Result saved to history.");
    } catch { Alert.alert("Error", "Failed to save."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>Filament Usage</Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>Estimate weight, length, and cost of filament</Text>
        <CalculatorInput label="Width (X)" value={xMm} onChangeText={setXMm} unit="mm" placeholder="50" />
        <CalculatorInput label="Depth (Y)" value={yMm} onChangeText={setYMm} unit="mm" placeholder="50" />
        <CalculatorInput label="Height (Z)" value={zMm} onChangeText={setZMm} unit="mm" placeholder="20" />
        <CalculatorInput label="Infill" value={infillPct} onChangeText={setInfillPct} unit="%" placeholder="20" />
        <CalculatorInput label="Walls" value={wallCount} onChangeText={setWallCount} placeholder="3" />
        <CalculatorInput label="Layer Height" value={layerHeight} onChangeText={setLayerHeight} unit="mm" placeholder="0.2" />
        <CalculatorInput label="Filament Density" value={density} onChangeText={setDensity} unit="g/cm³" placeholder="1.24" />
        <CalculatorInput label="Cost per kg" value={costPerKg} onChangeText={setCostPerKg} unit="$/kg" placeholder="20" />
        <CalculatorInput label="Filament Diameter" value={filDiameter} onChangeText={setFilDiameter} unit="mm" placeholder="1.75" />
        {results ? (<><ResultCard title="Results" results={resultItems} /><ShowMath steps={mathSteps} /></>) : (
          <View className="rounded-xl p-4 mt-4 items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>Enter dimensions to estimate filament usage</Text>
          </View>
        )}
        <ActionBar onSaveToHistory={handleSave} onAddToQuote={() => Alert.alert("Coming Soon")} onLogToProject={() => Alert.alert("Coming Soon")} />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Create max flow screen**

Create `app/(tabs)/make/printing/max-flow.tsx`:

```typescript
import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateMaxVolumetricFlow } from "../../../../src/modules/printing/calculators/maxVolumetricFlow";
import { getActiveProfile } from "../../../../src/modules/printing/data/printerProfiles";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { ShowMath } from "../../../../src/design-system/components/ShowMath";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function MaxFlowScreen() {
  const { colors } = useTheme();
  const profile = useMemo(() => getActiveProfile(), []);

  const [layerHeight, setLayerHeight] = useState("0.2");
  const [lineWidth, setLineWidth] = useState("0.48");
  const [printSpeed, setPrintSpeed] = useState(profile?.defaultSpeedMms?.toString() ?? "50");
  const [hotendMax, setHotendMax] = useState(profile?.maxVolumetricFlow?.toString() ?? "15");

  const results = useMemo(() => {
    const lh = parseFloat(layerHeight); const lw = parseFloat(lineWidth);
    const sp = parseFloat(printSpeed); const mx = parseFloat(hotendMax);
    if (!lh || !lw || !sp || !mx || lh <= 0 || lw <= 0 || sp <= 0 || mx <= 0) return null;
    return calculateMaxVolumetricFlow({ layerHeight: lh, lineWidth: lw, printSpeedMms: sp, hotendMaxFlow: mx });
  }, [layerHeight, lineWidth, printSpeed, hotendMax]);

  const statusColor = results?.status === "safe" ? "#22c55e" : results?.status === "warning" ? "#f59e0b" : "#ef4444";

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Calculated Flow", value: `${results.calculatedFlow}`, unit: "mm³/s", highlight: true },
      { label: "Hotend Capacity", value: `${results.hotendCapacityPct}%`, unit: results.status },
      { label: "Max Safe Speed", value: `${results.maxSafeSpeedMms}`, unit: "mm/s" },
    ];
  }, [results]);

  const mathSteps = useMemo(() => {
    if (!results) return [];
    return results.mathSteps.map((s) => ({ label: s.label, formula: s.formula, result: `${s.result} ${s.unit}` }));
  }, [results]);

  const handleSave = () => {
    if (!results) { Alert.alert("No Results", "Enter valid inputs."); return; }
    try {
      CalculatorService.save({ module: "printing", calculatorType: "max-flow", inputsJson: { layerHeight, lineWidth, printSpeed, hotendMax }, outputsJson: results, label: `${results.calculatedFlow} mm³/s (${results.status})` });
      Alert.alert("Saved", "Result saved.");
    } catch { Alert.alert("Error", "Failed to save."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>Max Volumetric Flow</Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>Check if your speed exceeds hotend capacity{profile ? ` • ${profile.name}` : ""}</Text>
        <CalculatorInput label="Layer Height" value={layerHeight} onChangeText={setLayerHeight} unit="mm" placeholder="0.2" />
        <CalculatorInput label="Line Width" value={lineWidth} onChangeText={setLineWidth} unit="mm" placeholder="0.48" />
        <CalculatorInput label="Print Speed" value={printSpeed} onChangeText={setPrintSpeed} unit="mm/s" placeholder="50" />
        <CalculatorInput label="Hotend Max Flow" value={hotendMax} onChangeText={setHotendMax} unit="mm³/s" placeholder="15" />
        {results ? (
          <>
            <ResultCard title="Results" results={resultItems} />
            <View className="rounded-lg p-3 mt-3" style={{ backgroundColor: statusColor + "20", borderWidth: 1, borderColor: statusColor }}>
              <Text className="text-[13px] font-medium" style={{ color: statusColor }}>
                {results.status === "safe" ? "Safe — within hotend capacity" : results.status === "warning" ? "Warning — approaching hotend limit" : "Exceeds — reduce speed or use thinner layers"}
              </Text>
            </View>
            <ShowMath steps={mathSteps} />
          </>
        ) : (
          <View className="rounded-xl p-4 mt-4 items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>Enter parameters to check flow rate</Text>
          </View>
        )}
        <ActionBar onSaveToHistory={handleSave} onAddToQuote={() => Alert.alert("Coming Soon")} onLogToProject={() => Alert.alert("Coming Soon")} />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: Create flow calibration screen**

Create `app/(tabs)/make/printing/flow-calibration.tsx`:

```typescript
import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateFlowRate } from "../../../../src/modules/printing/calculators/flowRateCalibration";
import { getActiveProfile } from "../../../../src/modules/printing/data/printerProfiles";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { ShowMath } from "../../../../src/design-system/components/ShowMath";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function FlowCalibrationScreen() {
  const { colors } = useTheme();
  const profile = useMemo(() => getActiveProfile(), []);

  const [requested, setRequested] = useState("100");
  const [measured, setMeasured] = useState("");
  const [currentESteps, setCurrentESteps] = useState(profile?.stepsPerMmE?.toString() ?? "93");

  const results = useMemo(() => {
    const req = parseFloat(requested); const meas = parseFloat(measured); const steps = parseFloat(currentESteps);
    if (!req || !meas || !steps || req <= 0 || meas <= 0 || steps <= 0) return null;
    return calculateFlowRate({ requestedLengthMm: req, measuredLengthMm: meas, currentESteps: steps });
  }, [requested, measured, currentESteps]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "New E-Steps", value: `${results.newESteps}`, unit: "steps/mm", highlight: true },
      { label: "Flow Multiplier", value: `${results.flowMultiplier}%`, unit: "" },
      { label: "Deviation", value: `${results.deviationPct}%`, unit: "" },
    ];
  }, [results]);

  const mathSteps = useMemo(() => {
    if (!results) return [];
    return results.mathSteps.map((s) => ({ label: s.label, formula: s.formula, result: `${s.result} ${s.unit}` }));
  }, [results]);

  const handleSave = () => {
    if (!results) { Alert.alert("No Results", "Enter valid inputs."); return; }
    try {
      CalculatorService.save({ module: "printing", calculatorType: "flow-calibration", inputsJson: { requested, measured, currentESteps }, outputsJson: results, label: `E-Steps: ${results.newESteps} (${results.deviationPct}% off)` });
      Alert.alert("Saved", "Result saved.");
    } catch { Alert.alert("Error", "Failed to save."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>E-Steps Calibration</Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>Calculate corrected extruder steps/mm{profile ? ` • ${profile.name}` : ""}</Text>
        <CalculatorInput label="Requested Length" value={requested} onChangeText={setRequested} unit="mm" placeholder="100" />
        <CalculatorInput label="Measured Length" value={measured} onChangeText={setMeasured} unit="mm" placeholder="95" />
        <CalculatorInput label="Current E-Steps" value={currentESteps} onChangeText={setCurrentESteps} unit="steps/mm" placeholder="93" />
        {results ? (<><ResultCard title="Results" results={resultItems} /><ShowMath steps={mathSteps} /></>) : (
          <View className="rounded-xl p-4 mt-4 items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>Mark filament, extrude 100mm, measure actual length</Text>
          </View>
        )}
        <ActionBar onSaveToHistory={handleSave} onAddToQuote={() => Alert.alert("Coming Soon")} onLogToProject={() => Alert.alert("Coming Soon")} />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/(tabs)/make/printing/filament-usage.tsx app/(tabs)/make/printing/max-flow.tsx app/(tabs)/make/printing/flow-calibration.tsx
git commit -m "feat(printing): add filament usage, max flow, and e-steps calibration screens"
```

---

### Task 14: Retraction Tuning & Belt Steps Screens

**Files:**
- Create: `app/(tabs)/make/printing/retraction.tsx`
- Create: `app/(tabs)/make/printing/belt-steps.tsx`

- [ ] **Step 1: Create retraction tuning screen**

Create `app/(tabs)/make/printing/retraction.tsx`:

```typescript
import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateRetraction } from "../../../../src/modules/printing/calculators/retractionTuning";
import { getActiveProfile } from "../../../../src/modules/printing/data/printerProfiles";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { ShowMath } from "../../../../src/design-system/components/ShowMath";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const FILAMENT_OPTIONS = [
  { label: "PLA", value: "PLA" },
  { label: "PETG", value: "PETG" },
  { label: "ABS", value: "ABS" },
  { label: "TPU", value: "TPU" },
];

const EXTRUDER_OPTIONS = [
  { label: "Bowden", value: "bowden" },
  { label: "Direct", value: "direct" },
];

export default function RetractionScreen() {
  const { colors } = useTheme();
  const profile = useMemo(() => getActiveProfile(), []);

  const [filament, setFilament] = useState("PLA");
  const [extruder, setExtruder] = useState(profile?.extruderType ?? "bowden");
  const [bowdenLength, setBowdenLength] = useState(profile?.bowdenLengthMm?.toString() ?? "400");

  const results = useMemo(() => {
    return calculateRetraction({
      filamentCategory: filament,
      extruderType: extruder as "bowden" | "direct",
      bowdenLengthMm: extruder === "bowden" ? (parseFloat(bowdenLength) || 400) : null,
      nozzleDiameter: profile?.nozzleDiameter ?? 0.4,
    });
  }, [filament, extruder, bowdenLength, profile]);

  const resultItems = useMemo(() => [
    { label: "Retraction Distance", value: `${results.retractionDistMm}`, unit: "mm", highlight: true },
    { label: "Retraction Speed", value: `${results.retractionSpeedMms}`, unit: "mm/s" },
    { label: "Z-Hop", value: `${results.zHopMm}`, unit: "mm" },
    { label: "Extra Prime", value: `${results.primeAmountMm}`, unit: "mm" },
  ], [results]);

  const mathSteps = useMemo(() => results.mathSteps.map((s) => ({ label: s.label, formula: s.formula, result: `${s.result} ${s.unit}` })), [results]);

  const handleSave = () => {
    try {
      CalculatorService.save({ module: "printing", calculatorType: "retraction", inputsJson: { filament, extruder, bowdenLength }, outputsJson: results, label: `${filament} ${extruder}: ${results.retractionDistMm}mm @ ${results.retractionSpeedMms}mm/s` });
      Alert.alert("Saved", "Result saved.");
    } catch { Alert.alert("Error", "Failed to save."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>Retraction Tuning</Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>Recommended retraction settings{profile ? ` • ${profile.name}` : ""}</Text>

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>Filament</Text>
        <FilterBar options={FILAMENT_OPTIONS} selected={filament} onSelect={setFilament} />

        <Text className="text-[12px] uppercase tracking-wider mb-2 mt-3" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>Extruder</Text>
        <FilterBar options={EXTRUDER_OPTIONS} selected={extruder} onSelect={setExtruder} />

        {extruder === "bowden" && (
          <CalculatorInput label="Bowden Tube Length" value={bowdenLength} onChangeText={setBowdenLength} unit="mm" placeholder="400" />
        )}

        <ResultCard title="Recommended Settings" results={resultItems} />
        {results.warnings.length > 0 && (
          <View className="rounded-lg p-3 mt-3" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: "#f59e0b" }}>
            {results.warnings.map((w, i) => (
              <Text key={i} className="text-[12px]" style={{ fontFamily: "Inter_400Regular", color: "#f59e0b" }}>{w}</Text>
            ))}
          </View>
        )}
        <ShowMath steps={mathSteps} />
        <ActionBar onSaveToHistory={handleSave} onAddToQuote={() => Alert.alert("Coming Soon")} onLogToProject={() => Alert.alert("Coming Soon")} />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Create belt steps screen**

Create `app/(tabs)/make/printing/belt-steps.tsx`:

```typescript
import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateBeltSteps } from "../../../../src/modules/printing/calculators/beltSteps";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { ShowMath } from "../../../../src/design-system/components/ShowMath";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const AXIS_OPTIONS = [
  { label: "Belt", value: "belt" },
  { label: "Leadscrew", value: "leadscrew" },
];

const MOTOR_OPTIONS = [
  { label: "1.8°", value: "1.8" },
  { label: "0.9°", value: "0.9" },
];

export default function BeltStepsScreen() {
  const { colors } = useTheme();

  const [axisType, setAxisType] = useState("belt");
  const [motorAngle, setMotorAngle] = useState("1.8");
  const [microstepping, setMicrostepping] = useState("16");
  const [pulleyTeeth, setPulleyTeeth] = useState("20");
  const [beltPitch, setBeltPitch] = useState("2");
  const [leadMm, setLeadMm] = useState("8");

  const results = useMemo(() => {
    const ms = parseInt(microstepping, 10);
    if (!ms || ms <= 0) return null;
    return calculateBeltSteps({
      axisType: axisType as "belt" | "leadscrew",
      motorStepAngle: parseFloat(motorAngle),
      microstepping: ms,
      pulleyTeeth: axisType === "belt" ? (parseInt(pulleyTeeth, 10) || 20) : null,
      beltPitch: axisType === "belt" ? (parseFloat(beltPitch) || 2) : null,
      leadMm: axisType === "leadscrew" ? (parseFloat(leadMm) || 8) : null,
    });
  }, [axisType, motorAngle, microstepping, pulleyTeeth, beltPitch, leadMm]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Steps/mm", value: `${results.stepsPerMm}`, unit: "steps/mm", highlight: true },
      { label: "Resolution", value: `${results.resolutionUm}`, unit: "µm" },
    ];
  }, [results]);

  const mathSteps = useMemo(() => {
    if (!results) return [];
    return results.mathSteps.map((s) => ({ label: s.label, formula: s.formula, result: `${s.result} ${s.unit}` }));
  }, [results]);

  const handleSave = () => {
    if (!results) { Alert.alert("No Results", "Enter valid inputs."); return; }
    try {
      CalculatorService.save({ module: "printing", calculatorType: "belt-steps", inputsJson: { axisType, motorAngle, microstepping, pulleyTeeth, beltPitch, leadMm }, outputsJson: results, label: `${results.stepsPerMm} steps/mm (${results.resolutionUm}µm)` });
      Alert.alert("Saved", "Result saved.");
    } catch { Alert.alert("Error", "Failed to save."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>Steps/mm Calculator</Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>Calculate steps/mm for belt or leadscrew axes</Text>

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>Axis Type</Text>
        <FilterBar options={AXIS_OPTIONS} selected={axisType} onSelect={setAxisType} />

        <Text className="text-[12px] uppercase tracking-wider mb-2 mt-3" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>Motor Step Angle</Text>
        <FilterBar options={MOTOR_OPTIONS} selected={motorAngle} onSelect={setMotorAngle} />

        <CalculatorInput label="Microstepping" value={microstepping} onChangeText={setMicrostepping} placeholder="16" />

        {axisType === "belt" ? (
          <>
            <CalculatorInput label="Pulley Teeth" value={pulleyTeeth} onChangeText={setPulleyTeeth} placeholder="20" />
            <CalculatorInput label="Belt Pitch" value={beltPitch} onChangeText={setBeltPitch} unit="mm" placeholder="2" />
          </>
        ) : (
          <CalculatorInput label="Lead" value={leadMm} onChangeText={setLeadMm} unit="mm" placeholder="8" />
        )}

        {results ? (<><ResultCard title="Results" results={resultItems} /><ShowMath steps={mathSteps} /></>) : (
          <View className="rounded-xl p-4 mt-4 items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>Configure axis to calculate steps/mm</Text>
          </View>
        )}
        <ActionBar onSaveToHistory={handleSave} onAddToQuote={() => Alert.alert("Coming Soon")} onLogToProject={() => Alert.alert("Coming Soon")} />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/make/printing/retraction.tsx app/(tabs)/make/printing/belt-steps.tsx
git commit -m "feat(printing): add retraction tuning and belt steps/mm screens"
```

---

### Task 15: Filament Database Browser Screen

**Files:**
- Create: `app/(tabs)/make/printing/filament-db.tsx`

- [ ] **Step 1: Create filament database screen**

Create `app/(tabs)/make/printing/filament-db.tsx`:

```typescript
import { useState, useMemo } from "react";
import { SafeAreaView, FlatList, Text, View, TextInput } from "react-native";
import { getDatabase } from "../../../../src/core/database/connection";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

interface FilamentRow {
  id: string;
  category: string;
  name: string;
  print_temp_low: number;
  print_temp_high: number;
  bed_temp_low: number;
  bed_temp_high: number;
  max_flow_rate: number;
  density: number;
  retraction_dist_bowden: number;
  retraction_dist_direct: number;
  retraction_speed: number;
  cost_per_kg: number | null;
  notes: string | null;
}

const CATEGORY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "PLA", value: "PLA" },
  { label: "PETG", value: "PETG" },
  { label: "ABS", value: "ABS" },
  { label: "TPU", value: "TPU" },
];

export default function FilamentDbScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filaments: FilamentRow[] = useMemo(() => {
    try {
      const db = getDatabase();
      return db.getAllSync("SELECT * FROM printing_filaments ORDER BY category, name") as FilamentRow[];
    } catch {
      return [];
    }
  }, []);

  const filtered = useMemo(() => {
    return filaments.filter((f) => {
      const matchesCat = category === "all" || f.category === category;
      const matchesSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.category.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [filaments, category, search]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="p-4 pb-0">
        <TextInput
          className="rounded-lg px-3 py-2 mb-3 text-[14px]"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, fontFamily: "Inter_400Regular" }}
          placeholder="Search filaments..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        <FilterBar options={CATEGORY_OPTIONS} selected={category} onSelect={setCategory} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        renderItem={({ item }) => (
          <View className="rounded-xl p-4 mb-3" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-[15px]" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>{item.name}</Text>
              <Text className="text-[11px] px-2 py-0.5 rounded" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary, backgroundColor: colors.background }}>{item.category}</Text>
            </View>
            <View className="flex-row flex-wrap gap-x-4 gap-y-1">
              <Text className="text-[12px]" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>Print: {item.print_temp_low}-{item.print_temp_high}°C</Text>
              <Text className="text-[12px]" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>Bed: {item.bed_temp_low}-{item.bed_temp_high}°C</Text>
              <Text className="text-[12px]" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>Flow: {item.max_flow_rate} mm³/s</Text>
              <Text className="text-[12px]" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>Retract: {item.retraction_dist_direct}/{item.retraction_dist_bowden}mm</Text>
            </View>
            {item.notes && (
              <Text className="text-[11px] mt-2" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>{item.notes}</Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>No filaments found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/make/printing/filament-db.tsx
git commit -m "feat(printing): add filament database browser screen"
```

---

### Task 16: Printer Profiles Screen

**Files:**
- Create: `app/(tabs)/make/printing/printer-profiles.tsx`

- [ ] **Step 1: Create printer profiles CRUD screen**

Create `app/(tabs)/make/printing/printer-profiles.tsx`:

```typescript
import { useState, useCallback } from "react";
import { SafeAreaView, ScrollView, Text, View, Pressable, Alert, TextInput } from "react-native";
import {
  getAllProfiles,
  createProfile,
  deleteProfile,
  setActiveProfile,
  type PrinterProfile,
} from "../../../../src/modules/printing/data/printerProfiles";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const EXTRUDER_OPTIONS = [
  { label: "Bowden", value: "bowden" },
  { label: "Direct", value: "direct" },
];

export default function PrinterProfilesScreen() {
  const { colors } = useTheme();
  const [profiles, setProfiles] = useState<PrinterProfile[]>(() => getAllProfiles());
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [volX, setVolX] = useState("220");
  const [volY, setVolY] = useState("220");
  const [volZ, setVolZ] = useState("250");
  const [nozzle, setNozzle] = useState("0.4");
  const [maxFlow, setMaxFlow] = useState("15");
  const [extruder, setExtruder] = useState("bowden");
  const [bowdenLen, setBowdenLen] = useState("400");
  const [speed, setSpeed] = useState("50");
  const [travel, setTravel] = useState("150");
  const [eSteps, setESteps] = useState("93");

  const refresh = useCallback(() => setProfiles(getAllProfiles()), []);

  const handleCreate = () => {
    if (!name.trim()) { Alert.alert("Name Required", "Enter a printer name."); return; }
    createProfile({
      name: name.trim(),
      buildVolumeX: parseFloat(volX) || 220,
      buildVolumeY: parseFloat(volY) || 220,
      buildVolumeZ: parseFloat(volZ) || 250,
      nozzleDiameter: parseFloat(nozzle) || 0.4,
      maxVolumetricFlow: parseFloat(maxFlow) || null,
      extruderType: extruder as "bowden" | "direct",
      bowdenLengthMm: extruder === "bowden" ? (parseFloat(bowdenLen) || 400) : null,
      stepsPerMmX: null,
      stepsPerMmY: null,
      stepsPerMmZ: null,
      stepsPerMmE: parseFloat(eSteps) || null,
      defaultSpeedMms: parseFloat(speed) || 50,
      defaultTravelMms: parseFloat(travel) || 150,
    });
    setShowForm(false);
    setName("");
    refresh();
  };

  const handleSetActive = (id: string) => {
    setActiveProfile(id);
    refresh();
  };

  const handleDelete = (id: string, pName: string) => {
    Alert.alert("Delete Printer", `Remove "${pName}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { deleteProfile(id); refresh(); } },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[22px]" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>My Printers</Text>
          <Pressable onPress={() => setShowForm(!showForm)} className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: colors.accent ?? "#f59e0b" }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_600SemiBold", color: "#000" }}>{showForm ? "Cancel" : "+ Add"}</Text>
          </Pressable>
        </View>

        {showForm && (
          <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <CalculatorInput label="Printer Name" value={name} onChangeText={setName} placeholder="Ender 3 V2" />
            <View className="flex-row gap-2">
              <View className="flex-1"><CalculatorInput label="X (mm)" value={volX} onChangeText={setVolX} placeholder="220" /></View>
              <View className="flex-1"><CalculatorInput label="Y (mm)" value={volY} onChangeText={setVolY} placeholder="220" /></View>
              <View className="flex-1"><CalculatorInput label="Z (mm)" value={volZ} onChangeText={setVolZ} placeholder="250" /></View>
            </View>
            <CalculatorInput label="Nozzle" value={nozzle} onChangeText={setNozzle} unit="mm" placeholder="0.4" />
            <CalculatorInput label="Max Flow" value={maxFlow} onChangeText={setMaxFlow} unit="mm³/s" placeholder="15" />
            <Text className="text-[12px] uppercase tracking-wider mb-2 mt-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>Extruder</Text>
            <FilterBar options={EXTRUDER_OPTIONS} selected={extruder} onSelect={setExtruder} />
            {extruder === "bowden" && <CalculatorInput label="Bowden Length" value={bowdenLen} onChangeText={setBowdenLen} unit="mm" placeholder="400" />}
            <CalculatorInput label="Default Speed" value={speed} onChangeText={setSpeed} unit="mm/s" placeholder="50" />
            <CalculatorInput label="Travel Speed" value={travel} onChangeText={setTravel} unit="mm/s" placeholder="150" />
            <CalculatorInput label="E-Steps" value={eSteps} onChangeText={setESteps} unit="steps/mm" placeholder="93" />
            <Pressable onPress={handleCreate} className="mt-3 py-2.5 rounded-lg items-center" style={{ backgroundColor: colors.accent ?? "#f59e0b" }}>
              <Text className="text-[14px]" style={{ fontFamily: "Inter_600SemiBold", color: "#000" }}>Save Printer</Text>
            </Pressable>
          </View>
        )}

        {profiles.length === 0 && !showForm && (
          <View className="items-center py-12">
            <Text className="text-[14px] mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}>No printers saved</Text>
            <Text className="text-[12px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>Add a printer to auto-fill calculator inputs</Text>
          </View>
        )}

        {profiles.map((p) => (
          <View key={p.id} className="rounded-xl p-4 mb-3" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: p.isActive ? (colors.accent ?? "#f59e0b") : colors.border }}>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-[15px]" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>{p.name}</Text>
              {p.isActive && <Text className="text-[11px] px-2 py-0.5 rounded" style={{ fontFamily: "Inter_600SemiBold", color: "#000", backgroundColor: colors.accent ?? "#f59e0b" }}>ACTIVE</Text>}
            </View>
            <Text className="text-[12px] mb-2" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>
              {p.buildVolumeX}×{p.buildVolumeY}×{p.buildVolumeZ}mm • {p.nozzleDiameter}mm nozzle • {p.extruderType}
            </Text>
            <View className="flex-row gap-2">
              {!p.isActive && (
                <Pressable onPress={() => handleSetActive(p.id)} className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: colors.background }}>
                  <Text className="text-[12px]" style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}>Set Active</Text>
                </Pressable>
              )}
              <Pressable onPress={() => handleDelete(p.id, p.name)} className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: colors.background }}>
                <Text className="text-[12px]" style={{ fontFamily: "Inter_500Medium", color: "#ef4444" }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/make/printing/printer-profiles.tsx
git commit -m "feat(printing): add printer profiles CRUD screen"
```

---

### Task 17: Final Integration & Milestone Commit

**Files:** None new (verification + milestone tag)

- [ ] **Step 1: Run full test suite**

Run: `npx jest --no-coverage`
Expected: ALL tests pass (~170+)

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Create milestone commit**

```bash
git add -A
git commit -m "milestone: M3 complete — 3D Printing module with 6 calculators, filament database, printer profiles"
```

- [ ] **Step 4: Push to remote**

```bash
git push origin main
```
