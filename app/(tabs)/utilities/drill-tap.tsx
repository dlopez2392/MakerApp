import { useState, useMemo } from "react";
import { SafeAreaView, View, Text, FlatList, TextInput } from "react-native";
import {
  imperialTapDrills,
  metricTapDrills,
  type DrillTapEntry,
} from "../../../src/modules/utilities/data/drillTap";
import { FilterBar } from "../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

const SYSTEM_OPTIONS = [
  { label: "Imperial", value: "imperial" },
  { label: "Metric", value: "metric" },
];

export default function DrillTapScreen() {
  const { colors } = useTheme();
  const [system, setSystem] = useState("imperial");
  const [search, setSearch] = useState("");

  const data = useMemo(() => {
    const source = system === "imperial" ? imperialTapDrills : metricTapDrills;
    if (!search.trim()) return source;
    const q = search.toLowerCase();
    return source.filter((entry) => entry.size.toLowerCase().includes(q));
  }, [system, search]);

  const renderItem = ({ item }: { item: DrillTapEntry }) => (
    <View
      className="rounded-xl p-3 mb-2"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <Text
        className="text-[15px] mb-2"
        style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
      >
        {item.size}
      </Text>
      <View className="flex-row justify-between">
        <View className="flex-1">
          <Text
            className="text-[11px] uppercase mb-1"
            style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
          >
            Tap Drill
          </Text>
          <Text
            className="text-[14px]"
            style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.primary }}
          >
            {item.tapDrill}
          </Text>
          <Text
            className="text-[11px]"
            style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textSecondary }}
          >
            ({item.tapDrillDecimal}{system === "imperial" ? '"' : "mm"})
          </Text>
        </View>
        <View className="flex-1">
          <Text
            className="text-[11px] uppercase mb-1"
            style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
          >
            Clearance
          </Text>
          <Text
            className="text-[14px]"
            style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
          >
            {item.clearanceDrill}
          </Text>
          <Text
            className="text-[11px]"
            style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textSecondary }}
          >
            ({item.clearanceDrillDecimal}{system === "imperial" ? '"' : "mm"})
          </Text>
        </View>
        <View className="flex-1">
          <Text
            className="text-[11px] uppercase mb-1"
            style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
          >
            {system === "imperial" ? "TPI" : "Pitch"}
          </Text>
          <Text
            className="text-[14px]"
            style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
          >
            {system === "imperial" ? item.threadsPerInch : `${item.pitch}mm`}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 p-4">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Drill & Tap Reference
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          {data.length} entries
        </Text>

        <FilterBar options={SYSTEM_OPTIONS} selected={system} onSelect={setSystem} />

        <View
          className="rounded-lg px-4 py-3 mb-3"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <TextInput
            className="text-[16px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by size..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.size}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}
