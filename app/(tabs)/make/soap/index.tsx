import { View, Text, SafeAreaView } from "react-native";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function SoapHome() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 items-center justify-center">
        <Text style={{ fontFamily: "Inter_500Medium", color: colors.textMuted, fontSize: 15 }}>
          Coming in Milestone 3
        </Text>
      </View>
    </SafeAreaView>
  );
}
