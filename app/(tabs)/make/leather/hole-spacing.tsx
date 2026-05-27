import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateHoleSpacing } from "../../../../src/modules/leather/calculators/holeSpacing";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function HoleSpacingScreen() {
  const { colors } = useTheme();

  const [edgeLengthIn, setEdgeLengthIn] = useState("");
  const [desiredSpacingIn, setDesiredSpacingIn] = useState("");
  const [edgeMarginIn, setEdgeMarginIn] = useState("");
  const [prongCount, setProngCount] = useState("4");

  const results = useMemo(() => {
    const el = parseFloat(edgeLengthIn);
    const ds = parseFloat(desiredSpacingIn);
    const em = parseFloat(edgeMarginIn);
    const pc = parseInt(prongCount, 10);
    if (!(el > 0) || !(ds > 0) || isNaN(em) || em < 0 || !(pc > 0)) return null;

    return calculateHoleSpacing({
      edgeLengthIn: el,
      desiredSpacingIn: ds,
      edgeMarginIn: em,
      prongCount: pc as 1 | 2 | 4 | 6,
    });
  }, [edgeLengthIn, desiredSpacingIn, edgeMarginIn, prongCount]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Number of Holes", value: String(results.numberOfHoles), highlight: true },
      { label: "Actual Spacing", value: String(results.actualSpacing), unit: "in" },
      { label: "Chisel Passes", value: String(results.chiselPasses) },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "leather",
        calculatorType: "hole-spacing",
        inputsJson: { edgeLengthIn, desiredSpacingIn, edgeMarginIn, prongCount },
        outputsJson: results,
        label: `${results.numberOfHoles} holes @ ${results.actualSpacing}in spacing`,
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
          Hole Spacing
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate stitch hole count and chisel passes
        </Text>

        <CalculatorInput label="Edge Length" value={edgeLengthIn} onChangeText={setEdgeLengthIn} unit="in" placeholder="12" />
        <CalculatorInput label="Desired Spacing" value={desiredSpacingIn} onChangeText={setDesiredSpacingIn} unit="in" placeholder="0.15" />
        <CalculatorInput label="Edge Margin" value={edgeMarginIn} onChangeText={setEdgeMarginIn} unit="in" placeholder="0.25" />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-4"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Prong Count
        </Text>
        <FilterBar
          options={[
            { label: "1", value: "1" },
            { label: "2", value: "2" },
            { label: "4", value: "4" },
            { label: "6", value: "6" },
          ]}
          selected={prongCount}
          onSelect={setProngCount}
        />

        {results && (
          <ResultCard title="Results" results={resultItems} />
        )}

        {!results && (
          <View
            className="rounded-xl p-4 mt-4 items-center justify-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}
          >
            <Text
              className="text-[13px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              Enter edge length and spacing to see results
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
