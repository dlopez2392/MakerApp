import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateBatchScale } from "../../../../src/modules/soap/calculators/batchScaler";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const SCALE_MODE_OPTIONS = [
  { label: "By Factor", value: "factor" },
  { label: "By Total Weight", value: "totalWeight" },
];

export default function BatchScalerScreen() {
  const { colors } = useTheme();

  const [scaleMode, setScaleMode] = useState<"factor" | "totalWeight">("factor");
  const [scaleValue, setScaleValue] = useState("2");

  // Oil entries
  const [oil1Name] = useState("Olive Oil");
  const [oil1Wt, setOil1Wt] = useState("16");
  const [oil2Name] = useState("Coconut Oil 76");
  const [oil2Wt, setOil2Wt] = useState("8");
  const [oil3Name] = useState("Palm Oil");
  const [oil3Wt, setOil3Wt] = useState("0");

  const results = useMemo(() => {
    const sv = parseFloat(scaleValue);
    if (isNaN(sv) || sv <= 0) return null;

    const originalOils = [
      { name: oil1Name, weightOz: parseFloat(oil1Wt) || 0 },
      { name: oil2Name, weightOz: parseFloat(oil2Wt) || 0 },
      { name: oil3Name, weightOz: parseFloat(oil3Wt) || 0 },
    ].filter((o) => o.weightOz > 0);

    if (originalOils.length === 0) return null;

    return calculateBatchScale({ originalOils, scaleMode, scaleValue: sv });
  }, [oil1Name, oil1Wt, oil2Name, oil2Wt, oil3Name, oil3Wt, scaleMode, scaleValue]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    const items = results.scaledOils.map((o) => ({
      label: o.name,
      value: `${o.weightOz}`,
      unit: "oz",
    }));
    items.push({
      label: "Scale Factor",
      value: `${Math.round(results.scaleFactor * 1000) / 1000}`,
      unit: "×",
    });
    return items;
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      const scaledTotal = results.scaledOils.reduce((s, o) => s + o.weightOz, 0);
      CalculatorService.save({
        module: "soap",
        calculatorType: "batch-scaler",
        inputsJson: { oil1Name, oil1Wt, oil2Name, oil2Wt, oil3Name, oil3Wt, scaleMode, scaleValue },
        outputsJson: results,
        label: `${Math.round(results.scaleFactor * 1000) / 1000}× → ${Math.round(scaledTotal * 100) / 100} oz total`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch {
      Alert.alert("Error", "Failed to save result.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Batch Scaler
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Scale soap recipes by factor or target weight
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Scale Mode
        </Text>
        <FilterBar
          options={SCALE_MODE_OPTIONS}
          selected={scaleMode}
          onSelect={(v) => setScaleMode(v as "factor" | "totalWeight")}
        />

        <Text
          className="text-[14px] mt-4 mb-2"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Original Oils
        </Text>

        <View
          className="rounded-xl p-3 mb-3"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-[13px] mb-1" style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}>
            {oil1Name}
          </Text>
          <CalculatorInput label="Weight" value={oil1Wt} onChangeText={setOil1Wt} unit="oz" placeholder="16" />
        </View>

        <View
          className="rounded-xl p-3 mb-3"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-[13px] mb-1" style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}>
            {oil2Name}
          </Text>
          <CalculatorInput label="Weight" value={oil2Wt} onChangeText={setOil2Wt} unit="oz" placeholder="8" />
        </View>

        <View
          className="rounded-xl p-3 mb-3"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-[13px] mb-1" style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}>
            {oil3Name}
          </Text>
          <CalculatorInput label="Weight" value={oil3Wt} onChangeText={setOil3Wt} unit="oz" placeholder="0" />
        </View>

        <CalculatorInput
          label={scaleMode === "factor" ? "Scale Factor" : "Target Total Weight"}
          value={scaleValue}
          onChangeText={setScaleValue}
          unit={scaleMode === "factor" ? "×" : "oz"}
          placeholder={scaleMode === "factor" ? "2" : "48"}
        />

        {results ? (
          <ResultCard title="Scaled Recipe" results={resultItems} />
        ) : (
          <View
            className="rounded-xl p-4 mt-4 items-center justify-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}
          >
            <Text
              className="text-[13px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              Enter oils and scale value to see results
            </Text>
          </View>
        )}

        <ActionBar
          onSaveToHistory={handleSave}
          onAddToQuote={() => Alert.alert("Coming Soon", "Quote feature coming soon.")}
          onLogToProject={() => Alert.alert("Coming Soon", "Project logging coming soon.")}
        />

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
