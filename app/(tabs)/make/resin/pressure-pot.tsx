import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculatePressurePot } from "../../../../src/modules/resin/calculators/pressurePot";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const POT_UNIT_OPTIONS = [
  { label: "inches", value: "in" },
  { label: "cm", value: "cm" },
];

const MOLD_UNIT_OPTIONS = [
  { label: "inches", value: "in" },
  { label: "cm", value: "cm" },
];

type DimUnit = "in" | "cm";

export default function PressurePotScreen() {
  const { colors } = useTheme();

  const [potUnit, setPotUnit] = useState<DimUnit>("in");
  const [moldUnit, setMoldUnit] = useState<DimUnit>("in");
  const [potDiameter, setPotDiameter] = useState("");
  const [potHeight, setPotHeight] = useState("");
  const [moldDiameter, setMoldDiameter] = useState("");
  const [moldHeight, setMoldHeight] = useState("");
  const [numberOfMolds, setNumberOfMolds] = useState("1");
  const [heightClearance, setHeightClearance] = useState("1");

  const results = useMemo(() => {
    const pd = parseFloat(potDiameter);
    const ph = parseFloat(potHeight);
    const md = parseFloat(moldDiameter);
    const mh = parseFloat(moldHeight);
    const nm = parseInt(numberOfMolds, 10);
    const hc = parseFloat(heightClearance);
    if (!pd || pd <= 0 || !ph || ph <= 0 || !md || md <= 0 || !mh || mh <= 0 || !nm || nm <= 0) return null;

    return calculatePressurePot({
      potDiameter: pd,
      potHeight: ph,
      potUnit,
      moldDiameter: md,
      moldHeight: mh,
      moldUnit,
      numberOfMolds: nm,
      heightClearance: hc || (potUnit === "in" ? 1 : 2.54),
    });
  }, [potDiameter, potHeight, moldDiameter, moldHeight, numberOfMolds, heightClearance, potUnit, moldUnit]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Max Molds", value: `${results.maxMoldsFit}`, highlight: true },
      { label: "Total Resin", value: `${results.totalResinMl}`, unit: "ml" },
      { label: "Total Weight", value: `${results.totalResinWeightG}`, unit: "g" },
      { label: "Height Clearance Left", value: `${results.heightClearanceRemaining}`, unit: "cm" },
    ];
  }, [results]);

  const verdictColor = results?.fitVerdict === "fits" ? colors.success : colors.danger;
  const verdictLabel: Record<string, string> = {
    "fits": "Fits",
    "too-tall": "Too Tall",
    "too-wide": "Too Wide",
    "too-many": "Too Many",
  };

  const handleSave = () => {
    if (!results) { Alert.alert("No Results", "Enter valid inputs to save."); return; }
    try {
      CalculatorService.save({
        module: "resin",
        calculatorType: "pressure-pot",
        inputsJson: { potDiameter, potHeight, potUnit, moldDiameter, moldHeight, moldUnit, numberOfMolds, heightClearance },
        outputsJson: results,
        label: `${results.fitVerdict === "fits" ? "Fits" : "Does not fit"} — ${results.maxMoldsFit} max molds`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch { Alert.alert("Error", "Failed to save result."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          Pressure Pot Sizing
        </Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>
          Check mold fit and plan batch pours
        </Text>

        <Text className="text-[12px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
          Pot Dimensions ({potUnit})
        </Text>
        <FilterBar options={POT_UNIT_OPTIONS} selected={potUnit} onSelect={(v) => setPotUnit(v as DimUnit)} />
        <CalculatorInput label="Pot Inner Diameter" value={potDiameter} onChangeText={setPotDiameter} unit={potUnit} placeholder="10" />
        <CalculatorInput label="Pot Inner Height" value={potHeight} onChangeText={setPotHeight} unit={potUnit} placeholder="12" />
        <CalculatorInput label="Lid Clearance" value={heightClearance} onChangeText={setHeightClearance} unit={potUnit} placeholder="1" />

        <Text className="text-[12px] uppercase tracking-wider mb-2 mt-2" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
          Mold Dimensions ({moldUnit})
        </Text>
        <FilterBar options={MOLD_UNIT_OPTIONS} selected={moldUnit} onSelect={(v) => setMoldUnit(v as DimUnit)} />
        <CalculatorInput label="Mold Diameter" value={moldDiameter} onChangeText={setMoldDiameter} unit={moldUnit} placeholder="3" />
        <CalculatorInput label="Mold Height" value={moldHeight} onChangeText={setMoldHeight} unit={moldUnit} placeholder="4" />
        <CalculatorInput label="Number of Molds" value={numberOfMolds} onChangeText={setNumberOfMolds} unit="molds" placeholder="1" />

        {results ? (
          <>
            <View className="rounded-xl p-4 mt-4 items-center" style={{ backgroundColor: colors.surface, borderWidth: 2, borderColor: verdictColor }}>
              <Text className="text-[28px]" style={{ fontFamily: "Inter_700Bold", color: verdictColor }}>
                {verdictLabel[results.fitVerdict] ?? results.fitVerdict}
              </Text>
              {results.failReason && (
                <Text className="text-[13px] mt-1 text-center" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>
                  {results.failReason}
                </Text>
              )}
            </View>

            <ResultCard title="Details" results={resultItems} />

            <View className="rounded-lg p-3 mt-3" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <Text className="text-[12px] leading-5" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>
                {"•"} Leave 1 inch clearance above molds for lid seal{"\n"}{"•"} Molds should not touch pot walls — use spacers
              </Text>
            </View>
          </>
        ) : (
          <View className="rounded-xl p-4 mt-4 items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}>
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
              Enter pot and mold dimensions to check fit
            </Text>
          </View>
        )}

        <ActionBar onSaveToHistory={handleSave} onAddToQuote={() => Alert.alert("Coming Soon", "Quote feature coming soon.")} onLogToProject={() => Alert.alert("Coming Soon", "Project logging coming soon.")} />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
