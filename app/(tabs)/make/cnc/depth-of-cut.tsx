import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateDepthOfCut } from "../../../../src/modules/cnc/calculators/depthOfCut";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const FINISHING_OPTIONS = [
  { label: "No Finishing Pass", value: "no" },
  { label: "With Finishing Pass", value: "yes" },
];

export default function DepthOfCutScreen() {
  const { colors } = useTheme();

  const [totalDepth, setTotalDepth] = useState("");
  const [roughingDoc, setRoughingDoc] = useState("");
  const [hasFinishing, setHasFinishing] = useState("no");
  const [finishingDoc, setFinishingDoc] = useState("");
  const [feedRate, setFeedRate] = useState("");
  const [cutLength, setCutLength] = useState("");

  const results = useMemo(() => {
    const totalDepthVal = parseFloat(totalDepth);
    const roughingDocVal = parseFloat(roughingDoc);
    if (!totalDepthVal || !roughingDocVal || totalDepthVal <= 0 || roughingDocVal <= 0) return null;

    const finishingDocVal = hasFinishing === "yes" ? parseFloat(finishingDoc) || 0 : 0;
    const feedRateVal = parseFloat(feedRate) || undefined;
    const cutLengthVal = parseFloat(cutLength) || undefined;

    return calculateDepthOfCut({
      totalDepthIn: totalDepthVal,
      maxRoughDocIn: roughingDocVal,
      finishingPassIn: finishingDocVal,
      feedRateIpm: feedRateVal,
      cutLengthIn: cutLengthVal,
    });
  }, [totalDepth, roughingDoc, hasFinishing, finishingDoc, feedRate, cutLength]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    const items = [
      { label: "Total Passes", value: `${results.totalPasses}`, highlight: true },
      { label: "Roughing Passes", value: `${results.roughingPasses}` },
      { label: "Finishing Pass", value: results.hasFinishingPass ? "Yes" : "No" },
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
        calculatorType: "depth-of-cut",
        inputsJson: { totalDepth, roughingDoc, hasFinishing, finishingDoc, feedRate, cutLength },
        outputsJson: results,
        label: `${results.totalPasses} passes — ${totalDepth}" total depth`,
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
          Depth of Cut
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Plan pass schedule and depth strategy for your cut
        </Text>

        <CalculatorInput
          label="Total Depth"
          value={totalDepth}
          onChangeText={setTotalDepth}
          unit="in"
          placeholder="1.0"
        />
        <CalculatorInput
          label="Max Roughing DOC per Pass"
          value={roughingDoc}
          onChangeText={setRoughingDoc}
          unit="in"
          placeholder="0.25"
        />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Finishing Pass
        </Text>
        <FilterBar
          options={FINISHING_OPTIONS}
          selected={hasFinishing}
          onSelect={setHasFinishing}
        />

        {hasFinishing === "yes" && (
          <CalculatorInput
            label="Finishing Pass Depth"
            value={finishingDoc}
            onChangeText={setFinishingDoc}
            unit="in"
            placeholder="0.01"
          />
        )}

        <CalculatorInput
          label="Feed Rate (optional — for time estimate)"
          value={feedRate}
          onChangeText={setFeedRate}
          unit="IPM"
          placeholder="60"
        />
        <CalculatorInput
          label="Cut Length (optional — for time estimate)"
          value={cutLength}
          onChangeText={setCutLength}
          unit="in"
          placeholder="24"
        />

        {results ? (
          <>
            <ResultCard title="Results" results={resultItems} />
            {results.passSchedule.length > 0 && (
              <View
                className="rounded-xl p-4 mt-3"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              >
                <Text
                  className="text-[12px] uppercase tracking-wider mb-2"
                  style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
                >
                  Pass Schedule
                </Text>
                {results.passSchedule.map((pass) => (
                  <View key={pass.passNumber} className="flex-row justify-between py-1">
                    <Text
                      className="text-[13px]"
                      style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
                    >
                      Pass {pass.passNumber} ({pass.passType})
                    </Text>
                    <Text
                      className="text-[13px]"
                      style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textSecondary }}
                    >
                      {pass.depthIn}" → {pass.cumulativeDepthIn}" total
                    </Text>
                  </View>
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
              Enter depth values to plan pass schedule
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
