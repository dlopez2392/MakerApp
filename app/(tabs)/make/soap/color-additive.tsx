import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateColorAdditive, DEFAULT_RATES } from "../../../../src/modules/soap/calculators/colorAdditive";
import type { ColorantType } from "../../../../src/modules/soap/calculators/colorAdditive";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const COLORANT_OPTIONS = [
  { label: "Mica", value: "mica" },
  { label: "Oxide", value: "oxide" },
  { label: "Clay", value: "clay" },
  { label: "Liquid Dye", value: "liquid-dye" },
];

const UNIT_OPTIONS = [
  { label: "oz", value: "oz" },
  { label: "g", value: "g" },
];

export default function ColorAdditiveScreen() {
  const { colors } = useTheme();
  const [colorantType, setColorantType] = useState<ColorantType>("mica");
  const [unit, setUnit] = useState<"oz" | "g">("oz");
  const [totalOilWeight, setTotalOilWeight] = useState("");
  const [usageRate, setUsageRate] = useState(String(DEFAULT_RATES["mica"]));
  const [colorSplits, setColorSplits] = useState("1");

  const handleTypeChange = (v: string) => {
    const t = v as ColorantType;
    setColorantType(t);
    setUsageRate(String(DEFAULT_RATES[t]));
  };

  const results = useMemo(() => {
    const w = parseFloat(totalOilWeight);
    const r = parseFloat(usageRate);
    const s = parseInt(colorSplits, 10);
    if (!w || w <= 0 || !r || r <= 0 || !s || s <= 0) return null;
    return calculateColorAdditive({ colorantType, totalOilWeight: w, usageRate: r, numberOfColorSplits: s, unit });
  }, [colorantType, totalOilWeight, usageRate, colorSplits, unit]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    const items = [
      { label: "Total Colorant", value: `${results.totalColorantTsp}`, unit: "tsp", highlight: true },
      { label: "Total (grams)", value: `${results.totalColorantG}`, unit: "g" },
    ];
    if (parseInt(colorSplits, 10) > 1) {
      items.push({ label: "Per Color", value: `${results.perColorTsp}`, unit: "tsp", highlight: false });
      items.push({ label: "Per Color (g)", value: `${results.perColorG}`, unit: "g", highlight: false });
    }
    return items;
  }, [results, colorSplits]);

  const handleSave = () => {
    if (!results) { Alert.alert("No Results", "Enter valid inputs to save."); return; }
    try {
      CalculatorService.save({
        module: "soap", calculatorType: "color-additive",
        inputsJson: { colorantType, totalOilWeight, usageRate, colorSplits, unit },
        outputsJson: results,
        label: `${results.totalColorantTsp} tsp ${colorantType} @ ${usageRate} tsp/lb`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch { Alert.alert("Error", "Failed to save result."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>Color Additive</Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>Calculate colorant amounts by type and oil weight</Text>

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>Colorant Type</Text>
        <FilterBar options={COLORANT_OPTIONS} selected={colorantType} onSelect={handleTypeChange} />

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>Unit</Text>
        <FilterBar options={UNIT_OPTIONS} selected={unit} onSelect={(v) => setUnit(v as "oz" | "g")} />

        <CalculatorInput label="Total Oil Weight" value={totalOilWeight} onChangeText={setTotalOilWeight} unit={unit} placeholder="32" />
        <CalculatorInput label="Usage Rate" value={usageRate} onChangeText={setUsageRate} unit="tsp/lb" placeholder="1" />
        <CalculatorInput label="Number of Colors" value={colorSplits} onChangeText={setColorSplits} unit="colors" placeholder="1" />

        {results ? (
          <>
            <ResultCard title="Results" results={resultItems} />
            {results.warnings.length > 0 && (
              <View className="rounded-xl p-4 mt-3" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: "#f59e0b" }}>
                {results.warnings.map((w, i) => (
                  <Text key={i} className="text-[13px]" style={{ fontFamily: "Inter_500Medium", color: "#f59e0b" }}>{w}</Text>
                ))}
              </View>
            )}
          </>
        ) : (
          <View className="rounded-xl p-4 mt-4 items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>Enter oil weight to calculate colorant amount</Text>
          </View>
        )}

        <ActionBar onSaveToHistory={handleSave} onAddToQuote={() => Alert.alert("Coming Soon", "Quote feature coming soon.")} onLogToProject={() => Alert.alert("Coming Soon", "Project logging coming soon.")} />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
