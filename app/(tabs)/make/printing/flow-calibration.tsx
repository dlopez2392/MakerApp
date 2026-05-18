import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateFlowRate } from "../../../../src/modules/printing/calculators/flowRateCalibration";
import { getActiveProfile } from "../../../../src/modules/printing/data/printerProfiles";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { ShowMath } from "../../../../src/design-system/components/ShowMath";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function FlowCalibrationScreen() {
  const { colors } = useTheme();

  const profile = useMemo(() => {
    try { return getActiveProfile(); } catch { return null; }
  }, []);

  const [requestedLength, setRequestedLength] = useState("100");
  const [measuredLength, setMeasuredLength] = useState("");
  const [currentESteps, setCurrentESteps] = useState(
    profile?.stepsPerMmE ? String(profile.stepsPerMmE) : ""
  );

  const results = useMemo(() => {
    const req = parseFloat(requestedLength);
    const meas = parseFloat(measuredLength);
    const esteps = parseFloat(currentESteps);
    if (!req || !meas || !esteps) return null;
    if (req <= 0 || meas <= 0 || esteps <= 0) return null;
    return calculateFlowRate({ requestedLengthMm: req, measuredLengthMm: meas, currentESteps: esteps });
  }, [requestedLength, measuredLength, currentESteps]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "New E-Steps", value: `${Math.round(results.newESteps * 100) / 100}`, unit: "steps/mm", highlight: true },
      { label: "Flow Multiplier", value: `${Math.round(results.flowMultiplier * 100) / 100}`, unit: "%" },
      { label: "Deviation", value: `${Math.round(results.deviationPct * 100) / 100}`, unit: "%" },
    ];
  }, [results]);

  const mathSteps = useMemo(() => {
    if (!results) return [];
    return results.mathSteps.map((s) => ({
      label: s.label,
      formula: s.formula,
      result: `${s.result} ${s.unit}`,
    }));
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "printing",
        calculatorType: "flow-calibration",
        inputsJson: { requestedLength, measuredLength, currentESteps },
        outputsJson: results,
        label: `New E-Steps: ${Math.round(results.newESteps * 100) / 100} steps/mm`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch {
      Alert.alert("Error", "Failed to save result.");
    }
  };

  const subtitle = profile ? `• ${profile.name}` : "Calibrate extruder e-steps from measured extrusion";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Flow Rate Calibration
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          {subtitle}
        </Text>

        <CalculatorInput
          label="Requested Length"
          value={requestedLength}
          onChangeText={setRequestedLength}
          unit="mm"
          placeholder="100"
        />
        <CalculatorInput
          label="Measured Length"
          value={measuredLength}
          onChangeText={setMeasuredLength}
          unit="mm"
          placeholder="98.5"
        />
        <CalculatorInput
          label="Current E-Steps"
          value={currentESteps}
          onChangeText={setCurrentESteps}
          unit="steps/mm"
          placeholder="93"
        />

        {results ? (
          <>
            <ResultCard title="Results" results={resultItems} />
            <ShowMath steps={mathSteps} />
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
              Enter requested length, measured length, and current e-steps
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
