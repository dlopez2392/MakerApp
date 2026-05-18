import { View, Text, Pressable, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const TILES = [
  { name: "Print Time", route: "/make/printing/print-time" },
  { name: "Filament Usage", route: "/make/printing/filament-usage" },
  { name: "Max Flow", route: "/make/printing/max-flow" },
  { name: "Flow Calibration", route: "/make/printing/flow-calibration" },
  { name: "Retraction Tuning", route: "/make/printing/retraction" },
  { name: "Belt / Steps", route: "/make/printing/belt-steps" },
  { name: "Filament Database", route: "/make/printing/filament-db" },
  { name: "My Printers", route: "/make/printing/printer-profiles" },
];

export default function PrintingHome() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          3D Printing
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          6 calculators · filament database · printer profiles
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {TILES.map((tile) => (
            <Pressable
              key={tile.name}
              onPress={() => router.push(tile.route as any)}
              className="rounded-xl p-4 items-center justify-center"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                width: "47%",
                minHeight: 100,
              }}
              accessibilityRole="button"
              accessibilityLabel={tile.name}
            >
              <Text
                className="text-[15px] text-center mt-2"
                style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
              >
                {tile.name}
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
