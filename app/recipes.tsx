import { useState } from "react";
import { SafeAreaView, View, Text, FlatList, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useRecipes } from "../src/core/hooks/useRecipes";
import { FilterBar } from "../src/design-system/components/FilterBar";
import { EmptyState } from "../src/design-system/components/EmptyState";
import { useTheme } from "../src/design-system/hooks/useTheme";
import type { SavedRecipe } from "../src/core/types";

const MODULE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Wood", value: "woodworking" },
  { label: "Laser", value: "laser" },
  { label: "CNC", value: "cnc" },
  { label: "3D Print", value: "printing" },
];

const MODULE_LABELS: Record<string, string> = {
  woodworking: "Woodworking",
  laser: "Laser",
  cnc: "CNC",
  printing: "3D Printing",
  resin: "Resin",
  knife: "Knife",
  leather: "Leather",
  candle: "Candle",
  soap: "Soap",
};

export default function RecipesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { recipes, loading, remove, load } = useRecipes();
  const [moduleFilter, setModuleFilter] = useState("all");

  const filtered = moduleFilter === "all"
    ? recipes
    : recipes.filter((r) => r.module === moduleFilter);

  const handleDelete = (recipe: SavedRecipe) => {
    Alert.alert("Delete Recipe", `Delete "${recipe.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => remove(recipe.id),
      },
    ]);
  };

  const renderRecipe = ({ item }: { item: SavedRecipe }) => (
    <View
      className="rounded-xl p-4 mb-3"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <View className="flex-row justify-between items-center mb-1">
        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: colors.surfaceElevated }}>
          <Text className="text-[11px]" style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}>
            {MODULE_LABELS[item.module] || item.module}
          </Text>
        </View>
        <Text className="text-[11px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
          {item.recipeType}
        </Text>
      </View>
      <Text className="text-[15px] mt-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
        {item.name}
      </Text>
      {item.notes && (
        <Text className="text-[12px] mt-1" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }} numberOfLines={2}>
          {item.notes}
        </Text>
      )}
      <View className="flex-row justify-between items-center mt-3">
        <Text className="text-[11px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Pressable onPress={() => handleDelete(item)} className="px-3 py-1 rounded-lg" style={{ backgroundColor: colors.surfaceElevated }}>
          <Text className="text-[11px]" style={{ fontFamily: "Inter_500Medium", color: "#ef4444" }}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[22px]" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
            Saved Recipes
          </Text>
          <Pressable onPress={() => router.back()} className="px-3 py-2">
            <Text className="text-[14px]" style={{ fontFamily: "Inter_500Medium", color: colors.primary }}>Done</Text>
          </Pressable>
        </View>

        <FilterBar options={MODULE_OPTIONS} selected={moduleFilter} onSelect={setModuleFilter} />

        {filtered.length === 0 && !loading ? (
          <EmptyState
            title="No saved recipes"
            message="Save calculator configurations as reusable recipes from any calculator"
          />
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderRecipe}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
