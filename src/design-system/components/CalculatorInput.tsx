import { View, TextInput, Text } from "react-native";
import { useTheme } from "../hooks/useTheme";

interface CalculatorInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit?: string;
  placeholder?: string;
  keyboardType?: "numeric" | "decimal-pad";
  accessibilityLabel?: string;
}

export function CalculatorInput({
  label,
  value,
  onChangeText,
  unit,
  placeholder = "0",
  keyboardType = "decimal-pad",
  accessibilityLabel,
}: CalculatorInputProps) {
  const { colors } = useTheme();

  return (
    <View className="mb-3">
      <Text
        className="text-text-secondary text-[13px] mb-1 ml-1"
        style={{ fontFamily: "Inter_400Regular" }}
      >
        {label}
      </Text>
      <View
        className="flex-row items-center rounded-lg px-4 py-3"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        <TextInput
          className="flex-1 text-[18px] text-text-primary"
          style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          accessibilityLabel={accessibilityLabel || label}
        />
        {unit && (
          <Text
            className="text-[13px] ml-2"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
}
