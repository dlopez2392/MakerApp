import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateEpoxy } from "../../../../src/modules/woodworking/calculators/epoxy";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const PROJECT_PRESETS = [
  { label: "River Table", value: "river", length: "60", width: "2", depth: "1.5", ratioA: "1", ratioB: "1", maxPour: "0.25" },
  { label: "Coaster Set", value: "coaster", length: "4", width: "4", depth: "0.5", ratioA: "1", ratioB: "1", maxPour: "" },
  { label: "Void Fill", value: "void", length: "12", width: "3", depth: "1", ratioA: "2", ratioB: "1", maxPour: "0.5" },
  { label: "Custom", value: "custom", length: "", width: "", depth: "", ratioA: "1", ratioB: "1", maxPour: "" },
];

export default function EpoxyScreen() {
  const { colors } = useTheme();
  const [preset, setPreset] = useState("river");
  const [length, setLength] = useState("60");
  const [width, setWidth] = useState("2");
  const [depth, setDepth] = useState("1.5");
  const [ratioA, setRatioA] = useState("1");
  const [ratioB, setRatioB] = useState("1");
  const [maxPour, setMaxPour] = useState("0.25");
  const [colorantPercent, setColorantPercent] = useState("");

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const p = PROJECT_PRESETS.find((pr) => pr.value === value);
    if (p) {
      setLength(p.length);
      setWidth(p.width);
      setDepth(p.depth);
      setRatioA(p.ratioA);
      setRatioB(p.ratioB);
      setMaxPour(p.maxPour);
    }
  };

  const result = useMemo(() => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const d = parseFloat(depth);
    const rA = parseFloat(ratioA);
    const rB = parseFloat(ratioB);
    if (!l || !w || !d || !rA || !rB || l <= 0 || w <= 0 || d <= 0) return null;

    const mp = parseFloat(maxPour);
    const cp = parseFloat(colorantPercent);

    return calculateEpoxy({
      lengthIn: l,
      widthIn: w,
      depthIn: d,
      ratioA: rA,
      ratioB: rB,
      maxPourDepthIn: mp > 0 ? mp : undefined,
      colorantPercent: cp > 0 ? cp : undefined,
    });
  }, [length, width, depth, ratioA, ratioB, maxPour, colorantPercent]);

  const handleSave = () => {
    if (!result) return;
    try {
      CalculatorService.save({
        module: "woodworking",
        calculatorType: "epoxy",
        inputsJson: { length, width, depth, ratioA, ratioB, maxPour, colorantPercent, preset },
        outputsJson: result,
        label: `${length}×${width}×${depth}" ${preset} — ${result.volumeOz.toFixed(1)}oz`,
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
          Epoxy Calculator
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate resin volume, mix ratio, and pour schedule
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Project Type
        </Text>
        <FilterBar
          options={PROJECT_PRESETS.map((p) => ({ label: p.label, value: p.value }))}
          selected={preset}
          onSelect={handlePresetChange}
        />

        <CalculatorInput label="Length" value={length} onChangeText={setLength} unit="in" />
        <CalculatorInput label="Width" value={width} onChangeText={setWidth} unit="in" />
        <CalculatorInput label="Depth" value={depth} onChangeText={setDepth} unit="in" />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <CalculatorInput label="Ratio A" value={ratioA} onChangeText={setRatioA} />
          </View>
          <View className="flex-1">
            <CalculatorInput label="Ratio B" value={ratioB} onChangeText={setRatioB} />
          </View>
        </View>

        <CalculatorInput
          label="Max Pour Depth (optional)"
          value={maxPour}
          onChangeText={setMaxPour}
          unit="in"
          placeholder="0"
        />
        <CalculatorInput
          label="Colorant % by Weight (optional)"
          value={colorantPercent}
          onChangeText={setColorantPercent}
          unit="%"
          placeholder="0"
        />

        {result && (
          <>
            <ResultCard
              title="Volume & Mix"
              results={[
                { label: "Volume", value: result.volumeCubicIn.toFixed(1), unit: "in³" },
                { label: "Total resin", value: result.volumeOz.toFixed(1), unit: "oz", highlight: true },
                { label: "Part A", value: result.mix.partAOz.toFixed(1), unit: "oz" },
                { label: "Part B", value: result.mix.partBOz.toFixed(1), unit: "oz" },
              ]}
            />

            {result.multiPour && (
              <ResultCard
                title="Pour Schedule"
                results={[
                  { label: "Number of pours", value: result.multiPour.numPours.toString() },
                  { label: "Depth per pour", value: result.multiPour.depthPerPour.toFixed(3), unit: "in" },
                  { label: "Last pour depth", value: result.multiPour.lastPourDepth.toFixed(3), unit: "in" },
                ]}
              />
            )}

            {result.colorant && (
              <ResultCard
                title="Colorant"
                results={[
                  { label: "Pigment needed", value: result.colorant.pigmentGrams.toFixed(1), unit: "g" },
                ]}
              />
            )}
          </>
        )}

        {!result && (
          <View
            className="rounded-xl p-4 mt-4 items-center justify-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}
          >
            <Text
              className="text-[13px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              Enter dimensions to see results
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
