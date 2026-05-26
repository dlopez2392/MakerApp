import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
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
import { useSettingsStore } from "../src/core/stores/settingsStore";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const loadSettings = useSettingsStore((s) => s.load);
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const settingsLoaded = useSettingsStore((s) => s.loaded);

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
      loadSettings();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (settingsLoaded && !onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [settingsLoaded, onboardingComplete]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="ai-chat"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="upgrade"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="recipes"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="feedback"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="onboarding"
          options={{ animation: "fade" }}
        />
      </Stack>
    </>
  );
}
