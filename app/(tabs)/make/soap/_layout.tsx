import { Stack } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function SoapLayout() {
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
      <Stack.Screen name="lye-calculator" options={{ title: "Lye Calculator" }} />
      <Stack.Screen name="batch-scaler" options={{ title: "Batch Scaler" }} />
      <Stack.Screen name="fragrance-calc" options={{ title: "Fragrance Calculator" }} />
      <Stack.Screen name="color-additive" options={{ title: "Color Additive" }} />
      <Stack.Screen name="cure-tracker" options={{ title: "Cure Tracker" }} />
      <Stack.Screen name="cost-estimator" options={{ title: "Cost Estimator" }} />
    </Stack>
  );
}
