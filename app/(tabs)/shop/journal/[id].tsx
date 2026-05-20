import { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useJournal } from "../../../../src/core/hooks/useJournal";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
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

function getMoodDisplay(mood?: Mood): string {
  const found = MOOD_OPTIONS.find((m) => m.value === mood);
  return found ? `${found.emoji} ${found.label}` : "---";
}

export default function JournalEntryDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, update, remove } = useJournal();

  const entry = entries.find((e) => e.id === id);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(entry?.title ?? "");
  const [body, setBody] = useState(entry?.bodyRichText ?? "");
  const [hoursLogged, setHoursLogged] = useState(entry?.hoursLogged?.toString() ?? "");
  const [mood, setMood] = useState<Mood | undefined>(entry?.mood);
  const [disciplines, setDisciplines] = useState<Discipline[]>(entry?.disciplineTags ?? []);
  const [machineUsed, setMachineUsed] = useState(entry?.machineUsed ?? "");

  if (!entry) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center p-4">
          <Text
            className="text-[16px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
          >
            Entry not found.
          </Text>
          <Pressable onPress={() => router.back()} className="mt-4 py-3 px-6">
            <Text
              className="text-[14px]"
              style={{ fontFamily: "Inter_500Medium", color: colors.primary }}
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const toggleDiscipline = (d: Discipline) => {
    setDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleSave = () => {
    update(entry.id, {
      title: title.trim() || undefined,
      bodyRichText: body.trim() || undefined,
      disciplineTags: disciplines,
      hoursLogged: hoursLogged ? parseFloat(hoursLogged) : undefined,
      mood,
      machineUsed: machineUsed.trim() || undefined,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this journal entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          remove(entry.id);
          router.back();
        },
      },
    ]);
  };

  const handleCancelEdit = () => {
    setTitle(entry.title ?? "");
    setBody(entry.bodyRichText ?? "");
    setHoursLogged(entry.hoursLogged?.toString() ?? "");
    setMood(entry.mood);
    setDisciplines(entry.disciplineTags ?? []);
    setMachineUsed(entry.machineUsed ?? "");
    setEditing(false);
  };

  // --- Read-only view ---
  if (!editing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView className="flex-1 p-4">
          {/* Date */}
          <Text
            className="text-[13px] mb-1"
            style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
          >
            {entry.entryDate}
          </Text>

          {/* Title */}
          <Text
            className="text-[22px] mb-4"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
          >
            {entry.title || "Untitled Entry"}
          </Text>

          {/* Mood */}
          {entry.mood && (
            <View className="flex-row items-center mb-3">
              <Text
                className="text-[13px] mr-2"
                style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
              >
                Mood:
              </Text>
              <Text
                className="text-[15px]"
                style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
              >
                {getMoodDisplay(entry.mood)}
              </Text>
            </View>
          )}

          {/* Hours */}
          {entry.hoursLogged != null && (
            <View className="flex-row items-center mb-3">
              <Text
                className="text-[13px] mr-2"
                style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
              >
                Hours:
              </Text>
              <Text
                className="text-[15px]"
                style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.primary }}
              >
                {entry.hoursLogged} hrs
              </Text>
            </View>
          )}

          {/* Disciplines */}
          {entry.disciplineTags.length > 0 && (
            <View className="mb-3">
              <Text
                className="text-[13px] mb-1"
                style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
              >
                Disciplines
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {entry.disciplineTags.map((d) => {
                  const opt = DISCIPLINE_OPTIONS.find((o) => o.value === d);
                  return (
                    <View
                      key={d}
                      className="rounded-full px-3 py-1"
                      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
                    >
                      <Text
                        className="text-[12px]"
                        style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
                      >
                        {opt?.label ?? d}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Machine Used */}
          {entry.machineUsed && (
            <View className="flex-row items-center mb-3">
              <Text
                className="text-[13px] mr-2"
                style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
              >
                Machine:
              </Text>
              <Text
                className="text-[15px]"
                style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}
              >
                {entry.machineUsed}
              </Text>
            </View>
          )}

          {/* Body */}
          {entry.bodyRichText && (
            <View
              className="rounded-lg p-4 mt-2 mb-4"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            >
              <Text
                className="text-[15px] leading-[22px]"
                style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}
              >
                {entry.bodyRichText}
              </Text>
            </View>
          )}

          {/* Action buttons */}
          <Pressable
            onPress={() => setEditing(true)}
            className="rounded-xl py-4 items-center mt-6"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="text-[16px]"
              style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
            >
              Edit Entry
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDelete}
            className="rounded-xl py-4 items-center mt-3"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: "#ef4444" }}
          >
            <Text
              className="text-[16px]"
              style={{ fontFamily: "Inter_600SemiBold", color: "#ef4444" }}
            >
              Delete Entry
            </Text>
          </Pressable>

          <Pressable onPress={() => router.back()} className="items-center mt-4 py-3">
            <Text
              className="text-[14px]"
              style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
            >
              Back
            </Text>
          </Pressable>

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Edit mode ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-6"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Edit Entry
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
          placeholder="What did you work on?"
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
            Save Changes
          </Text>
        </Pressable>

        <Pressable onPress={handleCancelEdit} className="items-center mt-4 py-3">
          <Text
            className="text-[14px]"
            style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
          >
            Cancel
          </Text>
        </Pressable>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
