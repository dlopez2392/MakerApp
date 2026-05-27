import { Pressable, type ViewStyle } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { getModuleTheme, type ModuleId } from "../tokens/moduleThemes";

interface ThemedCardProps {
  module?: ModuleId;
  onPress?: () => void;
  children: React.ReactNode;
  highlight?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function ThemedCard({
  module,
  onPress,
  children,
  highlight = false,
  style,
  accessibilityLabel,
}: ThemedCardProps) {
  const { colors, activeModule } = useTheme();
  const resolvedModule = module ?? activeModule;
  const theme = getModuleTheme(resolvedModule);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="rounded-xl p-4 items-center justify-center"
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: highlight ? theme.accent : theme.cardBorderColor,
          width: "47%",
          minHeight: 100,
        },
        style,
      ]}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Pressable>
  );
}
