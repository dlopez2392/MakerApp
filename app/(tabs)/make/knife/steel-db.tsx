import { useState, useMemo } from "react";
import { SafeAreaView, FlatList, Text, View, TextInput } from "react-native";
import { steelData } from "../../../../src/modules/knife/data/steelDatabase";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import type { KnifeSteel } from "../../../../src/modules/knife/data/steelDatabase";

const CATEGORY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Carbon", value: "carbon" },
  { label: "Tool", value: "tool" },
  { label: "Stainless", value: "stainless" },
];

const CATEGORY_COLORS: Record<string, string> = {
  carbon: "#f59e0b",
  tool: "#ef4444",
  stainless: "#3b82f6",
};

export default function SteelDBScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    let rows = steelData;

    if (category !== "all") {
      rows = rows.filter((r) => r.category === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.quenchMedium.toLowerCase().includes(q) ||
          (r.notes ?? "").toLowerCase().includes(q),
      );
    }

    return rows;
  }, [search, category]);

  const renderItem = ({ item }: { item: KnifeSteel }) => {
    const catColor = CATEGORY_COLORS[item.category] ?? colors.primary;
    return (
      <View
        className="rounded-xl p-4 mb-3"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        <View className="flex-row justify-between items-center mb-1">
          <Text
            className="text-[16px]"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
          >
            {item.name}
          </Text>
          <View
            className="rounded-full px-2 py-1"
            style={{ backgroundColor: catColor + "20" }}
          >
            <Text
              className="text-[11px]"
              style={{ fontFamily: "Inter_500Medium", color: catColor }}
            >
              {item.category}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-4 mt-2">
          <View>
            <Text
              className="text-[11px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
            >
              Harden
            </Text>
            <Text
              className="text-[14px]"
              style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
            >
              {item.hardenTempF}°F
            </Text>
          </View>
          <View>
            <Text
              className="text-[11px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
            >
              Quench
            </Text>
            <Text
              className="text-[14px]"
              style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
            >
              {item.quenchMedium}
            </Text>
          </View>
          <View>
            <Text
              className="text-[11px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
            >
              HRC
            </Text>
            <Text
              className="text-[14px]"
              style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
            >
              {item.rockwellLow}–{item.rockwellHigh}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 mt-2">
          <Text
            className="text-[12px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            Temper: {item.temperLowF}–{item.temperHighF}°F
          </Text>
          <Text
            className="text-[12px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            Soak: {item.soakMinutes}min
          </Text>
        </View>

        {item.normalizeTempF !== null && (
          <Text
            className="text-[12px] mt-1"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            Normalize: {item.normalizeTempF}°F ({item.normalizeCycles} cycles)
          </Text>
        )}

        {item.notes && (
          <Text
            className="text-[12px] italic mt-2"
            style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
          >
            {item.notes}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 p-4">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Steel Database
        </Text>
        <Text
          className="text-[13px] mb-3"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          {filtered.length} {filtered.length === 1 ? "steel" : "steels"}
        </Text>

        <View
          className="rounded-lg px-4 py-3 mb-3"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <TextInput
            className="text-[16px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}
            value={search}
            onChangeText={setSearch}
            placeholder="Search steels, quench, notes..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <FilterBar options={CATEGORY_OPTIONS} selected={category} onSelect={setCategory} />

        {filtered.length === 0 ? (
          <View
            className="rounded-xl p-4 mt-4 items-center justify-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}
          >
            <Text
              className="text-[13px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              No steels found
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={(item) => item.name}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
