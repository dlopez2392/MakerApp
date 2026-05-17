import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateSpoilboardSurfacing } from "../../../../src/modules/cnc/calculators/spoilboardSurfacing";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function SpoilboardScreen() {
  const { colors } = useTheme();

  const [bedX, setBedX] = useState("");
  const [bedY, setBedY] = useState("");
  const [bitDiameter, setBitDiameter] = useState("");
  const [stepoverPct, setStepoverPct] = useState("80");
  const [feedRate, setFeedRate] = useState("");
  const [docPerPass, setDocPerPass] = useState("");
  const [totalSkim, setTotalSkim] = useState("");

  const results = useMemo(() => {
    const bedXVal = parseFloat(bedX);
    const bedYVal = parseFloat(bedY);
    const bitDiaVal = parseFloat(bitDiameter);
    const stepoverPctVal = parseFloat(stepoverPct) || 80;
    const docVal = parseFloat(docPerPass);
    const skimVal = parseFloat(totalSkim);

    if (!bedXVal || !bedYVal || !bitDiaVal || !docVal || !skimVal) return null;
    if (bedXVal <= 0 || bedYVal <= 0 || bitDiaVal <= 0 || docVal <= 0 || skimVal <= 0) return null;

    const stepoverIn = bitDiaVal * (stepoverPctVal / 100);
    const feedRateVal = parseFloat(feedRate) || undefined;

    return calculateSpoilboardSurfacing({
      bedXIn: bedXVal,
      bedYIn: bedYVal,
      stepoverIn,
      docPerPassIn: docVal,
      totalSkimIn: skimVal,
      feedRateIpm: feedRateVal,
    });
  }, [bedX, bedY, bitDiameter, stepoverPct, feedRate, docPerPass, totalSkim]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    const items = [
      { label: "Passes per Layer", value: `${results.passesPerLayer}`, highlight: true },
      { label: "Layers", value: `${results.layers}` },
      { label: "Total Passes", value: `${results.totalPasses}` },
      { label: "Distance per Layer", value: `${results.totalDistancePerLayerIn.toFixed(1)}`, unit: "in" },
    ];
    if (results.estimatedMinutes !== null) {
      items.push({ label: "Est. Time", value: `${results.estimatedMinutes}`, unit: "min" } as any);
    }
    return items;
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "cnc",
        calculatorType: "spoilboard",
        inputsJson: { bedX, bedY, bitDiameter, stepoverPct, feedRate, docPerPass, totalSkim },
        outputsJson: results,
        label: `${results.totalPasses} total passes — ${bedX}"×${bedY}" bed`,
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
          Spoilboard Surfacing
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Plan your spoilboard skim passes and estimate surfacing time
        </Text>

        <CalculatorInput
          label="Bed Length (X)"
          value={bedX}
          onChangeText={setBedX}
          unit="in"
          placeholder="24"
        />
        <CalculatorInput
          label="Bed Width (Y)"
          value={bedY}
          onChangeText={setBedY}
          unit="in"
          placeholder="24"
        />
        <CalculatorInput
          label="Surfacing Bit Diameter"
          value={bitDiameter}
          onChangeText={setBitDiameter}
          unit="in"
          placeholder="1.5"
        />
        <CalculatorInput
          label="Stepover %"
          value={stepoverPct}
          onChangeText={setStepoverPct}
          unit="%"
          placeholder="80"
        />
        <CalculatorInput
          label="Feed Rate"
          value={feedRate}
          onChangeText={setFeedRate}
          unit="IPM"
          placeholder="100"
        />
        <CalculatorInput
          label="DOC per Pass"
          value={docPerPass}
          onChangeText={setDocPerPass}
          unit="in"
          placeholder="0.01"
        />
        <CalculatorInput
          label="Total Skim Depth"
          value={totalSkim}
          onChangeText={setTotalSkim}
          unit="in"
          placeholder="0.03"
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
              Enter bed and bit dimensions to plan surfacing
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
