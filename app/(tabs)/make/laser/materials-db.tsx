import { useState, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
} from "react-native";
import { getDatabase } from "../../../../src/core/database/connection";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const CATEGORY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Wood", value: "Wood" },
  { label: "Acrylic", value: "Acrylic" },
  { label: "Leather", value: "Leather" },
  { label: "Paper", value: "Paper" },
  { label: "Fabric", value: "Fabric" },
  { label: "Glass", value: "Glass" },
  { label: "Metal", value: "Metal" },
  { label: "Other", value: "Other" },
];

const OPERATION_COLORS: Record<string, string> = {
  cut: "#ef4444",
  engrave: "#f59e0b",
  score: "#10b981",
};

interface LaserMaterial {
  id: string;
  category: string;
  material_name: string;
  brand: string | null;
  thickness_mm: number;
  operation: string;
  power_pct: number;
  speed_mms: number;
  passes: number;
  laser_wattage: number;
  notes: string | null;
}

function loadMaterials(): LaserMaterial[] {
  try {
    const db = getDatabase();
    return db.getAllSync(
      "SELECT id, category, material_name, brand, thickness_mm, operation, power_pct, speed_mms, passes, laser_wattage, notes FROM laser_materials ORDER BY category, material_name",
    ) as LaserMaterial[];
  } catch {
    return [];
  }
}

export default function MaterialsDBScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const allMaterials = useMemo(() => loadMaterials(), []);

  const filtered = useMemo(() => {
    let rows = allMaterials;

    if (category !== "all") {
      rows = rows.filter((r) => r.category === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.material_name.toLowerCase().includes(q) ||
          (r.brand ?? "").toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.operation.toLowerCase().includes(q),
      );
    }

    return rows;
  }, [allMaterials, search, category]);

  const renderItem = ({ item }: { item: LaserMaterial }) => {
    const opColor = OPERATION_COLORS[item.operation] ?? colors.primary;
    return (
      <View
        className="rounded-xl p-4 mb-3"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-1 mr-2">
            <Text
              className="text-[16px]"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
            >
              {item.material_name}
            </Text>
            {item.brand && (
              <Text
                className="text-[12px]"
                style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
              >
                {item.brand}
              </Text>
            )}
          </View>
          <View
            className="rounded-full px-2 py-1"
            style={{ backgroundColor: opColor + "20" }}
          >
            <Text
              className="text-[11px]"
              style={{ fontFamily: "Inter_500Medium", color: opColor }}
            >
              {item.operation}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-4 mt-2">
          <Text
            className="text-[13px]"
            style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
          >
            {item.power_pct}%
          </Text>
          <Text
            className="text-[13px]"
            style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
          >
            {item.speed_mms}mm/s
          </Text>
          <Text
            className="text-[13px]"
            style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
          >
            {item.passes}x
          </Text>
        </View>

        <View className="flex-row gap-3 mt-1">
          <Text
            className="text-[12px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            {item.thickness_mm}mm
          </Text>
          <Text
            className="text-[12px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            {item.laser_wattage}W
          </Text>
          <Text
            className="text-[12px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            {item.category}
          </Text>
        </View>

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
          Material Database
        </Text>
        <Text
          className="text-[13px] mb-3"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          {filtered.length} {filtered.length === 1 ? "material" : "materials"}
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
            placeholder="Search materials, brand, operation..."
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
              No materials found
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
