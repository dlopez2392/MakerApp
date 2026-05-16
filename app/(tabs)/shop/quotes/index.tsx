import { SafeAreaView, View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useQuotes } from "../../../../src/core/hooks/useQuotes";
import { StatusBadge } from "../../../../src/design-system/components/StatusBadge";
import { EmptyState } from "../../../../src/design-system/components/EmptyState";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import type { Quote } from "../../../../src/core/types";

export default function QuotesListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { quotes, loading } = useQuotes();

  const renderItem = ({ item }: { item: Quote }) => (
    <Pressable
      onPress={() => router.push(`/shop/quotes/${item.id}` as any)}
      className="rounded-xl p-4 mb-3"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-[15px]" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          {item.quoteNumber}
        </Text>
        <StatusBadge status={item.status} />
      </View>
      <Text className="text-[12px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
        Created {item.createdAt.split("T")[0]}
        {item.validUntil ? ` • Valid until ${item.validUntil}` : ""}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[22px]" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>Quotes</Text>
          <Pressable
            onPress={() => router.push("/shop/quotes/new" as any)}
            className="rounded-lg px-4 py-2"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-[14px]" style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}>+ Quote</Text>
          </Pressable>
        </View>

        {quotes.length === 0 && !loading ? (
          <EmptyState title="No quotes yet" message="Create a quote from a pricing calculation or from scratch" />
        ) : (
          <FlatList data={quotes} renderItem={renderItem} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} />
        )}
      </View>
    </SafeAreaView>
  );
}
