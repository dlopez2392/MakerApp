# Soap Calculator Module Expansion

**Date:** 2026-05-26
**Module:** `src/modules/soap/` + `app/(tabs)/make/soap/`
**Approach:** Standalone screens (Approach A) — one route + one pure calc function per calculator

## Existing Calculators (unchanged)

| Calculator | Route | Calc Function |
|---|---|---|
| Lye Calculator | `soap/lye-calculator.tsx` | `lyeCalculator.ts` |
| Batch Scaler | `soap/batch-scaler.tsx` | `batchScaler.ts` |

## New Calculators

### 1. Fragrance / Essential Oil Calculator

**Route:** `soap/fragrance-calc.tsx`
**Calc function:** `src/modules/soap/calculators/fragranceCalc.ts`

**Inputs:**
- `oilType: "fragrance" | "essential"` — FO or EO
- `totalOilWeight: number` — total oil weight in batch
- `usageRate: number` — percentage (default 6% for FO, 3% for EO)
- `unit: "oz" | "g"`

**Outputs:**
- `fragranceWeight: number` — weight of fragrance/EO needed
- `fragranceTeaspoons: number` — converted to tsp (1 tsp = 4.93 ml, ~4.7g for most FOs)
- `maxSafeRate: number` — 6 for FO, 3 for EO
- `warnings: string[]` — triggered if usageRate exceeds maxSafeRate
- `mathSteps: MathStep[]`

**Logic:**
1. fragranceWeight = totalOilWeight * (usageRate / 100)
2. Convert to tsp: if unit is "oz", tsp = fragranceWeight / 0.17; if "g", tsp = fragranceWeight / 4.7
3. If usageRate > maxSafeRate, push warning

**Safety warning:** "Essential oil usage rates vary by oil. Check supplier IFRA documentation for skin-safe maximums." Displayed via `SafetyWarning` component.

---

### 2. Color Additive Calculator

**Route:** `soap/color-additive.tsx`
**Calc function:** `src/modules/soap/calculators/colorAdditive.ts`

**Inputs:**
- `colorantType: "mica" | "oxide" | "clay" | "liquid-dye"`
- `totalOilWeight: number` — in oz or g
- `usageRate: number` — tsp per pound of oils (defaults: mica 1, oxide 0.5, clay 1, liquid-dye 0.5)
- `numberOfColorSplits: number` — default 1 (divides total evenly)
- `unit: "oz" | "g"`

**Default usage rates (tsp/lb):**

| Type | Default | Max Safe |
|---|---|---|
| Mica | 1.0 | 2.0 |
| Oxide | 0.5 | 1.0 |
| Clay | 1.0 | 2.0 |
| Liquid Dye | 0.5 | 1.5 |

**Outputs:**
- `totalColorantTsp: number` — total tsp needed
- `totalColorantG: number` — converted to grams (1 tsp mica ≈ 3g, oxide ≈ 4g, clay ≈ 3.5g, liquid ≈ 5g)
- `perColorTsp: number` — divided by numberOfColorSplits
- `perColorG: number`
- `maxSafeRate: number`
- `warnings: string[]` — if exceeds max safe rate
- `mathSteps: MathStep[]`

**Logic:**
1. Convert oil weight to pounds: if "oz", divide by 16; if "g", divide by 453.6
2. totalColorantTsp = oilWeightLbs * usageRate
3. Convert to grams using type-specific density
4. Divide by numberOfColorSplits
5. If usageRate > maxSafe, push warning

---

### 3. Cure Time Tracker

**Route:** `soap/cure-tracker.tsx`
**Calc function:** `src/modules/soap/calculators/cureTracker.ts`

**Inputs:**
- `soapMethod: "cold-process" | "hot-process" | "melt-and-pour"`
- `batchDate: string` — MM/DD/YYYY format, defaults to today
- `humidity: "low" | "moderate" | "high"`

**Base cure times (in hours):**

| Method | Unmold | Cut | Use | Full Cure |
|---|---|---|---|---|
| Cold Process | 36 | 48 | 672 (4 wk) | 1008 (6 wk) |
| Hot Process | 18 | 24 | 168 (1 wk) | 504 (3 wk) |
| Melt & Pour | 3 | 0 (N/A) | 24 | 24 |

**Humidity adjustment:**
- Low: factor = 0.85 (15% faster)
- Moderate: factor = 1.0
- High: factor = 1.25 (25% slower)

**Outputs:**
- `unmoldDate: string` — ISO date
- `cutDate: string | null` — null for melt & pour
- `useDate: string` — safe to use date
- `fullCureDate: string` — full cure date
- `currentStage: string` — which phase based on today vs dates
- `daysToNextMilestone: number`
- `mathSteps: MathStep[]`

**Logic:**
1. Parse batchDate to Date object
2. Apply humidity factor to each base time
3. Add adjusted hours to batchDate for each milestone
4. Determine currentStage by comparing today's date against milestones
5. Calculate days remaining to next upcoming milestone

---

### 4. Cost Estimator

**Route:** `soap/cost-estimator.tsx`
**Calc function:** `src/modules/soap/calculators/costEstimator.ts`

**Inputs:**
- `oilEntries: { name: string; weightOz: number; pricePerLb: number }[]` — dynamic list
- `lyePricePerLb: number`
- `lyeWeightOz: number`
- `fragranceCostPerBottle: number`
- `fragranceBottleSizeOz: number`
- `fragranceAmountUsedOz: number`
- `colorantCostPerContainer: number`
- `colorantAmountUsedTsp: number`
- `colorantContainerSizeTsp: number`
- `packagingCostPerBar: number`
- `numberOfBars: number`

**Outputs:**
- `oilCostTotal: number`
- `lyeCost: number`
- `fragranceCost: number`
- `colorantCost: number`
- `packagingCostTotal: number`
- `totalBatchCost: number`
- `costPerBar: number`
- `suggestedRetailPrice: number` — 3x costPerBar
- `mathSteps: MathStep[]`

**Logic:**
1. Oil cost: for each oil entry, (weightOz / 16) * pricePerLb, then sum
2. Lye cost: (lyeWeightOz / 16) * lyePricePerLb
3. Fragrance cost: (fragranceAmountUsedOz / fragranceBottleSizeOz) * fragranceCostPerBottle
4. Colorant cost: (colorantAmountUsedTsp / colorantContainerSizeTsp) * colorantCostPerContainer
5. Packaging cost: packagingCostPerBar * numberOfBars
6. Total = oil + lye + fragrance + colorant + packaging
7. Cost per bar = total / numberOfBars
8. Suggested retail = costPerBar * 3

---

## Files to Create

| File | Purpose |
|---|---|
| `src/modules/soap/calculators/fragranceCalc.ts` | Pure fragrance/EO calculation |
| `src/modules/soap/calculators/colorAdditive.ts` | Pure color additive calculation |
| `src/modules/soap/calculators/cureTracker.ts` | Pure cure time date calculation |
| `src/modules/soap/calculators/costEstimator.ts` | Pure batch cost calculation |
| `app/(tabs)/make/soap/fragrance-calc.tsx` | Fragrance calculator screen |
| `app/(tabs)/make/soap/color-additive.tsx` | Color additive screen |
| `app/(tabs)/make/soap/cure-tracker.tsx` | Cure time tracker screen |
| `app/(tabs)/make/soap/cost-estimator.tsx` | Cost estimator screen |

## Files to Modify

| File | Change |
|---|---|
| `app/(tabs)/make/soap/index.tsx` | Add 4 new entries to CALCULATORS array |
| `app/(tabs)/make/soap/_layout.tsx` | Add 4 new Stack.Screen entries |

## Shared Dependencies

All screens use existing design system components:
- `CalculatorInput` — numeric inputs with labels and units
- `ResultCard` — results display
- `ActionBar` — save/quote/log actions
- `FilterBar` — option selection pills
- `SafetyWarning` — warning callouts (fragrance calc)
- `useTheme` — dark/light theme colors
- `CalculatorService.save()` — save results to history

No new dependencies needed.

## Architecture Invariants

- Pure calc functions have zero side effects and zero UI imports
- Screens handle state, UI, and save-to-history
- All calc functions return `mathSteps: MathStep[]` for transparency
- All inputs use string state for controlled TextInputs, parsed to numbers at calculation time
- Results computed via `useMemo` keyed to input state
- MathStep type imported from `lyeCalculator.ts` (same as resin imports from `resinRatio.ts`)
