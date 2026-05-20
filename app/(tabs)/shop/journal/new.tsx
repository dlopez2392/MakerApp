import { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useJournal } from "../../../../src/core/hooks/useJournal";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { UpgradeModal } from "../../../../src/design-system/components/UpgradeModal";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import type { Discipline, Mood } from "../../../../src/core/types";

const DISCIPLINE_OPTIONS: { label: string; value: Discipline }[] = [
  { label: "Woodworking", value: "woodworking" },
  { label: "Laser", value: "laser" },
  { label: "CNC", value: "cnc" },
  { label: "3D Print", value: "3d-print" },
  { label: "Resin", value: "resin" },
  { label: "Knife", value: "knife" },
  { label: "Leather", value: "leather" },
  { label: "Candle", value: "candle" },
  { label: "Soap", value: "soap" },
  { label: "Mixed", value: "mixed" },
];

const MOOD_OPTIONS: { label: string; emoji: string; value: Mood }[] = [
  { label: "Great", emoji: "\u{1F525}", value: "great" },
  { label: "Good", emoji: "\u{1F44D}", value: "good" },
  { label: "Okay", emoji: "\u{1F610}", value: "okay" },
  { label: "Rough", emoji: "\u{1F613}", value: "rough" },
];

export default function NewJournalEntryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { create, limitReached } = useJournal();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [hoursLogged, setHoursLogged] = useState("");
  const [mood, setMood] = useState<Mood | undefined>(undefined);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [machineUsed, setMachineUsed] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const toggleDiscipline = (d: Discipline) => {
    setDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Required", "Entry title is required.");
      return;
    }

    const entry = create({
      entryDate: new Date().toISOString().split("T")[0],
      title: title.trim(),
      bodyRichText: body.trim() || undefined,
      disciplineTags: disciplines,
      projectIds: [],
      hoursLogged: hoursLogged ? parseFloat(hoursLogged) : undefined,
      mood,
      machineUsed: machineUsed.trim() || undefined,
      photoUrls: [],
    });

    if (entry) {
      router.back();
    } else if (limitReached) {
      setShowUpgrade(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-6"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          New Journal Entry
        </Text>

        {/* Title */}
        <Text
          className="text-[14px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
        >
          Title
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.textPrimary,
            fontFamily: "Inter_400Regular",
          }}
          value={title}
          onChangeText={setTitle}
          placeholder="Entry title"
          placeholderTextColor={colors.textMuted}
        />

        {/* Body */}
        <Text
          className="text-[14px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
        >
          Notes
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.textPrimary,
            fontFamily: "Inter_400Regular",
            minHeight: 150,
            textAlignVertical: "top",
          }}
          value={body}
          onChangeText={setBody}
          placeholder="What did you work on today?"
          placeholderTextColor={colors.textMuted}
          multiline
        />

        {/* Hours Logged */}
        <CalculatorInput
          label="Hours Logged (optional)"
          value={hoursLogged}
          onChangeText={setHoursLogged}
          unit="hrs"
          placeholder="0"
        />

        {/* Mood */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Mood
        </Text>
        <View className="flex-row gap-2 mb-4">
          {MOOD_OPTIONS.map((m) => {
            const isActive = mood === m.value;
            return (
              <Pressable
                key={m.value}
                onPress={() => setMood(isActive ? undefined : m.value)}
                className="flex-1 rounded-xl py-3 items-center"
                style={{
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: isActive ? colors.primary : colors.border,
                }}
              >
                <Text className="text-[20px] mb-1">{m.emoji}</Text>
                <Text
                  className="text-[11px]"
                  style={{
                    fontFamily: "Inter_500Medium",
                    color: isActive ? "#0f0f1a" : colors.textSecondary,
                  }}
                >
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Disciplines */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Disciplines
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {DISCIPLINE_OPTIONS.map((d) => {
            const isActive = disciplines.includes(d.value);
            return (
              <Pressable
                key={d.value}
                onPress={() => toggleDiscipline(d.value)}
                className="rounded-full px-3 py-2"
                style={{
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: isActive ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="text-[13px]"
                  style={{
                    fontFamily: "Inter_500Medium",
                    color: isActive ? "#0f0f1a" : colors.textSecondary,
                  }}
                >
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Machine Used */}
        <Text
          className="text-[14px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
        >
          Machine Used (optional)
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.textPrimary,
            fontFamily: "Inter_400Regular",
          }}
          value={machineUsed}
          onChangeText={setMachineUsed}
          placeholder="e.g. Glowforge, Prusa MK4"
          placeholderTextColor={colors.textMuted}
        />

        {/* Save */}
        <Pressable
          onPress={handleSave}
          className="rounded-xl py-4 items-center mt-6"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="text-[16px]"
            style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
          >
            Save Entry
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()} className="items-center mt-4 py-3">
          <Text
            className="text-[14px]"
            style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
          >
            Cancel
          </Text>
        </Pressable>

        <View className="h-8" />
      </ScrollView>

      <UpgradeModal
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="journal entries"
      />
    </SafeAreaView>
  );
}
