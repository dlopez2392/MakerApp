import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateGrindAngle } from "../../../../src/modules/knife/calculators/grindAngle";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function GrindAngleScreen() {
  const { colors } = useTheme();

  const [bladeThickness, setBladeThickness] = useState("");
  const [bevelHeight, setBevelHeight] = useState("");
  const [edgeAngle, setEdgeAngle] = useState("");

  const results = useMemo(() => {
    const thick = parseFloat(bladeThickness);
    const bevel = parseFloat(bevelHeight);
    const angle = parseFloat(edgeAngle);

    if (!thick || !bevel || !angle || thick <= 0 || bevel <= 0 || angle <= 0) return null;

    try {
      return calculateGrindAngle({
        bladeThicknessIn: thick,
        bevelHeightIn: bevel,
        desiredEdgeAngleDeg: angle,
      });
    } catch {
      return null;
    }
  }, [bladeThickness, bevelHeight, edgeAngle]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      {
        label: "Grind Angle Per Side",
        value: `${results.grindAnglePerSideDeg}`,
        unit: "°",
        highlight: true,
      },
      {
        label: "Edge Thickness",
        value: `${results.edgeThicknessIn}`,
        unit: "in",
      },
      {
        label: "Steel Removal Per Side",
        value: `${results.steelRemovalIn}`,
        unit: "in",
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
        calculatorType: "grind-angle",
        inputsJson: { bladeThickness, bevelHeight, edgeAngle },
        outputsJson: results,
        label: `${results.grindAnglePerSideDeg}° per side — ${edgeAngle}° edge`,
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
          Grind Angle
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate bevel grind angle from blade geometry
        </Text>

        <CalculatorInput
          label="Blade Thickness"
          value={bladeThickness}
          onChangeText={setBladeThickness}
          unit="in"
          placeholder="0.125"
        />
        <CalculatorInput
          label="Bevel Height"
          value={bevelHeight}
          onChangeText={setBevelHeight}
          unit="in"
          placeholder="0.75"
        />
        <CalculatorInput
          label="Desired Edge Angle"
          value={edgeAngle}
          onChangeText={setEdgeAngle}
          unit="°"
          placeholder="30"
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
              Enter blade dimensions to see grind angle
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
