import { View } from "react-native";
import { useTheme } from "../hooks/useTheme";

interface StepIndicatorProps {
  total: number;
  current: number;
}

export function StepIndicator({ total, current }: StepIndicatorProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-row justify-center gap-2 mb-4">
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          className="rounded-full"
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            backgroundColor: i === current ? colors.primary : colors.border,
          }}
        />
      ))}
    </View>
  );
}
