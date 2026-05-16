import { SafeAreaView, View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useInvoices } from "../../../../src/core/hooks/useInvoices";
import { StatusBadge } from "../../../../src/design-system/components/StatusBadge";
import { EmptyState } from "../../../../src/design-system/components/EmptyState";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import type { Invoice } from "../../../../src/core/types";

export default function InvoicesListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { invoices, loading } = useInvoices();

  const renderItem = ({ item }: { item: Invoice }) => {
    const isOverdue = item.status === "overdue";
    return (
      <Pressable
        onPress={() => router.push(`/shop/invoices/${item.id}` as any)}
        className="rounded-xl p-4 mb-3"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: isOverdue ? "#ef4444" : colors.border }}
      >
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-[15px]" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
            {item.invoiceNumber}
          </Text>
          <StatusBadge status={item.status} />
        </View>
        <Text className="text-[12px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
          Issued {item.issueDate}
          {item.dueDate ? ` • Due ${item.dueDate}` : ""}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[22px]" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>Invoices</Text>
          <Pressable
            onPress={() => router.push("/shop/invoices/new" as any)}
            className="rounded-lg px-4 py-2"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-[14px]" style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}>+ Invoice</Text>
          </Pressable>
        </View>

        {invoices.length === 0 && !loading ? (
          <EmptyState title="No invoices yet" message="Create an invoice from a quote or from scratch" />
        ) : (
          <FlatList data={invoices} renderItem={renderItem} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} />
        )}
      </View>
    </SafeAreaView>
  );
}
