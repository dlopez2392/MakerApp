import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { ThemedBackground } from "../../../../src/design-system/components/ThemedBackground";
import { ThemedCard } from "../../../../src/design-system/components/ThemedCard";

const CALCULATORS = [
  { name: "Board Foot", route: "/make/woodworking/board-foot" },
  { name: "Fractions", route: "/make/woodworking/fraction-calc" },
  { name: "Cut List", route: "/make/woodworking/cut-list" },
  { name: "Wood Movement", route: "/make/woodworking/wood-movement" },
  { name: "Finishing", route: "/make/woodworking/finishing" },
  { name: "Epoxy Resin", route: "/make/woodworking/epoxy" },
  { name: "Species DB", route: "/make/woodworking/species-db" },
  { name: "Pricing", route: "/make/woodworking/pricing" },
];

export default function WoodworkingHome() {
  const router = useRouter();
  const { colors, moduleTheme } = useTheme();

  return (
    <ThemedBackground module="woodworking">
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Woodworking
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
              module="woodworking"
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
