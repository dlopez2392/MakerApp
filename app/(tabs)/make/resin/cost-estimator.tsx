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
