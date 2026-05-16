import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { calculateCircleArc } from "../../../src/modules/utilities/calculators/circleArc";
import { CalculatorInput } from "../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../src/design-system/components/ResultCard";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

export default function CircleArcScreen() {
  const { colors } = useTheme();
  const [radius, setRadius] = useState("");
  const [angle, setAngle] = useState("");

  const result = useMemo(() => {
    const r = parseFloat(radius);
    if (!r || r <= 0) return null;
    const a = parseFloat(angle);
    return calculateCircleArc(r, a > 0 ? a : undefined);
  }, [radius, angle]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Circle & Arc Calculator
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate circumference, area, arc length, and chord
        </Text>

        <CalculatorInput
          label="Radius"
          value={radius}
          onChangeText={setRadius}
          unit="in"
          placeholder="0"
        />
        <CalculatorInput
          label="Arc Angle (optional)"
          value={angle}
          onChangeText={setAngle}
          unit="°"
          placeholder="360"
        />

        {result && (
          <ResultCard
            title="Results"
            results={[
              { label: "Circumference", value: result.circumference.toFixed(4), unit: "in" },
              { label: "Area", value: result.area.toFixed(4), unit: "in²", highlight: true },
              ...(result.arcLength !== null
                ? [{ label: "Arc Length", value: result.arcLength.toFixed(4), unit: "in" }]
                : []),
              ...(result.chordLength !== null
                ? [{ label: "Chord Length", value: result.chordLength.toFixed(4), unit: "in" }]
                : []),
            ]}
          />
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
              Enter radius to see results
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
