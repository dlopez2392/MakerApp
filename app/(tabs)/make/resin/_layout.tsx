import { Stack } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function ResinLayout() {
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
      <Stack.Screen name="resin-ratio" options={{ title: "Resin/Hardener Ratio" }} />
      <Stack.Screen name="mold-volume" options={{ title: "Mold Volume" }} />
      <Stack.Screen name="colorant-mix" options={{ title: "Colorant Mix" }} />
    </Stack>
  );
}
