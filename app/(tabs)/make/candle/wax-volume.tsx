import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateWaxVolume } from "../../../../src/modules/candle/calculators/waxVolume";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const SHAPE_OPTIONS = [
  { label: "Cylinder", value: "cylinder" },
  { label: "Tapered", value: "tapered" },
];

export default function WaxVolumeScreen() {
  const { colors } = useTheme();

  const [shape, setShape] = useState<"cylinder" | "tapered">("cylinder");
  const [diameter, setDiameter] = useState("");
  const [height, setHeight] = useState("");
  const [taperRatio, setTaperRatio] = useState("1.0");

  const results = useMemo(() => {
    const d = parseFloat(diameter);
    const h = parseFloat(height);
    const tr = parseFloat(taperRatio);
    if (!d || d <= 0 || !h || h <= 0) return null;
    if (shape === "tapered" && (!tr || tr <= 0 || tr > 1)) return null;

    return calculateWaxVolume({
      diameterIn: d,
      heightIn: h,
      shape,
      taperRatio: shape === "tapered" ? tr : 1,
    });
  }, [diameter, height, shape, taperRatio]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Volume", value: `${Math.round(results.volumeMl * 100) / 100}`, unit: "ml", highlight: true },
      { label: "Wax Weight", value: `${Math.round(results.waxWeightG * 100) / 100}`, unit: "g" },
      { label: "Wax Weight", value: `${Math.round(results.waxWeightOz * 100) / 100}`, unit: "oz" },
      { label: "Pour Weight", value: `${Math.round(results.pourWeightG * 100) / 100}`, unit: "g" },
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
        calculatorType: "wax-volume",
        inputsJson: { diameter, height, shape, taperRatio },
        outputsJson: results,
        label: `${Math.round(results.volumeMl * 100) / 100} ml (${diameter}" × ${height}" ${shape})`,
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
          Wax Volume
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate wax volume and weight by container dimensions
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Shape
        </Text>
        <FilterBar
          options={SHAPE_OPTIONS}
          selected={shape}
          onSelect={(v) => setShape(v as "cylinder" | "tapered")}
        />

        <CalculatorInput
          label="Diameter"
          value={diameter}
          onChangeText={setDiameter}
          unit="in"
          placeholder="3"
        />

        <CalculatorInput
          label="Height"
          value={height}
          onChangeText={setHeight}
          unit="in"
          placeholder="4"
        />

        {shape === "tapered" && (
          <CalculatorInput
            label="Taper Ratio"
            value={taperRatio}
            onChangeText={setTaperRatio}
            unit="ratio"
            placeholder="0.7"
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
              Enter diameter and height to calculate
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
