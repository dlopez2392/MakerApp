import { SafeAreaView, View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function InventoryDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 p-4">
        <Text className="text-[22px] mb-2" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          Item Detail
        </Text>
        <Text className="text-[14px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
          Item ID: {id}
        </Text>
      </View>
    </SafeAreaView>
  );
}
