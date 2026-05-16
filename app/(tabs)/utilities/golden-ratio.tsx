import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { calculateProportions } from "../../../src/modules/utilities/calculators/goldenRatio";
import { CalculatorInput } from "../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../src/design-system/components/ResultCard";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

export default function GoldenRatioScreen() {
  const { colors } = useTheme();
  const [dimension, setDimension] = useState("");

  const result = useMemo(() => {
    const d = parseFloat(dimension);
    if (!d || d <= 0) return null;
    return calculateProportions(d);
  }, [dimension]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Golden Ratio & Proportions
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate harmonious proportions from a base dimension
        </Text>

        <CalculatorInput
          label="Base Dimension"
          value={dimension}
          onChangeText={setDimension}
          unit="in"
          placeholder="Enter a measurement"
        />

        {result && (
          <ResultCard
            title="Proportions"
            results={[
              { label: "Golden (×1.618)", value: result.golden.toFixed(3), highlight: true },
              { label: "Golden Inverse (÷1.618)", value: result.goldenInverse.toFixed(3) },
              { label: "√2 (×1.414)", value: result.sqrt2.toFixed(3) },
              { label: "Two-thirds (×0.667)", value: result.twoThirds.toFixed(3) },
              { label: "Three-halves (×1.5)", value: result.threeHalves.toFixed(3) },
              { label: "Double (×2)", value: result.double.toFixed(3) },
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
              Enter a dimension to see proportions
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
