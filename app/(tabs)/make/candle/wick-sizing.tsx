import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateWickSizing } from "../../../../src/modules/candle/calculators/wickSizing";
import type { WaxType } from "../../../../src/modules/candle/calculators/wickSizing";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const WAX_TYPE_OPTIONS = [
  { label: "Soy", value: "soy" },
  { label: "Paraffin", value: "paraffin" },
  { label: "Coconut", value: "coconut" },
  { label: "Blend", value: "blend" },
];

export default function WickSizingScreen() {
  const { colors } = useTheme();

  const [waxType, setWaxType] = useState<WaxType>("soy");
  const [containerDiameter, setContainerDiameter] = useState("");

  const results = useMemo(() => {
    const d = parseFloat(containerDiameter);
    if (!d || d <= 0) return null;

    return calculateWickSizing({
      containerDiameterIn: d,
      waxType,
    });
  }, [containerDiameter, waxType]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Recommended Wick Series", value: results.wickSeries, unit: "", highlight: true },
      { label: "Burn Pool Diameter", value: `${results.burnPoolDiameterIn}`, unit: "in" },
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
        calculatorType: "wick-sizing",
        inputsJson: { containerDiameter, waxType },
        outputsJson: results,
        label: `${results.wickSeries} for ${containerDiameter}" ${waxType}`,
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
          Wick Sizing
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Find the right wick for your container and wax type
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Wax Type
        </Text>
        <FilterBar
          options={WAX_TYPE_OPTIONS}
          selected={waxType}
          onSelect={(v) => setWaxType(v as WaxType)}
        />

        <CalculatorInput
          label="Container Diameter"
          value={containerDiameter}
          onChangeText={setContainerDiameter}
          unit="in"
          placeholder="3"
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
              Enter container diameter to find wick size
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
