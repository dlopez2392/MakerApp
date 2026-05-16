import { View, Pressable, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "../hooks/useTheme";

interface ActionBarProps {
  onSaveToHistory: () => void;
  onAddToQuote: () => void;
  onLogToProject: () => void;
}

export function ActionBar({ onSaveToHistory, onAddToQuote, onLogToProject }: ActionBarProps) {
  const { colors } = useTheme();

  const handlePress = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    callback();
  };

  const buttons = [
    { label: "Save to History", onPress: () => handlePress(onSaveToHistory), icon: "bookmark" },
    { label: "Add to Quote", onPress: () => handlePress(onAddToQuote), icon: "file-text" },
    { label: "Log to Project", onPress: () => handlePress(onLogToProject), icon: "folder" },
  ];

  return (
    <View className="flex-row justify-between mt-6 gap-2">
      {buttons.map((btn) => (
        <Pressable
          key={btn.label}
          onPress={btn.onPress}
          className="flex-1 items-center py-3 rounded-lg"
          style={{ backgroundColor: colors.surfaceElevated, minHeight: 48 }}
          accessibilityLabel={btn.label}
          accessibilityRole="button"
        >
          <Text
            className="text-[11px] text-center"
            style={{ fontFamily: "Inter_500Medium", color: colors.primary }}
          >
            {btn.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
