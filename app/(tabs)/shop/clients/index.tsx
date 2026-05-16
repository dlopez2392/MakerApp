import { useState, useMemo } from "react";
import { SafeAreaView, View, Text, FlatList, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useClients } from "../../../../src/core/hooks/useClients";
import { EmptyState } from "../../../../src/design-system/components/EmptyState";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import type { Client } from "../../../../src/core/types";

export default function ClientsListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { clients, loading } = useClients();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) => c.fullName.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const renderItem = ({ item }: { item: Client }) => (
    <Pressable
      onPress={() => router.push(`/shop/clients/${item.id}` as any)}
      className="rounded-xl p-4 mb-3"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <Text
        className="text-[16px]"
        style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
      >
        {item.fullName}
      </Text>
      {item.company && (
        <Text className="text-[13px] mt-1" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>
          {item.company}
        </Text>
      )}
      {item.tags.length > 0 && (
        <View className="flex-row gap-2 mt-2">
          {item.tags.map((tag) => (
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
          <Text className="text-[22px]" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>Clients</Text>
          <Pressable
            onPress={() => router.push("/shop/clients/new" as any)}
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
            placeholder="Search clients..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {filtered.length === 0 && !loading ? (
          <EmptyState title="No clients yet" message="Add your first client to track relationships" />
        ) : (
          <FlatList data={filtered} renderItem={renderItem} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} />
        )}
      </View>
    </SafeAreaView>
  );
}
