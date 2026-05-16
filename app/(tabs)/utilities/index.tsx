import { View, Text, Pressable, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

const TOOLS = [
  { name: "Unit Converter", route: "/utilities/unit-converter" },
  { name: "Decibel Meter", route: "/utilities/decibel-meter" },
  { name: "Golden Ratio", route: "/utilities/golden-ratio" },
  { name: "Circle / Arc", route: "/utilities/circle-arc" },
  { name: "Drill / Tap", route: "/utilities/drill-tap" },
  { name: "EMC Calculator", route: "/utilities/emc" },
];

export default function UtilitiesHome() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[18px] mb-4"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Utilities
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {TOOLS.map((tool) => (
            <Pressable
              key={tool.name}
              onPress={() => router.push(tool.route as any)}
              className="rounded-xl p-4 items-center justify-center"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                width: "47%",
                minHeight: 100,
              }}
              accessibilityRole="button"
            >
              <Text
                className="text-[15px] text-center"
                style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
              >
                {tool.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
