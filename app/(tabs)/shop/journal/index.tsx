import { useState } from "react";
import { SafeAreaView, View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useJournal } from "../../../../src/core/hooks/useJournal";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { EmptyState } from "../../../../src/design-system/components/EmptyState";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import type { JournalEntry } from "../../../../src/core/types";

const VIEW_OPTIONS = [
  { label: "Timeline", value: "timeline" },
  { label: "Calendar", value: "calendar" },
];

const MOOD_EMOJI: Record<string, string> = {
  great: "🔥",
  good: "👍",
  okay: "😐",
  rough: "😓",
};

export default function JournalListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { entries, loading } = useJournal();
  const [view, setView] = useState("timeline");

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <Pressable
      onPress={() => router.push(`/shop/journal/${item.id}` as any)}
      className="rounded-xl p-4 mb-3"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-[13px]" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
          {item.entryDate}
        </Text>
        {item.mood && (
          <Text className="text-[16px]">{MOOD_EMOJI[item.mood] || ""}</Text>
        )}
      </View>
      {item.title && (
        <Text className="text-[15px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          {item.title}
        </Text>
      )}
      {item.hoursLogged != null && item.hoursLogged > 0 && (
        <Text className="text-[12px]" style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.primary }}>
          {item.hoursLogged}h logged
        </Text>
      )}
      {item.disciplineTags.length > 0 && (
        <View className="flex-row gap-2 mt-2">
          {item.disciplineTags.map((tag) => (
            <View key={tag} className="rounded-full px-2 py-0.5" style={{ backgroundColor: colors.surfaceElevated }}>
              <Text className="text-[11px]" style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[22px]" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>Journal</Text>
          <Pressable
            onPress={() => router.push("/shop/journal/new" as any)}
            className="rounded-lg px-4 py-2"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-[14px]" style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}>+ Entry</Text>
          </Pressable>
        </View>

        <FilterBar options={VIEW_OPTIONS} selected={view} onSelect={setView} />

        {entries.length === 0 && !loading ? (
          <EmptyState title="No journal entries" message="Start documenting your shop time" />
        ) : (
          <FlatList data={entries} renderItem={renderEntry} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} />
        )}
      </View>
    </SafeAreaView>
  );
}
