import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateFilamentUsage } from "../../../../src/modules/printing/calculators/filamentUsage";
import { getActiveProfile } from "../../../../src/modules/printing/data/printerProfiles";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { ShowMath } from "../../../../src/design-system/components/ShowMath";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function FilamentUsageScreen() {
  const { colors } = useTheme();

  const profile = useMemo(() => {
    try { return getActiveProfile(); } catch { return null; }
  }, []);

  const [xMm, setXMm] = useState("");
  const [yMm, setYMm] = useState("");
  const [zMm, setZMm] = useState("");
  const [infillPct, setInfillPct] = useState("20");
  const [wallCount, setWallCount] = useState("3");
  const [layerHeight, setLayerHeight] = useState("0.2");
  const [nozzle, setNozzle] = useState(
    profile?.nozzleDiameter ? String(profile.nozzleDiameter) : "0.4"
  );
  const [density, setDensity] = useState("1.24");
  const [costPerKg, setCostPerKg] = useState("20");
  const [filamentDiameter, setFilamentDiameter] = useState("1.75");

  const results = useMemo(() => {
    const x = parseFloat(xMm);
    const y = parseFloat(yMm);
    const z = parseFloat(zMm);
    const infill = parseFloat(infillPct);
    const walls = parseFloat(wallCount);
    const lh = parseFloat(layerHeight);
    const noz = parseFloat(nozzle);
    const dens = parseFloat(density);
    const fd = parseFloat(filamentDiameter);
    if (!x || !y || !z || !infill || !walls || !lh || !noz || !dens || !fd) return null;
    if (x <= 0 || y <= 0 || z <= 0) return null;
    const cost = parseFloat(costPerKg);
    return calculateFilamentUsage({
      xMm: x, yMm: y, zMm: z,
      infillPct: infill, wallCount: walls, layerHeight: lh,
      nozzleDiameter: noz, filamentDensity: dens,
      filamentCostPerKg: isNaN(cost) ? null : cost,
      filamentDiameter: fd,
    });
  }, [xMm, yMm, zMm, infillPct, wallCount, layerHeight, nozzle, density, costPerKg, filamentDiameter]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    const items = [
      { label: "Volume", value: `${Math.round(results.volumeCm3 * 100) / 100}`, unit: "cm³", highlight: true },
      { label: "Weight", value: `${Math.round(results.weightG * 10) / 10}`, unit: "g" },
      { label: "Filament Length", value: `${Math.round(results.filamentLengthM * 10) / 10}`, unit: "m" },
    ];
    if (results.estimatedCost !== null) {
      items.push({ label: "Estimated Cost", value: `$${(Math.round(results.estimatedCost * 100) / 100).toFixed(2)}`, unit: "" });
    }
    return items;
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
        calculatorType: "filament-usage",
        inputsJson: { xMm, yMm, zMm, infillPct, wallCount, layerHeight, nozzle, density, costPerKg, filamentDiameter },
        outputsJson: results,
        label: `${Math.round(results.weightG)}g · ${Math.round(results.filamentLengthM * 10) / 10}m — ${xMm}×${yMm}×${zMm}mm`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch {
      Alert.alert("Error", "Failed to save result.");
    }
  };

  const subtitle = profile ? `• ${profile.name}` : "Estimate filament weight, length, and cost";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Filament Usage
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
        <CalculatorInput label="Infill" value={infillPct} onChangeText={setInfillPct} unit="%" placeholder="20" />
        <CalculatorInput label="Wall Count" value={wallCount} onChangeText={setWallCount} placeholder="3" />
        <CalculatorInput label="Layer Height" value={layerHeight} onChangeText={setLayerHeight} unit="mm" placeholder="0.2" />
        <CalculatorInput label="Nozzle Diameter" value={nozzle} onChangeText={setNozzle} unit="mm" placeholder="0.4" />
        <CalculatorInput label="Filament Density" value={density} onChangeText={setDensity} unit="g/cm³" placeholder="1.24" />
        <CalculatorInput label="Cost per kg" value={costPerKg} onChangeText={setCostPerKg} unit="$/kg" placeholder="20" />
        <CalculatorInput label="Filament Diameter" value={filamentDiameter} onChangeText={setFilamentDiameter} unit="mm" placeholder="1.75" />

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
              Enter part dimensions to estimate filament usage
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
