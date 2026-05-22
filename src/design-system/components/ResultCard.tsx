import { View, Text } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { useTheme } from "../hooks/useTheme";

interface ResultItem {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}

interface ResultCardProps {
  title?: string;
  results: ResultItem[];
}

export function ResultCard({ title, results }: ResultCardProps) {
  const { colors } = useTheme();
  const prevResults = useRef(results);

  useEffect(() => {
    if (JSON.stringify(prevResults.current) !== JSON.stringify(results)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      prevResults.current = results;
    }
  }, [results]);

  return (
    <Animated.View
      entering={FadeInUp.duration(200).springify()}
      className="rounded-xl p-4 mt-4"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      {title && (
        <Text
          className="text-[13px] mb-3 uppercase tracking-wider"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
        >
          {title}
        </Text>
      )}
      {results.map((item, i) => (
        <View
          key={i}
          className={`flex-row justify-between items-baseline ${i > 0 ? "mt-3" : ""}`}
          accessible
          accessibilityLabel={`${item.label}: ${item.value}${item.unit ? ` ${item.unit}` : ""}`}
        >
          <Text
            className="text-[13px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            {item.label}
          </Text>
          <View className="flex-row items-baseline">
            <Text
              className={item.highlight ? "text-[36px]" : "text-[28px]"}
              style={{
                fontFamily: "JetBrainsMono_700Bold",
                color: item.highlight ? colors.primary : colors.textPrimary,
              }}
            >
              {item.value}
            </Text>
            {item.unit && (
              <Text
                className="text-[13px] ml-1"
                style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
              >
                {item.unit}
              </Text>
            )}
          </View>
        </View>
      ))}
    </Animated.View>
  );
}
