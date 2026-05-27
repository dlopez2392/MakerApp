import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { ThemedBackground } from "../../../../src/design-system/components/ThemedBackground";
import { ThemedCard } from "../../../../src/design-system/components/ThemedCard";

const CALCULATORS = [
  { name: "Power & Speed", route: "/make/laser/power-speed" },
  { name: "Kerf Compensation", route: "/make/laser/kerf-comp" },
  { name: "Engrave Time", route: "/make/laser/engrave-time" },
  { name: "Material Cost", route: "/make/laser/material-cost" },
  { name: "Focus Offset", route: "/make/laser/focus-offset" },
  { name: "Ramp/Gradient", route: "/make/laser/ramp-gradient" },
  { name: "Material Database", route: "/make/laser/materials-db" },
];

export default function LaserHome() {
  const router = useRouter();
  const { colors, moduleTheme } = useTheme();

  return (
    <ThemedBackground module="laser">
      <ScrollView className="flex-1 p-4">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          Laser Cutters
        </Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: moduleTheme.accent }}>
          {CALCULATORS.length} calculators
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {CALCULATORS.map((calc) => (
            <ThemedCard key={calc.name} module="laser" onPress={() => router.push(calc.route as any)} accessibilityLabel={calc.name}>
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
