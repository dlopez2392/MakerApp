import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { ThemedBackground } from "../../../../src/design-system/components/ThemedBackground";
import { ThemedCard } from "../../../../src/design-system/components/ThemedCard";

const CALCULATORS = [
  { name: "Wax Volume", route: "/make/candle/wax-volume" },
  { name: "Fragrance Load", route: "/make/candle/fragrance-load" },
  { name: "Wick Sizing", route: "/make/candle/wick-sizing" },
];

export default function CandleHome() {
  const router = useRouter();
  const { colors, moduleTheme } = useTheme();

  return (
    <ThemedBackground module="candle">
      <ScrollView className="flex-1 p-4">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          Candle Making
        </Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: moduleTheme.accent }}>
          {CALCULATORS.length} calculators
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {CALCULATORS.map((calc) => (
            <ThemedCard key={calc.name} module="candle" onPress={() => router.push(calc.route as any)} accessibilityLabel={calc.name}>
              <Text className="text-[15px] text-center mt-2" style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}>
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
