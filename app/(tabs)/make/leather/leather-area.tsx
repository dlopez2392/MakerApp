import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateLeatherArea } from "../../../../src/modules/leather/calculators/leatherArea";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function LeatherAreaScreen() {
  const { colors } = useTheme();

  const [length1, setLength1] = useState("");
  const [width1, setWidth1] = useState("");
  const [qty1, setQty1] = useState("1");

  const [length2, setLength2] = useState("");
  const [width2, setWidth2] = useState("");
  const [qty2, setQty2] = useState("1");

  const [length3, setLength3] = useState("");
  const [width3, setWidth3] = useState("");
  const [qty3, setQty3] = useState("1");

  const [wastePct, setWastePct] = useState("15");

  const results = useMemo(() => {
    const pieces = [
      { lengthIn: parseFloat(length1), widthIn: parseFloat(width1), quantity: parseFloat(qty1) || 1 },
      { lengthIn: parseFloat(length2), widthIn: parseFloat(width2), quantity: parseFloat(qty2) || 1 },
      { lengthIn: parseFloat(length3), widthIn: parseFloat(width3), quantity: parseFloat(qty3) || 1 },
    ].filter((p) => p.lengthIn > 0 && p.widthIn > 0);

    if (pieces.length === 0) return null;

    const w = parseFloat(wastePct);
    if (isNaN(w) || w < 0) return null;

    return calculateLeatherArea({ pieces, wastePct: w });
  }, [length1, width1, qty1, length2, width2, qty2, length3, width3, qty3, wastePct]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Total Area", value: results.totalAreaSqIn.toFixed(2), unit: "sq in" },
      { label: "Total Area", value: results.totalAreaSqFt.toFixed(2), unit: "sq ft" },
      { label: "With Waste", value: results.withWasteSqFt.toFixed(2), unit: "sq ft", highlight: true },
      { label: "Hide Recommendation", value: results.hideRecommendation },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid dimensions to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "leather",
        calculatorType: "leather-area",
        inputsJson: { length1, width1, qty1, length2, width2, qty2, length3, width3, qty3, wastePct },
        outputsJson: results,
        label: `${results.withWasteSqFt.toFixed(2)} sq ft — ${results.hideRecommendation}`,
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
          Leather Area Calculator
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate total leather area with waste allowance
        </Text>

        {/* Piece 1 */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Piece 1
        </Text>
        <CalculatorInput label="Length" value={length1} onChangeText={setLength1} unit="in" placeholder="0" />
        <CalculatorInput label="Width" value={width1} onChangeText={setWidth1} unit="in" placeholder="0" />
        <CalculatorInput label="Quantity" value={qty1} onChangeText={setQty1} unit="pcs" placeholder="1" />

        {/* Piece 2 */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-4"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Piece 2
        </Text>
        <CalculatorInput label="Length" value={length2} onChangeText={setLength2} unit="in" placeholder="0" />
        <CalculatorInput label="Width" value={width2} onChangeText={setWidth2} unit="in" placeholder="0" />
        <CalculatorInput label="Quantity" value={qty2} onChangeText={setQty2} unit="pcs" placeholder="1" />

        {/* Piece 3 */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-4"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Piece 3
        </Text>
        <CalculatorInput label="Length" value={length3} onChangeText={setLength3} unit="in" placeholder="0" />
        <CalculatorInput label="Width" value={width3} onChangeText={setWidth3} unit="in" placeholder="0" />
        <CalculatorInput label="Quantity" value={qty3} onChangeText={setQty3} unit="pcs" placeholder="1" />

        {/* Waste */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-4"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Waste Allowance
        </Text>
        <CalculatorInput label="Waste" value={wastePct} onChangeText={setWastePct} unit="%" placeholder="15" />

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
