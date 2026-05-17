import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import {
  calculateKerfComp,
  type JointType,
} from "../../../../src/modules/laser/calculators/kerfComp";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const JOINT_OPTIONS = [
  { label: "Inlay", value: "inlay" },
  { label: "Press-Fit", value: "press-fit" },
  { label: "Box-Joint", value: "box-joint" },
];

export default function KerfCompScreen() {
  const { colors } = useTheme();

  const [jointType, setJointType] = useState<JointType>("inlay");
  const [designDimension, setDesignDimension] = useState("");
  const [kerfWidth, setKerfWidth] = useState("");
  const [affectedEdges, setAffectedEdges] = useState("2");

  const results = useMemo(() => {
    const dim = parseFloat(designDimension);
    const kerf = parseFloat(kerfWidth);
    const edges = parseFloat(affectedEdges) || 2;

    if (!dim || !kerf || dim <= 0 || kerf <= 0) return null;

    return calculateKerfComp({
      designDimension: dim,
      kerfWidth: kerf,
      jointType,
      affectedEdges: edges,
    });
  }, [designDimension, kerfWidth, jointType, affectedEdges]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Male dimension", value: `${results.maleDimension}`, unit: "mm", highlight: true },
      { label: "Female dimension", value: `${results.femaleDimension}`, unit: "mm" },
      { label: "Total offset", value: `${results.totalOffset}`, unit: "mm" },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "laser",
        calculatorType: "kerf-comp",
        inputsJson: { jointType, designDimension, kerfWidth, affectedEdges },
        outputsJson: results,
        label: `${results.maleDimension}mm male / ${results.femaleDimension}mm female — ${jointType}`,
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
          Kerf Compensation
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Adjust cut dimensions to account for kerf width
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Joint Type
        </Text>
        <FilterBar
          options={JOINT_OPTIONS}
          selected={jointType}
          onSelect={(v) => setJointType(v as JointType)}
        />

        <CalculatorInput
          label="Design Dimension"
          value={designDimension}
          onChangeText={setDesignDimension}
          unit="mm"
          placeholder="100"
        />
        <CalculatorInput
          label="Kerf Width"
          value={kerfWidth}
          onChangeText={setKerfWidth}
          unit="mm"
          placeholder="0.2"
        />
        <CalculatorInput
          label="Affected Edges"
          value={affectedEdges}
          onChangeText={setAffectedEdges}
          unit="edges"
          placeholder="2"
          keyboardType="numeric"
        />

        {results ? (
          <ResultCard title="Results" results={resultItems} />
        ) : (
          <View
            className="rounded-xl p-4 mt-4 items-center justify-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}
          >
            <Text
              className="text-[13px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              Enter dimension and kerf to see results
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
