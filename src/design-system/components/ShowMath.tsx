import { useState, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { useTheme } from "../hooks/useTheme";

export interface MathStepDisplay {
  label: string;
  formula: string;
  result: string;
}

interface ShowMathProps {
  steps: MathStepDisplay[];
}

export function ShowMath({ steps }: ShowMathProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const animHeight = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    Animated.parallel([
      Animated.timing(animHeight, {
        toValue,
        duration: 220,
        useNativeDriver: false,
      }),
      Animated.timing(animOpacity, {
        toValue,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
    setExpanded(!expanded);
  };

  const estimatedHeight = steps.length * 72;

  const heightInterpolation = animHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, estimatedHeight],
  });

  return (
    <View
      className="rounded-lg mt-3"
      style={{
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={toggle}
        className="flex-row justify-between items-center px-4 py-3"
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Hide math" : "Show math"}
        accessibilityState={{ expanded }}
      >
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 13,
            color: colors.primary,
          }}
        >
          {expanded ? "Hide math" : "Show math"}
        </Text>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 13,
            color: colors.primary,
          }}
        >
          {expanded ? "−" : "+"}
        </Text>
      </Pressable>

      <Animated.View
        style={{
          height: heightInterpolation,
          opacity: animOpacity,
          overflow: "hidden",
        }}
      >
        <View className="px-4 pb-3">
          {steps.map((step, i) => (
            <View
              key={i}
              className={i > 0 ? "mt-4" : ""}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 11,
                  color: colors.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 2,
                }}
              >
                {step.label}
              </Text>
              <Text
                style={{
                  fontFamily: "JetBrainsMono_500Medium",
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginBottom: 1,
                }}
              >
                {step.formula}
              </Text>
              <Text
                style={{
                  fontFamily: "JetBrainsMono_700Bold",
                  fontSize: 14,
                  color: colors.textPrimary,
                }}
              >
                {"= "}{step.result}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}
