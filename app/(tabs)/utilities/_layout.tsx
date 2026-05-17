import { Stack } from "expo-router";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

export default function UtilitiesLayout() {
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
      <Stack.Screen name="unit-converter" options={{ title: "Unit Converter" }} />
      <Stack.Screen name="decibel-meter" options={{ title: "Decibel Meter" }} />
      <Stack.Screen name="golden-ratio" options={{ title: "Golden Ratio" }} />
      <Stack.Screen name="circle-arc" options={{ title: "Circle & Arc" }} />
      <Stack.Screen name="drill-tap" options={{ title: "Drill & Tap" }} />
      <Stack.Screen name="emc" options={{ title: "EMC Calculator" }} />
    </Stack>
  );
}
