import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import * as SplashScreen from "expo-splash-screen";
import { initializeDatabase } from "../src/core/database/connection";
import { seedWoodSpecies } from "../src/modules/woodworking/data/seedSpecies";
import { seedLaserMaterials } from "../src/modules/laser/data/seedLaserMaterials";
import { seedCncData } from "../src/modules/cnc/data/seedCncData";
import { seedPrintingData } from "../src/modules/printing/data/seedPrintingData";
import { seedKnifeSteels } from "../src/modules/knife/data/seedKnifeSteels";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      initializeDatabase();
      seedWoodSpecies();
      seedLaserMaterials();
      seedCncData();
      seedPrintingData();
      seedKnifeSteels();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
