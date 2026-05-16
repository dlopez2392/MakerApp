import { Tabs } from "expo-router";
import { useTheme } from "../../src/design-system/hooks/useTheme";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarLabel: "Home" }} />
      <Tabs.Screen name="make" options={{ title: "Make", tabBarLabel: "Make" }} />
      <Tabs.Screen name="shop" options={{ title: "Shop", tabBarLabel: "Shop" }} />
      <Tabs.Screen name="utilities" options={{ title: "Utilities", tabBarLabel: "Utilities" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarLabel: "Profile" }} />
    </Tabs>
  );
}
