import { useEffect } from "react";
import { Stack } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function LeatherLayout() {
  const { colors, setActiveModule } = useTheme();

  useEffect(() => {
    setActiveModule("leather");
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="leather-area" options={{ title: "Leather Area" }} />
      <Stack.Screen name="thread-stitch" options={{ title: "Thread & Stitch" }} />
      <Stack.Screen name="cost-estimator" options={{ title: "Cost Estimator" }} />
      <Stack.Screen name="hole-spacing" options={{ title: "Hole Spacing" }} />
      <Stack.Screen name="dye-coverage" options={{ title: "Dye Coverage" }} />
      <Stack.Screen name="edge-finishing" options={{ title: "Edge Finishing" }} />
    </Stack>
  );
}
