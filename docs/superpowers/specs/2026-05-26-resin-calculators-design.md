# Resin Calculator Module Expansion

**Date:** 2026-05-26
**Module:** `src/modules/resin/` + `app/(tabs)/make/resin/`
**Approach:** Standalone screens (Approach A) — one route + one pure calc function per calculator

## Existing Calculators (unchanged)

| Calculator | Route | Calc Function |
|---|---|---|
| Resin/Hardener Ratio | `resin/resin-ratio.tsx` | `resinRatio.ts` |
| Mold Volume | `resin/mold-volume.tsx` | `moldVolume.ts` |
| Colorant Mix | `resin/colorant-mix.tsx` | `colorantMix.ts` |

## New Calculators

### 1. Cost Estimator

**Route:** `resin/cost-estimator.tsx`
**Calc function:** `src/modules/resin/calculators/costEstimator.ts`

**Inputs:**
- `resinPricePerUnit: number` — price per liter or gallon
- `priceUnit: "L" | "gal"` — unit for the price
- `volumeNeeded: number` — ml or oz of mixed resin needed
- `volumeUnit: "ml" | "oz"`
- `mixRatioResin: number` — resin part of ratio (default 2)
- `mixRatioHardener: number` — hardener part of ratio (default 1)
- `colorantCostPerBottle: number` — cost of colorant bottle
- `colorantAmountUsed: number` — grams or drops used
- `colorantBottleSize: number` — total grams or drops in bottle
- `wasteFactor: number` — percentage (default 10)

**Outputs:**
- `resinCost: number`
- `hardenerCost: number`
- `colorantCost: number`
- `wasteCost: number`
- `totalCost: number`
- `costPerMl: number`
- `mathSteps: MathStep[]`

**Logic:**
1. Convert price to cost-per-ml: if priceUnit is "gal", divide by 3785.41; if "L", divide by 1000
2. Split volume into resin and hardener portions using mix ratio
3. Resin cost = resin portion ml * cost-per-ml
4. Hardener cost = hardener portion ml * cost-per-ml (assumes same price; most kits are sold together)
5. Colorant cost = (colorantAmountUsed / colorantBottleSize) * colorantCostPerBottle
6. Subtotal = resin + hardener + colorant
7. Waste cost = subtotal * (wasteFactor / 100)
8. Total = subtotal + waste
9. Cost per ml = total / volumeNeeded

---

### 2. Coating Coverage

**Route:** `resin/coating-coverage.tsx`
**Calc function:** `src/modules/resin/calculators/coatingCoverage.ts`

**Inputs:**
- `shape: "rectangle" | "circle"`
- `lengthMm: number` — rectangle only
- `widthMm: number` — rectangle only
- `diameterMm: number` — circle only
- `depthMm: number` — coating thickness (default 1.5)
- `numberOfCoats: number` — default 1
- `mixRatioResin: number` — default 2
- `mixRatioHardener: number` — default 1
- `inputUnit: "mm" | "in"` — user-facing unit; internally converted to mm

**Conversion:** 1 inch = 25.4 mm. All inputs converted to mm before calculation.

**Outputs:**
- `surfaceAreaMm2: number`
- `volumePerCoatMl: number`
- `totalVolumeMl: number`
- `resinAmountMl: number`
- `hardenerAmountMl: number`
- `totalWeightG: number` — using density constant 1.1 g/ml
- `mathSteps: MathStep[]`

**Logic:**
1. Convert inputs to mm if inputUnit is "in"
2. Surface area: rectangle = length * width; circle = pi * (d/2)^2
3. Volume per coat = surfaceArea * depth / 1000 (mm^3 to ml)
4. Total volume = volumePerCoat * numberOfCoats
5. Split into resin/hardener using ratio
6. Weight = totalVolume * 1.1

**Safety warning:** "Seal coat recommended on porous surfaces (wood, fabric) before flood coat to prevent bubbles." Displayed via `SafetyWarning` component.

---

### 3. Pot Life Timer

**Route:** `resin/pot-life.tsx`
**Calc function:** `src/modules/resin/calculators/potLife.ts`

**Inputs:**
- `resinType: "standard-epoxy" | "fast-set-epoxy" | "polyester" | "polyurethane"`
- `ambientTemp: number`
- `tempUnit: "F" | "C"`
- `batchVolumeMl: number`

**Resin type presets** (base pot life at 72°F / 22°C):

| Type | Base Pot Life | Gel Time | Demold Time | Full Cure |
|---|---|---|---|---|
| Standard Epoxy | 45 min | 3 hr | 12 hr | 72 hr |
| Fast-Set Epoxy | 15 min | 1 hr | 4 hr | 24 hr |
| Polyester | 10 min | 30 min | 2 hr | 24 hr |
| Polyurethane | 8 min | 20 min | 1 hr | 16 hr |

**Temperature adjustment:**
- Convert to °F if needed
- Delta = ambientTemp(°F) - 72
- Factor = 0.5 ^ (delta / 18) — halves every 18°F above baseline, doubles every 18°F below
- Adjusted time = base time * factor

**Mass adjustment:**
- If batchVolumeMl > 200: massFactor = 200 / batchVolumeMl (capped at min 0.5)
- If batchVolumeMl <= 200: massFactor = 1.0
- Final adjusted time = temp-adjusted time * massFactor

**Outputs:**
- `adjustedPotLifeMin: number`
- `gelTimeMin: number` — adjusted
- `demoldTimeMin: number` — adjusted
- `fullCureTimeMin: number` — adjusted
- `tempFactor: number`
- `massFactor: number`
- `mathSteps: MathStep[]`

**Timer UI (screen only, not in calc function):**
- Start / Pause / Reset buttons
- Countdown display (mm:ss)
- Progress bar with color zones: green (0-75%), yellow (75-90%), red (90-100%)
- Vibration haptics at 75% and 90% elapsed via `expo-haptics`
- Cure stage indicator below timer: Working > Gel > Demold > Full Cure with estimated clock times

**No background notifications.** Timer only runs while screen is active.

---

### 4. Pressure Pot Sizing

**Route:** `resin/pressure-pot.tsx`
**Calc function:** `src/modules/resin/calculators/pressurePot.ts`

**Inputs:**
- `potDiameter: number` — inner diameter
- `potHeight: number` — inner height
- `potUnit: "in" | "cm"`
- `moldDiameter: number`
- `moldHeight: number`
- `moldUnit: "in" | "cm"`
- `numberOfMolds: number` — default 1
- `heightClearance: number` — default 1 inch / 2.54 cm (for lid seal)

**Conversion:** All values to cm internally. 1 inch = 2.54 cm.

**Outputs:**
- `potVolumeMl: number` — pi * r^2 * h / 1 (cm^3 = ml)
- `singleMoldVolumeMl: number`
- `maxMoldsFit: number` — floor based on how many mold diameters fit across pot diameter
- `fitVerdict: "fits" | "too-tall" | "too-wide" | "too-many"`
- `failReason: string | null` — which dimension fails
- `heightClearanceRemaining: number`
- `totalResinMl: number` — singleMoldVolume * numberOfMolds
- `totalResinWeightG: number` — totalResinMl * 1.1
- `mathSteps: MathStep[]`

**Max molds calculation:**
1. Usable pot height = potHeight - heightClearance
2. Check: moldHeight <= usable pot height (if not: "too-tall")
3. Molds across diameter = floor(potDiameter / moldDiameter) — simplified; actual circle packing is complex, this gives a conservative floor-row estimate
4. If numberOfMolds > maxMoldsFit: "too-many"
5. If single mold diameter > potDiameter: "too-wide"

**Practical notes** (displayed via info text, not SafetyWarning):
- "Leave 1 inch clearance above molds for lid seal"
- "Molds should not touch pot walls — use spacers"

---

## Files to Create

| File | Purpose |
|---|---|
| `src/modules/resin/calculators/costEstimator.ts` | Pure cost calculation |
| `src/modules/resin/calculators/coatingCoverage.ts` | Pure coverage calculation |
| `src/modules/resin/calculators/potLife.ts` | Pure pot life + cure stage calculation |
| `src/modules/resin/calculators/pressurePot.ts` | Pure pressure pot sizing calculation |
| `app/(tabs)/make/resin/cost-estimator.tsx` | Cost estimator screen |
| `app/(tabs)/make/resin/coating-coverage.tsx` | Coating coverage screen |
| `app/(tabs)/make/resin/pot-life.tsx` | Pot life timer screen |
| `app/(tabs)/make/resin/pressure-pot.tsx` | Pressure pot sizing screen |

## Files to Modify

| File | Change |
|---|---|
| `app/(tabs)/make/resin/index.tsx` | Add 4 new entries to CALCULATORS array |
| `app/(tabs)/make/resin/_layout.tsx` | Add 4 new Stack.Screen entries |

## Shared Dependencies

All screens use existing design system components:
- `CalculatorInput` — numeric inputs with labels and units
- `ResultCard` — results display
- `ActionBar` — save/quote/log actions
- `FilterBar` — unit and option selection pills
- `SafetyWarning` — warning callouts (coating coverage)
- `ShowMath` — expandable math steps
- `useTheme` — dark/light theme colors
- `CalculatorService.save()` — save results to history

**New dependency for Pot Life Timer only:**
- `expo-haptics` — vibration at 75% and 90% elapsed (check if already installed)

## Architecture Invariants

- Pure calc functions have zero side effects and zero UI imports
- Screens handle state, UI, and save-to-history
- All calc functions return `mathSteps: MathStep[]` for transparency
- All inputs use string state for controlled TextInputs, parsed to numbers at calculation time
- Results computed via `useMemo` keyed to input state
