import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateSoapCost } from "../../../../src/modules/soap/calculators/costEstimator";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function SoapCostEstimatorScreen() {
  const { colors } = useTheme();

  const [oilWeight, setOilWeight] = useState("");
  const [oilPricePerLb, setOilPricePerLb] = useState("");
  const [lyePricePerLb, setLyePricePerLb] = useState("");
  const [lyeWeightOz, setLyeWeightOz] = useState("");
  const [fragCostPerBottle, setFragCostPerBottle] = useState("");
  const [fragBottleSize, setFragBottleSize] = useState("");
  const [fragAmountUsed, setFragAmountUsed] = useState("");
  const [colorCostPerContainer, setColorCostPerContainer] = useState("");
  const [colorAmountUsed, setColorAmountUsed] = useState("");
  const [colorContainerSize, setColorContainerSize] = useState("");
  const [packagingCost, setPackagingCost] = useState("");
  const [numberOfBars, setNumberOfBars] = useState("8");

  const results = useMemo(() => {
    const ow = parseFloat(oilWeight);
    const op = parseFloat(oilPricePerLb);
    const lp = parseFloat(lyePricePerLb);
    const lw = parseFloat(lyeWeightOz);
    const nb = parseInt(numberOfBars, 10);
    if (!ow || ow <= 0 || !op || op <= 0 || !lp || lp <= 0 || !lw || lw <= 0 || !nb || nb <= 0) return null;

    return calculateSoapCost({
      oilEntries: [{ name: "Oil blend", weightOz: ow, pricePerLb: op }],
      lyePricePerLb: lp,
      lyeWeightOz: lw,
      fragranceCostPerBottle: parseFloat(fragCostPerBottle) || 0,
      fragranceBottleSizeOz: parseFloat(fragBottleSize) || 0,
      fragranceAmountUsedOz: parseFloat(fragAmountUsed) || 0,
      colorantCostPerContainer: parseFloat(colorCostPerContainer) || 0,
      colorantAmountUsedTsp: parseFloat(colorAmountUsed) || 0,
      colorantContainerSizeTsp: parseFloat(colorContainerSize) || 0,
      packagingCostPerBar: parseFloat(packagingCost) || 0,
      numberOfBars: nb,
    });
  }, [oilWeight, oilPricePerLb, lyePricePerLb, lyeWeightOz, fragCostPerBottle, fragBottleSize, fragAmountUsed, colorCostPerContainer, colorAmountUsed, colorContainerSize, packagingCost, numberOfBars]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Total Batch Cost", value: `$${results.totalBatchCost.toFixed(2)}`, highlight: true },
      { label: "Cost per Bar", value: `$${results.costPerBar.toFixed(2)}` },
      { label: "Suggested Retail", value: `$${results.suggestedRetailPrice.toFixed(2)}` },
      { label: "Oils", value: `$${results.oilCostTotal.toFixed(2)}` },
      { label: "Lye", value: `$${results.lyeCost.toFixed(2)}` },
      { label: "Fragrance", value: `$${results.fragranceCost.toFixed(2)}` },
      { label: "Colorant", value: `$${results.colorantCost.toFixed(2)}` },
      { label: "Packaging", value: `$${results.packagingCostTotal.toFixed(2)}` },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) { Alert.alert("No Results", "Enter valid inputs to save."); return; }
    try {
      CalculatorService.save({
        module: "soap", calculatorType: "cost-estimator",
        inputsJson: { oilWeight, oilPricePerLb, lyePricePerLb, lyeWeightOz, fragCostPerBottle, fragBottleSize, fragAmountUsed, colorCostPerContainer, colorAmountUsed, colorContainerSize, packagingCost, numberOfBars },
        outputsJson: results,
        label: `$${results.totalBatchCost.toFixed(2)} batch — $${results.costPerBar.toFixed(2)}/bar`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch { Alert.alert("Error", "Failed to save result."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>Cost Estimator</Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>Calculate batch cost and per-bar pricing</Text>

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>Oils</Text>
        <CalculatorInput label="Total Oil Weight" value={oilWeight} onChangeText={setOilWeight} unit="oz" placeholder="32" />
        <CalculatorInput label="Oil Price" value={oilPricePerLb} onChangeText={setOilPricePerLb} unit="$/lb" placeholder="8" />

        <Text className="text-[12px] uppercase tracking-wider mb-2 mt-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>Lye</Text>
        <CalculatorInput label="Lye Price" value={lyePricePerLb} onChangeText={setLyePricePerLb} unit="$/lb" placeholder="5" />
        <CalculatorInput label="Lye Weight" value={lyeWeightOz} onChangeText={setLyeWeightOz} unit="oz" placeholder="4.5" />

        <Text className="text-[12px] uppercase tracking-wider mb-2 mt-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>Fragrance (optional)</Text>
        <CalculatorInput label="Bottle Price" value={fragCostPerBottle} onChangeText={setFragCostPerBottle} unit="$" placeholder="15" />
        <CalculatorInput label="Bottle Size" value={fragBottleSize} onChangeText={setFragBottleSize} unit="oz" placeholder="4" />
        <CalculatorInput label="Amount Used" value={fragAmountUsed} onChangeText={setFragAmountUsed} unit="oz" placeholder="2" />

        <Text className="text-[12px] uppercase tracking-wider mb-2 mt-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>Colorant (optional)</Text>
        <CalculatorInput label="Container Price" value={colorCostPerContainer} onChangeText={setColorCostPerContainer} unit="$" placeholder="6" />
        <CalculatorInput label="Amount Used" value={colorAmountUsed} onChangeText={setColorAmountUsed} unit="tsp" placeholder="2" />
        <CalculatorInput label="Container Size" value={colorContainerSize} onChangeText={setColorContainerSize} unit="tsp" placeholder="30" />

        <Text className="text-[12px] uppercase tracking-wider mb-2 mt-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>Packaging & Output</Text>
        <CalculatorInput label="Packaging per Bar" value={packagingCost} onChangeText={setPackagingCost} unit="$" placeholder="0.50" />
        <CalculatorInput label="Number of Bars" value={numberOfBars} onChangeText={setNumberOfBars} unit="bars" placeholder="8" />

        {results ? (
          <ResultCard title="Cost Breakdown" results={resultItems} />
        ) : (
          <View className="rounded-xl p-4 mt-4 items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>Enter oil, lye, and bar count to estimate cost</Text>
          </View>
        )}

        <ActionBar onSaveToHistory={handleSave} onAddToQuote={() => Alert.alert("Coming Soon", "Quote feature coming soon.")} onLogToProject={() => Alert.alert("Coming Soon", "Project logging coming soon.")} />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
