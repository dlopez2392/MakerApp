import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateResinRatio } from "../../../../src/modules/resin/calculators/resinRatio";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const UNIT_OPTIONS = [
  { label: "ml", value: "ml" },
  { label: "oz", value: "oz" },
];

export default function ResinRatioScreen() {
  const { colors } = useTheme();

  const [unit, setUnit] = useState<"ml" | "oz">("ml");
  const [totalVolume, setTotalVolume] = useState("");
  const [resinRatio, setResinRatio] = useState("2");
  const [hardenerRatio, setHardenerRatio] = useState("1");

  const results = useMemo(() => {
    const vol = parseFloat(totalVolume);
    const rr = parseFloat(resinRatio);
    const hr = parseFloat(hardenerRatio);
    if (!vol || vol <= 0 || !rr || rr <= 0 || !hr || hr <= 0) return null;

    return calculateResinRatio({
      totalVolumeMl: vol,
      mixRatioResin: rr,
      mixRatioHardener: hr,
      unit,
    });
  }, [totalVolume, resinRatio, hardenerRatio, unit]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Resin Amount", value: `${Math.round(results.resinAmount * 100) / 100}`, unit, highlight: true },
      { label: "Hardener Amount", value: `${Math.round(results.hardenerAmount * 100) / 100}`, unit },
    ];
  }, [results, unit]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "resin",
        calculatorType: "resin-ratio",
        inputsJson: { totalVolume, resinRatio, hardenerRatio, unit },
        outputsJson: results,
        label: `${Math.round(results.resinAmount * 100) / 100} ${unit} resin + ${Math.round(results.hardenerAmount * 100) / 100} ${unit} hardener (${resinRatio}:${hardenerRatio})`,
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
          Resin/Hardener Ratio
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate resin and hardener amounts by mix ratio
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Unit
        </Text>
        <FilterBar
          options={UNIT_OPTIONS}
          selected={unit}
          onSelect={(v) => setUnit(v as "ml" | "oz")}
        />

        <CalculatorInput
          label="Total Volume"
          value={totalVolume}
          onChangeText={setTotalVolume}
          unit={unit}
          placeholder="100"
        />

        <CalculatorInput
          label="Resin Ratio"
          value={resinRatio}
          onChangeText={setResinRatio}
          unit="parts"
          placeholder="2"
        />

        <CalculatorInput
          label="Hardener Ratio"
          value={hardenerRatio}
          onChangeText={setHardenerRatio}
          unit="parts"
          placeholder="1"
        />

        {results ? (
          <ResultCard title="Results" results={resultItems} />
        ) : (
          <View
            className="rounded-xl p-4 mt-4 items-center justify-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}
          >
            <Text
              className="text-[13px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              Enter total volume to calculate ratio
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
