import { Stack } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function CncLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="feeds-speeds" options={{ title: "Feeds & Speeds" }} />
      <Stack.Screen name="stepover" options={{ title: "Stepover" }} />
      <Stack.Screen name="depth-of-cut" options={{ title: "Depth of Cut" }} />
      <Stack.Screen name="v-carve" options={{ title: "V-Carve" }} />
      <Stack.Screen name="spoilboard" options={{ title: "Spoilboard Surfacing" }} />
      <Stack.Screen name="tram-check" options={{ title: "Tram Check" }} />
      <Stack.Screen name="tool-library" options={{ title: "Tool Library" }} />
    </Stack>
  );
}
