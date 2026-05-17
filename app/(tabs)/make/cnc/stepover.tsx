import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import {
  calculateStepover,
  type StepoverMode,
} from "../../../../src/modules/cnc/calculators/stepover";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const OPERATION_OPTIONS = [
  { label: "Roughing", value: "roughing" },
  { label: "Finishing", value: "finishing" },
  { label: "3D Finishing", value: "3d-finishing" },
];

export default function StepoverScreen() {
  const { colors } = useTheme();

  const [mode, setMode] = useState<StepoverMode>("roughing");
  const [diameter, setDiameter] = useState("");
  const [scallopHeight, setScallopHeight] = useState("");

  const results = useMemo(() => {
    const diaVal = parseFloat(diameter);
    if (!diaVal || diaVal <= 0) return null;

    const scallop = parseFloat(scallopHeight);
    return calculateStepover({
      mode,
      toolDiameterIn: diaVal,
      scallopHeightIn: mode === "3d-finishing" && scallop > 0 ? scallop : undefined,
    });
  }, [mode, diameter, scallopHeight]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Stepover %", value: `${results.stepoverPct}`, unit: "%", highlight: true },
      { label: "Stepover Distance", value: `${results.stepoverIn}`, unit: "in" },
      { label: "Scallop Height", value: `${results.scallopHeightIn}`, unit: "in" },
      { label: "Finish Quality", value: results.finishQuality },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "cnc",
        calculatorType: "stepover",
        inputsJson: { mode, diameter, scallopHeight },
        outputsJson: results,
        label: `${results.stepoverPct}% stepover (${results.stepoverIn}") — ${mode}`,
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
          Stepover
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate optimal stepover distance and scallop height
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Operation
        </Text>
        <FilterBar
          options={OPERATION_OPTIONS}
          selected={mode}
          onSelect={(v) => setMode(v as StepoverMode)}
        />

        <CalculatorInput
          label="Tool Diameter"
          value={diameter}
          onChangeText={setDiameter}
          unit="in"
          placeholder="0.5"
        />

        {mode === "3d-finishing" && (
          <CalculatorInput
            label="Target Scallop Height"
            value={scallopHeight}
            onChangeText={setScallopHeight}
            unit="in"
            placeholder="0.001"
          />
        )}

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
              Enter tool diameter to calculate stepover
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
