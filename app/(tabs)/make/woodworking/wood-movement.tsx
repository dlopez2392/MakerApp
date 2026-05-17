import { useState, useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Alert,
  Pressable,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import {
  calculateWoodMovement,
  type GrainOrientation,
} from "../../../../src/modules/woodworking/calculators/woodMovement";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { SafetyWarning } from "../../../../src/design-system/components/SafetyWarning";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const COMMON_SPECIES = [
  { name: "Red Oak", tangential: 8.6, radial: 4.0 },
  { name: "White Oak", tangential: 9.0, radial: 5.6 },
  { name: "Hard Maple", tangential: 9.9, radial: 4.8 },
  { name: "Cherry", tangential: 7.1, radial: 3.7 },
  { name: "Walnut", tangential: 7.8, radial: 5.5 },
  { name: "Pine", tangential: 7.7, radial: 4.1 },
  { name: "Poplar", tangential: 8.2, radial: 4.6 },
  { name: "Ash", tangential: 7.8, radial: 4.9 },
];

const ORIENTATION_OPTIONS = [
  { label: "Flat-sawn", value: "flat-sawn" },
  { label: "Quarter-sawn", value: "quarter-sawn" },
  { label: "Rift-sawn", value: "rift-sawn" },
];

export default function WoodMovementScreen() {
  const { colors } = useTheme();

  const [selectedSpecies, setSelectedSpecies] = useState(COMMON_SPECIES[0]);
  const [orientation, setOrientation] = useState<GrainOrientation>("flat-sawn");
  const [width, setWidth] = useState("");
  const [currentMC, setCurrentMC] = useState("");
  const [targetMC, setTargetMC] = useState("");

  const [pickerVisible, setPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSpecies = useMemo(
    () =>
      COMMON_SPECIES.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const results = useMemo(() => {
    const w = parseFloat(width);
    const cMC = parseFloat(currentMC);
    const tMC = parseFloat(targetMC);

    if (!w || isNaN(cMC) || isNaN(tMC) || w <= 0) return null;

    return calculateWoodMovement({
      width: w,
      currentMC: cMC,
      targetMC: tMC,
      tangentialShrinkage: selectedSpecies.tangential,
      radialShrinkage: selectedSpecies.radial,
      orientation,
    });
  }, [width, currentMC, targetMC, selectedSpecies, orientation]);

  const directionLabel = useMemo(() => {
    if (!results) return "";
    if (results.direction === "shrinkage") return "Shrinkage";
    if (results.direction === "expansion") return "Expansion";
    return "No Change";
  }, [results]);

  const fractionLabel = useMemo(() => {
    if (!results) return "";
    const { whole, numerator, denominator } = results.movementFraction;
    if (whole === 0 && numerator === 0) return "0";
    if (numerator === 0) return `${whole}"`;
    if (whole === 0) return `${numerator}/${denominator}"`;
    return `${whole} ${numerator}/${denominator}"`;
  }, [results]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      {
        label: "Movement",
        value: results.movementInches.toFixed(4),
        unit: "in",
        highlight: true,
      },
      {
        label: "As fraction",
        value: fractionLabel,
      },
      {
        label: "Direction",
        value: directionLabel,
      },
      {
        label: "Shrinkage coefficient",
        value: (results.coefficient * 100).toFixed(2),
        unit: "%/MC%",
      },
    ];
  }, [results, fractionLabel, directionLabel]);

  const handleSave = () => {
    if (!results) {
      Alert.alert("No Results", "Enter valid inputs to save.");
      return;
    }
    try {
      CalculatorService.save({
        module: "woodworking",
        calculatorType: "wood-movement",
        inputsJson: {
          species: selectedSpecies.name,
          orientation,
          width,
          currentMC,
          targetMC,
        },
        outputsJson: results,
        label: `${selectedSpecies.name} — ${results.movementInches.toFixed(4)}" ${directionLabel}`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch {
      Alert.alert("Error", "Failed to save result.");
    }
  };

  const handleAddToQuote = () => {
    Alert.alert("Coming Soon", "Quote feature coming soon.");
  };

  const handleLogToProject = () => {
    Alert.alert("Coming Soon", "Project logging coming soon.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Wood Movement
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Calculate seasonal expansion and contraction by species
        </Text>

        {/* Species Picker */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Species
        </Text>
        <Pressable
          onPress={() => setPickerVisible(true)}
          className="rounded-xl px-4 py-3 mb-4 flex-row justify-between items-center"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          accessibilityRole="button"
          accessibilityLabel={`Selected species: ${selectedSpecies.name}. Tap to change.`}
        >
          <View>
            <Text
              className="text-[15px]"
              style={{
                fontFamily: "Inter_500Medium",
                color: colors.textPrimary,
              }}
            >
              {selectedSpecies.name}
            </Text>
            <Text
              className="text-[11px] mt-0.5"
              style={{
                fontFamily: "Inter_400Regular",
                color: colors.textMuted,
              }}
            >
              T: {selectedSpecies.tangential}% · R: {selectedSpecies.radial}%
            </Text>
          </View>
          <Text
            className="text-[13px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.primary }}
          >
            Change
          </Text>
        </Pressable>

        {/* Orientation */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Grain Orientation
        </Text>
        <FilterBar
          options={ORIENTATION_OPTIONS}
          selected={orientation}
          onSelect={(v) => setOrientation(v as GrainOrientation)}
        />

        {/* Inputs */}
        <CalculatorInput
          label="Board Width"
          value={width}
          onChangeText={setWidth}
          unit="in"
          placeholder="8"
        />
        <CalculatorInput
          label="Current MC"
          value={currentMC}
          onChangeText={setCurrentMC}
          unit="%"
          placeholder="12"
        />
        <CalculatorInput
          label="Target MC"
          value={targetMC}
          onChangeText={setTargetMC}
          unit="%"
          placeholder="7"
        />

        {/* Warning */}
        {results?.warningFlag && (
          <SafetyWarning
            level="warning"
            message={'Movement exceeds 1/8". Account for this in joinery — use floating panels, elongated screw holes, or wood movement clips to prevent cracking or joint failure.'}
          />
        )}

        {/* Results */}
        {results && <ResultCard title="Results" results={resultItems} />}

        {!results && (
          <View
            className="rounded-xl p-4 mt-4 items-center justify-center"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              minHeight: 80,
            }}
          >
            <Text
              className="text-[13px]"
              style={{
                fontFamily: "Inter_400Regular",
                color: colors.textMuted,
              }}
            >
              Enter dimensions and moisture content to see results
            </Text>
          </View>
        )}

        <ActionBar
          onSaveToHistory={handleSave}
          onAddToQuote={handleAddToQuote}
          onLogToProject={handleLogToProject}
        />

        <View className="h-8" />
      </ScrollView>

      {/* Species Picker Modal */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View
            className="px-4 pt-4 pb-2"
            style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text
                className="text-[18px]"
                style={{
                  fontFamily: "Inter_600SemiBold",
                  color: colors.textPrimary,
                }}
              >
                Select Species
              </Text>
              <Pressable
                onPress={() => {
                  setPickerVisible(false);
                  setSearchQuery("");
                }}
                accessibilityRole="button"
                accessibilityLabel="Close species picker"
              >
                <Text
                  className="text-[15px]"
                  style={{
                    fontFamily: "Inter_500Medium",
                    color: colors.primary,
                  }}
                >
                  Done
                </Text>
              </Pressable>
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search species..."
              placeholderTextColor={colors.textMuted}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                fontFamily: "Inter_400Regular",
                color: colors.textPrimary,
                fontSize: 14,
              }}
            />
          </View>
          <FlatList
            data={filteredSpecies}
            keyExtractor={(item) => item.name}
            contentContainerStyle={{ padding: 16, gap: 8 }}
            renderItem={({ item }) => {
              const isSelected = item.name === selectedSpecies.name;
              return (
                <Pressable
                  onPress={() => {
                    setSelectedSpecies(item);
                    setPickerVisible(false);
                    setSearchQuery("");
                  }}
                  className="rounded-xl px-4 py-3 flex-row justify-between items-center"
                  style={{
                    backgroundColor: isSelected
                      ? `${colors.primary}20`
                      : colors.surface,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.primary : colors.border,
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View>
                    <Text
                      className="text-[15px]"
                      style={{
                        fontFamily: "Inter_500Medium",
                        color: isSelected ? colors.primary : colors.textPrimary,
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      className="text-[11px] mt-0.5"
                      style={{
                        fontFamily: "Inter_400Regular",
                        color: colors.textMuted,
                      }}
                    >
                      Tangential: {item.tangential}% · Radial: {item.radial}%
                    </Text>
                  </View>
                  {isSelected && (
                    <Text
                      className="text-[16px]"
                      style={{ color: colors.primary }}
                    >
                      ✓
                    </Text>
                  )}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
