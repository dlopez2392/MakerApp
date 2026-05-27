import { View, Text, Pressable, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

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
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Resin Art
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          {CALCULATORS.length} calculators
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {CALCULATORS.map((calc) => (
            <Pressable
              key={calc.name}
              onPress={() => router.push(calc.route as any)}
              className="rounded-xl p-4 items-center justify-center"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                width: "47%",
                minHeight: 100,
              }}
              accessibilityRole="button"
              accessibilityLabel={calc.name}
            >
              <Text
                className="text-[15px] text-center mt-2"
                style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
              >
                {calc.name}
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
