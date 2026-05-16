import { Text, SafeAreaView, ScrollView } from "react-native";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

export default function ProfileScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[18px] mb-4"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Settings
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
