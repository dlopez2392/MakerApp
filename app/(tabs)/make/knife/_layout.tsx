import { useEffect } from "react";
import { Stack } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function KnifeLayout() {
  const { colors, setActiveModule } = useTheme();

  useEffect(() => {
    setActiveModule("knife");
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
      <Stack.Screen name="heat-treat" options={{ title: "Heat Treat" }} />
      <Stack.Screen name="grind-angle" options={{ title: "Grind Angle" }} />
      <Stack.Screen name="handle-scale" options={{ title: "Handle Scale" }} />
      <Stack.Screen name="steel-db" options={{ title: "Steel Database" }} />
    </Stack>
  );
}
