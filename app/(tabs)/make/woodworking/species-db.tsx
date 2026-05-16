import { useState, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { woodSpeciesData, type WoodSpecies, type PriceTier } from "../../../../src/modules/woodworking/data/woodSpecies";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Domestic", value: "domestic" },
  { label: "Exotic", value: "exotic" },
  { label: "Budget", value: "budget" },
  { label: "Premium", value: "premium" },
];

const PRICE_COLORS: Record<PriceTier, string> = {
  budget: "#10b981",
  moderate: "#f59e0b",
  premium: "#f97316",
  exotic: "#ef4444",
};

function formatFraction(label: string, value: number): string {
  return `${label}: ${value}%`;
}

export default function SpeciesDBScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedSpecies, setSelectedSpecies] = useState<WoodSpecies | null>(null);

  const filteredSpecies = useMemo(() => {
    let results = woodSpeciesData;

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (s) =>
          s.commonName.toLowerCase().includes(q) ||
          s.botanicalName.toLowerCase().includes(q) ||
          s.typicalUses.some((u) => u.toLowerCase().includes(q))
      );
    }

    switch (filter) {
      case "domestic":
        results = results.filter((s) => s.domestic);
        break;
      case "exotic":
        results = results.filter((s) => !s.domestic);
        break;
      case "budget":
        results = results.filter((s) => s.priceTier === "budget");
        break;
      case "premium":
        results = results.filter((s) => s.priceTier === "premium" || s.priceTier === "exotic");
        break;
    }

    return results.sort((a, b) => a.commonName.localeCompare(b.commonName));
  }, [search, filter]);

  const renderSpeciesItem = ({ item }: { item: WoodSpecies }) => (
    <Pressable
      onPress={() => setSelectedSpecies(item)}
      className="rounded-xl p-4 mb-3"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <View className="flex-row justify-between items-center mb-1">
        <Text
          className="text-[16px] flex-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          {item.commonName}
        </Text>
        <View
          className="rounded-full px-2 py-1"
          style={{ backgroundColor: PRICE_COLORS[item.priceTier] + "20" }}
        >
          <Text
            className="text-[11px]"
            style={{ fontFamily: "Inter_500Medium", color: PRICE_COLORS[item.priceTier] }}
          >
            {item.priceTier}
          </Text>
        </View>
      </View>
      <Text
        className="text-[12px] italic mb-2"
        style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
      >
        {item.botanicalName}
      </Text>
      <View className="flex-row gap-4">
        <Text
          className="text-[12px]"
          style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textSecondary }}
        >
          Janka: {item.jankaHardness}
        </Text>
        <Text
          className="text-[12px]"
          style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textSecondary }}
        >
          {item.densityLbsFt3} lb/ft³
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 p-4">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Wood Species Database
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          {filteredSpecies.length} species
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
            placeholder="Search species, uses..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <FilterBar options={FILTER_OPTIONS} selected={filter} onSelect={setFilter} />

        <FlatList
          data={filteredSpecies}
          renderItem={renderSpeciesItem}
          keyExtractor={(item) => item.commonName}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>

      <Modal
        visible={selectedSpecies !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedSpecies(null)}
      >
        {selectedSpecies && (
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView className="flex-1 p-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text
                  className="text-[24px] flex-1"
                  style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
                >
                  {selectedSpecies.commonName}
                </Text>
                <Pressable
                  onPress={() => setSelectedSpecies(null)}
                  className="rounded-full px-3 py-2"
                  style={{ backgroundColor: colors.surfaceElevated }}
                >
                  <Text style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
                    Close
                  </Text>
                </Pressable>
              </View>
              <Text
                className="text-[14px] italic mb-6"
                style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
              >
                {selectedSpecies.botanicalName}
              </Text>

              <DetailSection title="Physical Properties" colors={colors}>
                <DetailRow label="Janka Hardness" value={`${selectedSpecies.jankaHardness} lbf`} colors={colors} />
                <DetailRow label="Density" value={`${selectedSpecies.densityLbsFt3} lb/ft³`} colors={colors} />
                <DetailRow label="Price Tier" value={selectedSpecies.priceTier} colors={colors} />
                <DetailRow label="Origin" value={selectedSpecies.domestic ? "Domestic" : "Exotic"} colors={colors} />
              </DetailSection>

              <DetailSection title="Movement" colors={colors}>
                <DetailRow label="Tangential Shrinkage" value={`${selectedSpecies.tangentialShrinkage}%`} colors={colors} />
                <DetailRow label="Radial Shrinkage" value={`${selectedSpecies.radialShrinkage}%`} colors={colors} />
                <DetailRow label="T/R Ratio" value={(selectedSpecies.tangentialShrinkage / selectedSpecies.radialShrinkage).toFixed(2)} colors={colors} />
              </DetailSection>

              <DetailSection title="Typical Uses" colors={colors}>
                <View className="flex-row flex-wrap gap-2">
                  {selectedSpecies.typicalUses.map((use) => (
                    <View
                      key={use}
                      className="rounded-full px-3 py-1"
                      style={{ backgroundColor: colors.surfaceElevated }}
                    >
                      <Text
                        className="text-[12px]"
                        style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
                      >
                        {use}
                      </Text>
                    </View>
                  ))}
                </View>
              </DetailSection>

              <DetailSection title="Finishing Notes" colors={colors}>
                <Text
                  className="text-[14px] leading-5"
                  style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}
                >
                  {selectedSpecies.finishingNotes}
                </Text>
              </DetailSection>

              {selectedSpecies.toxicityWarnings && (
                <View
                  className="rounded-xl p-4 mt-4"
                  style={{ backgroundColor: "#ef444420", borderWidth: 1, borderColor: "#ef4444" }}
                >
                  <Text
                    className="text-[13px] mb-1"
                    style={{ fontFamily: "Inter_600SemiBold", color: "#ef4444" }}
                  >
                    Safety Warning
                  </Text>
                  <Text
                    className="text-[13px]"
                    style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}
                  >
                    {selectedSpecies.toxicityWarnings}
                  </Text>
                </View>
              )}

              <View className="h-8" />
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

function DetailSection({ title, colors, children }: { title: string; colors: any; children: React.ReactNode }) {
  return (
    <View
      className="rounded-xl p-4 mt-4"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <Text
        className="text-[12px] uppercase tracking-wider mb-3"
        style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function DetailRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View className="flex-row justify-between items-baseline mb-2">
      <Text
        className="text-[13px]"
        style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
      >
        {label}
      </Text>
      <Text
        className="text-[15px]"
        style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
      >
        {value}
      </Text>
    </View>
  );
}
