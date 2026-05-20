import { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { useInventory } from "../../../../src/core/hooks/useInventory";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { UpgradeModal } from "../../../../src/design-system/components/UpgradeModal";
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

export default function NewInventoryItemScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { create, limitReached } = useInventory();

  // Required fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InventoryCategory>("general_shop");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("pcs");

  // Optional fields
  const [unitCost, setUnitCost] = useState("");
  const [location, setLocation] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [sku, setSku] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [notes, setNotes] = useState("");

  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Required", "Item name is required.");
      return;
    }

    const result = create({
      name: name.trim(),
      masterCategory: category,
      quantity: parseInt(quantity, 10) || 0,
      unit: unit.trim() || "pcs",
      unitCost: unitCost ? parseFloat(unitCost) : undefined,
      location: location.trim() || undefined,
      lowStockThreshold: lowStockThreshold
        ? parseInt(lowStockThreshold, 10)
        : undefined,
      sku: sku.trim() || undefined,
      supplierName: supplierName.trim() || undefined,
      notes: notes.trim() || undefined,
      metadata: {},
    });

    if (result === null) {
      setShowUpgrade(true);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* ── Name ── */}
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
          value={name}
          onChangeText={setName}
          placeholder="Item name"
          placeholderTextColor={colors.textMuted}
        />

        {/* ── Category ── */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Category *
        </Text>
        <FilterBar
          options={CATEGORY_OPTIONS}
          selected={category}
          onSelect={(v) => setCategory(v as InventoryCategory)}
        />

        {/* ── Quantity & Unit ── */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <CalculatorInput
              label="Quantity *"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-[12px] uppercase tracking-wider mb-2"
              style={{
                fontFamily: "Inter_500Medium",
                color: colors.textSecondary,
              }}
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
              value={unit}
              onChangeText={setUnit}
              placeholder="pcs"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* ── Unit Cost ── */}
        <CalculatorInput
          label="Unit Cost ($)"
          value={unitCost}
          onChangeText={setUnitCost}
          unit="$"
          placeholder="0.00"
        />

        {/* ── Location ── */}
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
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Shelf A3"
          placeholderTextColor={colors.textMuted}
        />

        {/* ── Low Stock Threshold ── */}
        <CalculatorInput
          label="Low Stock Threshold"
          value={lowStockThreshold}
          onChangeText={setLowStockThreshold}
          placeholder="0"
          keyboardType="numeric"
        />

        {/* ── SKU ── */}
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
          value={sku}
          onChangeText={setSku}
          placeholder="Optional SKU"
          placeholderTextColor={colors.textMuted}
        />

        {/* ── Supplier Name ── */}
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
          value={supplierName}
          onChangeText={setSupplierName}
          placeholder="Supplier name"
          placeholderTextColor={colors.textMuted}
        />

        {/* ── Notes ── */}
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
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
        />

        {/* ── Save Button ── */}
        <Pressable
          onPress={handleSave}
          className="rounded-xl py-4 items-center mt-2"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="text-[16px]"
            style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
          >
            Save Item
          </Text>
        </Pressable>

        {/* ── Cancel ── */}
        <Pressable
          onPress={() => router.back()}
          className="items-center mt-4 py-3 mb-8"
        >
          <Text
            className="text-[15px]"
            style={{
              fontFamily: "Inter_400Regular",
              color: colors.textSecondary,
            }}
          >
            Cancel
          </Text>
        </Pressable>
      </ScrollView>

      <UpgradeModal
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="inventory items"
      />
    </SafeAreaView>
  );
}
