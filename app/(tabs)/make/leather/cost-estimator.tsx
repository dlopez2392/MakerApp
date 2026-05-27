import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateLeatherCost } from "../../../../src/modules/leather/calculators/costEstimator";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function CostEstimatorScreen() {
  const { colors } = useTheme();

  const [hideCost, setHideCost] = useState("");
  const [hideAreaSqFt, setHideAreaSqFt] = useState("");
  const [hardwareCount, setHardwareCount] = useState("");
  const [hardwareCostPer, setHardwareCostPer] = useState("");
  const [threadSpoolCost, setThreadSpoolCost] = useState("");
  const [threadSpoolsUsed, setThreadSpoolsUsed] = useState("");
  const [dyeFinishCost, setDyeFinishCost] = useState("");
  const [numberOfItems, setNumberOfItems] = useState("1");

  const results = useMemo(() => {
    const hc = parseFloat(hideCost);
    const ni = parseFloat(numberOfItems);
    if (!(hc > 0) || !(ni > 0)) return null;

    return calculateLeatherCost({
      hideCost: hc,
      hideAreaSqFt: parseFloat(hideAreaSqFt) || 0,
      hardwareCount: parseFloat(hardwareCount) || 0,
      hardwareCostPer: parseFloat(hardwareCostPer) || 0,
      threadSpoolCost: parseFloat(threadSpoolCost) || 0,
      threadSpoolsUsed: parseFloat(threadSpoolsUsed) || 0,
      dyeFinishCost: parseFloat(dyeFinishCost) || 0,
      numberOfItems: ni,
    });
  }, [hideCost, hideAreaSqFt, hardwareCount, hardwareCostPer, threadSpoolCost, threadSpoolsUsed, dyeFinishCost, numberOfItems]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Total Project Cost", value: `$${results.totalProjectCost.toFixed(2)}`, highlight: true },
      { label: "Cost per Item", value: `$${results.costPerItem.toFixed(2)}` },
      { label: "Suggested Retail", value: `$${results.suggestedRetail.toFixed(2)}` },
      { label: "Hide", value: `$${results.hideCostTotal.toFixed(2)}` },
      { label: "Hardware", value: `$${results.hardwareCostTotal.toFixed(2)}` },
      { label: "Thread", value: `$${results.threadCostTotal.toFixed(2)}` },
      { label: "Dye/Finish", value: `$${results.dyeCostTotal.toFixed(2)}` },
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
        calculatorType: "cost-estimator",
        inputsJson: { hideCost, hideAreaSqFt, hardwareCount, hardwareCostPer, threadSpoolCost, threadSpoolsUsed, dyeFinishCost, numberOfItems },
        outputsJson: results,
        label: `$${results.totalProjectCost.toFixed(2)} project — $${results.costPerItem.toFixed(2)}/item`,
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
          Cost Estimator
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Estimate total project cost and per-item price
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Hide / Leather
        </Text>
        <CalculatorInput label="Hide Cost" value={hideCost} onChangeText={setHideCost} unit="$" placeholder="50" />
        <CalculatorInput label="Hide Area" value={hideAreaSqFt} onChangeText={setHideAreaSqFt} unit="sq ft" placeholder="6" />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-4"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Hardware
        </Text>
        <CalculatorInput label="Hardware Count" value={hardwareCount} onChangeText={setHardwareCount} unit="pcs" placeholder="10" />
        <CalculatorInput label="Cost per Piece" value={hardwareCostPer} onChangeText={setHardwareCostPer} unit="$" placeholder="0.75" />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-4"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Thread
        </Text>
        <CalculatorInput label="Spool Cost" value={threadSpoolCost} onChangeText={setThreadSpoolCost} unit="$" placeholder="8" />
        <CalculatorInput label="Spools Used" value={threadSpoolsUsed} onChangeText={setThreadSpoolsUsed} unit="spools" placeholder="1" />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-4"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Dye & Finish
        </Text>
        <CalculatorInput label="Dye/Finish Cost" value={dyeFinishCost} onChangeText={setDyeFinishCost} unit="$" placeholder="15" />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-4"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Production
        </Text>
        <CalculatorInput label="Number of Items" value={numberOfItems} onChangeText={setNumberOfItems} unit="items" placeholder="1" />

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
              Enter hide cost and item count to see results
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
