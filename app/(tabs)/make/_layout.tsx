import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

const { Navigator } = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Navigator);

export default function MakeLayout() {
  const { colors } = useTheme();

  return (
    <TopTabs
      screenOptions={{
        tabBarScrollEnabled: true,
        tabBarStyle: { backgroundColor: colors.background },
        tabBarIndicatorStyle: { backgroundColor: colors.primary, height: 3 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: "Inter_600SemiBold", fontSize: 13, textTransform: "none" },
        tabBarItemStyle: { width: "auto", paddingHorizontal: 16 },
      }}
    >
      <TopTabs.Screen name="woodworking" options={{ title: "Woodworking" }} />
      <TopTabs.Screen name="laser" options={{ title: "Laser" }} />
      <TopTabs.Screen name="cnc" options={{ title: "CNC" }} />
      <TopTabs.Screen name="printing" options={{ title: "3D Print" }} />
      <TopTabs.Screen name="resin" options={{ title: "Resin" }} />
      <TopTabs.Screen name="knife" options={{ title: "Knife" }} />
      <TopTabs.Screen name="leather" options={{ title: "Leather" }} />
      <TopTabs.Screen name="candle" options={{ title: "Candle" }} />
      <TopTabs.Screen name="soap" options={{ title: "Soap" }} />
    </TopTabs>
  );
}
