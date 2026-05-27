import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { calculatePotLife } from "../../../../src/modules/resin/calculators/potLife";
import type { ResinType } from "../../../../src/modules/resin/calculators/potLife";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const RESIN_TYPE_OPTIONS = [
  { label: "Standard Epoxy", value: "standard-epoxy" },
  { label: "Fast-Set", value: "fast-set-epoxy" },
  { label: "Polyester", value: "polyester" },
  { label: "Polyurethane", value: "polyurethane" },
];

const TEMP_UNIT_OPTIONS = [
  { label: "°F", value: "F" },
  { label: "°C", value: "C" },
];

type TimerState = "idle" | "running" | "paused";

export default function PotLifeScreen() {
  const { colors } = useTheme();

  const [resinType, setResinType] = useState<ResinType>("standard-epoxy");
  const [tempUnit, setTempUnit] = useState<"F" | "C">("F");
  const [ambientTemp, setAmbientTemp] = useState("72");
  const [batchVolume, setBatchVolume] = useState("100");

  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const totalSecondsRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const haptic75Ref = useRef(false);
  const haptic90Ref = useRef(false);

  const results = useMemo(() => {
    const temp = parseFloat(ambientTemp);
    const vol = parseFloat(batchVolume);
    if (!temp || !vol || vol <= 0) return null;
    return calculatePotLife({ resinType, ambientTemp: temp, tempUnit, batchVolumeMl: vol });
  }, [resinType, ambientTemp, tempUnit, batchVolume]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    const fmt = (min: number) => min >= 60 ? `${(min / 60).toFixed(1)} hr` : `${min} min`;
    return [
      { label: "Working Time", value: fmt(results.adjustedPotLifeMin), highlight: true },
      { label: "Gel Time", value: fmt(results.gelTimeMin) },
      { label: "Demold Time", value: fmt(results.demoldTimeMin) },
      { label: "Full Cure", value: fmt(results.fullCureTimeMin) },
    ];
  }, [results]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  useEffect(() => { return clearTimer; }, [clearTimer]);

  const tick = useCallback(() => {
    setSecondsRemaining((prev) => {
      if (prev <= 1) {
        clearTimer();
        setTimerState("idle");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return 0;
      }
      const next = prev - 1;
      const elapsed = totalSecondsRef.current - next;
      const pct = elapsed / totalSecondsRef.current;
      if (pct >= 0.75 && !haptic75Ref.current) { haptic75Ref.current = true; Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); }
      if (pct >= 0.90 && !haptic90Ref.current) { haptic90Ref.current = true; Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); }
      return next;
    });
  }, [clearTimer]);

  const startTimer = () => {
    if (!results) return;
    const totalSec = Math.round(results.adjustedPotLifeMin * 60);
    totalSecondsRef.current = totalSec;
    haptic75Ref.current = false;
    haptic90Ref.current = false;
    setSecondsRemaining(totalSec);
    setTimerState("running");
    clearTimer();
    intervalRef.current = setInterval(tick, 1000);
  };

  const pauseTimer = () => { clearTimer(); setTimerState("paused"); };
  const resumeTimer = () => {
    setTimerState("running");
    intervalRef.current = setInterval(tick, 1000);
  };
  const resetTimer = () => { clearTimer(); setTimerState("idle"); setSecondsRemaining(0); };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPct = totalSecondsRef.current > 0
    ? (totalSecondsRef.current - secondsRemaining) / totalSecondsRef.current
    : 0;

  const progressColor = progressPct < 0.75 ? colors.success : progressPct < 0.90 ? colors.warning : colors.danger;

  const handleSave = () => {
    if (!results) { Alert.alert("No Results", "Enter valid inputs to save."); return; }
    try {
      CalculatorService.save({
        module: "resin",
        calculatorType: "pot-life",
        inputsJson: { resinType, ambientTemp, tempUnit, batchVolume },
        outputsJson: results,
        label: `${results.adjustedPotLifeMin} min pot life — ${RESIN_TYPE_OPTIONS.find(o => o.value === resinType)?.label}`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch { Alert.alert("Error", "Failed to save result."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          Pot Life Timer
        </Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>
          Temperature and mass-adjusted working time with countdown
        </Text>

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
          Resin Type
        </Text>
        <FilterBar options={RESIN_TYPE_OPTIONS} selected={resinType} onSelect={(v) => setResinType(v as ResinType)} />

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
          Temperature Unit
        </Text>
        <FilterBar options={TEMP_UNIT_OPTIONS} selected={tempUnit} onSelect={(v) => setTempUnit(v as "F" | "C")} />

        <CalculatorInput label="Ambient Temperature" value={ambientTemp} onChangeText={setAmbientTemp} unit={`°${tempUnit}`} placeholder="72" />
        <CalculatorInput label="Batch Volume" value={batchVolume} onChangeText={setBatchVolume} unit="ml" placeholder="100" />

        {results && (
          <ResultCard title="Cure Stages" results={resultItems} />
        )}

        {results && (
          <View className="rounded-xl p-4 mt-4 items-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <Text className="text-[48px]" style={{ fontFamily: "JetBrainsMono_700Bold", color: timerState === "idle" && secondsRemaining === 0 ? colors.textMuted : progressColor }}>
              {timerState === "idle" && secondsRemaining === 0 ? formatTime(Math.round(results.adjustedPotLifeMin * 60)) : formatTime(secondsRemaining)}
            </Text>

            <View className="w-full h-3 rounded-full mt-3 overflow-hidden" style={{ backgroundColor: colors.border }}>
              <View style={{ width: `${Math.min(progressPct * 100, 100)}%`, height: "100%", backgroundColor: progressColor, borderRadius: 9999 }} />
            </View>

            <View className="flex-row gap-3 mt-4">
              {timerState === "idle" && (
                <Pressable onPress={startTimer} className="px-6 py-3 rounded-lg" style={{ backgroundColor: colors.success }} accessibilityLabel="Start timer" accessibilityRole="button">
                  <Text className="text-[14px]" style={{ fontFamily: "Inter_600SemiBold", color: "#fff" }}>Start</Text>
                </Pressable>
              )}
              {timerState === "running" && (
                <>
                  <Pressable onPress={pauseTimer} className="px-6 py-3 rounded-lg" style={{ backgroundColor: colors.warning }} accessibilityLabel="Pause timer" accessibilityRole="button">
                    <Text className="text-[14px]" style={{ fontFamily: "Inter_600SemiBold", color: "#fff" }}>Pause</Text>
                  </Pressable>
                  <Pressable onPress={resetTimer} className="px-6 py-3 rounded-lg" style={{ backgroundColor: colors.danger }} accessibilityLabel="Reset timer" accessibilityRole="button">
                    <Text className="text-[14px]" style={{ fontFamily: "Inter_600SemiBold", color: "#fff" }}>Reset</Text>
                  </Pressable>
                </>
              )}
              {timerState === "paused" && (
                <>
                  <Pressable onPress={resumeTimer} className="px-6 py-3 rounded-lg" style={{ backgroundColor: colors.success }} accessibilityLabel="Resume timer" accessibilityRole="button">
                    <Text className="text-[14px]" style={{ fontFamily: "Inter_600SemiBold", color: "#fff" }}>Resume</Text>
                  </Pressable>
                  <Pressable onPress={resetTimer} className="px-6 py-3 rounded-lg" style={{ backgroundColor: colors.danger }} accessibilityLabel="Reset timer" accessibilityRole="button">
                    <Text className="text-[14px]" style={{ fontFamily: "Inter_600SemiBold", color: "#fff" }}>Reset</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        )}

        {!results && (
          <View className="rounded-xl p-4 mt-4 items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
              Enter temperature and batch volume to calculate pot life
            </Text>
          </View>
        )}

        <ActionBar onSaveToHistory={handleSave} onAddToQuote={() => Alert.alert("Coming Soon", "Quote feature coming soon.")} onLogToProject={() => Alert.alert("Coming Soon", "Project logging coming soon.")} />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
