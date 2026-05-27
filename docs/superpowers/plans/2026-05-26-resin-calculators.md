# Resin Calculator Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 new resin calculators (cost estimator, coating coverage, pot life timer, pressure pot sizing) to the existing resin module.

**Architecture:** Each calculator is a pure TypeScript function in `src/modules/resin/calculators/` paired with an Expo Router screen in `app/(tabs)/make/resin/`. All screens follow the identical pattern established by the 3 existing resin calculators: string state for inputs, `useMemo` for computation, `ResultCard` for display, `ActionBar` for save/quote/log, `FilterBar` for option selection.

**Tech Stack:** React Native, Expo Router (file-based routing), expo-haptics (already installed), TypeScript, NativeWind (Tailwind classes).

---

## File Map

### Files to Create

| File | Responsibility |
|---|---|
| `src/modules/resin/calculators/costEstimator.ts` | Pure function: resin project cost from price, volume, ratio, colorant, waste |
| `src/modules/resin/calculators/coatingCoverage.ts` | Pure function: surface area + volume for flood/seal coats |
| `src/modules/resin/calculators/potLife.ts` | Pure function: temp/mass-adjusted pot life + cure stage times |
| `src/modules/resin/calculators/pressurePot.ts` | Pure function: pot/mold fit check, max molds, total resin needed |
| `app/(tabs)/make/resin/cost-estimator.tsx` | Screen: cost estimator UI |
| `app/(tabs)/make/resin/coating-coverage.tsx` | Screen: coating coverage UI |
| `app/(tabs)/make/resin/pot-life.tsx` | Screen: pot life timer UI with countdown |
| `app/(tabs)/make/resin/pressure-pot.tsx` | Screen: pressure pot sizing UI |

### Files to Modify

| File | Change |
|---|---|
| `app/(tabs)/make/resin/index.tsx` | Add 4 entries to `CALCULATORS` array |
| `app/(tabs)/make/resin/_layout.tsx` | Add 4 `Stack.Screen` entries |

---

## Task 1: Cost Estimator — Calc Function

**Files:**
- Create: `src/modules/resin/calculators/costEstimator.ts`

- [ ] **Step 1: Create the cost estimator calc function**

```ts
// src/modules/resin/calculators/costEstimator.ts
import type { MathStep } from "./resinRatio";

export interface CostEstimatorInput {
  resinPricePerUnit: number;
  priceUnit: "L" | "gal";
  volumeNeeded: number;
  volumeUnit: "ml" | "oz";
  mixRatioResin: number;
  mixRatioHardener: number;
  colorantCostPerBottle: number;
  colorantAmountUsed: number;
  colorantBottleSize: number;
  wasteFactor: number;
}

export interface CostEstimatorResult {
  resinCost: number;
  hardenerCost: number;
  colorantCost: number;
  wasteCost: number;
  totalCost: number;
  costPerMl: number;
  mathSteps: MathStep[];
}

const ML_PER_GAL = 3785.41;
const ML_PER_L = 1000;
const ML_PER_OZ = 29.5735;

export function calculateCost(input: CostEstimatorInput): CostEstimatorResult {
  const {
    resinPricePerUnit, priceUnit, volumeNeeded, volumeUnit,
    mixRatioResin, mixRatioHardener,
    colorantCostPerBottle, colorantAmountUsed, colorantBottleSize,
    wasteFactor,
  } = input;

  const mlPerPriceUnit = priceUnit === "gal" ? ML_PER_GAL : ML_PER_L;
  const costPerMlRaw = resinPricePerUnit / mlPerPriceUnit;

  const volumeMl = volumeUnit === "oz" ? volumeNeeded * ML_PER_OZ : volumeNeeded;

  const totalRatio = mixRatioResin + mixRatioHardener;
  const resinPortionMl = volumeMl * (mixRatioResin / totalRatio);
  const hardenerPortionMl = volumeMl - resinPortionMl;

  const resinCost = resinPortionMl * costPerMlRaw;
  const hardenerCost = hardenerPortionMl * costPerMlRaw;

  const colorantCost = colorantBottleSize > 0
    ? (colorantAmountUsed / colorantBottleSize) * colorantCostPerBottle
    : 0;

  const subtotal = resinCost + hardenerCost + colorantCost;
  const wasteCost = subtotal * (wasteFactor / 100);
  const totalCost = subtotal + wasteCost;
  const costPerMl = volumeMl > 0 ? totalCost / volumeMl : 0;

  const r = (v: number) => Math.round(v * 100) / 100;

  const mathSteps: MathStep[] = [
    { label: "Cost per ml", formula: `$${resinPricePerUnit} / ${mlPerPriceUnit} ml`, result: r(costPerMlRaw), unit: "$/ml" },
    { label: "Resin portion", formula: `${r(volumeMl)} ml x (${mixRatioResin}/${totalRatio})`, result: r(resinPortionMl), unit: "ml" },
    { label: "Resin cost", formula: `${r(resinPortionMl)} ml x $${r(costPerMlRaw)}/ml`, result: r(resinCost), unit: "$" },
    { label: "Hardener cost", formula: `${r(hardenerPortionMl)} ml x $${r(costPerMlRaw)}/ml`, result: r(hardenerCost), unit: "$" },
    { label: "Colorant cost", formula: `(${colorantAmountUsed} / ${colorantBottleSize}) x $${colorantCostPerBottle}`, result: r(colorantCost), unit: "$" },
    { label: "Waste cost", formula: `$${r(subtotal)} x ${wasteFactor}%`, result: r(wasteCost), unit: "$" },
    { label: "Total", formula: `$${r(subtotal)} + $${r(wasteCost)}`, result: r(totalCost), unit: "$" },
  ];

  return { resinCost: r(resinCost), hardenerCost: r(hardenerCost), colorantCost: r(colorantCost), wasteCost: r(wasteCost), totalCost: r(totalCost), costPerMl: r(costPerMl), mathSteps };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\danlo\MakerApp && npx tsc --noEmit --pretty 2>&1 | Select-Object -First 20`
Expected: No errors related to `costEstimator.ts`

- [ ] **Step 3: Commit**

```powershell
cd C:\Users\danlo\MakerApp
git add src/modules/resin/calculators/costEstimator.ts
git commit -m "feat(resin): add cost estimator calc function"
```

---

## Task 2: Cost Estimator — Screen

**Files:**
- Create: `app/(tabs)/make/resin/cost-estimator.tsx`

- [ ] **Step 1: Create the cost estimator screen**

```tsx
// app/(tabs)/make/resin/cost-estimator.tsx
import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateCost } from "../../../../src/modules/resin/calculators/costEstimator";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const PRICE_UNIT_OPTIONS = [
  { label: "per Liter", value: "L" },
  { label: "per Gallon", value: "gal" },
];

const VOLUME_UNIT_OPTIONS = [
  { label: "ml", value: "ml" },
  { label: "oz", value: "oz" },
];

export default function CostEstimatorScreen() {
  const { colors } = useTheme();

  const [priceUnit, setPriceUnit] = useState<"L" | "gal">("L");
  const [volumeUnit, setVolumeUnit] = useState<"ml" | "oz">("ml");
  const [resinPrice, setResinPrice] = useState("");
  const [volumeNeeded, setVolumeNeeded] = useState("");
  const [resinRatio, setResinRatio] = useState("2");
  const [hardenerRatio, setHardenerRatio] = useState("1");
  const [colorantCost, setColorantCost] = useState("");
  const [colorantUsed, setColorantUsed] = useState("");
  const [colorantBottleSize, setColorantBottleSize] = useState("");
  const [wasteFactor, setWasteFactor] = useState("10");

  const results = useMemo(() => {
    const price = parseFloat(resinPrice);
    const vol = parseFloat(volumeNeeded);
    const rr = parseFloat(resinRatio);
    const hr = parseFloat(hardenerRatio);
    if (!price || price <= 0 || !vol || vol <= 0 || !rr || rr <= 0 || !hr || hr <= 0) return null;

    return calculateCost({
      resinPricePerUnit: price,
      priceUnit,
      volumeNeeded: vol,
      volumeUnit,
      mixRatioResin: rr,
      mixRatioHardener: hr,
      colorantCostPerBottle: parseFloat(colorantCost) || 0,
      colorantAmountUsed: parseFloat(colorantUsed) || 0,
      colorantBottleSize: parseFloat(colorantBottleSize) || 0,
      wasteFactor: parseFloat(wasteFactor) || 10,
    });
  }, [resinPrice, volumeNeeded, resinRatio, hardenerRatio, priceUnit, volumeUnit, colorantCost, colorantUsed, colorantBottleSize, wasteFactor]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Total Cost", value: `$${results.totalCost.toFixed(2)}`, highlight: true },
      { label: "Resin", value: `$${results.resinCost.toFixed(2)}` },
      { label: "Hardener", value: `$${results.hardenerCost.toFixed(2)}` },
      { label: "Colorant", value: `$${results.colorantCost.toFixed(2)}` },
      { label: "Waste", value: `$${results.wasteCost.toFixed(2)}` },
      { label: "Cost per ml", value: `$${results.costPerMl.toFixed(3)}`, unit: "/ml" },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) { Alert.alert("No Results", "Enter valid inputs to save."); return; }
    try {
      CalculatorService.save({
        module: "resin",
        calculatorType: "cost-estimator",
        inputsJson: { resinPrice, priceUnit, volumeNeeded, volumeUnit, resinRatio, hardenerRatio, colorantCost, colorantUsed, colorantBottleSize, wasteFactor },
        outputsJson: results,
        label: `$${results.totalCost.toFixed(2)} total — ${volumeNeeded} ${volumeUnit}`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch { Alert.alert("Error", "Failed to save result."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          Cost Estimator
        </Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>
          Calculate total project cost from resin, colorant, and waste
        </Text>

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
          Resin Price Unit
        </Text>
        <FilterBar options={PRICE_UNIT_OPTIONS} selected={priceUnit} onSelect={(v) => setPriceUnit(v as "L" | "gal")} />

        <CalculatorInput label="Resin Price" value={resinPrice} onChangeText={setResinPrice} unit={`$/${priceUnit}`} placeholder="45" />
        
        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
          Volume Unit
        </Text>
        <FilterBar options={VOLUME_UNIT_OPTIONS} selected={volumeUnit} onSelect={(v) => setVolumeUnit(v as "ml" | "oz")} />

        <CalculatorInput label="Volume Needed" value={volumeNeeded} onChangeText={setVolumeNeeded} unit={volumeUnit} placeholder="200" />
        <CalculatorInput label="Resin Ratio" value={resinRatio} onChangeText={setResinRatio} unit="parts" placeholder="2" />
        <CalculatorInput label="Hardener Ratio" value={hardenerRatio} onChangeText={setHardenerRatio} unit="parts" placeholder="1" />

        <Text className="text-[12px] uppercase tracking-wider mb-2 mt-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
          Colorant (optional)
        </Text>
        <CalculatorInput label="Colorant Bottle Price" value={colorantCost} onChangeText={setColorantCost} unit="$" placeholder="12" />
        <CalculatorInput label="Amount Used" value={colorantUsed} onChangeText={setColorantUsed} unit="g" placeholder="5" />
        <CalculatorInput label="Bottle Size" value={colorantBottleSize} onChangeText={setColorantBottleSize} unit="g" placeholder="50" />

        <CalculatorInput label="Waste Factor" value={wasteFactor} onChangeText={setWasteFactor} unit="%" placeholder="10" />

        {results ? (
          <ResultCard title="Cost Breakdown" results={resultItems} />
        ) : (
          <View className="rounded-xl p-4 mt-4 items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
              Enter resin price and volume to estimate cost
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

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\danlo\MakerApp && npx tsc --noEmit --pretty 2>&1 | Select-Object -First 20`
Expected: No errors related to `cost-estimator.tsx`

- [ ] **Step 3: Commit**

```powershell
cd C:\Users\danlo\MakerApp
git add app/(tabs)/make/resin/cost-estimator.tsx
git commit -m "feat(resin): add cost estimator screen"
```

---

## Task 3: Coating Coverage — Calc Function

**Files:**
- Create: `src/modules/resin/calculators/coatingCoverage.ts`

- [ ] **Step 1: Create the coating coverage calc function**

```ts
// src/modules/resin/calculators/coatingCoverage.ts
import type { MathStep } from "./resinRatio";

export interface CoatingCoverageInput {
  shape: "rectangle" | "circle";
  lengthMm?: number;
  widthMm?: number;
  diameterMm?: number;
  depthMm: number;
  numberOfCoats: number;
  mixRatioResin: number;
  mixRatioHardener: number;
  inputUnit: "mm" | "in";
}

export interface CoatingCoverageResult {
  surfaceAreaMm2: number;
  volumePerCoatMl: number;
  totalVolumeMl: number;
  resinAmountMl: number;
  hardenerAmountMl: number;
  totalWeightG: number;
  mathSteps: MathStep[];
}

const MM_PER_IN = 25.4;
const RESIN_DENSITY = 1.1;

function toMm(value: number, unit: "mm" | "in"): number {
  return unit === "in" ? value * MM_PER_IN : value;
}

export function calculateCoatingCoverage(input: CoatingCoverageInput): CoatingCoverageResult {
  const { shape, numberOfCoats, mixRatioResin, mixRatioHardener, inputUnit } = input;
  const depthMm = toMm(input.depthMm, inputUnit);

  let surfaceAreaMm2 = 0;
  const steps: MathStep[] = [];
  const r = (v: number) => Math.round(v * 100) / 100;

  if (shape === "rectangle") {
    const l = toMm(input.lengthMm ?? 0, inputUnit);
    const w = toMm(input.widthMm ?? 0, inputUnit);
    surfaceAreaMm2 = l * w;
    steps.push({ label: "Surface Area", formula: `${r(l)} mm x ${r(w)} mm`, result: r(surfaceAreaMm2), unit: "mm²" });
  } else {
    const d = toMm(input.diameterMm ?? 0, inputUnit);
    const radius = d / 2;
    surfaceAreaMm2 = Math.PI * radius * radius;
    steps.push({ label: "Surface Area", formula: `π x (${r(d)}/2)²`, result: r(surfaceAreaMm2), unit: "mm²" });
  }

  const volumePerCoatMl = (surfaceAreaMm2 * depthMm) / 1000;
  steps.push({ label: "Volume per Coat", formula: `${r(surfaceAreaMm2)} mm² x ${r(depthMm)} mm / 1000`, result: r(volumePerCoatMl), unit: "ml" });

  const totalVolumeMl = volumePerCoatMl * numberOfCoats;
  if (numberOfCoats > 1) {
    steps.push({ label: "Total Volume", formula: `${r(volumePerCoatMl)} ml x ${numberOfCoats} coats`, result: r(totalVolumeMl), unit: "ml" });
  }

  const totalRatio = mixRatioResin + mixRatioHardener;
  const resinAmountMl = totalVolumeMl * (mixRatioResin / totalRatio);
  const hardenerAmountMl = totalVolumeMl - resinAmountMl;
  steps.push({ label: "Resin Amount", formula: `${r(totalVolumeMl)} ml x (${mixRatioResin}/${totalRatio})`, result: r(resinAmountMl), unit: "ml" });
  steps.push({ label: "Hardener Amount", formula: `${r(totalVolumeMl)} ml - ${r(resinAmountMl)} ml`, result: r(hardenerAmountMl), unit: "ml" });

  const totalWeightG = totalVolumeMl * RESIN_DENSITY;
  steps.push({ label: "Total Weight", formula: `${r(totalVolumeMl)} ml x ${RESIN_DENSITY} g/ml`, result: r(totalWeightG), unit: "g" });

  return {
    surfaceAreaMm2: r(surfaceAreaMm2),
    volumePerCoatMl: r(volumePerCoatMl),
    totalVolumeMl: r(totalVolumeMl),
    resinAmountMl: r(resinAmountMl),
    hardenerAmountMl: r(hardenerAmountMl),
    totalWeightG: r(totalWeightG),
    mathSteps: steps,
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\danlo\MakerApp && npx tsc --noEmit --pretty 2>&1 | Select-Object -First 20`

- [ ] **Step 3: Commit**

```powershell
cd C:\Users\danlo\MakerApp
git add src/modules/resin/calculators/coatingCoverage.ts
git commit -m "feat(resin): add coating coverage calc function"
```

---

## Task 4: Coating Coverage — Screen

**Files:**
- Create: `app/(tabs)/make/resin/coating-coverage.tsx`

- [ ] **Step 1: Create the coating coverage screen**

```tsx
// app/(tabs)/make/resin/coating-coverage.tsx
import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateCoatingCoverage } from "../../../../src/modules/resin/calculators/coatingCoverage";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { SafetyWarning } from "../../../../src/design-system/components/SafetyWarning";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const SHAPE_OPTIONS = [
  { label: "Rectangle", value: "rectangle" },
  { label: "Circle", value: "circle" },
];

const UNIT_OPTIONS = [
  { label: "mm", value: "mm" },
  { label: "inches", value: "in" },
];

type Shape = "rectangle" | "circle";
type DimUnit = "mm" | "in";

export default function CoatingCoverageScreen() {
  const { colors } = useTheme();

  const [shape, setShape] = useState<Shape>("rectangle");
  const [inputUnit, setInputUnit] = useState<DimUnit>("in");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [diameter, setDiameter] = useState("");
  const [depth, setDepth] = useState("1.5");
  const [numberOfCoats, setNumberOfCoats] = useState("1");
  const [resinRatio, setResinRatio] = useState("2");
  const [hardenerRatio, setHardenerRatio] = useState("1");

  const results = useMemo(() => {
    const d = parseFloat(depth);
    const coats = parseInt(numberOfCoats, 10);
    const rr = parseFloat(resinRatio);
    const hr = parseFloat(hardenerRatio);
    if (!d || d <= 0 || !coats || coats <= 0 || !rr || rr <= 0 || !hr || hr <= 0) return null;

    if (shape === "rectangle") {
      const l = parseFloat(length);
      const w = parseFloat(width);
      if (!l || l <= 0 || !w || w <= 0) return null;
      return calculateCoatingCoverage({ shape, lengthMm: l, widthMm: w, depthMm: d, numberOfCoats: coats, mixRatioResin: rr, mixRatioHardener: hr, inputUnit });
    }
    const dia = parseFloat(diameter);
    if (!dia || dia <= 0) return null;
    return calculateCoatingCoverage({ shape, diameterMm: dia, depthMm: d, numberOfCoats: coats, mixRatioResin: rr, mixRatioHardener: hr, inputUnit });
  }, [shape, length, width, diameter, depth, numberOfCoats, resinRatio, hardenerRatio, inputUnit]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Total Volume", value: `${results.totalVolumeMl}`, unit: "ml", highlight: true },
      { label: "Per Coat", value: `${results.volumePerCoatMl}`, unit: "ml" },
      { label: "Resin", value: `${results.resinAmountMl}`, unit: "ml" },
      { label: "Hardener", value: `${results.hardenerAmountMl}`, unit: "ml" },
      { label: "Total Weight", value: `${results.totalWeightG}`, unit: "g" },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) { Alert.alert("No Results", "Enter valid inputs to save."); return; }
    try {
      CalculatorService.save({
        module: "resin",
        calculatorType: "coating-coverage",
        inputsJson: { shape, inputUnit, length, width, diameter, depth, numberOfCoats, resinRatio, hardenerRatio },
        outputsJson: results,
        label: `${results.totalVolumeMl} ml — ${numberOfCoats} coat(s)`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch { Alert.alert("Error", "Failed to save result."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          Coating Coverage
        </Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>
          Calculate resin needed for flood coats and seal coats
        </Text>

        <SafetyWarning message="Seal coat recommended on porous surfaces (wood, fabric) before flood coat to prevent bubbles." level="warning" />

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
          Shape
        </Text>
        <FilterBar options={SHAPE_OPTIONS} selected={shape} onSelect={(v) => setShape(v as Shape)} />

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
          Unit
        </Text>
        <FilterBar options={UNIT_OPTIONS} selected={inputUnit} onSelect={(v) => setInputUnit(v as DimUnit)} />

        {shape === "rectangle" ? (
          <>
            <CalculatorInput label="Length" value={length} onChangeText={setLength} unit={inputUnit} placeholder="36" />
            <CalculatorInput label="Width" value={width} onChangeText={setWidth} unit={inputUnit} placeholder="24" />
          </>
        ) : (
          <CalculatorInput label="Diameter" value={diameter} onChangeText={setDiameter} unit={inputUnit} placeholder="24" />
        )}

        <CalculatorInput label="Coating Depth" value={depth} onChangeText={setDepth} unit={inputUnit} placeholder="1.5" />
        <CalculatorInput label="Number of Coats" value={numberOfCoats} onChangeText={setNumberOfCoats} unit="coats" placeholder="1" />
        <CalculatorInput label="Resin Ratio" value={resinRatio} onChangeText={setResinRatio} unit="parts" placeholder="2" />
        <CalculatorInput label="Hardener Ratio" value={hardenerRatio} onChangeText={setHardenerRatio} unit="parts" placeholder="1" />

        {results ? (
          <ResultCard title="Coverage Results" results={resultItems} />
        ) : (
          <View className="rounded-xl p-4 mt-4 items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
              Enter surface dimensions to calculate coverage
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

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\danlo\MakerApp && npx tsc --noEmit --pretty 2>&1 | Select-Object -First 20`

- [ ] **Step 3: Commit**

```powershell
cd C:\Users\danlo\MakerApp
git add app/(tabs)/make/resin/coating-coverage.tsx
git commit -m "feat(resin): add coating coverage screen"
```

---

## Task 5: Pot Life Timer — Calc Function

**Files:**
- Create: `src/modules/resin/calculators/potLife.ts`

- [ ] **Step 1: Create the pot life calc function**

```ts
// src/modules/resin/calculators/potLife.ts
import type { MathStep } from "./resinRatio";

export type ResinType = "standard-epoxy" | "fast-set-epoxy" | "polyester" | "polyurethane";

export interface PotLifeInput {
  resinType: ResinType;
  ambientTemp: number;
  tempUnit: "F" | "C";
  batchVolumeMl: number;
}

export interface CureStage {
  name: string;
  minutes: number;
}

export interface PotLifeResult {
  adjustedPotLifeMin: number;
  gelTimeMin: number;
  demoldTimeMin: number;
  fullCureTimeMin: number;
  tempFactor: number;
  massFactor: number;
  cureStages: CureStage[];
  mathSteps: MathStep[];
}

interface ResinPreset {
  label: string;
  potLifeMin: number;
  gelTimeMin: number;
  demoldTimeMin: number;
  fullCureMin: number;
}

const PRESETS: Record<ResinType, ResinPreset> = {
  "standard-epoxy": { label: "Standard Epoxy", potLifeMin: 45, gelTimeMin: 180, demoldTimeMin: 720, fullCureMin: 4320 },
  "fast-set-epoxy": { label: "Fast-Set Epoxy", potLifeMin: 15, gelTimeMin: 60, demoldTimeMin: 240, fullCureMin: 1440 },
  "polyester": { label: "Polyester", potLifeMin: 10, gelTimeMin: 30, demoldTimeMin: 120, fullCureMin: 1440 },
  "polyurethane": { label: "Polyurethane", potLifeMin: 8, gelTimeMin: 20, demoldTimeMin: 60, fullCureMin: 960 },
};

export function calculatePotLife(input: PotLifeInput): PotLifeResult {
  const { resinType, ambientTemp, tempUnit, batchVolumeMl } = input;
  const preset = PRESETS[resinType];

  const tempF = tempUnit === "C" ? ambientTemp * 9 / 5 + 32 : ambientTemp;
  const delta = tempF - 72;
  const tempFactor = Math.pow(0.5, delta / 18);

  const massFactor = batchVolumeMl > 200
    ? Math.max(0.5, 200 / batchVolumeMl)
    : 1.0;

  const combinedFactor = tempFactor * massFactor;

  const adjustedPotLifeMin = preset.potLifeMin * combinedFactor;
  const gelTimeMin = preset.gelTimeMin * combinedFactor;
  const demoldTimeMin = preset.demoldTimeMin * combinedFactor;
  const fullCureTimeMin = preset.fullCureMin * combinedFactor;

  const r = (v: number) => Math.round(v * 10) / 10;

  const cureStages: CureStage[] = [
    { name: "Working Time", minutes: r(adjustedPotLifeMin) },
    { name: "Gel", minutes: r(gelTimeMin) },
    { name: "Demold", minutes: r(demoldTimeMin) },
    { name: "Full Cure", minutes: r(fullCureTimeMin) },
  ];

  const mathSteps: MathStep[] = [
    { label: "Ambient Temp (°F)", formula: tempUnit === "C" ? `${ambientTemp}°C x 9/5 + 32` : `${ambientTemp}°F`, result: r(tempF), unit: "°F" },
    { label: "Temp Delta", formula: `${r(tempF)}°F - 72°F`, result: r(delta), unit: "°F" },
    { label: "Temp Factor", formula: `0.5 ^ (${r(delta)} / 18)`, result: Math.round(tempFactor * 1000) / 1000, unit: "x" },
    { label: "Mass Factor", formula: batchVolumeMl > 200 ? `max(0.5, 200 / ${batchVolumeMl})` : "1.0 (batch ≤ 200 ml)", result: Math.round(massFactor * 1000) / 1000, unit: "x" },
    { label: "Adjusted Pot Life", formula: `${preset.potLifeMin} min x ${Math.round(tempFactor * 1000) / 1000} x ${Math.round(massFactor * 1000) / 1000}`, result: r(adjustedPotLifeMin), unit: "min" },
  ];

  return {
    adjustedPotLifeMin: r(adjustedPotLifeMin),
    gelTimeMin: r(gelTimeMin),
    demoldTimeMin: r(demoldTimeMin),
    fullCureTimeMin: r(fullCureTimeMin),
    tempFactor: Math.round(tempFactor * 1000) / 1000,
    massFactor: Math.round(massFactor * 1000) / 1000,
    cureStages,
    mathSteps,
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\danlo\MakerApp && npx tsc --noEmit --pretty 2>&1 | Select-Object -First 20`

- [ ] **Step 3: Commit**

```powershell
cd C:\Users\danlo\MakerApp
git add src/modules/resin/calculators/potLife.ts
git commit -m "feat(resin): add pot life calc function with temp/mass adjustment"
```

---

## Task 6: Pot Life Timer — Screen

**Files:**
- Create: `app/(tabs)/make/resin/pot-life.tsx`

- [ ] **Step 1: Create the pot life timer screen**

```tsx
// app/(tabs)/make/resin/pot-life.tsx
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { calculatePotLife } from "../../../../src/modules/resin/calculators/potLife";
import type { ResinType } from "../../../../src/modules/resin/calculators/potLife";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const RESIN_TYPE_OPTIONS = [
  { label: "Standard Epoxy", value: "standard-epoxy" },
  { label: "Fast-Set", value: "fast-set-epoxy" },
  { label: "Polyester", value: "polyester" },
  { label: "Polyurethane", value: "polyurethane" },
];

const TEMP_UNIT_OPTIONS = [
  { label: "°F", value: "F" },
  { label: "°C", value: "C" },
];

type TimerState = "idle" | "running" | "paused";

export default function PotLifeScreen() {
  const { colors } = useTheme();

  const [resinType, setResinType] = useState<ResinType>("standard-epoxy");
  const [tempUnit, setTempUnit] = useState<"F" | "C">("F");
  const [ambientTemp, setAmbientTemp] = useState("72");
  const [batchVolume, setBatchVolume] = useState("100");

  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const totalSecondsRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const haptic75Ref = useRef(false);
  const haptic90Ref = useRef(false);

  const results = useMemo(() => {
    const temp = parseFloat(ambientTemp);
    const vol = parseFloat(batchVolume);
    if (!temp || !vol || vol <= 0) return null;
    return calculatePotLife({ resinType, ambientTemp: temp, tempUnit, batchVolumeMl: vol });
  }, [resinType, ambientTemp, tempUnit, batchVolume]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    const fmt = (min: number) => min >= 60 ? `${(min / 60).toFixed(1)} hr` : `${min} min`;
    return [
      { label: "Working Time", value: fmt(results.adjustedPotLifeMin), highlight: true },
      { label: "Gel Time", value: fmt(results.gelTimeMin) },
      { label: "Demold Time", value: fmt(results.demoldTimeMin) },
      { label: "Full Cure", value: fmt(results.fullCureTimeMin) },
    ];
  }, [results]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  useEffect(() => { return clearTimer; }, [clearTimer]);

  const startTimer = () => {
    if (!results) return;
    const totalSec = Math.round(results.adjustedPotLifeMin * 60);
    totalSecondsRef.current = totalSec;
    haptic75Ref.current = false;
    haptic90Ref.current = false;
    setSecondsRemaining(totalSec);
    setTimerState("running");
    clearTimer();
    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) { clearTimer(); setTimerState("idle"); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); return 0; }
        const next = prev - 1;
        const elapsed = totalSecondsRef.current - next;
        const pct = elapsed / totalSecondsRef.current;
        if (pct >= 0.75 && !haptic75Ref.current) { haptic75Ref.current = true; Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); }
        if (pct >= 0.90 && !haptic90Ref.current) { haptic90Ref.current = true; Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); }
        return next;
      });
    }, 1000);
  };

  const pauseTimer = () => { clearTimer(); setTimerState("paused"); };
  const resumeTimer = () => {
    setTimerState("running");
    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) { clearTimer(); setTimerState("idle"); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); return 0; }
        const next = prev - 1;
        const elapsed = totalSecondsRef.current - next;
        const pct = elapsed / totalSecondsRef.current;
        if (pct >= 0.75 && !haptic75Ref.current) { haptic75Ref.current = true; Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); }
        if (pct >= 0.90 && !haptic90Ref.current) { haptic90Ref.current = true; Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); }
        return next;
      });
    }, 1000);
  };
  const resetTimer = () => { clearTimer(); setTimerState("idle"); setSecondsRemaining(0); };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPct = totalSecondsRef.current > 0
    ? (totalSecondsRef.current - secondsRemaining) / totalSecondsRef.current
    : 0;

  const progressColor = progressPct < 0.75 ? colors.success : progressPct < 0.90 ? colors.warning : colors.danger;

  const handleSave = () => {
    if (!results) { Alert.alert("No Results", "Enter valid inputs to save."); return; }
    try {
      CalculatorService.save({
        module: "resin",
        calculatorType: "pot-life",
        inputsJson: { resinType, ambientTemp, tempUnit, batchVolume },
        outputsJson: results,
        label: `${results.adjustedPotLifeMin} min pot life — ${RESIN_TYPE_OPTIONS.find(o => o.value === resinType)?.label}`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch { Alert.alert("Error", "Failed to save result."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          Pot Life Timer
        </Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>
          Temperature and mass-adjusted working time with countdown
        </Text>

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
          Resin Type
        </Text>
        <FilterBar options={RESIN_TYPE_OPTIONS} selected={resinType} onSelect={(v) => setResinType(v as ResinType)} />

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
          Temperature Unit
        </Text>
        <FilterBar options={TEMP_UNIT_OPTIONS} selected={tempUnit} onSelect={(v) => setTempUnit(v as "F" | "C")} />

        <CalculatorInput label="Ambient Temperature" value={ambientTemp} onChangeText={setAmbientTemp} unit={`°${tempUnit}`} placeholder="72" />
        <CalculatorInput label="Batch Volume" value={batchVolume} onChangeText={setBatchVolume} unit="ml" placeholder="100" />

        {results && (
          <ResultCard title="Cure Stages" results={resultItems} />
        )}

        {results && (
          <View className="rounded-xl p-4 mt-4 items-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <Text className="text-[48px]" style={{ fontFamily: "JetBrainsMono_700Bold", color: timerState === "idle" && secondsRemaining === 0 ? colors.textMuted : progressColor }}>
              {timerState === "idle" && secondsRemaining === 0 ? formatTime(Math.round(results.adjustedPotLifeMin * 60)) : formatTime(secondsRemaining)}
            </Text>

            <View className="w-full h-3 rounded-full mt-3 overflow-hidden" style={{ backgroundColor: colors.border }}>
              <View style={{ width: `${Math.min(progressPct * 100, 100)}%`, height: "100%", backgroundColor: progressColor, borderRadius: 9999 }} />
            </View>

            <View className="flex-row gap-3 mt-4">
              {timerState === "idle" && (
                <Pressable onPress={startTimer} className="px-6 py-3 rounded-lg" style={{ backgroundColor: colors.success }} accessibilityLabel="Start timer" accessibilityRole="button">
                  <Text className="text-[14px]" style={{ fontFamily: "Inter_600SemiBold", color: "#fff" }}>Start</Text>
                </Pressable>
              )}
              {timerState === "running" && (
                <Pressable onPress={pauseTimer} className="px-6 py-3 rounded-lg" style={{ backgroundColor: colors.warning }} accessibilityLabel="Pause timer" accessibilityRole="button">
                  <Text className="text-[14px]" style={{ fontFamily: "Inter_600SemiBold", color: "#fff" }}>Pause</Text>
                </Pressable>
              )}
              {timerState === "paused" && (
                <>
                  <Pressable onPress={resumeTimer} className="px-6 py-3 rounded-lg" style={{ backgroundColor: colors.success }} accessibilityLabel="Resume timer" accessibilityRole="button">
                    <Text className="text-[14px]" style={{ fontFamily: "Inter_600SemiBold", color: "#fff" }}>Resume</Text>
                  </Pressable>
                  <Pressable onPress={resetTimer} className="px-6 py-3 rounded-lg" style={{ backgroundColor: colors.danger }} accessibilityLabel="Reset timer" accessibilityRole="button">
                    <Text className="text-[14px]" style={{ fontFamily: "Inter_600SemiBold", color: "#fff" }}>Reset</Text>
                  </Pressable>
                </>
              )}
              {timerState === "running" && (
                <Pressable onPress={resetTimer} className="px-6 py-3 rounded-lg" style={{ backgroundColor: colors.danger }} accessibilityLabel="Reset timer" accessibilityRole="button">
                  <Text className="text-[14px]" style={{ fontFamily: "Inter_600SemiBold", color: "#fff" }}>Reset</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {!results && (
          <View className="rounded-xl p-4 mt-4 items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
              Enter temperature and batch volume to calculate pot life
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

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\danlo\MakerApp && npx tsc --noEmit --pretty 2>&1 | Select-Object -First 20`

- [ ] **Step 3: Commit**

```powershell
cd C:\Users\danlo\MakerApp
git add app/(tabs)/make/resin/pot-life.tsx
git commit -m "feat(resin): add pot life timer screen with countdown and haptics"
```

---

## Task 7: Pressure Pot Sizing — Calc Function

**Files:**
- Create: `src/modules/resin/calculators/pressurePot.ts`

- [ ] **Step 1: Create the pressure pot calc function**

```ts
// src/modules/resin/calculators/pressurePot.ts
import type { MathStep } from "./resinRatio";

export type FitVerdict = "fits" | "too-tall" | "too-wide" | "too-many";

export interface PressurePotInput {
  potDiameter: number;
  potHeight: number;
  potUnit: "in" | "cm";
  moldDiameter: number;
  moldHeight: number;
  moldUnit: "in" | "cm";
  numberOfMolds: number;
  heightClearance: number;
}

export interface PressurePotResult {
  potVolumeMl: number;
  singleMoldVolumeMl: number;
  maxMoldsFit: number;
  fitVerdict: FitVerdict;
  failReason: string | null;
  heightClearanceRemaining: number;
  totalResinMl: number;
  totalResinWeightG: number;
  mathSteps: MathStep[];
}

const CM_PER_IN = 2.54;
const RESIN_DENSITY = 1.1;

function toCm(value: number, unit: "in" | "cm"): number {
  return unit === "in" ? value * CM_PER_IN : value;
}

export function calculatePressurePot(input: PressurePotInput): PressurePotResult {
  const potDCm = toCm(input.potDiameter, input.potUnit);
  const potHCm = toCm(input.potHeight, input.potUnit);
  const moldDCm = toCm(input.moldDiameter, input.moldUnit);
  const moldHCm = toCm(input.moldHeight, input.moldUnit);
  const clearanceCm = toCm(input.heightClearance, input.potUnit);

  const potR = potDCm / 2;
  const potVolumeMl = Math.PI * potR * potR * potHCm;

  const moldR = moldDCm / 2;
  const singleMoldVolumeMl = Math.PI * moldR * moldR * moldHCm;

  const usableHeight = potHCm - clearanceCm;

  let fitVerdict: FitVerdict = "fits";
  let failReason: string | null = null;

  if (moldDCm > potDCm) {
    fitVerdict = "too-wide";
    failReason = `Mold diameter (${r(moldDCm)} cm) exceeds pot diameter (${r(potDCm)} cm)`;
  } else if (moldHCm > usableHeight) {
    fitVerdict = "too-tall";
    failReason = `Mold height (${r(moldHCm)} cm) exceeds usable pot height (${r(usableHeight)} cm)`;
  }

  const maxMoldsFit = moldDCm > 0 ? Math.floor(potDCm / moldDCm) : 0;

  if (fitVerdict === "fits" && input.numberOfMolds > maxMoldsFit) {
    fitVerdict = "too-many";
    failReason = `Requested ${input.numberOfMolds} molds but max ${maxMoldsFit} fit across pot diameter`;
  }

  const heightClearanceRemaining = usableHeight - moldHCm;
  const totalResinMl = singleMoldVolumeMl * input.numberOfMolds;
  const totalResinWeightG = totalResinMl * RESIN_DENSITY;

  const steps: MathStep[] = [
    { label: "Pot Volume", formula: `π x (${r(potDCm)}/2)² x ${r(potHCm)}`, result: r(potVolumeMl), unit: "ml" },
    { label: "Usable Height", formula: `${r(potHCm)} - ${r(clearanceCm)} clearance`, result: r(usableHeight), unit: "cm" },
    { label: "Mold Volume", formula: `π x (${r(moldDCm)}/2)² x ${r(moldHCm)}`, result: r(singleMoldVolumeMl), unit: "ml" },
    { label: "Max Molds Across", formula: `floor(${r(potDCm)} / ${r(moldDCm)})`, result: maxMoldsFit, unit: "molds" },
    { label: "Total Resin", formula: `${r(singleMoldVolumeMl)} ml x ${input.numberOfMolds}`, result: r(totalResinMl), unit: "ml" },
    { label: "Total Weight", formula: `${r(totalResinMl)} ml x ${RESIN_DENSITY}`, result: r(totalResinWeightG), unit: "g" },
  ];

  return {
    potVolumeMl: r(potVolumeMl),
    singleMoldVolumeMl: r(singleMoldVolumeMl),
    maxMoldsFit,
    fitVerdict,
    failReason,
    heightClearanceRemaining: r(heightClearanceRemaining),
    totalResinMl: r(totalResinMl),
    totalResinWeightG: r(totalResinWeightG),
    mathSteps: steps,
  };
}

function r(v: number): number {
  return Math.round(v * 100) / 100;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\danlo\MakerApp && npx tsc --noEmit --pretty 2>&1 | Select-Object -First 20`

- [ ] **Step 3: Commit**

```powershell
cd C:\Users\danlo\MakerApp
git add src/modules/resin/calculators/pressurePot.ts
git commit -m "feat(resin): add pressure pot sizing calc function"
```

---

## Task 8: Pressure Pot Sizing — Screen

**Files:**
- Create: `app/(tabs)/make/resin/pressure-pot.tsx`

- [ ] **Step 1: Create the pressure pot screen**

```tsx
// app/(tabs)/make/resin/pressure-pot.tsx
import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculatePressurePot } from "../../../../src/modules/resin/calculators/pressurePot";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const POT_UNIT_OPTIONS = [
  { label: "inches", value: "in" },
  { label: "cm", value: "cm" },
];

const MOLD_UNIT_OPTIONS = [
  { label: "inches", value: "in" },
  { label: "cm", value: "cm" },
];

type DimUnit = "in" | "cm";

export default function PressurePotScreen() {
  const { colors } = useTheme();

  const [potUnit, setPotUnit] = useState<DimUnit>("in");
  const [moldUnit, setMoldUnit] = useState<DimUnit>("in");
  const [potDiameter, setPotDiameter] = useState("");
  const [potHeight, setPotHeight] = useState("");
  const [moldDiameter, setMoldDiameter] = useState("");
  const [moldHeight, setMoldHeight] = useState("");
  const [numberOfMolds, setNumberOfMolds] = useState("1");
  const [heightClearance, setHeightClearance] = useState("1");

  const results = useMemo(() => {
    const pd = parseFloat(potDiameter);
    const ph = parseFloat(potHeight);
    const md = parseFloat(moldDiameter);
    const mh = parseFloat(moldHeight);
    const nm = parseInt(numberOfMolds, 10);
    const hc = parseFloat(heightClearance);
    if (!pd || pd <= 0 || !ph || ph <= 0 || !md || md <= 0 || !mh || mh <= 0 || !nm || nm <= 0) return null;

    return calculatePressurePot({
      potDiameter: pd,
      potHeight: ph,
      potUnit,
      moldDiameter: md,
      moldHeight: mh,
      moldUnit,
      numberOfMolds: nm,
      heightClearance: hc || (potUnit === "in" ? 1 : 2.54),
    });
  }, [potDiameter, potHeight, moldDiameter, moldHeight, numberOfMolds, heightClearance, potUnit, moldUnit]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Max Molds", value: `${results.maxMoldsFit}`, highlight: true },
      { label: "Total Resin", value: `${results.totalResinMl}`, unit: "ml" },
      { label: "Total Weight", value: `${results.totalResinWeightG}`, unit: "g" },
      { label: "Height Clearance Left", value: `${results.heightClearanceRemaining}`, unit: "cm" },
    ];
  }, [results]);

  const verdictColor = results?.fitVerdict === "fits" ? colors.success : colors.danger;
  const verdictLabel: Record<string, string> = {
    "fits": "Fits",
    "too-tall": "Too Tall",
    "too-wide": "Too Wide",
    "too-many": "Too Many",
  };

  const handleSave = () => {
    if (!results) { Alert.alert("No Results", "Enter valid inputs to save."); return; }
    try {
      CalculatorService.save({
        module: "resin",
        calculatorType: "pressure-pot",
        inputsJson: { potDiameter, potHeight, potUnit, moldDiameter, moldHeight, moldUnit, numberOfMolds, heightClearance },
        outputsJson: results,
        label: `${results.fitVerdict === "fits" ? "Fits" : "Does not fit"} — ${results.maxMoldsFit} max molds`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch { Alert.alert("Error", "Failed to save result."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          Pressure Pot Sizing
        </Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>
          Check mold fit and plan batch pours
        </Text>

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
          Pot Dimensions ({potUnit})
        </Text>
        <FilterBar options={POT_UNIT_OPTIONS} selected={potUnit} onSelect={(v) => setPotUnit(v as DimUnit)} />
        <CalculatorInput label="Pot Inner Diameter" value={potDiameter} onChangeText={setPotDiameter} unit={potUnit} placeholder="10" />
        <CalculatorInput label="Pot Inner Height" value={potHeight} onChangeText={setPotHeight} unit={potUnit} placeholder="12" />
        <CalculatorInput label="Lid Clearance" value={heightClearance} onChangeText={setHeightClearance} unit={potUnit} placeholder="1" />

        <Text className="text-[12px] uppercase tracking-wider mb-2 mt-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
          Mold Dimensions ({moldUnit})
        </Text>
        <FilterBar options={MOLD_UNIT_OPTIONS} selected={moldUnit} onSelect={(v) => setMoldUnit(v as DimUnit)} />
        <CalculatorInput label="Mold Diameter" value={moldDiameter} onChangeText={setMoldDiameter} unit={moldUnit} placeholder="3" />
        <CalculatorInput label="Mold Height" value={moldHeight} onChangeText={setMoldHeight} unit={moldUnit} placeholder="4" />
        <CalculatorInput label="Number of Molds" value={numberOfMolds} onChangeText={setNumberOfMolds} unit="molds" placeholder="1" />

        {results ? (
          <>
            <View className="rounded-xl p-4 mt-4 items-center" style={{ backgroundColor: colors.surface, borderWidth: 2, borderColor: verdictColor }}>
              <Text className="text-[28px]" style={{ fontFamily: "Inter_700Bold", color: verdictColor }}>
                {verdictLabel[results.fitVerdict] ?? results.fitVerdict}
              </Text>
              {results.failReason && (
                <Text className="text-[13px] mt-1 text-center" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>
                  {results.failReason}
                </Text>
              )}
            </View>

            <ResultCard title="Details" results={resultItems} />

            <View className="rounded-lg p-3 mt-3" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <Text className="text-[12px] leading-5" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>
                {"•"} Leave 1 inch clearance above molds for lid seal{"\n"}{"•"} Molds should not touch pot walls — use spacers
              </Text>
            </View>
          </>
        ) : (
          <View className="rounded-xl p-4 mt-4 items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
              Enter pot and mold dimensions to check fit
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

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\danlo\MakerApp && npx tsc --noEmit --pretty 2>&1 | Select-Object -First 20`

- [ ] **Step 3: Commit**

```powershell
cd C:\Users\danlo\MakerApp
git add app/(tabs)/make/resin/pressure-pot.tsx
git commit -m "feat(resin): add pressure pot sizing screen"
```

---

## Task 9: Register New Screens in Layout and Index

**Files:**
- Modify: `app/(tabs)/make/resin/index.tsx`
- Modify: `app/(tabs)/make/resin/_layout.tsx`

- [ ] **Step 1: Update the CALCULATORS array in index.tsx**

Add the 4 new entries after the existing 3:

```tsx
// In app/(tabs)/make/resin/index.tsx, replace the CALCULATORS array:
const CALCULATORS = [
  { name: "Resin/Hardener Ratio", route: "/make/resin/resin-ratio" },
  { name: "Mold Volume", route: "/make/resin/mold-volume" },
  { name: "Colorant Mix", route: "/make/resin/colorant-mix" },
  { name: "Cost Estimator", route: "/make/resin/cost-estimator" },
  { name: "Coating Coverage", route: "/make/resin/coating-coverage" },
  { name: "Pot Life Timer", route: "/make/resin/pot-life" },
  { name: "Pressure Pot", route: "/make/resin/pressure-pot" },
];
```

- [ ] **Step 2: Add Stack.Screen entries in _layout.tsx**

Add after the existing 3 Screen entries inside the `<Stack>`:

```tsx
<Stack.Screen name="cost-estimator" options={{ title: "Cost Estimator" }} />
<Stack.Screen name="coating-coverage" options={{ title: "Coating Coverage" }} />
<Stack.Screen name="pot-life" options={{ title: "Pot Life Timer" }} />
<Stack.Screen name="pressure-pot" options={{ title: "Pressure Pot" }} />
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd C:\Users\danlo\MakerApp && npx tsc --noEmit --pretty 2>&1 | Select-Object -First 20`

- [ ] **Step 4: Commit**

```powershell
cd C:\Users\danlo\MakerApp
git add app/(tabs)/make/resin/index.tsx app/(tabs)/make/resin/_layout.tsx
git commit -m "feat(resin): register 4 new calculators in index and layout"
```

---

## Task 10: Smoke Test on Device

- [ ] **Step 1: Start Expo dev server**

Run: `cd C:\Users\danlo\MakerApp && npx expo start`

- [ ] **Step 2: Verify on device or emulator**

Navigate to Make tab > Resin Art. Verify:
1. Index page shows 7 calculator cards (3 existing + 4 new)
2. Each new calculator opens and displays inputs correctly
3. Entering valid inputs produces results in the ResultCard
4. Pot Life Timer countdown starts, pauses, resets, and shows progress bar color zones
5. Pressure Pot shows "Fits" / verdict correctly
6. Coating Coverage shows the SafetyWarning banner
7. Cost Estimator calculates breakdown with colorant optional
8. Save to History works on each calculator

- [ ] **Step 3: Final commit if any fixes needed**
