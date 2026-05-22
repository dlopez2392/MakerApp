import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import {
  calculatePowerSpeed,
  type LaserOperationType,
} from "../../../../src/modules/laser/calculators/powerSpeed";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { RecipeService } from "../../../../src/core/services/RecipeService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const OPERATION_OPTIONS = [
  { label: "Cut", value: "cut" },
  { label: "Engrave", value: "engrave" },
  { label: "Score", value: "score" },
];

const WATTAGE_OPTIONS = [
  { label: "40W", value: "40" },
  { label: "60W", value: "60" },
  { label: "80W", value: "80" },
  { label: "100W", value: "100" },
];

export default function PowerSpeedScreen() {
  const { colors } = useTheme();

  const [operation, setOperation] = useState<LaserOperationType>("cut");
  const [targetWattage, setTargetWattage] = useState("60");
  const [thickness, setThickness] = useState("");
  const [basePower, setBasePower] = useState("");
  const [baseSpeed, setBaseSpeed] = useState("");

  const results = useMemo(() => {
    const thick = parseFloat(thickness);
    const power = parseFloat(basePower);
    const speed = parseFloat(baseSpeed);
    const wattage = parseFloat(targetWattage);

    if (!thick || !power || !speed || thick <= 0 || power <= 0 || speed <= 0) return null;

    return calculatePowerSpeed({
      operation,
      targetWattage: wattage,
      baseWattage: 40,
      thicknessMm: thick,
      powerPctBase: power,
      speedMmsBase: speed,
      passesBase: 1,
    });
  }, [operation, targetWattage, thickness, basePower, baseSpeed]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Power", value: `${results.powerPct}`, unit: "%", highlight: true },
      { label: "Speed", value: `${results.speedMms}`, unit: "mm/s" },
      { label: "Passes", value: `${results.passes}` },
      { label: "Power range", value: `${results.powerRange.min}–${results.powerRange.max}`, unit: "%" },
      { label: "Speed range", value: `${results.speedRange.min}–${results.speedRange.max}`, unit: "mm/s" },
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
        calculatorType: "power-speed",
        inputsJson: { operation, targetWattage, thickness, basePower, baseSpeed },
        outputsJson: results,
        label: `${results.powerPct}% @ ${results.speedMms}mm/s — ${operation}`,
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
          Power & Speed
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Scale power/speed settings across laser wattages
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
          onSelect={(v) => setOperation(v as LaserOperationType)}
        />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Target Wattage
        </Text>
        <FilterBar
          options={WATTAGE_OPTIONS}
          selected={targetWattage}
          onSelect={setTargetWattage}
        />

        <CalculatorInput
          label="Material Thickness"
          value={thickness}
          onChangeText={setThickness}
          unit="mm"
          placeholder="3"
        />
        <CalculatorInput
          label="Base Power (at 40W)"
          value={basePower}
          onChangeText={setBasePower}
          unit="%"
          placeholder="80"
        />
        <CalculatorInput
          label="Base Speed (at 40W)"
          value={baseSpeed}
          onChangeText={setBaseSpeed}
          unit="mm/s"
          placeholder="10"
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
              Enter base settings to see scaled results
            </Text>
          </View>
        )}

        <ActionBar
          onSaveToHistory={handleSave}
          onAddToQuote={() => Alert.alert("Coming Soon", "Quote feature coming soon.")}
          onLogToProject={() => Alert.alert("Coming Soon", "Project logging coming soon.")}
          onSaveAsRecipe={() => {
            if (!results) { Alert.alert("No Results", "Enter valid inputs first."); return; }
            const defaultName = `${operation} ${results.powerPct}%@${results.speedMms}mm/s — ${new Date().toLocaleDateString()}`;
            Alert.alert("Save as Recipe", `Save as "${defaultName}"?`, [
              { text: "Cancel", style: "cancel" },
              {
                text: "Save",
                onPress: () => {
                  try {
                    RecipeService.create({
                      module: "laser",
                      recipeType: "power-speed",
                      name: defaultName,
                      configJson: { operation, targetWattage, thickness, basePower, baseSpeed },
                    });
                    Alert.alert("Saved", "Recipe saved successfully.");
                  } catch (e: any) { Alert.alert("Error", e.message || "Failed to save recipe."); }
                },
              },
            ]);
          }}
          onLoadRecipe={() => {
            const recipes = RecipeService.getByModule("laser").filter((r) => r.recipeType === "power-speed");
            if (recipes.length === 0) { Alert.alert("No Recipes", "No saved power-speed recipes."); return; }
            const buttons = recipes.slice(0, 5).map((r) => ({
              text: r.name,
              onPress: () => {
                const c = r.configJson as Record<string, string>;
                if (c.operation) setOperation(c.operation as LaserOperationType);
                if (c.targetWattage) setTargetWattage(c.targetWattage);
                if (c.thickness) setThickness(c.thickness);
                if (c.basePower) setBasePower(c.basePower);
                if (c.baseSpeed) setBaseSpeed(c.baseSpeed);
              },
            }));
            buttons.push({ text: "Cancel", onPress: () => {} });
            Alert.alert("Load Recipe", "Choose a saved recipe:", buttons);
          }}
        />

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
