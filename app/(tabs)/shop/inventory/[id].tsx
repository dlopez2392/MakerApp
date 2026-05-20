import { useState, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { useInventory } from "../../../../src/core/hooks/useInventory";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import type { InventoryCategory } from "../../../../src/core/types";

const CATEGORY_OPTIONS: { label: string; value: InventoryCategory }[] = [
  { label: "Woodworking", value: "woodworking" },
  { label: "Laser", value: "laser" },
  { label: "CNC", value: "cnc" },
  { label: "3D Printing", value: "3d_printing" },
  { label: "General Shop", value: "general_shop" },
  { label: "Resin", value: "resin" },
  { label: "Knife", value: "knife" },
  { label: "Leather", value: "leather" },
  { label: "Candle", value: "candle" },
  { label: "Soap", value: "soap" },
];

const CATEGORY_LABEL: Record<InventoryCategory, string> = {
  woodworking: "Woodworking",
  laser: "Laser",
  cnc: "CNC",
  "3d_printing": "3D Printing",
  general_shop: "General Shop",
  resin: "Resin",
  knife: "Knife",
  leather: "Leather",
  candle: "Candle",
  soap: "Soap",
};

function InfoRow({
  label,
  value,
  colors,
  warn,
}: {
  label: string;
  value: string | undefined;
  colors: any;
  warn?: boolean;
}) {
  if (!value) return null;
  return (
    <View className="flex-row justify-between py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Text
        className="text-[13px]"
        style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
      >
        {label}
      </Text>
      <Text
        className="text-[14px] flex-shrink"
        style={{
          fontFamily: "Inter_400Regular",
          color: warn ? "#ef4444" : colors.textPrimary,
          textAlign: "right",
          maxWidth: "60%",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function InventoryDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, loading, update, remove, deduct } = useInventory();

  const item = useMemo(() => items.find((i) => i.id === id), [items, id]);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<InventoryCategory>("general_shop");
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editUnitCost, setEditUnitCost] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editLowStock, setEditLowStock] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editSupplier, setEditSupplier] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Deduct stock state
  const [showDeduct, setShowDeduct] = useState(false);
  const [deductAmount, setDeductAmount] = useState("");

  const isLowStock =
    item &&
    item.lowStockThreshold != null &&
    item.quantity <= item.lowStockThreshold;

  const startEdit = () => {
    if (!item) return;
    setEditName(item.name);
    setEditCategory(item.masterCategory);
    setEditQuantity(String(item.quantity));
    setEditUnit(item.unit);
    setEditUnitCost(item.unitCost != null ? String(item.unitCost) : "");
    setEditLocation(item.location ?? "");
    setEditLowStock(
      item.lowStockThreshold != null ? String(item.lowStockThreshold) : ""
    );
    setEditSku(item.sku ?? "");
    setEditSupplier(item.supplierName ?? "");
    setEditNotes(item.notes ?? "");
    setEditing(true);
  };

  const handleSaveEdit = () => {
    if (!item) return;
    if (!editName.trim()) {
      Alert.alert("Required", "Item name is required.");
      return;
    }
    update(item.id, {
      name: editName.trim(),
      masterCategory: editCategory,
      quantity: parseInt(editQuantity, 10) || 0,
      unit: editUnit.trim() || "pcs",
      unitCost: editUnitCost ? parseFloat(editUnitCost) : undefined,
      location: editLocation.trim() || undefined,
      lowStockThreshold: editLowStock
        ? parseInt(editLowStock, 10)
        : undefined,
      sku: editSku.trim() || undefined,
      supplierName: editSupplier.trim() || undefined,
      notes: editNotes.trim() || undefined,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert("Delete Item", "Are you sure? This cannot be undone.", [
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

  const handleDeduct = () => {
    const amount = parseInt(deductAmount, 10);
    if (!amount || amount <= 0) {
      Alert.alert("Invalid", "Enter a valid quantity to deduct.");
      return;
    }
    const success = deduct(id!, amount);
    if (success) {
      setDeductAmount("");
      setShowDeduct(false);
    } else {
      Alert.alert("Error", "Could not deduct stock. Check available quantity.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center p-4">
          <Text
            className="text-[16px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
          >
            Item not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Edit Mode ──
  if (editing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          <Text
            className="text-[20px] mb-4"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
          >
            Edit Item
          </Text>

          <Text
            className="text-[12px] uppercase tracking-wider mb-2"
            style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
          >
            Name *
          </Text>
          <TextInput
            className="rounded-xl px-4 py-3 mb-4 text-[16px]"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.textPrimary,
              fontFamily: "Inter_400Regular",
            }}
            value={editName}
            onChangeText={setEditName}
            placeholder="Item name"
            placeholderTextColor={colors.textMuted}
          />

          <Text
            className="text-[12px] uppercase tracking-wider mb-2"
            style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
          >
            Category
          </Text>
          <FilterBar
            options={CATEGORY_OPTIONS}
            selected={editCategory}
            onSelect={(v) => setEditCategory(v as InventoryCategory)}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <CalculatorInput
                label="Quantity"
                value={editQuantity}
                onChangeText={setEditQuantity}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-[12px] uppercase tracking-wider mb-2"
                style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
              >
                Unit
              </Text>
              <TextInput
                className="rounded-xl px-4 py-3 text-[16px]"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  fontFamily: "Inter_400Regular",
                }}
                value={editUnit}
                onChangeText={setEditUnit}
                placeholder="pcs"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <CalculatorInput
            label="Unit Cost ($)"
            value={editUnitCost}
            onChangeText={setEditUnitCost}
            unit="$"
            placeholder="0.00"
          />

          <Text
            className="text-[12px] uppercase tracking-wider mb-2"
            style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
          >
            Location
          </Text>
          <TextInput
            className="rounded-xl px-4 py-3 mb-4 text-[16px]"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.textPrimary,
              fontFamily: "Inter_400Regular",
            }}
            value={editLocation}
            onChangeText={setEditLocation}
            placeholder="e.g. Shelf A3"
            placeholderTextColor={colors.textMuted}
          />

          <CalculatorInput
            label="Low Stock Threshold"
            value={editLowStock}
            onChangeText={setEditLowStock}
            placeholder="0"
            keyboardType="numeric"
          />

          <Text
            className="text-[12px] uppercase tracking-wider mb-2"
            style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
          >
            SKU
          </Text>
          <TextInput
            className="rounded-xl px-4 py-3 mb-4 text-[16px]"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.textPrimary,
              fontFamily: "Inter_400Regular",
            }}
            value={editSku}
            onChangeText={setEditSku}
            placeholder="Optional SKU"
            placeholderTextColor={colors.textMuted}
          />

          <Text
            className="text-[12px] uppercase tracking-wider mb-2"
            style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
          >
            Supplier
          </Text>
          <TextInput
            className="rounded-xl px-4 py-3 mb-4 text-[16px]"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.textPrimary,
              fontFamily: "Inter_400Regular",
            }}
            value={editSupplier}
            onChangeText={setEditSupplier}
            placeholder="Supplier name"
            placeholderTextColor={colors.textMuted}
          />

          <Text
            className="text-[12px] uppercase tracking-wider mb-2"
            style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
          >
            Notes
          </Text>
          <TextInput
            className="rounded-xl px-4 py-3 mb-4 text-[16px]"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.textPrimary,
              fontFamily: "Inter_400Regular",
              minHeight: 80,
              textAlignVertical: "top",
            }}
            value={editNotes}
            onChangeText={setEditNotes}
            placeholder="Additional notes..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
          />

          <Pressable
            onPress={handleSaveEdit}
            className="rounded-xl py-4 items-center mt-2"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="text-[16px]"
              style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
            >
              Save Changes
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setEditing(false)}
            className="items-center mt-4 py-3 mb-8"
          >
            <Text
              className="text-[15px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
            >
              Cancel
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── View Mode ──
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View
          className="rounded-xl p-4 mb-3"
          style={{
            backgroundColor: colors.surface,
            borderWidth: isLowStock ? 2 : 1,
            borderColor: isLowStock ? "#ef4444" : colors.border,
          }}
        >
          <Text
            className="text-[22px] mb-1"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
          >
            {item.name}
          </Text>
          <Text
            className="text-[13px]"
            style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
          >
            {CATEGORY_LABEL[item.masterCategory]}
          </Text>

          {isLowStock && (
            <View className="mt-2 rounded-lg px-3 py-1.5 self-start" style={{ backgroundColor: "rgba(239,68,68,0.15)" }}>
              <Text
                className="text-[12px]"
                style={{ fontFamily: "Inter_600SemiBold", color: "#ef4444" }}
              >
                LOW STOCK
              </Text>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View
          className="rounded-xl p-4 mb-3"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <InfoRow
            label="Quantity"
            value={`${item.quantity} ${item.unit}`}
            colors={colors}
            warn={isLowStock}
          />
          <InfoRow
            label="Unit Cost"
            value={item.unitCost != null ? `$${item.unitCost.toFixed(2)}` : undefined}
            colors={colors}
          />
          <InfoRow label="Location" value={item.location} colors={colors} />
          <InfoRow
            label="Low Stock Threshold"
            value={
              item.lowStockThreshold != null
                ? String(item.lowStockThreshold)
                : undefined
            }
            colors={colors}
          />
          <InfoRow label="SKU" value={item.sku} colors={colors} />
          <InfoRow label="Supplier" value={item.supplierName} colors={colors} />
          <InfoRow label="Notes" value={item.notes} colors={colors} />
        </View>

        {/* Deduct Stock Section */}
        {showDeduct ? (
          <View
            className="rounded-xl p-4 mb-3"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.primary,
            }}
          >
            <Text
              className="text-[14px] mb-3"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
            >
              Deduct Stock
            </Text>
            <CalculatorInput
              label="Quantity to deduct"
              value={deductAmount}
              onChangeText={setDeductAmount}
              unit={item.unit}
              placeholder="0"
              keyboardType="numeric"
            />
            <View className="flex-row gap-3 mt-2">
              <Pressable
                onPress={() => {
                  setShowDeduct(false);
                  setDeductAmount("");
                }}
                className="flex-1 rounded-xl py-3 items-center"
                style={{ borderWidth: 1, borderColor: colors.border }}
              >
                <Text
                  className="text-[14px]"
                  style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDeduct}
                className="flex-1 rounded-xl py-3 items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text
                  className="text-[14px]"
                  style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
                >
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setShowDeduct(true)}
            className="rounded-xl py-4 items-center mb-3"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              className="text-[15px]"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.primary }}
            >
              Deduct Stock
            </Text>
          </Pressable>
        )}

        {/* Edit Button */}
        <Pressable
          onPress={startEdit}
          className="rounded-xl py-4 items-center mb-3"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="text-[16px]"
            style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
          >
            Edit Item
          </Text>
        </Pressable>

        {/* Delete Button */}
        <Pressable
          onPress={handleDelete}
          className="rounded-xl py-4 items-center mb-8"
          style={{
            borderWidth: 1,
            borderColor: "#ef4444",
          }}
        >
          <Text
            className="text-[15px]"
            style={{ fontFamily: "Inter_600SemiBold", color: "#ef4444" }}
          >
            Delete Item
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
