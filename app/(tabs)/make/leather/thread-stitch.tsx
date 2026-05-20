import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateThreadStitch } from "../../../../src/modules/leather/calculators/threadStitch";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const STITCH_OPTIONS = [
  { label: "Running Stitch", value: "1" },
  { label: "Saddle Stitch", value: "2" },
];

export default function ThreadStitchScreen() {
  const { colors } = useTheme();

  const [seamLength, setSeamLength] = useState("");
  const [spi, setSpi] = useState("7");
  const [thickness, setThickness] = useState("");
  const [threadPasses, setThreadPasses] = useState<"1" | "2">("2");

  const results = useMemo(() => {
    const sl = parseFloat(seamLength);
    const s = parseFloat(spi);
    const t = parseFloat(thickness);

    if (!sl || !s || !t || sl <= 0 || s <= 0 || t <= 0) return null;

    return calculateThreadStitch({
      seamLengthIn: sl,
      stitchesPerInch: s,
      leatherThicknessMm: t,
      threadPasses: parseInt(threadPasses) as 1 | 2,
    });
  }, [seamLength, spi, thickness, threadPasses]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Thread Length", value: results.threadLengthIn.toFixed(2), unit: "in" },
      { label: "Thread Length", value: results.threadLengthFt.toFixed(2), unit: "ft", highlight: true },
      { label: "Recommended Needle Size", value: results.needleSizeRec },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid values to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "leather",
        calculatorType: "thread-stitch",
        inputsJson: { seamLength, spi, thickness, threadPasses },
        outputsJson: results,
        label: `${results.threadLengthFt.toFixed(2)} ft — ${threadPasses === "2" ? "Saddle" : "Running"}`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch {
      Alert.alert("Error", "Failed to save result.");
    }
  };

  const handleAddToQuote = () => {
    Alert.alert("Coming Soon", "Quote feature coming soon.");
  };

  const handleLogToProject = () => {
    Alert.alert("Coming Soon", "Project logging coming soon.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Thread & Stitch Calculator
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate thread length for leather stitching
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Stitch Type
        </Text>
        <FilterBar
          options={STITCH_OPTIONS}
          selected={threadPasses}
          onSelect={(v) => setThreadPasses(v as "1" | "2")}
        />

        <CalculatorInput
          label="Seam Length"
          value={seamLength}
          onChangeText={setSeamLength}
          unit="in"
          placeholder="0"
        />
        <CalculatorInput
          label="Stitches Per Inch"
          value={spi}
          onChangeText={setSpi}
          unit="SPI"
          placeholder="7"
        />
        <CalculatorInput
          label="Leather Thickness"
          value={thickness}
          onChangeText={setThickness}
          unit="mm"
          placeholder="0"
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
              Enter values to see results
            </Text>
          </View>
        )}

        <ActionBar
          onSaveToHistory={handleSave}
          onAddToQuote={handleAddToQuote}
          onLogToProject={handleLogToProject}
        />

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
