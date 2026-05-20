import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateLye } from "../../../../src/modules/soap/calculators/lyeCalculator";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const SOAP_TYPE_OPTIONS = [
  { label: "Bar (NaOH)", value: "bar" },
  { label: "Liquid (KOH)", value: "liquid" },
];

export default function LyeCalculatorScreen() {
  const { colors } = useTheme();

  const [soapType, setSoapType] = useState<"bar" | "liquid">("bar");
  const [superfat, setSuperfat] = useState("5");
  const [waterLyeRatio, setWaterLyeRatio] = useState("2.0");

  // Oil entries
  const [oil1Name] = useState("Olive Oil");
  const [oil1Wt, setOil1Wt] = useState("16");
  const [oil2Name] = useState("Coconut Oil 76");
  const [oil2Wt, setOil2Wt] = useState("8");
  const [oil3Name] = useState("Palm Oil");
  const [oil3Wt, setOil3Wt] = useState("0");

  const results = useMemo(() => {
    const sf = parseFloat(superfat);
    const wlr = parseFloat(waterLyeRatio);
    if (isNaN(sf) || isNaN(wlr) || wlr <= 0) return null;

    const oils = [
      { name: oil1Name, weightOz: parseFloat(oil1Wt) || 0 },
      { name: oil2Name, weightOz: parseFloat(oil2Wt) || 0 },
      { name: oil3Name, weightOz: parseFloat(oil3Wt) || 0 },
    ].filter((o) => o.weightOz > 0);

    if (oils.length === 0) return null;

    return calculateLye({
      oils,
      superfattPct: sf,
      waterLyeRatio: wlr,
      soapType,
    });
  }, [oil1Name, oil1Wt, oil2Name, oil2Wt, oil3Name, oil3Wt, superfat, waterLyeRatio, soapType]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Lye Weight", value: `${Math.round(results.lyeWeightOz * 100) / 100}`, unit: "oz", highlight: true },
      { label: "Water Weight", value: `${Math.round(results.waterWeightOz * 100) / 100}`, unit: "oz" },
      { label: "Total Batch", value: `${Math.round(results.totalBatchWeightOz * 100) / 100}`, unit: "oz" },
    ];
  }, [results]);

  const profileItems = useMemo(() => {
    if (!results) return [];
    const p = results.fattyAcidProfile;
    return [
      { label: "Hardness", value: `${p.hardness}`, unit: "" },
      { label: "Cleansing", value: `${p.cleansing}`, unit: "" },
      { label: "Conditioning", value: `${p.conditioning}`, unit: "" },
      { label: "Bubbly", value: `${p.bubbly}`, unit: "" },
      { label: "Creamy", value: `${p.creamy}`, unit: "" },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "soap",
        calculatorType: "lye-calculator",
        inputsJson: { oil1Name, oil1Wt, oil2Name, oil2Wt, oil3Name, oil3Wt, superfat, waterLyeRatio, soapType },
        outputsJson: results,
        label: `${soapType === "bar" ? "NaOH" : "KOH"} ${Math.round(results.lyeWeightOz * 100) / 100} oz lye, ${Math.round(results.totalBatchWeightOz * 100) / 100} oz total`,
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
          Lye Calculator
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate lye and water amounts for cold-process soap
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Soap Type
        </Text>
        <FilterBar
          options={SOAP_TYPE_OPTIONS}
          selected={soapType}
          onSelect={(v) => setSoapType(v as "bar" | "liquid")}
        />

        <Text
          className="text-[14px] mt-4 mb-2"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Oils
        </Text>

        <View
          className="rounded-xl p-3 mb-3"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-[13px] mb-1" style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}>
            {oil1Name}
          </Text>
          <CalculatorInput label="Weight" value={oil1Wt} onChangeText={setOil1Wt} unit="oz" placeholder="16" />
        </View>

        <View
          className="rounded-xl p-3 mb-3"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-[13px] mb-1" style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}>
            {oil2Name}
          </Text>
          <CalculatorInput label="Weight" value={oil2Wt} onChangeText={setOil2Wt} unit="oz" placeholder="8" />
        </View>

        <View
          className="rounded-xl p-3 mb-3"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-[13px] mb-1" style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}>
            {oil3Name}
          </Text>
          <CalculatorInput label="Weight" value={oil3Wt} onChangeText={setOil3Wt} unit="oz" placeholder="0" />
        </View>

        <CalculatorInput
          label="Superfat %"
          value={superfat}
          onChangeText={setSuperfat}
          unit="%"
          placeholder="5"
        />

        <CalculatorInput
          label="Water:Lye Ratio"
          value={waterLyeRatio}
          onChangeText={setWaterLyeRatio}
          unit=":1"
          placeholder="2.0"
        />

        {results ? (
          <>
            <ResultCard title="Results" results={resultItems} />

            <ResultCard title="Fatty Acid Profile" results={profileItems} />

            {results.warnings.length > 0 && (
              <View
                className="rounded-xl p-4 mt-3"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.warning || "#f59e0b" }}
              >
                <Text
                  className="text-[13px] font-semibold mb-1"
                  style={{ fontFamily: "Inter_600SemiBold", color: colors.warning || "#f59e0b" }}
                >
                  Warnings
                </Text>
                {results.warnings.map((w, i) => (
                  <Text
                    key={i}
                    className="text-[13px] mt-1"
                    style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
                  >
                    {w}
                  </Text>
                ))}
              </View>
            )}
          </>
        ) : (
          <View
            className="rounded-xl p-4 mt-4 items-center justify-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}
          >
            <Text
              className="text-[13px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              Add oils to calculate lye requirements
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
