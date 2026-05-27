import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { ThemedBackground } from "../../../../src/design-system/components/ThemedBackground";
import { ThemedCard } from "../../../../src/design-system/components/ThemedCard";

const CALCULATORS = [
  { name: "Feeds & Speeds", route: "/make/cnc/feeds-speeds" },
  { name: "Stepover", route: "/make/cnc/stepover" },
  { name: "Depth of Cut", route: "/make/cnc/depth-of-cut" },
  { name: "V-Carve", route: "/make/cnc/v-carve" },
  { name: "Spoilboard Surfacing", route: "/make/cnc/spoilboard" },
  { name: "Tram Check", route: "/make/cnc/tram-check" },
  { name: "Tool Library", route: "/make/cnc/tool-library" },
];

export default function CncHome() {
  const router = useRouter();
  const { colors, moduleTheme } = useTheme();

  return (
    <ThemedBackground module="cnc">
      <ScrollView className="flex-1 p-4">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          CNC Routers
        </Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: moduleTheme.accent }}>
          {CALCULATORS.length} calculators
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {CALCULATORS.map((calc) => (
            <ThemedCard key={calc.name} module="cnc" onPress={() => router.push(calc.route as any)} accessibilityLabel={calc.name}>
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
