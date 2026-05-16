import { View, Text } from "react-native";
import { useTheme } from "../hooks/useTheme";

interface SafetyWarningProps {
  message: string;
  level?: "danger" | "warning";
}

export function SafetyWarning({ message, level = "danger" }: SafetyWarningProps) {
  const { colors } = useTheme();
  const borderColor = level === "danger" ? colors.danger : colors.warning;
  const textColor = level === "danger" ? colors.danger : colors.warning;

  return (
    <View
      className="rounded-lg p-3 mb-4 flex-row items-start"
      style={{ borderWidth: 2, borderColor, backgroundColor: `${borderColor}15` }}
    >
      <Text className="text-[16px] mr-2" accessibilityLabel={level === "danger" ? "Danger" : "Warning"}>
        {level === "danger" ? "⚠️" : "⚠"}
      </Text>
      <Text
        className="flex-1 text-[13px] leading-5"
        style={{ fontFamily: "Inter_400Regular", color: textColor }}
      >
        {message}
      </Text>
    </View>
  );
}
