import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateRetraction } from "../../../../src/modules/printing/calculators/retractionTuning";
import { getActiveProfile } from "../../../../src/modules/printing/data/printerProfiles";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { ShowMath } from "../../../../src/design-system/components/ShowMath";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const FILAMENT_OPTIONS = [
  { label: "PLA", value: "pla" },
  { label: "PETG", value: "petg" },
  { label: "ABS", value: "abs" },
  { label: "TPU", value: "tpu" },
];

const EXTRUDER_OPTIONS = [
  { label: "Direct", value: "direct" },
  { label: "Bowden", value: "bowden" },
];

export default function RetractionScreen() {
  const { colors } = useTheme();

  const profile = useMemo(() => {
    try { return getActiveProfile(); } catch { return null; }
  }, []);

  const [filament, setFilament] = useState("pla");
  const [extruder, setExtruder] = useState(
    profile?.extruderType === "bowden" ? "bowden" : "direct"
  );
  const [bowdenLength, setBowdenLength] = useState(
    profile?.bowdenLengthMm ? String(profile.bowdenLengthMm) : "400"
  );
  const [nozzle, setNozzle] = useState(
    profile?.nozzleDiameter ? String(profile.nozzleDiameter) : "0.4"
  );

  const results = useMemo(() => {
    const noz = parseFloat(nozzle);
    if (!noz || noz <= 0) return null;
    const bowdenMm = extruder === "bowden" ? (parseFloat(bowdenLength) || 400) : null;
    return calculateRetraction({
      filamentCategory: filament,
      extruderType: extruder as "bowden" | "direct",
      bowdenLengthMm: bowdenMm,
      nozzleDiameter: noz,
    });
  }, [filament, extruder, bowdenLength, nozzle]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Retraction Distance", value: `${Math.round(results.retractionDistMm * 1000) / 1000}`, unit: "mm", highlight: true },
      { label: "Retraction Speed", value: `${results.retractionSpeedMms}`, unit: "mm/s" },
      { label: "Z-Hop", value: `${Math.round(results.zHopMm * 1000) / 1000}`, unit: "mm" },
      { label: "Prime Amount", value: `${Math.round(results.primeAmountMm * 10000) / 10000}`, unit: "mm" },
    ];
  }, [results]);

  const mathSteps = useMemo(() => {
    if (!results) return [];
    return results.mathSteps.map((s) => ({
      label: s.label,
      formula: s.formula,
      result: `${s.result} ${s.unit}`,
    }));
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter a valid nozzle diameter.");
      return;
    }
    try {
      CalculatorService.save({
        module: "printing",
        calculatorType: "retraction",
        inputsJson: { filament, extruder, bowdenLength, nozzle },
        outputsJson: results,
        label: `${filament.toUpperCase()} ${extruder} — ${Math.round(results.retractionDistMm * 1000) / 1000}mm @ ${results.retractionSpeedMms}mm/s`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch {
      Alert.alert("Error", "Failed to save result.");
    }
  };

  const subtitle = profile ? `• ${profile.name}` : "Suggested retraction settings by filament and extruder type";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Retraction Tuning
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          {subtitle}
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Filament
        </Text>
        <FilterBar options={FILAMENT_OPTIONS} selected={filament} onSelect={(v) => setFilament(v)} />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-3"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Extruder Type
        </Text>
        <FilterBar options={EXTRUDER_OPTIONS} selected={extruder} onSelect={(v) => setExtruder(v)} />

        {extruder === "bowden" ? (
          <CalculatorInput
            label="Bowden Tube Length"
            value={bowdenLength}
            onChangeText={setBowdenLength}
            unit="mm"
            placeholder="400"
          />
        ) : null}

        <CalculatorInput
          label="Nozzle Diameter"
          value={nozzle}
          onChangeText={setNozzle}
          unit="mm"
          placeholder="0.4"
        />

        {results ? (
          <>
            {results.warnings.length > 0 ? (
              <View
                className="rounded-lg p-3 mt-4"
                style={{
                  backgroundColor: `${colors.warning ?? "#f59e0b"}22`,
                  borderWidth: 1,
                  borderColor: colors.warning ?? "#f59e0b",
                }}
              >
                {results.warnings.map((w, i) => (
                  <Text
                    key={i}
                    className="text-[12px]"
                    style={{ fontFamily: "Inter_400Regular", color: colors.warning ?? "#f59e0b" }}
                  >
                    {w}
                  </Text>
                ))}
              </View>
            ) : null}
            <ResultCard title="Results" results={resultItems} />
            <ShowMath steps={mathSteps} />
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
              Enter nozzle diameter to calculate retraction settings
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
