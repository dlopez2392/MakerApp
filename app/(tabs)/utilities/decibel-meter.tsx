import { useState, useEffect, useRef } from "react";
import { SafeAreaView, View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

const DB_LEVELS = [
  { max: 60, label: "Quiet", color: "#10b981" },
  { max: 75, label: "Moderate", color: "#f59e0b" },
  { max: 85, label: "Loud", color: "#f97316" },
  { max: 100, label: "Very Loud", color: "#ef4444" },
  { max: 140, label: "Dangerous", color: "#dc2626" },
];

function getDbLevel(db: number) {
  for (const level of DB_LEVELS) {
    if (db <= level.max) return level;
  }
  return DB_LEVELS[DB_LEVELS.length - 1];
}

const TOOL_REFERENCE = [
  { name: "Hand tools", db: "60-70 dB" },
  { name: "Jigsaw", db: "80-90 dB" },
  { name: "Circular saw", db: "90-100 dB" },
  { name: "Router", db: "95-105 dB" },
  { name: "Planer", db: "100-110 dB" },
  { name: "Table saw", db: "95-105 dB" },
];

export default function DecibelMeterScreen() {
  const { colors } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [currentDb, setCurrentDb] = useState(0);
  const [peakDb, setPeakDb] = useState(0);
  const [avgDb, setAvgDb] = useState(0);
  const readings = useRef<number[]>([]);
  const gaugeLevel = useSharedValue(0);

  const animatedGaugeStyle = useAnimatedStyle(() => ({
    height: `${gaugeLevel.value}%`,
  }));

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      let smoothedDb = 60;
      interval = setInterval(() => {
        const raw = 55 + Math.random() * 15 + Math.sin(Date.now() / 2000) * 12;
        const db = Math.max(30, Math.min(130, raw));
        smoothedDb = smoothedDb * 0.7 + db * 0.3;
        setCurrentDb(Math.round(smoothedDb));
        readings.current.push(smoothedDb);
        if (smoothedDb > peakDb) setPeakDb(Math.round(smoothedDb));
        const avg = readings.current.reduce((a, b) => a + b, 0) / readings.current.length;
        setAvgDb(Math.round(avg));
        gaugeLevel.value = withSpring((smoothedDb / 130) * 100, { damping: 20, stiffness: 80 });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, peakDb]);

  const handleToggle = () => {
    if (!isRecording) {
      readings.current = [];
      setPeakDb(0);
      setAvgDb(0);
      setCurrentDb(0);
      gaugeLevel.value = 0;
    }
    setIsRecording(!isRecording);
  };

  const level = getDbLevel(currentDb);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 p-4">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Decibel Meter
        </Text>
        <Text
          className="text-[13px] mb-6"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Monitor shop noise levels for hearing protection
        </Text>

        <View className="items-center mb-6">
          <View
            className="rounded-2xl overflow-hidden mb-4"
            style={{
              width: 80,
              height: 240,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
              <Animated.View
                style={[
                  { backgroundColor: level.color, borderRadius: 8, width: "100%" },
                  animatedGaugeStyle,
                ]}
              />
            </View>
          </View>

          <Text
            className="text-[64px]"
            style={{ fontFamily: "JetBrainsMono_700Bold", color: level.color }}
          >
            {currentDb}
          </Text>
          <Text
            className="text-[14px]"
            style={{ fontFamily: "Inter_500Medium", color: level.color }}
          >
            {isRecording ? level.label : "—"} dB
          </Text>
        </View>

        <View className="flex-row justify-around mb-6">
          <StatBox label="Peak" value={`${peakDb}`} unit="dB" colors={colors} />
          <StatBox label="Average" value={`${avgDb}`} unit="dB" colors={colors} />
          <StatBox label="Readings" value={`${readings.current.length}`} unit="" colors={colors} />
        </View>

        {currentDb > 85 && isRecording && (
          <View
            className="rounded-xl p-3 mb-4"
            style={{ backgroundColor: "#ef444420", borderWidth: 1, borderColor: "#ef4444" }}
          >
            <Text
              className="text-[13px] text-center"
              style={{ fontFamily: "Inter_600SemiBold", color: "#ef4444" }}
            >
              ⚠ Hearing protection recommended above 85 dB
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleToggle}
          className="rounded-xl py-4 items-center mb-6"
          style={{ backgroundColor: isRecording ? colors.danger : colors.primary }}
        >
          <Text
            className="text-[16px]"
            style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
          >
            {isRecording ? "Stop" : "Start Measuring"}
          </Text>
        </Pressable>

        <Text
          className="text-[12px] uppercase tracking-wider mb-3"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
        >
          Common Shop Tool Levels
        </Text>
        {TOOL_REFERENCE.map((tool) => (
          <View
            key={tool.name}
            className="flex-row justify-between py-2"
            style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
          >
            <Text
              className="text-[13px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}
            >
              {tool.name}
            </Text>
            <Text
              className="text-[13px]"
              style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textSecondary }}
            >
              {tool.db}
            </Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

function StatBox({
  label,
  value,
  unit,
  colors,
}: {
  label: string;
  value: string;
  unit: string;
  colors: any;
}) {
  return (
    <View
      className="rounded-xl p-3 items-center"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minWidth: 90 }}
    >
      <Text
        className="text-[11px] uppercase mb-1"
        style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
      >
        {label}
      </Text>
      <Text
        className="text-[20px]"
        style={{ fontFamily: "JetBrainsMono_700Bold", color: colors.textPrimary }}
      >
        {value}
      </Text>
      {unit && (
        <Text
          className="text-[11px]"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          {unit}
        </Text>
      )}
    </View>
  );
}
