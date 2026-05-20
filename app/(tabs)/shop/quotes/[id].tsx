import { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { StatusBadge } from "../../../../src/design-system/components/StatusBadge";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useQuotes } from "../../../../src/core/hooks/useQuotes";
import { useClients } from "../../../../src/core/hooks/useClients";
import { QuoteService } from "../../../../src/core/services/QuoteService";
import type { LineItem, LineItemCategory } from "../../../../src/core/types";

const CATEGORY_OPTIONS = [
  { label: "Labor", value: "labor" },
  { label: "Material", value: "material" },
  { label: "Laser", value: "laser_work" },
  { label: "CNC", value: "cnc_work" },
  { label: "3D Print", value: "3d_printing" },
  { label: "Finishing", value: "finishing" },
  { label: "Design", value: "design" },
  { label: "Delivery", value: "delivery" },
  { label: "Other", value: "other" },
];

export default function QuoteDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { quotes, update, remove, addLineItem, removeLineItem } = useQuotes();
  const { clients } = useClients();

  const quote = quotes.find((q) => q.id === id);
  const client = quote ? clients.find((c) => c.id === quote.clientId) : null;

  // Line items state
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Add-item form
  const [showAddForm, setShowAddForm] = useState(false);
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<string>("labor");
  const [qty, setQty] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");

  const loadLineItems = useCallback(() => {
    if (!id) return;
    try {
      const { lineItems: items } = QuoteService.getWithLineItems(id);
      setLineItems(items);
    } catch {
      // quote may not exist yet
    }
    setLoadingItems(false);
  }, [id]);

  useEffect(() => {
    loadLineItems();
  }, [loadLineItems]);

  if (!quote) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center">
          <Text style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
            Quote not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculations
  const subtotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0);
  const taxableTotal = lineItems
    .filter((li) => li.taxable)
    .reduce((sum, li) => sum + li.lineTotal, 0);
  const taxAmount = taxableTotal * ((quote.taxRate ?? 0) / 100);
  const total = subtotal + taxAmount;

  const handleAddItem = () => {
    if (!desc || !unitPrice) return;
    const q = parseFloat(qty) || 1;
    const p = parseFloat(unitPrice) || 0;
    const item = addLineItem(id!, {
      description: desc,
      category: category as LineItemCategory,
      quantity: q,
      unit: "ea",
      unitPrice: p,
      lineTotal: Math.round(q * p * 100) / 100,
      taxable: true,
      sortOrder: lineItems.length,
    });
    setLineItems((prev) => [...prev, item]);
    setDesc("");
    setQty("1");
    setUnitPrice("");
    setShowAddForm(false);
  };

  const handleRemoveItem = (itemId: string) => {
    Alert.alert("Remove Item", "Delete this line item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          removeLineItem(itemId);
          setLineItems((prev) => prev.filter((li) => li.id !== itemId));
        },
      },
    ]);
  };

  const handleStatusChange = (status: string) => {
    update(id!, { status: status as any });
  };

  const handleDelete = () => {
    Alert.alert("Delete Quote", `Delete ${quote.quoteNumber}? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          remove(id!);
          router.back();
        },
      },
    ]);
  };

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const renderItem = ({ item }: { item: LineItem }) => (
    <Pressable
      onLongPress={() => handleRemoveItem(item.id)}
      className="rounded-lg p-3 mb-2"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <Text
            className="text-[14px]"
            style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
          >
            {item.description}
          </Text>
          {item.category && (
            <Text
              className="text-[11px] mt-1"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              {item.category.replace("_", " ")}
            </Text>
          )}
        </View>
        <View className="items-end">
          <Text
            className="text-[14px]"
            style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.primary }}
          >
            {fmt(item.lineTotal)}
          </Text>
          <Text
            className="text-[11px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
          >
            {item.quantity} x {fmt(item.unitPrice)}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const ListHeader = () => (
    <View>
      {/* ── Header ── */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text
            className="text-[22px]"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
          >
            {quote.quoteNumber}
          </Text>
          <Text
            className="text-[14px] mt-1"
            style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
          >
            {client?.fullName ?? "Unknown Client"}
          </Text>
        </View>
        <StatusBadge status={quote.status} />
      </View>

      {/* ── Details ── */}
      <View
        className="rounded-lg p-4 mb-4"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        {quote.validUntil && (
          <View className="flex-row justify-between mb-2">
            <Text style={{ fontFamily: "Inter_400Regular", color: colors.textMuted, fontSize: 13 }}>
              Valid Until
            </Text>
            <Text style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary, fontSize: 13 }}>
              {quote.validUntil}
            </Text>
          </View>
        )}
        <View className="flex-row justify-between mb-2">
          <Text style={{ fontFamily: "Inter_400Regular", color: colors.textMuted, fontSize: 13 }}>
            Tax Rate
          </Text>
          <Text style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary, fontSize: 13 }}>
            {quote.taxRate ?? 0}%
          </Text>
        </View>
        {quote.notesClient && (
          <View className="mt-2 pt-2" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text style={{ fontFamily: "Inter_400Regular", color: colors.textMuted, fontSize: 12, marginBottom: 2 }}>
              Client Notes
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary, fontSize: 13 }}>
              {quote.notesClient}
            </Text>
          </View>
        )}
        {quote.terms && (
          <View className="mt-2 pt-2" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text style={{ fontFamily: "Inter_400Regular", color: colors.textMuted, fontSize: 12, marginBottom: 2 }}>
              Terms
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary, fontSize: 13 }}>
              {quote.terms}
            </Text>
          </View>
        )}
      </View>

      {/* ── Line Items Header ── */}
      <Text
        className="text-[16px] mb-3"
        style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
      >
        Line Items
      </Text>
      {loadingItems && <ActivityIndicator color={colors.primary} style={{ marginBottom: 8 }} />}
    </View>
  );

  const ListFooter = () => (
    <View>
      {lineItems.length === 0 && !loadingItems && (
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
        >
          No line items yet. Tap "Add Item" to start.
        </Text>
      )}

      {/* ── Add Item Toggle ── */}
      {!showAddForm ? (
        <Pressable
          onPress={() => setShowAddForm(true)}
          className="rounded-lg py-3 items-center mb-4"
          style={{ borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed" }}
        >
          <Text
            className="text-[14px]"
            style={{ fontFamily: "Inter_500Medium", color: colors.primary }}
          >
            + Add Item
          </Text>
        </Pressable>
      ) : (
        <View
          className="rounded-lg p-4 mb-4"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }}
        >
          <TextInput
            className="rounded-lg px-4 py-3 mb-3 text-[14px]"
            style={{
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.textPrimary,
              fontFamily: "Inter_400Regular",
            }}
            value={desc}
            onChangeText={setDesc}
            placeholder="Description"
            placeholderTextColor={colors.textMuted}
          />

          <Text
            className="text-[12px] mb-1"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
          >
            Category
          </Text>
          <FilterBar options={CATEGORY_OPTIONS} selected={category} onSelect={setCategory} />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text
                className="text-[12px] mb-1"
                style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
              >
                Qty
              </Text>
              <TextInput
                className="rounded-lg px-4 py-3 text-[14px]"
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  fontFamily: "JetBrainsMono_400Regular",
                }}
                value={qty}
                onChangeText={setQty}
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-[12px] mb-1"
                style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
              >
                Unit Price
              </Text>
              <TextInput
                className="rounded-lg px-4 py-3 text-[14px]"
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  fontFamily: "JetBrainsMono_400Regular",
                }}
                value={unitPrice}
                onChangeText={setUnitPrice}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View className="flex-row gap-3 mt-3">
            <Pressable
              onPress={() => setShowAddForm(false)}
              className="flex-1 rounded-lg py-3 items-center"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            >
              <Text style={{ fontFamily: "Inter_500Medium", color: colors.textMuted, fontSize: 14 }}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleAddItem}
              disabled={!desc || !unitPrice}
              className="flex-1 rounded-lg py-3 items-center"
              style={{
                backgroundColor: desc && unitPrice ? colors.primary : colors.surface,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  color: desc && unitPrice ? "#0f0f1a" : colors.textMuted,
                  fontSize: 14,
                }}
              >
                Add
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Totals ── */}
      <View
        className="rounded-lg p-4 mb-4"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        <View className="flex-row justify-between mb-2">
          <Text style={{ fontFamily: "Inter_400Regular", color: colors.textMuted, fontSize: 14 }}>
            Subtotal
          </Text>
          <Text style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary, fontSize: 14 }}>
            {fmt(subtotal)}
          </Text>
        </View>
        {(quote.taxRate ?? 0) > 0 && (
          <View className="flex-row justify-between mb-2">
            <Text style={{ fontFamily: "Inter_400Regular", color: colors.textMuted, fontSize: 14 }}>
              Tax ({quote.taxRate}%)
            </Text>
            <Text style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary, fontSize: 14 }}>
              {fmt(taxAmount)}
            </Text>
          </View>
        )}
        <View
          className="flex-row justify-between pt-2"
          style={{ borderTopWidth: 1, borderTopColor: colors.border }}
        >
          <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary, fontSize: 16 }}>
            Total
          </Text>
          <Text style={{ fontFamily: "JetBrainsMono_600SemiBold", color: colors.primary, fontSize: 16 }}>
            {fmt(total)}
          </Text>
        </View>
      </View>

      {/* ── Status Actions ── */}
      <View className="flex-row flex-wrap gap-2 mb-4">
        {quote.status === "draft" && (
          <Pressable
            onPress={() => handleStatusChange("sent")}
            className="rounded-lg px-4 py-3"
            style={{ backgroundColor: colors.primary }}
          >
            <Text style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a", fontSize: 14 }}>
              Mark as Sent
            </Text>
          </Pressable>
        )}
        {quote.status === "sent" && (
          <Pressable
            onPress={() => handleStatusChange("accepted")}
            className="rounded-lg px-4 py-3"
            style={{ backgroundColor: "#10b981" }}
          >
            <Text style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a", fontSize: 14 }}>
              Mark Accepted
            </Text>
          </Pressable>
        )}
        {(quote.status === "sent" || quote.status === "viewed") && (
          <Pressable
            onPress={() => handleStatusChange("rejected")}
            className="rounded-lg px-4 py-3"
            style={{ backgroundColor: "#ef444430" }}
          >
            <Text style={{ fontFamily: "Inter_600SemiBold", color: "#ef4444", fontSize: 14 }}>
              Mark Rejected
            </Text>
          </Pressable>
        )}
      </View>

      {/* ── Delete ── */}
      <Pressable
        onPress={handleDelete}
        className="rounded-lg py-3 items-center mb-8"
        style={{ borderWidth: 1, borderColor: "#ef444460" }}
      >
        <Text style={{ fontFamily: "Inter_500Medium", color: "#ef4444", fontSize: 14 }}>
          Delete Quote
        </Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={lineItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}
