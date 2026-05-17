import { View, Text, Pressable, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

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
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          CNC Routers
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
