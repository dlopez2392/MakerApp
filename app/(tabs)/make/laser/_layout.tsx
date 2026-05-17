import { Stack } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function LaserLayout() {
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
      <Stack.Screen name="power-speed" options={{ title: "Power & Speed" }} />
      <Stack.Screen name="kerf-comp" options={{ title: "Kerf Compensation" }} />
      <Stack.Screen name="engrave-time" options={{ title: "Engrave Time" }} />
      <Stack.Screen name="material-cost" options={{ title: "Material Cost" }} />
      <Stack.Screen name="focus-offset" options={{ title: "Focus Offset" }} />
      <Stack.Screen name="ramp-gradient" options={{ title: "Ramp/Gradient" }} />
      <Stack.Screen name="materials-db" options={{ title: "Material Database" }} />
    </Stack>
  );
}
