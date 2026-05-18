import { useState, useMemo } from "react";
import {
  SafeAreaView,
  FlatList,
  Text,
  View,
  TextInput,
} from "react-native";
import { getDatabase } from "../../../../src/core/database/connection";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

interface FilamentRow {
  id: string;
  category: string;
  name: string;
  print_temp_low: number;
  print_temp_high: number;
  bed_temp_low: number;
  bed_temp_high: number;
  max_flow_rate: number;
  density: number;
  retraction_dist_bowden: number;
  retraction_dist_direct: number;
  retraction_speed: number;
  cost_per_kg: number | null;
  notes: string | null;
  source: string;
}

const CATEGORY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "PLA", value: "PLA" },
  { label: "PETG", value: "PETG" },
  { label: "ABS", value: "ABS" },
  { label: "TPU", value: "TPU" },
];

export default function FilamentDbScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filaments: FilamentRow[] = useMemo(() => {
    try {
      const db = getDatabase();
      return db.getAllSync(
        "SELECT * FROM printing_filaments ORDER BY category, name"
      ) as FilamentRow[];
    } catch {
      return [];
    }
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return filaments.filter((f) => {
      const matchesCategory = categoryFilter === "all" || f.category === categoryFilter;
      const matchesSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        (f.notes ?? "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [filaments, search, categoryFilter]);

  const renderItem = ({ item }: { item: FilamentRow }) => (
    <View
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text
          className="text-[15px] flex-1 mr-2"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View
          className="rounded-full px-2 py-0.5"
          style={{ backgroundColor: colors.surfaceElevated }}
        >
          <Text
            className="text-[11px]"
            style={{ fontFamily: "Inter_500Medium", color: colors.primary }}
          >
            {item.category}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-1">
        <Text
          className="text-[13px]"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Print: {item.print_temp_low}–{item.print_temp_high}°C
        </Text>
        <Text
          className="text-[13px]"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Bed: {item.bed_temp_low}–{item.bed_temp_high}°C
        </Text>
        <Text
          className="text-[13px]"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Max flow: {item.max_flow_rate} mm³/s
        </Text>
        <Text
          className="text-[13px]"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Density: {item.density} g/cm³
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-1">
        <Text
          className="text-[12px]"
          style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
        >
          Retract direct: {item.retraction_dist_direct}mm
        </Text>
        <Text
          className="text-[12px]"
          style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
        >
          Bowden: {item.retraction_dist_bowden}mm
        </Text>
        <Text
          className="text-[12px]"
          style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
        >
          Speed: {item.retraction_speed}mm/s
        </Text>
        {item.cost_per_kg !== null ? (
          <Text
            className="text-[12px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
          >
            ~${item.cost_per_kg}/kg
          </Text>
        ) : null}
      </View>

      {item.notes ? (
        <Text
          className="text-[12px] mt-2"
          style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
          numberOfLines={2}
        >
          {item.notes}
        </Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1">
        <View className="px-4 pt-4 pb-2">
          <Text
            className="text-[22px] mb-1"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
          >
            Filament Database
          </Text>
          <Text
            className="text-[13px] mb-3"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            {filtered.length} filament{filtered.length !== 1 ? "s" : ""}
          </Text>

          <View
            className="rounded-xl px-3 py-2 mb-3 flex-row items-center"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search filaments..."
              placeholderTextColor={colors.textMuted}
              style={{
                flex: 1,
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: colors.textPrimary,
              }}
            />
          </View>

          <FilterBar
            options={CATEGORY_OPTIONS}
            selected={categoryFilter}
            onSelect={setCategoryFilter}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <Text
                className="text-[14px]"
                style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
              >
                {filaments.length === 0
                  ? "No filaments in database yet."
                  : "No filaments match your search."}
              </Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </SafeAreaView>
  );
}
