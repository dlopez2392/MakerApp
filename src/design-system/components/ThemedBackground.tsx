import { View, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../hooks/useTheme";
import { getModuleTheme, type ModuleId } from "../tokens/moduleThemes";

interface ThemedBackgroundProps {
  module: ModuleId;
  children: React.ReactNode;
  opacity?: number;
  useSafeArea?: boolean;
}

export function ThemedBackground({
  module,
  children,
  opacity,
  useSafeArea = true,
}: ThemedBackgroundProps) {
  const { colors, mode } = useTheme();
  const theme = getModuleTheme(module);
  const resolvedOpacity =
    opacity ?? (mode === "dark" ? theme.darkOverlayOpacity : theme.lightOverlayOpacity);

  const Container = useSafeArea ? SafeAreaView : View;

  if (!theme.backgroundAsset) {
    return (
      <Container style={{ flex: 1, backgroundColor: colors.background }}>
        {children}
      </Container>
    );
  }

  return (
    <ImageBackground
      source={theme.backgroundAsset}
      resizeMode="cover"
      style={{ flex: 1 }}
      imageStyle={{ opacity: resolvedOpacity }}
    >
      <View style={{ flex: 1, backgroundColor: colors.background + "e6" }}>
        <Container style={{ flex: 1 }}>{children}</Container>
      </View>
    </ImageBackground>
  );
}
