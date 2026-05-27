import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateCureTime } from "../../../../src/modules/soap/calculators/cureTracker";
import type { SoapMethod, Humidity } from "../../../../src/modules/soap/calculators/cureTracker";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const METHOD_OPTIONS = [
  { label: "Cold Process", value: "cold-process" },
  { label: "Hot Process", value: "hot-process" },
  { label: "Melt & Pour", value: "melt-and-pour" },
];

const HUMIDITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Moderate", value: "moderate" },
  { label: "High", value: "high" },
];

function todayString(): string {
  const d = new Date();
  return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}/${d.getFullYear()}`;
}

export default function CureTrackerScreen() {
  const { colors } = useTheme();
  const [soapMethod, setSoapMethod] = useState<SoapMethod>("cold-process");
  const [humidity, setHumidity] = useState<Humidity>("moderate");
  const [batchDate, setBatchDate] = useState(todayString());

  const results = useMemo(() => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(batchDate)) return null;
    return calculateCureTime({ soapMethod, batchDate, humidity });
  }, [soapMethod, batchDate, humidity]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    const items = [
      { label: "Current Stage", value: results.currentStage, highlight: true },
      { label: "Days to Next", value: `${results.daysToNextMilestone}`, unit: "days" },
      { label: "Unmold", value: results.unmoldDate },
    ];
    if (results.cutDate) items.push({ label: "Cut", value: results.cutDate });
    items.push({ label: "Safe to Use", value: results.useDate });
    items.push({ label: "Full Cure", value: results.fullCureDate });
    return items;
  }, [results]);

  const stageColor = results?.currentStage === "Fully Cured" ? colors.success
    : results?.currentStage === "Safe to Use" ? colors.primary
    : colors.warning;

  const handleSave = () => {
    if (!results) { Alert.alert("No Results", "Enter a valid batch date."); return; }
    try {
      CalculatorService.save({
        module: "soap", calculatorType: "cure-tracker",
        inputsJson: { soapMethod, batchDate, humidity },
        outputsJson: results,
        label: `${soapMethod} — ${results.currentStage} (${batchDate})`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch { Alert.alert("Error", "Failed to save result."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>Cure Time Tracker</Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>Estimate cure milestones from batch date and method</Text>

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>Soap Method</Text>
        <FilterBar options={METHOD_OPTIONS} selected={soapMethod} onSelect={(v) => setSoapMethod(v as SoapMethod)} />

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>Humidity</Text>
        <FilterBar options={HUMIDITY_OPTIONS} selected={humidity} onSelect={(v) => setHumidity(v as Humidity)} />

        <CalculatorInput label="Batch Date (MM/DD/YYYY)" value={batchDate} onChangeText={setBatchDate} placeholder="05/26/2026" keyboardType="numeric" />

        {results ? (
          <>
            <View className="rounded-xl p-4 mt-4 items-center" style={{ backgroundColor: colors.surface, borderWidth: 2, borderColor: stageColor }}>
              <Text className="text-[24px]" style={{ fontFamily: "Inter_700Bold", color: stageColor }}>{results.currentStage}</Text>
              {results.daysToNextMilestone > 0 && (
                <Text className="text-[13px] mt-1" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>{results.daysToNextMilestone} days to next milestone</Text>
              )}
            </View>
            <ResultCard title="Milestones" results={resultItems.slice(2)} />
          </>
        ) : (
          <View className="rounded-xl p-4 mt-4 items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>Enter batch date (MM/DD/YYYY) to track cure</Text>
          </View>
        )}

        <ActionBar onSaveToHistory={handleSave} onAddToQuote={() => Alert.alert("Coming Soon", "Quote feature coming soon.")} onLogToProject={() => Alert.alert("Coming Soon", "Project logging coming soon.")} />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
