import { useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  FlatList,
  Dimensions,
  type ViewToken,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../src/design-system/hooks/useTheme";
import { useSettingsStore } from "../src/core/stores/settingsStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Slide {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

const SLIDES: Slide[] = [
  {
    title: "Welcome to MakerOS",
    subtitle: "Your maker companion",
    description:
      "Everything you need to run your maker shop — calculators, project tracking, inventory, invoicing, and AI assistance — all in one app.",
    icon: "M",
  },
  {
    title: "Craft Calculators",
    subtitle: "9 modules, 30+ calculators",
    description:
      "Woodworking, laser, CNC, 3D printing, resin, knife, leather, candle, and soap. Save your favorite configurations as reusable recipes.",
    icon: "C",
  },
  {
    title: "Shop Management",
    subtitle: "Projects, clients & invoices",
    description:
      "Track projects from idea to completion. Manage clients, create quotes and invoices, log inventory, and journal your shop time.",
    icon: "S",
  },
  {
    title: "AI Assistant",
    subtitle: "Craft expertise on demand",
    description:
      "Ask questions about your craft, get material recommendations, troubleshoot issues, and get help with calculations — powered by AI that knows your shop context.",
    icon: "A",
  },
  {
    title: "Ready to Make",
    subtitle: "Let's get started",
    description:
      "Head to the Make tab to explore calculators, or set up your shop profile in Settings. You can always revisit this guide from Profile.",
    icon: "G",
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    completeOnboarding();
    router.replace("/");
  };

  const isLast = activeIndex === SLIDES.length - 1;

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 32 }} className="flex-1 justify-center items-center">
      <View
        className="w-24 h-24 rounded-3xl items-center justify-center mb-8"
        style={{ backgroundColor: colors.primary + "20" }}
      >
        <Text
          className="text-[40px]"
          style={{ fontFamily: "Inter_700Bold", color: colors.primary }}
        >
          {item.icon}
        </Text>
      </View>
      <Text
        className="text-[28px] text-center mb-2"
        style={{ fontFamily: "Inter_700Bold", color: colors.textPrimary }}
      >
        {item.title}
      </Text>
      <Text
        className="text-[15px] text-center mb-4"
        style={{ fontFamily: "Inter_600SemiBold", color: colors.primary }}
      >
        {item.subtitle}
      </Text>
      <Text
        className="text-[14px] text-center leading-[22px]"
        style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
      >
        {item.description}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row justify-end p-4">
        {!isLast && (
          <Pressable onPress={handleSkip} className="px-4 py-2">
            <Text
              className="text-[14px]"
              style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
            >
              Skip
            </Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      <View className="items-center pb-8 px-8">
        {/* Dots */}
        <View className="flex-row gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className="rounded-full"
              style={{
                width: i === activeIndex ? 24 : 8,
                height: 8,
                backgroundColor: i === activeIndex ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>

        {/* Next / Get Started button */}
        <Pressable
          onPress={handleNext}
          className="w-full rounded-xl py-4 items-center"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="text-[16px]"
            style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
          >
            {isLast ? "Get Started" : "Next"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
