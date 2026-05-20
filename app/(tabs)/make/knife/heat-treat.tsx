import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateHeatTreat } from "../../../../src/modules/knife/calculators/heatTreat";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const STEEL_OPTIONS = [
  { label: "1095", value: "1095" },
  { label: "1084", value: "1084" },
  { label: "O1", value: "O1" },
  { label: "W2", value: "W2" },
  { label: "5160", value: "5160" },
  { label: "D2", value: "D2" },
];

export default function HeatTreatScreen() {
  const { colors } = useTheme();
  const [steel, setSteel] = useState("1095");

  const results = useMemo(() => {
    try {
      return calculateHeatTreat({ steelName: steel });
    } catch {
      return null;
    }
  }, [steel]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    const items = [];

    if (results.normalizeTempF !== null) {
      items.push({
        label: "Normalize",
        value: `${results.normalizeTempF}°F`,
        unit: `${results.normalizeCycles} cycles`,
      });
    } else {
      items.push({ label: "Normalize", value: "Not required" });
    }

    items.push(
      {
        label: "Harden",
        value: `${results.hardenTempF}`,
        unit: "°F",
        highlight: true,
      },
      {
        label: "Soak Time",
        value: `${results.soakMinutes}`,
        unit: "min",
      },
      {
        label: "Quench Medium",
        value: results.quenchMedium,
      },
      {
        label: "Temper Range",
        value: `${results.temperLowF}–${results.temperHighF}`,
        unit: "°F",
      },
      {
        label: "Expected HRC",
        value: `${results.expectedRockwellLow}–${results.expectedRockwellHigh}`,
        unit: "HRC",
      },
    );

    return items;
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Select a steel to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "knife",
        calculatorType: "heat-treat",
        inputsJson: { steel },
        outputsJson: results,
        label: `${steel} — ${results.hardenTempF}°F ${results.quenchMedium} quench`,
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
          Heat Treat
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Heat treat schedules for common blade steels
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Steel
        </Text>
        <FilterBar options={STEEL_OPTIONS} selected={steel} onSelect={setSteel} />

        {results ? (
          <ResultCard title="Heat Treat Schedule" results={resultItems} />
        ) : (
          <View
            className="rounded-xl p-4 mt-4 items-center justify-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}
          >
            <Text
              className="text-[13px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              Select a steel to see its heat treat schedule
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
