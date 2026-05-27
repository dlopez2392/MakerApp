import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateFragrance } from "../../../../src/modules/soap/calculators/fragranceCalc";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { SafetyWarning } from "../../../../src/design-system/components/SafetyWarning";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const OIL_TYPE_OPTIONS = [
  { label: "Fragrance Oil", value: "fragrance" },
  { label: "Essential Oil", value: "essential" },
];

const UNIT_OPTIONS = [
  { label: "oz", value: "oz" },
  { label: "g", value: "g" },
];

type OilType = "fragrance" | "essential";

export default function FragranceCalcScreen() {
  const { colors } = useTheme();
  const [oilType, setOilType] = useState<OilType>("fragrance");
  const [unit, setUnit] = useState<"oz" | "g">("oz");
  const [totalOilWeight, setTotalOilWeight] = useState("");
  const [usageRate, setUsageRate] = useState("6");

  const handleOilTypeChange = (v: string) => {
    const t = v as OilType;
    setOilType(t);
    setUsageRate(t === "fragrance" ? "6" : "3");
  };

  const results = useMemo(() => {
    const w = parseFloat(totalOilWeight);
    const r = parseFloat(usageRate);
    if (!w || w <= 0 || !r || r <= 0) return null;
    return calculateFragrance({ oilType, totalOilWeight: w, usageRate: r, unit });
  }, [oilType, totalOilWeight, usageRate, unit]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Weight Needed", value: `${results.fragranceWeight}`, unit, highlight: true },
      { label: "Teaspoons", value: `${results.fragranceTeaspoons}`, unit: "tsp" },
      { label: "Max Safe Rate", value: `${results.maxSafeRate}`, unit: "%" },
    ];
  }, [results, unit]);

  const handleSave = () => {
    if (!results) { Alert.alert("No Results", "Enter valid inputs to save."); return; }
    try {
      CalculatorService.save({
        module: "soap", calculatorType: "fragrance-calc",
        inputsJson: { oilType, totalOilWeight, usageRate, unit },
        outputsJson: results,
        label: `${results.fragranceWeight} ${unit} ${oilType === "fragrance" ? "FO" : "EO"} @ ${usageRate}%`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch { Alert.alert("Error", "Failed to save result."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>Fragrance Calculator</Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>Calculate fragrance or essential oil amounts by oil weight</Text>

        <SafetyWarning message="Essential oil usage rates vary by oil. Check supplier IFRA documentation for skin-safe maximums." level="warning" />

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>Oil Type</Text>
        <FilterBar options={OIL_TYPE_OPTIONS} selected={oilType} onSelect={handleOilTypeChange} />

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>Unit</Text>
        <FilterBar options={UNIT_OPTIONS} selected={unit} onSelect={(v) => setUnit(v as "oz" | "g")} />

        <CalculatorInput label="Total Oil Weight" value={totalOilWeight} onChangeText={setTotalOilWeight} unit={unit} placeholder="32" />
        <CalculatorInput label="Usage Rate" value={usageRate} onChangeText={setUsageRate} unit="%" placeholder={oilType === "fragrance" ? "6" : "3"} />

        {results ? (
          <>
            <ResultCard title="Results" results={resultItems} />
            {results.warnings.length > 0 && (
              <View className="rounded-xl p-4 mt-3" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: "#f59e0b" }}>
                {results.warnings.map((w, i) => (
                  <Text key={i} className="text-[13px]" style={{ fontFamily: "Inter_500Medium", color: "#f59e0b" }}>{w}</Text>
                ))}
              </View>
            )}
          </>
        ) : (
          <View className="rounded-xl p-4 mt-4 items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>Enter oil weight to calculate fragrance amount</Text>
          </View>
        )}

        <ActionBar onSaveToHistory={handleSave} onAddToQuote={() => Alert.alert("Coming Soon", "Quote feature coming soon.")} onLogToProject={() => Alert.alert("Coming Soon", "Project logging coming soon.")} />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
