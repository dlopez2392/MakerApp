import { useEffect } from "react";
import { Stack } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function PrintingLayout() {
  const { colors, setActiveModule } = useTheme();

  useEffect(() => {
    setActiveModule("printing");
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
      <Stack.Screen name="print-time" options={{ title: "Print Time" }} />
      <Stack.Screen name="filament-usage" options={{ title: "Filament Usage" }} />
      <Stack.Screen name="max-flow" options={{ title: "Max Volumetric Flow" }} />
      <Stack.Screen name="flow-calibration" options={{ title: "Flow Rate Calibration" }} />
      <Stack.Screen name="retraction" options={{ title: "Retraction Tuning" }} />
      <Stack.Screen name="belt-steps" options={{ title: "Belt / Steps" }} />
      <Stack.Screen name="filament-db" options={{ title: "Filament Database" }} />
      <Stack.Screen name="printer-profiles" options={{ title: "My Printers" }} />
    </Stack>
  );
}
