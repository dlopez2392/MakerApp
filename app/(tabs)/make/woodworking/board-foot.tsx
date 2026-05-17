import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateBoardFeet, type SurfaceType } from "../../../../src/modules/woodworking/calculators/boardFoot";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const SURFACE_OPTIONS = [
  { label: "Rough", value: "rough" },
  { label: "S2S", value: "s2s" },
  { label: "S3S", value: "s3s" },
  { label: "S4S", value: "s4s" },
];

export default function BoardFootScreen() {
  const { colors } = useTheme();

  const [thickness, setThickness] = useState("");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [surfaceType, setSurfaceType] = useState<SurfaceType>("rough");

  const results = useMemo(() => {
    const t = parseFloat(thickness);
    const w = parseFloat(width);
    const l = parseFloat(length);
    const q = parseFloat(quantity) || 1;
    const p = parseFloat(price);

    if (!t || !w || !l || t <= 0 || w <= 0 || l <= 0) return null;

    return calculateBoardFeet({
      thickness: t,
      width: w,
      length: l,
      quantity: q,
      pricePerBF: p > 0 ? p : undefined,
      surfaceType,
    });
  }, [thickness, width, length, quantity, price, surfaceType]);

  const resultItems = useMemo(() => {
    if (!results) return [];

    const items: { label: string; value: string; unit?: string; highlight?: boolean }[] = [
      {
        label: "BF per piece",
        value: results.boardFeetPerPiece.toString(),
        unit: "BF",
      },
      {
        label: "Total board feet",
        value: results.totalBoardFeet.toString(),
        unit: "BF",
        highlight: true,
      },
    ];

    if (results.totalCost !== null) {
      items.push({
        label: "Total cost",
        value: `$${results.totalCost.toFixed(2)}`,
      });
    }

    return items;
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid dimensions to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "woodworking",
        calculatorType: "board-foot",
        inputsJson: { thickness, width, length, quantity, price, surfaceType },
        outputsJson: results,
        label: `${results.totalBoardFeet} BF — ${surfaceType}`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch {
      Alert.alert("Error", "Failed to save result.");
    }
  };

  const handleAddToQuote = () => {
    Alert.alert("Coming Soon", "Quote feature coming soon.");
  };

  const handleLogToProject = () => {
    Alert.alert("Coming Soon", "Project logging coming soon.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Board Foot Calculator
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate board feet based on lumber dimensions
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Surface Type
        </Text>
        <FilterBar
          options={SURFACE_OPTIONS}
          selected={surfaceType}
          onSelect={(v) => setSurfaceType(v as SurfaceType)}
        />

        <CalculatorInput
          label="Thickness"
          value={thickness}
          onChangeText={setThickness}
          unit="in"
          placeholder="1"
        />
        <CalculatorInput
          label="Width"
          value={width}
          onChangeText={setWidth}
          unit="in"
          placeholder="6"
        />
        <CalculatorInput
          label="Length"
          value={length}
          onChangeText={setLength}
          unit="in"
          placeholder="96"
        />
        <CalculatorInput
          label="Quantity"
          value={quantity}
          onChangeText={setQuantity}
          unit="pcs"
          placeholder="1"
          keyboardType="numeric"
        />
        <CalculatorInput
          label="Price per BF (optional)"
          value={price}
          onChangeText={setPrice}
          unit="$/BF"
          placeholder="0.00"
        />

        {results && (
          <ResultCard title="Results" results={resultItems} />
        )}

        {!results && (
          <View
            className="rounded-xl p-4 mt-4 items-center justify-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}
          >
            <Text
              className="text-[13px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              Enter dimensions to see results
            </Text>
          </View>
        )}

        <ActionBar
          onSaveToHistory={handleSave}
          onAddToQuote={handleAddToQuote}
          onLogToProject={handleLogToProject}
        />

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
