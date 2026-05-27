import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateDyeCoverage, type DyeType } from "../../../../src/modules/leather/calculators/dyeCoverage";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function DyeCoverageScreen() {
  const { colors } = useTheme();

  const [areaSqFt, setAreaSqFt] = useState("");
  const [numberOfCoats, setNumberOfCoats] = useState("2");
  const [dyeType, setDyeType] = useState<DyeType>("spirit");
  const [bottleSizeOz, setBottleSizeOz] = useState("4");
  const [pricePerBottle, setPricePerBottle] = useState("");

  const results = useMemo(() => {
    const a = parseFloat(areaSqFt);
    const nc = parseFloat(numberOfCoats);
    const bs = parseFloat(bottleSizeOz);
    if (!(a > 0) || !(nc > 0) || !(bs > 0)) return null;

    const price = parseFloat(pricePerBottle);

    return calculateDyeCoverage({
      areaSqFt: a,
      numberOfCoats: nc,
      dyeType,
      bottleSizeOz: bs,
      pricePerBottle: isNaN(price) ? undefined : price,
    });
  }, [areaSqFt, numberOfCoats, dyeType, bottleSizeOz, pricePerBottle]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    const items = [
      { label: "Dye Needed", value: String(results.totalDyeOz), unit: "oz", highlight: true },
      { label: "Bottles Needed", value: String(results.bottlesNeeded) },
      { label: "Coverage Rate", value: String(results.coverageRate), unit: "sq ft/oz" },
    ];
    if (results.estimatedCost !== null) {
      items.push({ label: "Estimated Cost", value: `$${results.estimatedCost.toFixed(2)}` });
    }
    return items;
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "leather",
        calculatorType: "dye-coverage",
        inputsJson: { areaSqFt, numberOfCoats, dyeType, bottleSizeOz, pricePerBottle },
        outputsJson: results,
        label: `${results.totalDyeOz}oz ${dyeType} dye — ${results.bottlesNeeded} bottles`,
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
          Dye Coverage
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate dye quantity and bottle count
        </Text>

        <CalculatorInput label="Area" value={areaSqFt} onChangeText={setAreaSqFt} unit="sq ft" placeholder="6" />
        <CalculatorInput label="Number of Coats" value={numberOfCoats} onChangeText={setNumberOfCoats} unit="coats" placeholder="2" />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-4"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Dye Type
        </Text>
        <FilterBar
          options={[
            { label: "Spirit", value: "spirit" },
            { label: "Oil", value: "oil" },
            { label: "Acrylic", value: "acrylic" },
          ]}
          selected={dyeType}
          onSelect={(v) => setDyeType(v as DyeType)}
        />

        <CalculatorInput label="Bottle Size" value={bottleSizeOz} onChangeText={setBottleSizeOz} unit="oz" placeholder="4" />
        <CalculatorInput label="Price per Bottle (optional)" value={pricePerBottle} onChangeText={setPricePerBottle} unit="$" placeholder="12" />

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
              Enter area and coat count to see results
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
