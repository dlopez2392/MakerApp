import { View, Pressable, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "../hooks/useTheme";

interface ActionBarProps {
  onSaveToHistory: () => void;
  onAddToQuote: () => void;
  onLogToProject: () => void;
  onSaveAsRecipe?: () => void;
  onLoadRecipe?: () => void;
}

export function ActionBar({ onSaveToHistory, onAddToQuote, onLogToProject, onSaveAsRecipe, onLoadRecipe }: ActionBarProps) {
  const { colors } = useTheme();

  const handlePress = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    callback();
  };

  const primaryButtons = [
    { label: "Save to History", onPress: () => handlePress(onSaveToHistory), icon: "bookmark" },
    { label: "Add to Quote", onPress: () => handlePress(onAddToQuote), icon: "file-text" },
    { label: "Log to Project", onPress: () => handlePress(onLogToProject), icon: "folder" },
  ];

  const recipeButtons = [
    onSaveAsRecipe && { label: "Save as Recipe", onPress: () => handlePress(onSaveAsRecipe) },
    onLoadRecipe && { label: "Load Recipe", onPress: () => handlePress(onLoadRecipe) },
  ].filter(Boolean) as { label: string; onPress: () => void }[];

  return (
    <View className="mt-6 gap-2">
      <View className="flex-row justify-between gap-2">
        {primaryButtons.map((btn) => (
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
      {recipeButtons.length > 0 && (
        <View className="flex-row justify-between gap-2">
          {recipeButtons.map((btn) => (
            <Pressable
              key={btn.label}
              onPress={btn.onPress}
              className="flex-1 items-center py-3 rounded-lg"
              style={{ backgroundColor: colors.primary, minHeight: 48 }}
              accessibilityLabel={btn.label}
              accessibilityRole="button"
            >
              <Text
                className="text-[11px] text-center"
                style={{ fontFamily: "Inter_600SemiBold", color: "#FFFFFF" }}
              >
                {btn.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
