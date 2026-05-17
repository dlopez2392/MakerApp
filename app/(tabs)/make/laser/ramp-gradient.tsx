import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateRampGradient } from "../../../../src/modules/laser/calculators/rampGradient";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function RampGradientScreen() {
  const { colors } = useTheme();

  const [startPower, setStartPower] = useState("");
  const [endPower, setEndPower] = useState("");
  const [length, setLength] = useState("");
  const [steps, setSteps] = useState("5");

  const results = useMemo(() => {
    const start = parseFloat(startPower);
    const end = parseFloat(endPower);
    const len = parseFloat(length);
    const numSteps = Math.max(1, Math.min(20, Math.round(parseFloat(steps) || 5)));

    if (!start || !end || !len || start <= 0 || end <= 0 || len <= 0) return null;

    return calculateRampGradient({
      startPowerPct: start,
      endPowerPct: end,
      lengthMm: len,
      steps: numSteps,
    });
  }, [startPower, endPower, length, steps]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "laser",
        calculatorType: "ramp-gradient",
        inputsJson: { startPower, endPower, length, steps },
        outputsJson: results,
        label: `${startPower}%→${endPower}% over ${length}mm (${results.steps.length} steps)`,
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
          Ramp/Gradient
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Generate stepped power ramp for gradient engrave
        </Text>

        <CalculatorInput
          label="Start Power"
          value={startPower}
          onChangeText={setStartPower}
          unit="%"
          placeholder="20"
        />
        <CalculatorInput
          label="End Power"
          value={endPower}
          onChangeText={setEndPower}
          unit="%"
          placeholder="80"
        />
        <CalculatorInput
          label="Length"
          value={length}
          onChangeText={setLength}
          unit="mm"
          placeholder="100"
        />
        <CalculatorInput
          label="Steps"
          value={steps}
          onChangeText={setSteps}
          unit="steps"
          placeholder="5"
          keyboardType="numeric"
        />

        {results ? (
          <View
            className="rounded-xl p-4 mt-4"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <Text
              className="text-[13px] mb-3 uppercase tracking-wider"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
            >
              Steps
            </Text>
            {results.steps.map((step) => (
              <View
                key={step.stepIndex}
                className="flex-row justify-between items-baseline mb-2"
              >
                <Text
                  className="text-[13px]"
                  style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
                >
                  Step {step.stepIndex + 1} @ {step.positionMm}mm
                </Text>
                <Text
                  className="text-[20px]"
                  style={{ fontFamily: "JetBrainsMono_700Bold", color: colors.textPrimary }}
                >
                  {step.powerPct}
                  <Text
                    className="text-[13px]"
                    style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
                  >
                    {" %}"}
                  </Text>
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View
            className="rounded-xl p-4 mt-4 items-center justify-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}
          >
            <Text
              className="text-[13px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              Enter power range and length to generate steps
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
