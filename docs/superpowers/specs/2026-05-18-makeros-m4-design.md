# M4 Design Specification: Craft Modules

## Overview

Add 5 craft modules to MakerApp: Resin Art, Knife Making, Leatherworking, Candle Making, and Soap Making. 13 calculators total, plus a steel reference database for knife making and an oil SAP values reference for soap making.

## Architecture

Each module follows the established vertical slice pattern:

```
src/modules/<name>/
  calculators/    — pure functions with typed Input/Result + MathStep[]
  data/           — reference data + seed functions (knife, soap only)

app/(tabs)/make/<name>/
  _layout.tsx     — Stack navigator
  index.tsx       — hub grid (replaces placeholder)
  <calc>.tsx      — calculator screens

__tests__/modules/<name>/
  <calc>.test.ts  — engine tests
```

Modules never import from each other, only from core/.

## Database Changes

One new table in `src/core/database/schema.ts`:

```sql
CREATE TABLE IF NOT EXISTS knife_steels (
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
)
```

Index: `CREATE INDEX IF NOT EXISTS idx_knife_steels_category ON knife_steels(category)`

Soap oil SAP data is in-memory TypeScript only (no SQLite table).

## Module 1: Resin Art

### Calculators

#### 1. Resin/Hardener Ratio (`resinRatio.ts`)

**Input:** totalVolumeMl, mixRatioResin (e.g. 2), mixRatioHardener (e.g. 1), unit ("ml" | "oz")

**Output:** resinAmount, hardenerAmount, mathSteps

**Math:** resinAmount = total * (ratioResin / (ratioResin + ratioHardener))

#### 2. Mold Volume (`moldVolume.ts`)

**Input:** shape ("cylinder" | "rectangle" | "sphere"), dimensions (diameter/length/width/height as applicable)

**Output:** volumeMl, resinWeightG (volume * 1.1 density), mathSteps

**Math:**
- Cylinder: pi * r^2 * h / 1000
- Rectangle: l * w * h / 1000
- Sphere: (4/3) * pi * r^3 / 1000

#### 3. Colorant Mixing (`colorantMix.ts`)

**Input:** resinWeightG, colorantType ("pigment" | "dye" | "mica"), loadPct (1-10)

**Output:** colorantWeightG, colorantDrops (weight / 0.05 for liquid), maxSafeLoad (pigment: 10%, dye: 5%, mica: 8%), warnings[], mathSteps

**Warnings:** triggered when loadPct exceeds maxSafeLoad for the colorant type.

### UI Screens

- `app/(tabs)/make/resin/_layout.tsx` — Stack
- `app/(tabs)/make/resin/index.tsx` — hub with 3 tiles
- `app/(tabs)/make/resin/resin-ratio.tsx`
- `app/(tabs)/make/resin/mold-volume.tsx`
- `app/(tabs)/make/resin/colorant-mix.tsx`

### Tests

~12 tests across 3 engines.

---

## Module 2: Knife Making

### Data: Steel Database

`src/modules/knife/data/steelDatabase.ts` — KnifeSteel interface + steelData array

```typescript
interface KnifeSteel {
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
```

**Built-in steels (~15):** 1095, 1084, 1080, O1, W2, 5160, 80CrV2, D2, A2, M2, S30V, S35VN, 440C, AEB-L, 154CM

`src/modules/knife/data/seedKnifeSteels.ts` — seed function following CNC pattern.

### Calculators

#### 4. Heat Treat Schedule (`heatTreat.ts`)

**Input:** steelName (looked up from DB reference data)

**Output:** normalizeTempF, normalizeCycles, hardenTempF, soakMinutes, quenchMedium, temperLowF, temperHighF, expectedRockwellLow, expectedRockwellHigh, mathSteps

This is primarily a lookup with formatted output, not heavy math. MathSteps show the sequence.

#### 5. Grind Angle (`grindAngle.ts`)

**Input:** bladeThicknessIn, bevelHeightIn, desiredEdgeAngleDeg

**Output:** grindAnglePerSideDeg, edgeThicknessIn, steelRemovalIn, mathSteps

**Math:**
- grindAnglePerSide = desiredEdgeAngle / 2
- edgeThickness = 2 * bevelHeight * tan(grindAnglePerSide)
- steelRemoval = (bladeThickness - edgeThickness) / 2

#### 6. Handle Scale (`handleScale.ts`)

**Input:** bladeLengthIn, tangLengthIn, handSize ("small" | "medium" | "large")

**Output:** handleLengthIn, handleWidthIn, handleThicknessIn, pinPositions (array of distances from front), mathSteps

**Logic:**
- Handle length = tang length (user sets this)
- Width/thickness derived from hand size lookup (S: 1.0/0.75, M: 1.15/0.85, L: 1.3/1.0)
- Pin positions: 2 pins at 20% and 80% of handle length, 3 pins if handle > 5"

### UI Screens

- `app/(tabs)/make/knife/_layout.tsx` — Stack
- `app/(tabs)/make/knife/index.tsx` — hub with 4 tiles (3 calcs + steel DB)
- `app/(tabs)/make/knife/heat-treat.tsx`
- `app/(tabs)/make/knife/grind-angle.tsx`
- `app/(tabs)/make/knife/handle-scale.tsx`
- `app/(tabs)/make/knife/steel-db.tsx` — steel database browser (FlatList, search, category filter)

### Tests

~15 tests across 3 engines.

---

## Module 3: Leatherworking

### Calculators

#### 7. Leather Area (`leatherArea.ts`)

**Input:** pieces (array of { lengthIn, widthIn, quantity }), wastePct (default 15)

**Output:** totalAreaSqIn, totalAreaSqFt, withWasteSqFt, hideRecommendation ("half hide" / "full hide" / "shoulder" based on area), mathSteps

**Math:**
- totalArea = sum(l * w * qty)
- withWaste = totalArea * (1 + wastePct/100)
- Hide recs: < 6 sqft → shoulder, < 12 sqft → half hide, else full hide

#### 8. Thread & Stitch (`threadStitch.ts`)

**Input:** seamLengthIn, stitchesPerInch (default 7), leatherThicknessMm, threadPasses (1 for running, 2 for saddle stitch)

**Output:** threadLengthIn, threadLengthFt, needleSizeRec, mathSteps

**Math:**
- stitchCount = seamLength * SPI
- threadPerStitch = (leatherThickness * 2.5) * passes + spacing
- totalThread = stitchCount * threadPerStitch * 1.15 (15% waste)
- Needle rec: thickness < 2mm → #0, < 4mm → #2, else #4

### UI Screens

- `app/(tabs)/make/leather/_layout.tsx` — Stack
- `app/(tabs)/make/leather/index.tsx` — hub with 2 tiles
- `app/(tabs)/make/leather/leather-area.tsx`
- `app/(tabs)/make/leather/thread-stitch.tsx`

### Tests

~10 tests across 2 engines.

---

## Module 4: Candle Making

### Calculators

#### 9. Wax Volume (`waxVolume.ts`)

**Input:** diameterIn, heightIn, shape ("cylinder" | "tapered"), taperRatio (0.7-1.0, default 1.0 for cylinder)

**Output:** volumeMl, waxWeightG (volume * 0.86 density), waxWeightOz, pourWeightG (waxWeight * 1.1 shrinkage), mathSteps

**Math:**
- Cylinder: pi * r^2 * h (convert in to cm)
- Tapered: pi * h/3 * (R^2 + R*r + r^2) where r = R * taperRatio

#### 10. Fragrance Load (`fragranceLoad.ts`)

**Input:** waxWeightG, fragrancePct (default 8), maxLoadPct (default 12)

**Output:** fragranceWeightG, fragranceWeightOz, remainingCapacityG, remainingCapacityPct, warnings[], mathSteps

**Math:** fragranceWeight = waxWeight * (pct / 100). Warning if pct > maxLoadPct.

#### 11. Wick Sizing (`wickSizing.ts`)

**Input:** containerDiameterIn, waxType ("soy" | "paraffin" | "coconut" | "blend")

**Output:** wickSeries (e.g. "CD 8", "ECO 10"), burnPoolDiameterIn, warnings[], mathSteps

**Logic:** Lookup table mapping diameter ranges × wax type to wick series. Soy needs larger wicks than paraffin. Warning if diameter > 4" (may need multiple wicks).

### UI Screens

- `app/(tabs)/make/candle/_layout.tsx` — Stack
- `app/(tabs)/make/candle/index.tsx` — hub with 3 tiles
- `app/(tabs)/make/candle/wax-volume.tsx`
- `app/(tabs)/make/candle/fragrance-load.tsx`
- `app/(tabs)/make/candle/wick-sizing.tsx`

### Tests

~12 tests across 3 engines.

---

## Module 5: Soap Making

### Data: Oil SAP Values

`src/modules/soap/data/oilDatabase.ts` — in-memory reference (not SQLite)

```typescript
interface SoapOil {
  name: string;
  sapNaOH: number;    // g NaOH per g oil
  sapKOH: number;     // g KOH per g oil
  iodine: number;
  ins: number;
  hardness: number;   // 0-100 scale
  cleansing: number;
  conditioning: number;
  bubbly: number;
  creamy: number;
  notes: string | null;
}
```

**Built-in oils (~20):** olive, coconut 76, coconut 92, palm, castor, avocado, sweet almond, sunflower, soybean, lard, tallow, shea butter, cocoa butter, jojoba, hemp seed, grapeseed, rice bran, mango butter, apricot kernel, canola

### Calculators

#### 12. Lye Calculator (`lyeCalculator.ts`)

**Input:** oils (array of { name, weightOz }), superfattPct (default 5), waterLyeRatio (default 2.0), soapType ("bar" | "liquid")

**Output:** lyeWeightOz, waterWeightOz, totalBatchWeightOz, oilBreakdown (per oil: name, weight, lyeRequired), fattyAcidProfile ({ hardness, cleansing, conditioning, bubbly, creamy } averaged), warnings[], mathSteps

**Math:**
- For each oil: lyeNeeded = weight * sapValue (NaOH for bar, KOH for liquid)
- totalLye = sum(lyeNeeded) * (1 - superfattPct/100)
- water = totalLye * waterLyeRatio
- Fatty acid profile = weighted average across oils
- Warning if no coconut/palm (low hardness), or superfat > 10%

#### 13. Batch Scaler (`batchScaler.ts`)

**Input:** originalOils (array of { name, weightOz }), scaleMode ("factor" | "totalWeight"), scaleValue (multiplier or target oz)

**Output:** scaledOils (array of { name, weightOz }), scaleFactor, mathSteps

**Math:**
- Factor mode: each oil * scaleValue
- TotalWeight mode: factor = targetWeight / sum(originals), then each oil * factor

### UI Screens

- `app/(tabs)/make/soap/_layout.tsx` — Stack
- `app/(tabs)/make/soap/index.tsx` — hub with 2 tiles
- `app/(tabs)/make/soap/lye-calculator.tsx` — shows oil SAP values inline (add oils from a picker)
- `app/(tabs)/make/soap/batch-scaler.tsx`

### Tests

~12 tests across 2 engines.

---

## Integration

- All calculators save to history via CalculatorService (module name matches: "resin", "knife", "leather", "candle", "soap")
- Knife steel seed function called from `app/_layout.tsx`
- No new Shop Core integration beyond existing CalculatorService.save

## Success Criteria

- All 13 calculators produce correct results with MathSteps
- Steel database browsable with search/filter
- Lye calculator handles multi-oil recipes correctly
- All placeholder "Coming in Milestone" screens replaced
- ~50-60 new tests passing
- TypeScript clean
