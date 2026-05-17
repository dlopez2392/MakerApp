import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateEngraveTime } from "../../../../src/modules/laser/calculators/engraveTime";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const BIDIR_OPTIONS = [
  { label: "Bidirectional", value: "yes" },
  { label: "Unidirectional", value: "no" },
];

export default function EngraveTimeScreen() {
  const { colors } = useTheme();

  const [bidirectional, setBidirectional] = useState("yes");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lpi, setLpi] = useState("300");
  const [speed, setSpeed] = useState("");

  const results = useMemo(() => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    const l = parseFloat(lpi) || 300;
    const s = parseFloat(speed);

    if (!w || !h || !s || w <= 0 || h <= 0 || s <= 0) return null;

    return calculateEngraveTime({
      widthMm: w,
      heightMm: h,
      lpi: l,
      speedMms: s,
      bidirectional: bidirectional === "yes",
    });
  }, [width, height, lpi, speed, bidirectional]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Estimated time", value: results.formattedTime, highlight: true },
      { label: "Line count", value: `${results.lineCount}`, unit: "lines" },
      { label: "Total distance", value: `${Math.round(results.totalDistanceMm)}`, unit: "mm" },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "laser",
        calculatorType: "engrave-time",
        inputsJson: { bidirectional, width, height, lpi, speed },
        outputsJson: results,
        label: `${results.formattedTime} — ${width}×${height}mm @ ${lpi}lpi`,
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
          Engrave Time
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Estimate engraving time for a given area
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Scan Direction
        </Text>
        <FilterBar
          options={BIDIR_OPTIONS}
          selected={bidirectional}
          onSelect={setBidirectional}
        />

        <CalculatorInput
          label="Width"
          value={width}
          onChangeText={setWidth}
          unit="mm"
          placeholder="100"
        />
        <CalculatorInput
          label="Height"
          value={height}
          onChangeText={setHeight}
          unit="mm"
          placeholder="50"
        />
        <CalculatorInput
          label="LPI (Lines Per Inch)"
          value={lpi}
          onChangeText={setLpi}
          unit="lpi"
          placeholder="300"
          keyboardType="numeric"
        />
        <CalculatorInput
          label="Scan Speed"
          value={speed}
          onChangeText={setSpeed}
          unit="mm/s"
          placeholder="200"
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
              Enter dimensions and speed to see estimate
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
