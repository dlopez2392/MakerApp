import { View, Text, Pressable } from "react-native";
import { useTheme } from "../hooks/useTheme";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text
        className="text-[18px] mb-2"
        style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
      >
        {title}
      </Text>
      <Text
        className="text-[15px] text-center mb-6"
        style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
      >
        {description}
      </Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="rounded-lg px-6 py-3"
          style={{ backgroundColor: colors.primary, minHeight: 48 }}
          accessibilityRole="button"
        >
          <Text className="text-[15px]" style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}>
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
