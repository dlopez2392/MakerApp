import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import {
  calculateFocusOffset,
  type FocusOperation,
} from "../../../../src/modules/laser/calculators/focusOffset";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const OPERATION_OPTIONS = [
  { label: "Cut", value: "cut" },
  { label: "Engrave", value: "engrave" },
  { label: "Defocused Engrave", value: "defocused-engrave" },
];

export default function FocusOffsetScreen() {
  const { colors } = useTheme();

  const [operation, setOperation] = useState<FocusOperation>("cut");
  const [thickness, setThickness] = useState("");
  const [focalLength, setFocalLength] = useState("50.8");
  const [defocusAmount, setDefocusAmount] = useState("1");

  const results = useMemo(() => {
    const thick = parseFloat(thickness);
    const focal = parseFloat(focalLength) || 50.8;
    const defocus = parseFloat(defocusAmount) || 1;

    if (!thick || thick <= 0) return null;

    return calculateFocusOffset({
      operation,
      thicknessMm: thick,
      focalLengthMm: focal,
      defocusAmountMm: operation === "defocused-engrave" ? defocus : undefined,
    });
  }, [operation, thickness, focalLength, defocusAmount]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Z Offset", value: `${results.zOffsetMm}`, unit: "mm", highlight: true },
      { label: "Focal Length", value: `${results.focalLengthMm}`, unit: "mm" },
      { label: "Description", value: results.description },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "laser",
        calculatorType: "focus-offset",
        inputsJson: { operation, thickness, focalLength, defocusAmount },
        outputsJson: results,
        label: `Z ${results.zOffsetMm}mm — ${operation}`,
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
          Focus Offset
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate Z-axis focus offset for different operations
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Operation
        </Text>
        <FilterBar
          options={OPERATION_OPTIONS}
          selected={operation}
          onSelect={(v) => setOperation(v as FocusOperation)}
        />

        <CalculatorInput
          label="Material Thickness"
          value={thickness}
          onChangeText={setThickness}
          unit="mm"
          placeholder="3"
        />
        <CalculatorInput
          label="Focal Length"
          value={focalLength}
          onChangeText={setFocalLength}
          unit="mm"
          placeholder="50.8"
        />

        {operation === "defocused-engrave" && (
          <CalculatorInput
            label="Defocus Amount"
            value={defocusAmount}
            onChangeText={setDefocusAmount}
            unit="mm"
            placeholder="1"
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
              Enter thickness to calculate focus offset
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
