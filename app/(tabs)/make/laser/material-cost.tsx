import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateMaterialCost } from "../../../../src/modules/laser/calculators/materialCost";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function MaterialCostScreen() {
  const { colors } = useTheme();

  const [sheetWidth, setSheetWidth] = useState("");
  const [sheetHeight, setSheetHeight] = useState("");
  const [pieceWidth, setPieceWidth] = useState("");
  const [pieceHeight, setPieceHeight] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [sheetCost, setSheetCost] = useState("");
  const [kerf, setKerf] = useState("0.2");

  const results = useMemo(() => {
    const sw = parseFloat(sheetWidth);
    const sh = parseFloat(sheetHeight);
    const pw = parseFloat(pieceWidth);
    const ph = parseFloat(pieceHeight);
    const qty = parseFloat(quantity) || 1;
    const cost = parseFloat(sheetCost);
    const k = parseFloat(kerf) || 0.2;

    if (!sw || !sh || !pw || !ph || !cost || sw <= 0 || sh <= 0 || pw <= 0 || ph <= 0 || cost <= 0) return null;

    return calculateMaterialCost({
      sheetWidthMm: sw,
      sheetHeightMm: sh,
      pieceWidthMm: pw,
      pieceHeightMm: ph,
      quantityNeeded: qty,
      sheetCost: cost,
      kerfWidthMm: k,
    });
  }, [sheetWidth, sheetHeight, pieceWidth, pieceHeight, quantity, sheetCost, kerf]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Pieces per sheet", value: `${results.piecesPerSheet}`, highlight: true },
      { label: "Sheets needed", value: `${results.sheetsNeeded}` },
      { label: "Cost per piece", value: `$${results.costPerPiece.toFixed(2)}` },
      { label: "Waste", value: `${results.wastePct}`, unit: "%" },
      { label: "Total cost", value: `$${results.totalCost.toFixed(2)}` },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "laser",
        calculatorType: "material-cost",
        inputsJson: { sheetWidth, sheetHeight, pieceWidth, pieceHeight, quantity, sheetCost, kerf },
        outputsJson: results,
        label: `$${results.totalCost.toFixed(2)} — ${results.sheetsNeeded} sheets, ${results.wastePct}% waste`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch {
      Alert.alert("Error", "Failed to save result.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Material Cost
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate sheet yield and cost per piece
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Sheet Size
        </Text>
        <CalculatorInput
          label="Sheet Width"
          value={sheetWidth}
          onChangeText={setSheetWidth}
          unit="mm"
          placeholder="600"
        />
        <CalculatorInput
          label="Sheet Height"
          value={sheetHeight}
          onChangeText={setSheetHeight}
          unit="mm"
          placeholder="300"
        />
        <CalculatorInput
          label="Sheet Cost"
          value={sheetCost}
          onChangeText={setSheetCost}
          unit="$"
          placeholder="12.00"
        />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Piece Size
        </Text>
        <CalculatorInput
          label="Piece Width"
          value={pieceWidth}
          onChangeText={setPieceWidth}
          unit="mm"
          placeholder="50"
        />
        <CalculatorInput
          label="Piece Height"
          value={pieceHeight}
          onChangeText={setPieceHeight}
          unit="mm"
          placeholder="50"
        />
        <CalculatorInput
          label="Quantity Needed"
          value={quantity}
          onChangeText={setQuantity}
          unit="pcs"
          placeholder="10"
          keyboardType="numeric"
        />
        <CalculatorInput
          label="Kerf Width"
          value={kerf}
          onChangeText={setKerf}
          unit="mm"
          placeholder="0.2"
        />

        {results ? (
          <ResultCard title="Results" results={resultItems} />
        ) : (
          <View
            className="rounded-xl p-4 mt-4 items-center justify-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}
          >
            <Text
              className="text-[13px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              Enter sheet, piece, and cost info to see results
            </Text>
          </View>
        )}

        <ActionBar
          onSaveToHistory={handleSave}
          onAddToQuote={() => Alert.alert("Coming Soon", "Quote feature coming soon.")}
          onLogToProject={() => Alert.alert("Coming Soon", "Project logging coming soon.")}
        />

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
