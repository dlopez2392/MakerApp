import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateTramCheck } from "../../../../src/modules/cnc/calculators/tramCheck";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function TramCheckScreen() {
  const { colors } = useTheme();

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const results = useMemo(() => {
    const frontVal = parseFloat(front);
    const backVal = parseFloat(back);
    const leftVal = parseFloat(left);
    const rightVal = parseFloat(right);

    if (
      isNaN(frontVal) || isNaN(backVal) || isNaN(leftVal) || isNaN(rightVal)
    ) return null;

    return calculateTramCheck({
      frontIn: frontVal,
      backIn: backVal,
      leftIn: leftVal,
      rightIn: rightVal,
    });
  }, [front, back, left, right]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      {
        label: "In Tram",
        value: results.isPerfect ? "Yes" : "No",
        highlight: true,
      },
      {
        label: "F/B Tilt",
        value: `${results.frontBack.tiltThousandths} thou`,
      },
      {
        label: "F/B Direction",
        value: results.frontBack.direction,
      },
      {
        label: "L/R Tilt",
        value: `${results.leftRight.tiltThousandths} thou`,
      },
      {
        label: "L/R Direction",
        value: results.leftRight.direction,
      },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter all four readings to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "cnc",
        calculatorType: "tram-check",
        inputsJson: { front, back, left, right },
        outputsJson: results,
        label: results.isPerfect
          ? "Router is trammed"
          : `Out of tram — F/B: ${results.frontBack.tiltThousandths} thou, L/R: ${results.leftRight.tiltThousandths} thou`,
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
          Tram Check
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Enter dial indicator readings to check spindle tram
        </Text>

        <CalculatorInput
          label="Front Reading"
          value={front}
          onChangeText={setFront}
          unit="in"
          placeholder="0.000"
        />
        <CalculatorInput
          label="Back Reading"
          value={back}
          onChangeText={setBack}
          unit="in"
          placeholder="0.000"
        />
        <CalculatorInput
          label="Left Reading"
          value={left}
          onChangeText={setLeft}
          unit="in"
          placeholder="0.000"
        />
        <CalculatorInput
          label="Right Reading"
          value={right}
          onChangeText={setRight}
          unit="in"
          placeholder="0.000"
        />

        {results ? (
          <>
            <ResultCard title="Results" results={resultItems} />
            <View
              className="rounded-xl p-4 mt-3"
              style={{
                backgroundColor: results.isPerfect ? colors.surface : colors.surface,
                borderWidth: 1,
                borderColor: results.isPerfect ? colors.border : colors.border,
              }}
            >
              <Text
                className="text-[12px] uppercase tracking-wider mb-2"
                style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
              >
                Adjustment Instructions
              </Text>
              <Text
                className="text-[13px] mb-2"
                style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}
              >
                {results.frontBack.adjustmentInstruction}
              </Text>
              <Text
                className="text-[13px]"
                style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}
              >
                {results.leftRight.adjustmentInstruction}
              </Text>
            </View>
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
              Enter all four dial indicator readings
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
