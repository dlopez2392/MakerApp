import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateFragranceLoad } from "../../../../src/modules/candle/calculators/fragranceLoad";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function FragranceLoadScreen() {
  const { colors } = useTheme();

  const [waxWeight, setWaxWeight] = useState("");
  const [fragrancePct, setFragrancePct] = useState("8");
  const [maxLoadPct, setMaxLoadPct] = useState("12");

  const results = useMemo(() => {
    const ww = parseFloat(waxWeight);
    const fp = parseFloat(fragrancePct);
    const mp = parseFloat(maxLoadPct);
    if (!ww || ww <= 0 || !fp || fp <= 0 || !mp || mp <= 0) return null;

    return calculateFragranceLoad({
      waxWeightG: ww,
      fragrancePct: fp,
      maxLoadPct: mp,
    });
  }, [waxWeight, fragrancePct, maxLoadPct]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Fragrance Weight", value: `${Math.round(results.fragranceWeightG * 100) / 100}`, unit: "g", highlight: true },
      { label: "Fragrance Weight", value: `${Math.round(results.fragranceWeightOz * 100) / 100}`, unit: "oz" },
      { label: "Remaining Capacity", value: `${Math.round(results.remainingCapacityG * 100) / 100}`, unit: "g" },
      { label: "Remaining", value: `${Math.round(results.remainingCapacityPct * 100) / 100}`, unit: "%" },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "candle",
        calculatorType: "fragrance-load",
        inputsJson: { waxWeight, fragrancePct, maxLoadPct },
        outputsJson: results,
        label: `${Math.round(results.fragranceWeightG * 100) / 100}g fragrance @ ${fragrancePct}% (${waxWeight}g wax)`,
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
          Fragrance Load
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate fragrance oil amounts and capacity
        </Text>

        <CalculatorInput
          label="Wax Weight"
          value={waxWeight}
          onChangeText={setWaxWeight}
          unit="g"
          placeholder="500"
        />

        <CalculatorInput
          label="Fragrance %"
          value={fragrancePct}
          onChangeText={setFragrancePct}
          unit="%"
          placeholder="8"
        />

        <CalculatorInput
          label="Max Load %"
          value={maxLoadPct}
          onChangeText={setMaxLoadPct}
          unit="%"
          placeholder="12"
        />

        {results ? (
          <>
            <ResultCard title="Results" results={resultItems} />
            {results.warnings.length > 0 && (
              <View className="mt-2 px-1">
                {results.warnings.map((w, i) => (
                  <Text
                    key={i}
                    className="text-[13px] mb-1"
                    style={{ fontFamily: "Inter_400Regular", color: "orange" }}
                  >
                    {w}
                  </Text>
                ))}
              </View>
            )}
          </>
        ) : (
          <View
            className="rounded-xl p-4 mt-4 items-center justify-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}
          >
            <Text
              className="text-[13px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              Enter wax weight to calculate fragrance load
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
