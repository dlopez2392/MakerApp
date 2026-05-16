import { View, Text, Pressable, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const CALCULATORS = [
  { name: "Board Foot", route: "/make/woodworking/board-foot", icon: "ruler" },
  { name: "Fractions", route: "/make/woodworking/fraction-calc", icon: "divide" },
  { name: "Cut List", route: "/make/woodworking/cut-list", icon: "scissors" },
  { name: "Wood Movement", route: "/make/woodworking/wood-movement", icon: "move" },
  { name: "Finishing", route: "/make/woodworking/finishing", icon: "droplet" },
  { name: "Epoxy Resin", route: "/make/woodworking/epoxy", icon: "layers" },
  { name: "Species DB", route: "/make/woodworking/species-db", icon: "database" },
  { name: "Pricing", route: "/make/woodworking/pricing", icon: "dollar-sign" },
];

export default function WoodworkingHome() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
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
      </ScrollView>
    </SafeAreaView>
  );
}
