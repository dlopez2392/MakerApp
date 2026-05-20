import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateHandleScale } from "../../../../src/modules/knife/calculators/handleScale";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const HAND_SIZE_OPTIONS = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
];

export default function HandleScaleScreen() {
  const { colors } = useTheme();

  const [bladeLength, setBladeLength] = useState("");
  const [tangLength, setTangLength] = useState("");
  const [handSize, setHandSize] = useState("medium");

  const results = useMemo(() => {
    const blade = parseFloat(bladeLength);
    const tang = parseFloat(tangLength);

    if (!blade || !tang || blade <= 0 || tang <= 0) return null;

    try {
      return calculateHandleScale({
        bladeLengthIn: blade,
        tangLengthIn: tang,
        handSize: handSize as "small" | "medium" | "large",
      });
    } catch {
      return null;
    }
  }, [bladeLength, tangLength, handSize]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      {
        label: "Handle Length",
        value: `${results.handleLengthIn}`,
        unit: "in",
        highlight: true,
      },
      {
        label: "Handle Width",
        value: `${results.handleWidthIn}`,
        unit: "in",
      },
      {
        label: "Handle Thickness",
        value: `${results.handleThicknessIn}`,
        unit: "in",
      },
      {
        label: "Pin Count",
        value: `${results.pinPositions.length}`,
        unit: "pins",
      },
      {
        label: "Pin Positions",
        value: results.pinPositions.map((p) => `${p}"`).join(", "),
        unit: "from end",
      },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "knife",
        calculatorType: "handle-scale",
        inputsJson: { bladeLength, tangLength, handSize },
        outputsJson: results,
        label: `${results.handleLengthIn}in handle — ${handSize} hand`,
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
          Handle Scale
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Size handle scales and pin placement for your blade
        </Text>

        <CalculatorInput
          label="Blade Length"
          value={bladeLength}
          onChangeText={setBladeLength}
          unit="in"
          placeholder="4"
        />
        <CalculatorInput
          label="Tang Length"
          value={tangLength}
          onChangeText={setTangLength}
          unit="in"
          placeholder="4.5"
        />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Hand Size
        </Text>
        <FilterBar
          options={HAND_SIZE_OPTIONS}
          selected={handSize}
          onSelect={setHandSize}
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
              Enter blade and tang dimensions to see handle sizing
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
