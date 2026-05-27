import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateEdgeFinishing, type FinishType, type EdgeProfile } from "../../../../src/modules/leather/calculators/edgeFinishing";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function EdgeFinishingScreen() {
  const { colors } = useTheme();

  const [totalEdgeLengthIn, setTotalEdgeLengthIn] = useState("");
  const [leatherThicknessMm, setLeatherThicknessMm] = useState("");
  const [numberOfCoats, setNumberOfCoats] = useState("3");
  const [finishType, setFinishType] = useState<FinishType>("edge-paint");
  const [edgeProfile, setEdgeProfile] = useState<EdgeProfile>("rounded");

  const results = useMemo(() => {
    const el = parseFloat(totalEdgeLengthIn);
    const lt = parseFloat(leatherThicknessMm);
    const nc = parseFloat(numberOfCoats);
    if (!(el > 0) || !(lt > 0) || !(nc > 0)) return null;

    return calculateEdgeFinishing({
      totalEdgeLengthIn: el,
      leatherThicknessMm: lt,
      numberOfCoats: nc,
      finishType,
      edgeProfile,
    });
  }, [totalEdgeLengthIn, leatherThicknessMm, numberOfCoats, finishType, edgeProfile]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Total Finish", value: `${results.totalFinishMl} ml (${results.totalFinishOz} oz)`, highlight: true },
      { label: "Bottles Needed (4oz)", value: String(results.bottlesNeeded) },
      { label: "Estimated Time", value: String(results.estimatedTimeMin), unit: "min" },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "leather",
        calculatorType: "edge-finishing",
        inputsJson: { totalEdgeLengthIn, leatherThicknessMm, numberOfCoats, finishType, edgeProfile },
        outputsJson: results,
        label: `${results.totalFinishMl}ml ${finishType} — ${results.estimatedTimeMin}min`,
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
          Edge Finishing
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate finish quantity and application time
        </Text>

        <CalculatorInput label="Total Edge Length" value={totalEdgeLengthIn} onChangeText={setTotalEdgeLengthIn} unit="in" placeholder="48" />
        <CalculatorInput label="Leather Thickness" value={leatherThicknessMm} onChangeText={setLeatherThicknessMm} unit="mm" placeholder="3" />
        <CalculatorInput label="Number of Coats" value={numberOfCoats} onChangeText={setNumberOfCoats} unit="coats" placeholder="3" />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-4"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Finish Type
        </Text>
        <FilterBar
          options={[
            { label: "Edge Paint", value: "edge-paint" },
            { label: "Gum Trag", value: "gum-trag" },
            { label: "Beeswax", value: "beeswax" },
          ]}
          selected={finishType}
          onSelect={(v) => setFinishType(v as FinishType)}
        />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-4"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Edge Profile
        </Text>
        <FilterBar
          options={[
            { label: "Flat", value: "flat" },
            { label: "Rounded", value: "rounded" },
            { label: "Beveled", value: "beveled" },
          ]}
          selected={edgeProfile}
          onSelect={(v) => setEdgeProfile(v as EdgeProfile)}
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
              Enter edge length and thickness to see results
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
