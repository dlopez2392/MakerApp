import { Stack } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function CandleLayout() {
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
      <Stack.Screen name="wax-volume" options={{ title: "Wax Volume" }} />
      <Stack.Screen name="fragrance-load" options={{ title: "Fragrance Load" }} />
      <Stack.Screen name="wick-sizing" options={{ title: "Wick Sizing" }} />
    </Stack>
  );
}
