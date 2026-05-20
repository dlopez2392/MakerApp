import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateMoldVolume } from "../../../../src/modules/resin/calculators/moldVolume";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const SHAPE_OPTIONS = [
  { label: "Cylinder", value: "cylinder" },
  { label: "Rectangle", value: "rectangle" },
  { label: "Sphere", value: "sphere" },
];

type Shape = "cylinder" | "rectangle" | "sphere";

export default function MoldVolumeScreen() {
  const { colors } = useTheme();

  const [shape, setShape] = useState<Shape>("cylinder");
  const [diameter, setDiameter] = useState("");
  const [height, setHeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");

  const results = useMemo(() => {
    if (shape === "cylinder") {
      const d = parseFloat(diameter);
      const h = parseFloat(height);
      if (!d || d <= 0 || !h || h <= 0) return null;
      return calculateMoldVolume({ shape, diameterMm: d, heightMm: h });
    }
    if (shape === "rectangle") {
      const l = parseFloat(length);
      const w = parseFloat(width);
      const h = parseFloat(height);
      if (!l || l <= 0 || !w || w <= 0 || !h || h <= 0) return null;
      return calculateMoldVolume({ shape, lengthMm: l, widthMm: w, heightMm: h });
    }
    // sphere
    const d = parseFloat(diameter);
    if (!d || d <= 0) return null;
    return calculateMoldVolume({ shape, diameterMm: d });
  }, [shape, diameter, height, length, width]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Volume", value: `${Math.round(results.volumeMl * 100) / 100}`, unit: "ml", highlight: true },
      { label: "Resin Weight", value: `${Math.round(results.resinWeightG * 100) / 100}`, unit: "g" },
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
        calculatorType: "mold-volume",
        inputsJson: { shape, diameter, height, length, width },
        outputsJson: results,
        label: `${Math.round(results.volumeMl * 100) / 100} ml (${Math.round(results.resinWeightG * 100) / 100} g) — ${shape}`,
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
          Mold Volume
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate mold volume and resin weight by shape
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
          onSelect={(v) => setShape(v as Shape)}
        />

        {shape === "cylinder" && (
          <>
            <CalculatorInput
              label="Diameter"
              value={diameter}
              onChangeText={setDiameter}
              unit="mm"
              placeholder="50"
            />
            <CalculatorInput
              label="Height"
              value={height}
              onChangeText={setHeight}
              unit="mm"
              placeholder="30"
            />
          </>
        )}

        {shape === "rectangle" && (
          <>
            <CalculatorInput
              label="Length"
              value={length}
              onChangeText={setLength}
              unit="mm"
              placeholder="100"
            />
            <CalculatorInput
              label="Width"
              value={width}
              onChangeText={setWidth}
              unit="mm"
              placeholder="50"
            />
            <CalculatorInput
              label="Height"
              value={height}
              onChangeText={setHeight}
              unit="mm"
              placeholder="20"
            />
          </>
        )}

        {shape === "sphere" && (
          <CalculatorInput
            label="Diameter"
            value={diameter}
            onChangeText={setDiameter}
            unit="mm"
            placeholder="40"
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
              Enter dimensions to calculate volume
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
