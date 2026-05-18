import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculatePrintTime } from "../../../../src/modules/printing/calculators/printTime";
import { getActiveProfile } from "../../../../src/modules/printing/data/printerProfiles";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { ShowMath } from "../../../../src/design-system/components/ShowMath";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default function PrintTimeScreen() {
  const { colors } = useTheme();

  const profile = useMemo(() => {
    try { return getActiveProfile(); } catch { return null; }
  }, []);

  const [xMm, setXMm] = useState("");
  const [yMm, setYMm] = useState("");
  const [zMm, setZMm] = useState("");
  const [layerHeight, setLayerHeight] = useState("0.2");
  const [infillPct, setInfillPct] = useState("20");
  const [wallCount, setWallCount] = useState("3");
  const [printSpeed, setPrintSpeed] = useState(
    profile?.defaultSpeedMms ? String(profile.defaultSpeedMms) : "60"
  );
  const [travelSpeed, setTravelSpeed] = useState(
    profile?.defaultTravelMms ? String(profile.defaultTravelMms) : "120"
  );
  const [nozzle, setNozzle] = useState(
    profile?.nozzleDiameter ? String(profile.nozzleDiameter) : "0.4"
  );

  const results = useMemo(() => {
    const x = parseFloat(xMm);
    const y = parseFloat(yMm);
    const z = parseFloat(zMm);
    const lh = parseFloat(layerHeight);
    const infill = parseFloat(infillPct);
    const walls = parseFloat(wallCount);
    const ps = parseFloat(printSpeed);
    const ts = parseFloat(travelSpeed);
    const noz = parseFloat(nozzle);
    if (!x || !y || !z || !lh || !infill || !walls || !ps || !ts || !noz) return null;
    if (x <= 0 || y <= 0 || z <= 0 || lh <= 0 || infill < 0 || walls <= 0) return null;
    return calculatePrintTime({
      xMm: x, yMm: y, zMm: z,
      layerHeight: lh, infillPct: infill, wallCount: walls,
      printSpeedMms: ps, travelSpeedMms: ts, nozzleDiameter: noz,
    });
  }, [xMm, yMm, zMm, layerHeight, infillPct, wallCount, printSpeed, travelSpeed, nozzle]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Print Time", value: formatTime(results.estimatedMinutes), highlight: true },
      { label: "Layer Count", value: `${results.layerCount}`, unit: "layers" },
      { label: "Total Extrusion", value: `${Math.round(results.totalExtrusionMm)}`, unit: "mm" },
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
        module: "printing",
        calculatorType: "print-time",
        inputsJson: { xMm, yMm, zMm, layerHeight, infillPct, wallCount, printSpeed, travelSpeed, nozzle },
        outputsJson: results,
        label: `${formatTime(results.estimatedMinutes)} — ${xMm}×${yMm}×${zMm}mm`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch {
      Alert.alert("Error", "Failed to save result.");
    }
  };

  const subtitle = profile ? `• ${profile.name}` : "Enter part dimensions to estimate print time";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Print Time
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          {subtitle}
        </Text>

        <CalculatorInput label="Part Width (X)" value={xMm} onChangeText={setXMm} unit="mm" placeholder="150" />
        <CalculatorInput label="Part Depth (Y)" value={yMm} onChangeText={setYMm} unit="mm" placeholder="150" />
        <CalculatorInput label="Part Height (Z)" value={zMm} onChangeText={setZMm} unit="mm" placeholder="50" />
        <CalculatorInput label="Layer Height" value={layerHeight} onChangeText={setLayerHeight} unit="mm" placeholder="0.2" />
        <CalculatorInput label="Infill" value={infillPct} onChangeText={setInfillPct} unit="%" placeholder="20" />
        <CalculatorInput label="Wall Count" value={wallCount} onChangeText={setWallCount} placeholder="3" />
        <CalculatorInput label="Print Speed" value={printSpeed} onChangeText={setPrintSpeed} unit="mm/s" placeholder="60" />
        <CalculatorInput label="Travel Speed" value={travelSpeed} onChangeText={setTravelSpeed} unit="mm/s" placeholder="120" />
        <CalculatorInput label="Nozzle Diameter" value={nozzle} onChangeText={setNozzle} unit="mm" placeholder="0.4" />

        {results ? (
          <>
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
              Enter part dimensions to estimate print time
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
