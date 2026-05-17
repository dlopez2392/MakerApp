import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import {
  calculateFeedsAndSpeeds,
  type CutType,
} from "../../../../src/modules/cnc/calculators/feedsAndSpeeds";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { ShowMath } from "../../../../src/design-system/components/ShowMath";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const OPERATION_OPTIONS = [
  { label: "Profile", value: "profile" },
  { label: "Pocket", value: "pocket" },
  { label: "Slot", value: "slot" },
  { label: "Drill", value: "drill" },
];

export default function FeedsSpeedsScreen() {
  const { colors } = useTheme();

  const [operation, setOperation] = useState<CutType>("pocket");
  const [sfm, setSfm] = useState("");
  const [diameter, setDiameter] = useState("");
  const [flutes, setFlutes] = useState("");
  const [chipload, setChipload] = useState("");
  const [minRpm, setMinRpm] = useState("10000");
  const [maxRpm, setMaxRpm] = useState("30000");

  const results = useMemo(() => {
    const sfmVal = parseFloat(sfm);
    const diaVal = parseFloat(diameter);
    const flutesVal = parseFloat(flutes);
    const chiploadVal = parseFloat(chipload);
    const minRpmVal = parseFloat(minRpm) || 10000;
    const maxRpmVal = parseFloat(maxRpm) || 30000;

    if (!sfmVal || !diaVal || !flutesVal || !chiploadVal) return null;
    if (sfmVal <= 0 || diaVal <= 0 || flutesVal <= 0 || chiploadVal <= 0) return null;

    // map UI operation names to engine CutType
    const cutType: CutType =
      operation === "profile" || operation === "slot" || operation === "drill"
        ? "slot"
        : "pocket";

    return calculateFeedsAndSpeeds({
      sfm: sfmVal,
      toolDiameterIn: diaVal,
      chiploadIn: chiploadVal,
      flutes: flutesVal,
      cutType,
      routerMinRpm: minRpmVal,
      routerMaxRpm: maxRpmVal,
    });
  }, [operation, sfm, diameter, flutes, chipload, minRpm, maxRpm]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "RPM", value: `${results.rpm}`, unit: "RPM", highlight: true },
      { label: "Feed Rate", value: `${results.feedRateIpm}`, unit: "IPM" },
      { label: "Plunge Rate", value: `${results.plungeRateIpm}`, unit: "IPM" },
      { label: "Width of Cut", value: `${results.wocIn}"`, unit: `(${results.wocPct}%)` },
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
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "cnc",
        calculatorType: "feeds-speeds",
        inputsJson: { operation, sfm, diameter, flutes, chipload, minRpm, maxRpm },
        outputsJson: results,
        label: `${results.rpm} RPM @ ${results.feedRateIpm} IPM — ${operation}`,
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
          Feeds & Speeds
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate RPM, feed rate, and plunge rate for CNC operations
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Operation
        </Text>
        <FilterBar
          options={OPERATION_OPTIONS}
          selected={operation}
          onSelect={(v) => setOperation(v as CutType)}
        />

        <CalculatorInput
          label="Surface Feet per Minute (SFM)"
          value={sfm}
          onChangeText={setSfm}
          unit="SFM"
          placeholder="200"
        />
        <CalculatorInput
          label="Tool Diameter"
          value={diameter}
          onChangeText={setDiameter}
          unit="in"
          placeholder="0.25"
        />
        <CalculatorInput
          label="Number of Flutes"
          value={flutes}
          onChangeText={setFlutes}
          placeholder="2"
        />
        <CalculatorInput
          label="Chipload per Tooth"
          value={chipload}
          onChangeText={setChipload}
          unit="in"
          placeholder="0.004"
        />
        <CalculatorInput
          label="Router Min RPM"
          value={minRpm}
          onChangeText={setMinRpm}
          unit="RPM"
          placeholder="10000"
        />
        <CalculatorInput
          label="Router Max RPM"
          value={maxRpm}
          onChangeText={setMaxRpm}
          unit="RPM"
          placeholder="30000"
        />

        {results ? (
          <>
            <ResultCard title="Results" results={resultItems} />
            {results.warnings.length > 0 && (
              <View
                className="rounded-lg p-3 mt-3"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              >
                {results.warnings.map((w, i) => (
                  <Text
                    key={i}
                    className="text-[12px]"
                    style={{ fontFamily: "Inter_400Regular", color: colors.warning ?? colors.textSecondary }}
                  >
                    {w}
                  </Text>
                ))}
              </View>
            )}
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
              Enter tool parameters to calculate feeds & speeds
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
