import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateVCarve } from "../../../../src/modules/cnc/calculators/vCarve";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const ANGLE_OPTIONS = [
  { label: "60°", value: "60" },
  { label: "90°", value: "90" },
  { label: "120°", value: "120" },
];

export default function VCarveScreen() {
  const { colors } = useTheme();

  const [angle, setAngle] = useState("90");
  const [desiredWidth, setDesiredWidth] = useState("");
  const [maxDepth, setMaxDepth] = useState("");
  const [tipWidth, setTipWidth] = useState("");

  const results = useMemo(() => {
    const widthVal = parseFloat(desiredWidth);
    if (!widthVal || widthVal <= 0) return null;

    const angleVal = parseFloat(angle) || 90;
    const maxDepthVal = parseFloat(maxDepth) || undefined;
    const tipWidthVal = parseFloat(tipWidth) || 0;

    return calculateVCarve({
      grooveWidthIn: widthVal,
      vbitAngleDeg: angleVal,
      maxDepthIn: maxDepthVal,
      tipWidthIn: tipWidthVal,
    });
  }, [angle, desiredWidth, maxDepth, tipWidth]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Required Depth", value: `${results.effectiveDepthIn}"`, highlight: true },
      { label: "Actual Width", value: `${results.achievedWidthIn}"` },
      { label: "Depth Limited", value: results.depthLimited ? "Yes" : "No" },
      { label: "Flat Bottom", value: results.flatBottomEngaged ? "Engaged" : "Not engaged" },
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
        calculatorType: "v-carve",
        inputsJson: { angle, desiredWidth, maxDepth, tipWidth },
        outputsJson: results,
        label: `${results.effectiveDepthIn}" depth for ${desiredWidth}" groove — ${angle}° V-bit`,
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
          V-Carve
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate depth and width for V-bit carving operations
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          V-Bit Angle
        </Text>
        <FilterBar
          options={ANGLE_OPTIONS}
          selected={angle}
          onSelect={setAngle}
        />

        <CalculatorInput
          label="Desired Groove Width"
          value={desiredWidth}
          onChangeText={setDesiredWidth}
          unit="in"
          placeholder="0.25"
        />
        <CalculatorInput
          label="Max Depth (optional)"
          value={maxDepth}
          onChangeText={setMaxDepth}
          unit="in"
          placeholder="0.5"
        />
        <CalculatorInput
          label="Tip Width (optional — 0 for sharp point)"
          value={tipWidth}
          onChangeText={setTipWidth}
          unit="in"
          placeholder="0"
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
              Enter groove width to calculate V-carve depth
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
