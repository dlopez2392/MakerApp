import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateMaxVolumetricFlow } from "../../../../src/modules/printing/calculators/maxVolumetricFlow";
import { getActiveProfile } from "../../../../src/modules/printing/data/printerProfiles";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { ShowMath } from "../../../../src/design-system/components/ShowMath";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function MaxFlowScreen() {
  const { colors } = useTheme();

  const profile = useMemo(() => {
    try { return getActiveProfile(); } catch { return null; }
  }, []);

  const [layerHeight, setLayerHeight] = useState("0.2");
  const [lineWidth, setLineWidth] = useState("0.4");
  const [printSpeed, setPrintSpeed] = useState(
    profile?.defaultSpeedMms ? String(profile.defaultSpeedMms) : "60"
  );
  const [hotendMaxFlow, setHotendMaxFlow] = useState(
    profile?.maxVolumetricFlow ? String(profile.maxVolumetricFlow) : "15"
  );

  const results = useMemo(() => {
    const lh = parseFloat(layerHeight);
    const lw = parseFloat(lineWidth);
    const ps = parseFloat(printSpeed);
    const mf = parseFloat(hotendMaxFlow);
    if (!lh || !lw || !ps || !mf) return null;
    if (lh <= 0 || lw <= 0 || ps <= 0 || mf <= 0) return null;
    return calculateMaxVolumetricFlow({ layerHeight: lh, lineWidth: lw, printSpeedMms: ps, hotendMaxFlow: mf });
  }, [layerHeight, lineWidth, printSpeed, hotendMaxFlow]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Volumetric Flow", value: `${Math.round(results.calculatedFlow * 100) / 100}`, unit: "mm³/s", highlight: true },
      { label: "Hotend Capacity", value: `${Math.round(results.hotendCapacityPct * 10) / 10}`, unit: "%" },
      { label: "Max Safe Speed", value: `${Math.round(results.maxSafeSpeedMms * 10) / 10}`, unit: "mm/s" },
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

  const statusColor = useMemo(() => {
    if (!results) return null;
    if (results.status === "safe") return colors.success ?? "#22c55e";
    if (results.status === "warning") return colors.warning ?? "#f59e0b";
    return "#ef4444";
  }, [results, colors]);

  const statusLabel = useMemo(() => {
    if (!results) return null;
    if (results.status === "safe") return "Safe — within hotend capacity";
    if (results.status === "warning") return "Warning — approaching max flow (≥80%)";
    return "Exceeds — reduce speed or increase hotend";
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "printing",
        calculatorType: "max-flow",
        inputsJson: { layerHeight, lineWidth, printSpeed, hotendMaxFlow },
        outputsJson: results,
        label: `${Math.round(results.calculatedFlow * 100) / 100} mm³/s · ${Math.round(results.hotendCapacityPct)}% capacity`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch {
      Alert.alert("Error", "Failed to save result.");
    }
  };

  const subtitle = profile ? `• ${profile.name}` : "Check if your print speed exceeds hotend capacity";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Max Volumetric Flow
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          {subtitle}
        </Text>

        <CalculatorInput label="Layer Height" value={layerHeight} onChangeText={setLayerHeight} unit="mm" placeholder="0.2" />
        <CalculatorInput label="Line Width" value={lineWidth} onChangeText={setLineWidth} unit="mm" placeholder="0.4" />
        <CalculatorInput label="Print Speed" value={printSpeed} onChangeText={setPrintSpeed} unit="mm/s" placeholder="60" />
        <CalculatorInput label="Hotend Max Flow" value={hotendMaxFlow} onChangeText={setHotendMaxFlow} unit="mm³/s" placeholder="15" />

        {results ? (
          <>
            {statusColor && statusLabel ? (
              <View
                className="rounded-lg p-3 mt-4"
                style={{ backgroundColor: `${statusColor}22`, borderWidth: 1, borderColor: statusColor }}
              >
                <Text
                  className="text-[13px]"
                  style={{ fontFamily: "Inter_500Medium", color: statusColor }}
                >
                  {statusLabel}
                </Text>
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
              Enter print settings to check volumetric flow
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
