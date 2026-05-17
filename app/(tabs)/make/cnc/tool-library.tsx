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

interface CncTool {
  id: string;
  name: string;
  tool_type: string;
  cut_direction: string | null;
  diameter_in: number;
  shank_diameter_in: number | null;
  flutes: number;
  tool_material: string;
  max_doc_in: number | null;
  vbit_angle: number | null;
  tip_width_in: number | null;
  notes: string | null;
  source: string;
}

const TYPE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "End Mill", value: "end-mill" },
  { label: "V-Bit", value: "v-bit" },
  { label: "Ball Nose", value: "ball-nose" },
  { label: "Surfacing", value: "surfacing" },
  { label: "Drill", value: "drill" },
];

export default function ToolLibraryScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const tools: CncTool[] = useMemo(() => {
    try {
      const db = getDatabase();
      return db.getAllSync("SELECT * FROM cnc_tools ORDER BY tool_type, name") as CncTool[];
    } catch {
      return [];
    }
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return tools.filter((t) => {
      const matchesType = typeFilter === "all" || t.tool_type === typeFilter;
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.tool_type.toLowerCase().includes(q) ||
        t.tool_material.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [tools, search, typeFilter]);

  const renderItem = ({ item }: { item: CncTool }) => (
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
            {item.tool_type}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-1">
        <Text
          className="text-[13px]"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          {item.diameter_in}" dia · {item.flutes} flute{item.flutes !== 1 ? "s" : ""}
        </Text>
        <Text
          className="text-[13px]"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          {item.tool_material}
        </Text>
        {item.cut_direction ? (
          <Text
            className="text-[13px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            {item.cut_direction}
          </Text>
        ) : null}
        {item.vbit_angle ? (
          <Text
            className="text-[13px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            {item.vbit_angle}° V-angle
          </Text>
        ) : null}
        {item.max_doc_in ? (
          <Text
            className="text-[13px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            Max DOC: {item.max_doc_in}"
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
            Tool Library
          </Text>
          <Text
            className="text-[13px] mb-3"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
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
              placeholder="Search tools..."
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
            options={TYPE_OPTIONS}
            selected={typeFilter}
            onSelect={setTypeFilter}
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
                {tools.length === 0 ? "No tools in library yet." : "No tools match your search."}
              </Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </SafeAreaView>
  );
}
