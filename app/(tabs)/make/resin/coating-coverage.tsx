import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateCoatingCoverage } from "../../../../src/modules/resin/calculators/coatingCoverage";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { SafetyWarning } from "../../../../src/design-system/components/SafetyWarning";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const SHAPE_OPTIONS = [
  { label: "Rectangle", value: "rectangle" },
  { label: "Circle", value: "circle" },
];

const UNIT_OPTIONS = [
  { label: "mm", value: "mm" },
  { label: "inches", value: "in" },
];

type Shape = "rectangle" | "circle";
type DimUnit = "mm" | "in";

export default function CoatingCoverageScreen() {
  const { colors } = useTheme();

  const [shape, setShape] = useState<Shape>("rectangle");
  const [inputUnit, setInputUnit] = useState<DimUnit>("in");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [diameter, setDiameter] = useState("");
  const [depth, setDepth] = useState("1.5");
  const [numberOfCoats, setNumberOfCoats] = useState("1");
  const [resinRatio, setResinRatio] = useState("2");
  const [hardenerRatio, setHardenerRatio] = useState("1");

  const results = useMemo(() => {
    const d = parseFloat(depth);
    const coats = parseInt(numberOfCoats, 10);
    const rr = parseFloat(resinRatio);
    const hr = parseFloat(hardenerRatio);
    if (!d || d <= 0 || !coats || coats <= 0 || !rr || rr <= 0 || !hr || hr <= 0) return null;

    if (shape === "rectangle") {
      const l = parseFloat(length);
      const w = parseFloat(width);
      if (!l || l <= 0 || !w || w <= 0) return null;
      return calculateCoatingCoverage({ shape, lengthMm: l, widthMm: w, depthMm: d, numberOfCoats: coats, mixRatioResin: rr, mixRatioHardener: hr, inputUnit });
    }
    const dia = parseFloat(diameter);
    if (!dia || dia <= 0) return null;
    return calculateCoatingCoverage({ shape, diameterMm: dia, depthMm: d, numberOfCoats: coats, mixRatioResin: rr, mixRatioHardener: hr, inputUnit });
  }, [shape, length, width, diameter, depth, numberOfCoats, resinRatio, hardenerRatio, inputUnit]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Total Volume", value: `${results.totalVolumeMl}`, unit: "ml", highlight: true },
      { label: "Per Coat", value: `${results.volumePerCoatMl}`, unit: "ml" },
      { label: "Resin", value: `${results.resinAmountMl}`, unit: "ml" },
      { label: "Hardener", value: `${results.hardenerAmountMl}`, unit: "ml" },
      { label: "Total Weight", value: `${results.totalWeightG}`, unit: "g" },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) { Alert.alert("No Results", "Enter valid inputs to save."); return; }
    try {
      CalculatorService.save({
        module: "resin",
        calculatorType: "coating-coverage",
        inputsJson: { shape, inputUnit, length, width, diameter, depth, numberOfCoats, resinRatio, hardenerRatio },
        outputsJson: results,
        label: `${results.totalVolumeMl} ml — ${numberOfCoats} coat(s)`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch { Alert.alert("Error", "Failed to save result."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          Coating Coverage
        </Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>
          Calculate resin needed for flood coats and seal coats
        </Text>

        <SafetyWarning message="Seal coat recommended on porous surfaces (wood, fabric) before flood coat to prevent bubbles." level="warning" />

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
          Shape
        </Text>
        <FilterBar options={SHAPE_OPTIONS} selected={shape} onSelect={(v) => setShape(v as Shape)} />

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
          Unit
        </Text>
        <FilterBar options={UNIT_OPTIONS} selected={inputUnit} onSelect={(v) => setInputUnit(v as DimUnit)} />

        {shape === "rectangle" ? (
          <>
            <CalculatorInput label="Length" value={length} onChangeText={setLength} unit={inputUnit} placeholder="36" />
            <CalculatorInput label="Width" value={width} onChangeText={setWidth} unit={inputUnit} placeholder="24" />
          </>
        ) : (
          <CalculatorInput label="Diameter" value={diameter} onChangeText={setDiameter} unit={inputUnit} placeholder="24" />
        )}

        <CalculatorInput label="Coating Depth" value={depth} onChangeText={setDepth} unit={inputUnit} placeholder="1.5" />
        <CalculatorInput label="Number of Coats" value={numberOfCoats} onChangeText={setNumberOfCoats} unit="coats" placeholder="1" />
        <CalculatorInput label="Resin Ratio" value={resinRatio} onChangeText={setResinRatio} unit="parts" placeholder="2" />
        <CalculatorInput label="Hardener Ratio" value={hardenerRatio} onChangeText={setHardenerRatio} unit="parts" placeholder="1" />

        {results ? (
          <ResultCard title="Coverage Results" results={resultItems} />
        ) : (
          <View className="rounded-xl p-4 mt-4 items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
              Enter surface dimensions to calculate coverage
            </Text>
          </View>
        )}

        <ActionBar onSaveToHistory={handleSave} onAddToQuote={() => Alert.alert("Coming Soon", "Quote feature coming soon.")} onLogToProject={() => Alert.alert("Coming Soon", "Project logging coming soon.")} />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
