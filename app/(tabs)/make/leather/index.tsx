import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { ThemedBackground } from "../../../../src/design-system/components/ThemedBackground";
import { ThemedCard } from "../../../../src/design-system/components/ThemedCard";

const CALCULATORS = [
  { name: "Leather Area", route: "/make/leather/leather-area" },
  { name: "Thread & Stitch", route: "/make/leather/thread-stitch" },
  { name: "Cost Estimator", route: "/make/leather/cost-estimator" },
  { name: "Hole Spacing", route: "/make/leather/hole-spacing" },
  { name: "Dye Coverage", route: "/make/leather/dye-coverage" },
  { name: "Edge Finishing", route: "/make/leather/edge-finishing" },
];

export default function LeatherHome() {
  const router = useRouter();
  const { colors, moduleTheme } = useTheme();

  return (
    <ThemedBackground module="leather">
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Leatherworking
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
              module="leather"
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
      </ScrollView>
    </ThemedBackground>
  );
}
