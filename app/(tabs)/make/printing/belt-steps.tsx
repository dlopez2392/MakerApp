import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculateBeltSteps } from "../../../../src/modules/printing/calculators/beltSteps";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { ShowMath } from "../../../../src/design-system/components/ShowMath";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const AXIS_OPTIONS = [
  { label: "Belt", value: "belt" },
  { label: "Leadscrew", value: "leadscrew" },
];

const STEP_ANGLE_OPTIONS = [
  { label: "1.8°", value: "1.8" },
  { label: "0.9°", value: "0.9" },
];

const MICROSTEPPING_OPTIONS = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "4", value: "4" },
  { label: "8", value: "8" },
  { label: "16", value: "16" },
  { label: "32", value: "32" },
];

export default function BeltStepsScreen() {
  const { colors } = useTheme();

  const [axisType, setAxisType] = useState("belt");
  const [stepAngle, setStepAngle] = useState("1.8");
  const [microstepping, setMicrostepping] = useState("16");
  const [pulleyTeeth, setPulleyTeeth] = useState("20");
  const [beltPitch, setBeltPitch] = useState("2");
  const [leadMm, setLeadMm] = useState("8");

  const results = useMemo(() => {
    const sa = parseFloat(stepAngle);
    const ms = parseFloat(microstepping);
    if (!sa || !ms) return null;
    if (axisType === "belt") {
      const teeth = parseFloat(pulleyTeeth);
      const pitch = parseFloat(beltPitch);
      if (!teeth || !pitch || teeth <= 0 || pitch <= 0) return null;
      return calculateBeltSteps({
        axisType: "belt",
        motorStepAngle: sa,
        microstepping: ms,
        pulleyTeeth: teeth,
        beltPitch: pitch,
        leadMm: null,
      });
    } else {
      const lead = parseFloat(leadMm);
      if (!lead || lead <= 0) return null;
      return calculateBeltSteps({
        axisType: "leadscrew",
        motorStepAngle: sa,
        microstepping: ms,
        pulleyTeeth: null,
        beltPitch: null,
        leadMm: lead,
      });
    }
  }, [axisType, stepAngle, microstepping, pulleyTeeth, beltPitch, leadMm]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Steps per mm", value: `${Math.round(results.stepsPerMm * 10000) / 10000}`, unit: "steps/mm", highlight: true },
      { label: "Resolution", value: `${Math.round(results.resolutionUm * 1000) / 1000}`, unit: "µm" },
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
        calculatorType: "belt-steps",
        inputsJson: { axisType, stepAngle, microstepping, pulleyTeeth, beltPitch, leadMm },
        outputsJson: results,
        label: `${Math.round(results.stepsPerMm * 100) / 100} steps/mm — ${axisType} ${stepAngle}° ×${microstepping}`,
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
          Belt / Steps
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate steps/mm for belt drives and leadscrews
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Axis Type
        </Text>
        <FilterBar options={AXIS_OPTIONS} selected={axisType} onSelect={(v) => setAxisType(v)} />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-3"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Motor Step Angle
        </Text>
        <FilterBar options={STEP_ANGLE_OPTIONS} selected={stepAngle} onSelect={(v) => setStepAngle(v)} />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-3"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Microstepping
        </Text>
        <FilterBar options={MICROSTEPPING_OPTIONS} selected={microstepping} onSelect={(v) => setMicrostepping(v)} />

        {axisType === "belt" ? (
          <>
            <CalculatorInput label="Pulley Teeth" value={pulleyTeeth} onChangeText={setPulleyTeeth} unit="teeth" placeholder="20" />
            <CalculatorInput label="Belt Pitch" value={beltPitch} onChangeText={setBeltPitch} unit="mm" placeholder="2" />
          </>
        ) : (
          <CalculatorInput label="Lead" value={leadMm} onChangeText={setLeadMm} unit="mm/rev" placeholder="8" />
        )}

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
              Select axis type and enter drive parameters
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
