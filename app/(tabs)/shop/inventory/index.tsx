import { useState, useMemo } from "react";
import { SafeAreaView, View, Text, FlatList, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useInventory } from "../../../../src/core/hooks/useInventory";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { EmptyState } from "../../../../src/design-system/components/EmptyState";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import type { InventoryItem, InventoryCategory } from "../../../../src/core/types";

const CATEGORY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Woodworking", value: "woodworking" },
  { label: "Laser", value: "laser" },
  { label: "CNC", value: "cnc" },
  { label: "General", value: "general_shop" },
  { label: "Resin", value: "resin" },
];

export default function InventoryListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { items, loading } = useInventory();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    let result = items;
    if (category !== "all") result = result.filter((i) => i.masterCategory === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }
    return result;
  }, [items, category, search]);

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const isLow = item.lowStockThreshold != null && item.quantity <= item.lowStockThreshold;
    return (
      <Pressable
        onPress={() => router.push(`/shop/inventory/${item.id}` as any)}
        className="rounded-xl p-4 mb-3"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: isLow ? "#ef4444" : colors.border }}
      >
        <View className="flex-row justify-between items-center">
          <Text
            className="text-[15px] flex-1"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            className="text-[14px]"
            style={{ fontFamily: "JetBrainsMono_500Medium", color: isLow ? "#ef4444" : colors.textPrimary }}
          >
            {item.quantity} {item.unit}
          </Text>
        </View>
        <Text
          className="text-[12px] mt-1"
          style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
        >
          {item.masterCategory}{item.location ? ` • ${item.location}` : ""}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[22px]" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
            Inventory
          </Text>
          <Pressable
            onPress={() => router.push("/shop/inventory/new" as any)}
            className="rounded-lg px-4 py-2"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-[14px]" style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}>+ Add</Text>
          </Pressable>
        </View>

        <View
          className="rounded-lg px-4 py-3 mb-3"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <TextInput
            className="text-[16px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}
            value={search}
            onChangeText={setSearch}
            placeholder="Search inventory..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <FilterBar options={CATEGORY_OPTIONS} selected={category} onSelect={setCategory} />

        {filtered.length === 0 && !loading ? (
          <EmptyState title="No inventory items" message="Add your first material or supply" />
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
