import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { ThemedBackground } from "../../../../src/design-system/components/ThemedBackground";
import { ThemedCard } from "../../../../src/design-system/components/ThemedCard";

const CALCULATORS = [
  { name: "Resin/Hardener Ratio", route: "/make/resin/resin-ratio" },
  { name: "Mold Volume", route: "/make/resin/mold-volume" },
  { name: "Colorant Mix", route: "/make/resin/colorant-mix" },
  { name: "Cost Estimator", route: "/make/resin/cost-estimator" },
  { name: "Coating Coverage", route: "/make/resin/coating-coverage" },
  { name: "Pot Life Timer", route: "/make/resin/pot-life" },
  { name: "Pressure Pot", route: "/make/resin/pressure-pot" },
];

export default function ResinHome() {
  const router = useRouter();
  const { colors, moduleTheme } = useTheme();

  return (
    <ThemedBackground module="resin">
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Resin Art
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: moduleTheme.accent }}
        >
          {CALCULATORS.length} calculators
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {CALCULATORS.map((calc) => (
            <ThemedCard
              key={calc.name}
              module="resin"
              onPress={() => router.push(calc.route as any)}
              accessibilityLabel={calc.name}
            >
              <Text
                className="text-[15px] text-center mt-2"
                style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
              >
                {calc.name}
              </Text>
            </ThemedCard>
          ))}
        </View>
        <View className="h-8" />
      </ScrollView>
    </ThemedBackground>
  );
}
