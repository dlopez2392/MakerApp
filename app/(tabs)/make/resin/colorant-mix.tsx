import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateColorantMix } from "../../../../src/modules/resin/calculators/colorantMix";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const COLORANT_OPTIONS = [
  { label: "Pigment", value: "pigment" },
  { label: "Dye", value: "dye" },
  { label: "Mica", value: "mica" },
];

type ColorantType = "pigment" | "dye" | "mica";

export default function ColorantMixScreen() {
  const { colors } = useTheme();

  const [colorantType, setColorantType] = useState<ColorantType>("pigment");
  const [resinWeight, setResinWeight] = useState("");
  const [loadPct, setLoadPct] = useState("5");

  const results = useMemo(() => {
    const weight = parseFloat(resinWeight);
    const load = parseFloat(loadPct);
    if (!weight || weight <= 0 || !load || load <= 0) return null;

    return calculateColorantMix({
      resinWeightG: weight,
      colorantType,
      loadPct: load,
    });
  }, [resinWeight, colorantType, loadPct]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Colorant Weight", value: `${Math.round(results.colorantWeightG * 100) / 100}`, unit: "g", highlight: true },
      { label: "Drops", value: `${Math.round(results.colorantDrops)}`, unit: "drops" },
      { label: "Max Safe Load", value: `${results.maxSafeLoad}`, unit: "%" },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "resin",
        calculatorType: "colorant-mix",
        inputsJson: { resinWeight, colorantType, loadPct },
        outputsJson: results,
        label: `${Math.round(results.colorantWeightG * 100) / 100} g ${colorantType} @ ${loadPct}%`,
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
          Colorant Mix
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate colorant amounts for resin
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Colorant Type
        </Text>
        <FilterBar
          options={COLORANT_OPTIONS}
          selected={colorantType}
          onSelect={(v) => setColorantType(v as ColorantType)}
        />

        <CalculatorInput
          label="Resin Weight"
          value={resinWeight}
          onChangeText={setResinWeight}
          unit="g"
          placeholder="100"
        />

        <CalculatorInput
          label="Load %"
          value={loadPct}
          onChangeText={setLoadPct}
          unit="%"
          placeholder="5"
        />

        {results ? (
          <>
            <ResultCard title="Results" results={resultItems} />
            {results.warnings.length > 0 && (
              <View
                className="rounded-xl p-4 mt-3"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: "#f59e0b" }}
              >
                {results.warnings.map((w, i) => (
                  <Text
                    key={i}
                    className="text-[13px]"
                    style={{ fontFamily: "Inter_500Medium", color: "#f59e0b" }}
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
              Enter resin weight to calculate colorant
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
