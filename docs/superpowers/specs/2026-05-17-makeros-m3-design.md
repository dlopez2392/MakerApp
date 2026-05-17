# M3 Design Specification: 3D Printing Module

## Overview

Add a complete 3D Printing (FDM) module to MakerApp with 6 calculators, a filament reference database, and a printer profile system. Follows the same domain-driven architecture as Laser and CNC modules.

**Scope:** FDM printers only (Ender, Prusa, Bambu, etc.)

## Architecture

```
src/modules/printing/
  calculators/
    printTime.ts
    filamentUsage.ts
    maxVolumetricFlow.ts
    flowRateCalibration.ts
    retractionTuning.ts
    beltSteps.ts
  data/
    filamentDatabase.ts
    seedFilaments.ts
    printerProfiles.ts

app/(tabs)/make/printing/
  _layout.tsx
  index.tsx                  ← hub grid (replaces placeholder)
  print-time.tsx
  filament-usage.tsx
  max-flow.tsx
  flow-calibration.tsx
  retraction.tsx
  belt-steps.tsx
  filament-db.tsx
  printer-profiles.tsx
```

Modules are vertical slices. Printing never imports from laser/ or cnc/, only from core/.

## Data Models

### Printer Profile (SQLite)

```sql
CREATE TABLE IF NOT EXISTS printer_profiles (
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
)
```

Only one profile has `is_active = 1` at a time. Calculators read the active profile to pre-fill inputs but never require it.

### Filament Database (TypeScript reference data)

```typescript
export interface Filament {
  category: string;           // "PLA" | "PETG" | "ABS" | "TPU" | "ASA" | "Nylon" | "PC"
  name: string;               // "Generic PLA", "eSun PETG", etc.
  printTempLow: number;       // °C
  printTempHigh: number;
  bedTempLow: number;
  bedTempHigh: number;
  maxFlowRate: number;        // mm³/s typical max
  density: number;            // g/cm³
  retractionDist: { bowden: number; direct: number };
  retractionSpeed: number;    // mm/s
  costPerKg: number | null;
  notes: string | null;
  source: "built-in" | "user";
}
```

**Built-in entries (~12):** PLA, PLA+, PETG, ABS, ASA, TPU 95A, TPU 85A, Nylon PA6, Nylon PA12, PC, HIPS, PVA.

## Calculator Specifications

All calculators follow the existing pattern:
- Pure function with typed `Input` and `Result` interfaces
- Return `MathStep[]` array for ShowMath disclosure component
- Return `warnings: string[]` for edge cases

### 1. Print Time Estimator

**Inputs:**
- `xMm`, `yMm`, `zMm` — bounding box dimensions
- `layerHeight` — mm (default 0.2)
- `infillPct` — 0-100 (default 20)
- `wallCount` — number of perimeter walls (default 3)
- `printSpeedMms` — from profile or manual
- `travelSpeedMms` — from profile or manual
- `nozzleDiameter` — from profile or 0.4

**Outputs:**
- `estimatedMinutes` — total print time
- `layerCount` — z / layerHeight
- `totalExtrusionMm` — estimated toolpath length
- `mathSteps: MathStep[]`

**Algorithm:**
1. Layer count = ceil(zMm / layerHeight)
2. Perimeter length per layer = 2*(x+y) * wallCount
3. Infill length per layer ≈ (x * y * infillPct/100) / lineWidth
4. Total extrusion = (perimeter + infill) * layerCount + top/bottom solid layers
5. Print time = extrusion length / print speed + travel estimate + per-layer overhead (1.5s)

### 2. Filament Usage & Cost

**Inputs:**
- `xMm`, `yMm`, `zMm` — bounding box
- `infillPct` — 0-100
- `wallCount` — perimeter count
- `layerHeight` — mm
- `nozzleDiameter` — from profile or 0.4
- `filamentDensity` — g/cm³ (from filament DB)
- `filamentCostPerKg` — $/kg (from filament DB or manual)
- `filamentDiameter` — 1.75 or 2.85mm

**Outputs:**
- `volumeCm3` — estimated print volume
- `weightG` — volume × density
- `filamentLengthM` — weight / (π × (d/2)² × density)
- `estimatedCost` — weight/1000 × costPerKg
- `mathSteps: MathStep[]`

### 3. Max Volumetric Flow

**Inputs:**
- `layerHeight` — mm
- `lineWidth` — mm (default nozzle × 1.2)
- `printSpeedMms` — mm/s
- `hotendMaxFlow` — mm³/s (from profile)

**Outputs:**
- `calculatedFlow` — layerHeight × lineWidth × speed (mm³/s)
- `hotendCapacity` — percentage of hotend max
- `maxSafeSpeed` — hotendMaxFlow / (layerHeight × lineWidth)
- `status` — "safe" | "warning" | "exceeds"
- `mathSteps: MathStep[]`

**Thresholds:** safe < 80%, warning 80-100%, exceeds > 100%

### 4. Flow Rate / E-Steps Calibration

**Inputs:**
- `requestedLengthMm` — how much filament was commanded (typically 100)
- `measuredLengthMm` — how much actually extruded
- `currentESteps` — current steps/mm for E axis

**Outputs:**
- `newESteps` — currentESteps × (requested / measured)
- `flowMultiplier` — (requested / measured) × 100 as percentage
- `deviation` — how far off the current calibration is
- `mathSteps: MathStep[]`

### 5. Retraction Tuning

**Inputs:**
- `filamentCategory` — from filament DB (affects base recommendations)
- `extruderType` — "bowden" | "direct" (from profile)
- `bowdenLengthMm` — tube length in mm (from profile, null for direct)
- `nozzleDiameter` — from profile

**Outputs:**
- `retractionDistMm` — recommended distance
- `retractionSpeedMms` — recommended speed
- `zHopMm` — recommended z-hop height
- `primeAmountMm` — extra prime after retraction
- `warnings: string[]` — flex filament cautions, etc.
- `mathSteps: MathStep[]`

**Logic:**
- Direct drive base: 0.5-2mm depending on filament
- Bowden base: 2-7mm scaled by tube length (longer tube = more retraction)
- TPU/flex: warning that retraction should be minimal or disabled
- Speed: 25-45mm/s, reduced for flexible filaments

### 6. Belt / Steps-per-mm

**Inputs:**
- `axisType` — "belt" | "leadscrew"
- `motorStepAngle` — 1.8 or 0.9 degrees
- `microstepping` — 16, 32, 64, 128, or 256
- `pulleyTeeth` — for belt (typically 16 or 20)
- `beltPitch` — for belt (2mm GT2 or 3mm GT3)
- `leadMm` — for leadscrew (typically 2, 4, or 8mm)

**Outputs:**
- `stepsPerMm` — calculated value
- `resolutionUm` — 1/stepsPerMm × 1000 (microns per step)
- `mathSteps: MathStep[]`

**Formulas:**
- Belt: stepsPerMm = (360 / stepAngle × microstepping) / (teeth × pitch)
- Leadscrew: stepsPerMm = (360 / stepAngle × microstepping) / lead

## Navigation & UI

### Stack Layout

```typescript
// app/(tabs)/make/printing/_layout.tsx
<Stack>
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
```

### Hub Screen

Grid layout with 8 tiles (matching CNC/Laser hub pattern):
- 6 calculator tiles
- 1 Filament Database tile
- 1 My Printers tile

### Active Printer Chip

Each calculator screen shows a small chip/badge at the top:
- Displays active printer name (e.g., "Ender 3 V2")
- Tap to switch active profile
- If no profile exists, shows "No printer set" with muted styling — calculators still work with manual input

### Printer Profiles Screen

- List of saved printers with active indicator
- Add/Edit/Delete actions
- Fields match the `printer_profiles` schema
- "Set Active" action on each profile
- No built-in presets (user creates from scratch)

### Filament Database Screen

- Search + category filter (same pattern as Laser materials browser)
- Shows temp ranges, density, retraction defaults per filament
- Built-in entries are read-only, user entries are editable

## Shop Core Integration

- **Filament Usage → QuoteService:** material cost line item using existing `addLineItem` method
- **Print Time → QuoteService:** time-based line item using existing `addTimeLineItem` method
- **Inventory bridge:** Filament DB is reference data only. Actual filament stock tracked in `inventory_items` table with `master_category = '3d-printing'`. No new inventory schema.

## Database Changes

Add to `src/core/database/schema.ts`:
- `printer_profiles` table (schema above)
- Index on `printer_profiles(is_active)`

Filament data is seeded via `seedFilaments.ts` into SQLite (same pattern as `seedCncData.ts`), stored in a `printing_filaments` table:

```sql
CREATE TABLE IF NOT EXISTS printing_filaments (
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
)
```

## Testing

Unit tests for all 6 calculator engines (same pattern as CNC tests):
- Happy path with known inputs → expected outputs
- Edge cases (zero dimensions, extreme values)
- MathSteps array populated correctly
- Warnings triggered appropriately

Target: ~25-30 tests across the 6 engines.

## Success Criteria

- All 6 calculators produce correct results with MathSteps
- Filament database browsable with search/filter
- Printer profiles CRUD works, active profile pre-fills calculator inputs
- Calculators work without a profile (fully manual mode)
- All tests pass
- Printing tab replaces "Coming in Milestone 3" placeholder
- Shop Core quote integration functional
