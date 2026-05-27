import { useEffect } from "react";
import { Stack } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function WoodworkingLayout() {
  const { colors, setActiveModule } = useTheme();

  useEffect(() => {
    setActiveModule("woodworking");
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
      <Stack.Screen name="board-foot" options={{ title: "Board Foot" }} />
      <Stack.Screen name="fraction-calc" options={{ title: "Fractions" }} />
      <Stack.Screen name="cut-list" options={{ title: "Cut List" }} />
      <Stack.Screen name="wood-movement" options={{ title: "Wood Movement" }} />
      <Stack.Screen name="finishing" options={{ title: "Finishing" }} />
      <Stack.Screen name="epoxy" options={{ title: "Epoxy" }} />
      <Stack.Screen name="species-db" options={{ title: "Species DB" }} />
      <Stack.Screen name="pricing" options={{ title: "Pricing" }} />
    </Stack>
  );
}
