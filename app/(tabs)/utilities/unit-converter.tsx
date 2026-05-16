import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, View, Text, Pressable } from "react-native";
import { convert, CATEGORIES } from "../../../src/modules/utilities/calculators/unitConverter";
import { CalculatorInput } from "../../../src/design-system/components/CalculatorInput";
import { FilterBar } from "../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

const CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(([key, config]) => ({
  label: config.label,
  value: key,
}));

export default function UnitConverterScreen() {
  const { colors } = useTheme();
  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("in");
  const [toUnit, setToUnit] = useState("mm");
  const [inputValue, setInputValue] = useState("");

  const currentCategory = CATEGORIES[category];

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    const c = CATEGORIES[cat];
    setFromUnit(c.units[0]);
    setToUnit(c.units.length > 1 ? c.units[1] : c.units[0]);
    setInputValue("");
  };

  const result = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return null;
    try {
      const converted = convert(val, fromUnit, toUnit, category);
      return Math.round(converted * 1000000) / 1000000;
    } catch {
      return null;
    }
  }, [inputValue, fromUnit, toUnit, category]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (result !== null) {
      setInputValue(result.toString());
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Unit Converter
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          9 maker-focused categories
        </Text>

        <FilterBar options={CATEGORY_OPTIONS} selected={category} onSelect={handleCategoryChange} />

        <CalculatorInput
          label={`From (${fromUnit})`}
          value={inputValue}
          onChangeText={setInputValue}
          unit={fromUnit}
          placeholder="0"
        />

        <UnitPicker
          units={currentCategory.units}
          selected={fromUnit}
          onSelect={setFromUnit}
          colors={colors}
        />

        <Pressable
          onPress={swapUnits}
          className="self-center my-3 rounded-full px-4 py-2"
          style={{ backgroundColor: colors.surfaceElevated }}
        >
          <Text
            className="text-[14px]"
            style={{ fontFamily: "Inter_500Medium", color: colors.primary }}
          >
            ⇅ Swap
          </Text>
        </Pressable>

        <UnitPicker
          units={currentCategory.units}
          selected={toUnit}
          onSelect={setToUnit}
          colors={colors}
        />

        {result !== null && (
          <View
            className="rounded-xl p-4 mt-4"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <Text
              className="text-[12px] uppercase tracking-wider mb-2"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
            >
              Result
            </Text>
            <View className="flex-row items-baseline">
              <Text
                className="text-[36px]"
                style={{ fontFamily: "JetBrainsMono_700Bold", color: colors.primary }}
              >
                {formatResult(result)}
              </Text>
              <Text
                className="text-[14px] ml-2"
                style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
              >
                {toUnit}
              </Text>
            </View>
            <Text
              className="text-[13px] mt-2"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              {inputValue} {fromUnit} = {formatResult(result)} {toUnit}
            </Text>
          </View>
        )}

        {result === null && inputValue === "" && (
          <View
            className="rounded-xl p-4 mt-4 items-center justify-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}
          >
            <Text
              className="text-[13px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              Enter a value to convert
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

function UnitPicker({
  units,
  selected,
  onSelect,
  colors,
}: {
  units: string[];
  selected: string;
  onSelect: (u: string) => void;
  colors: any;
}) {
  return (
    <View className="flex-row flex-wrap gap-2 mt-2">
      {units.map((unit) => {
        const isActive = unit === selected;
        return (
          <Pressable
            key={unit}
            onPress={() => onSelect(unit)}
            className="rounded-lg px-3 py-2"
            style={{
              backgroundColor: isActive ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: isActive ? colors.primary : colors.border,
            }}
          >
            <Text
              className="text-[13px]"
              style={{
                fontFamily: "JetBrainsMono_500Medium",
                color: isActive ? "#0f0f1a" : colors.textSecondary,
              }}
            >
              {unit}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function formatResult(value: number): string {
  if (Math.abs(value) >= 1000) return value.toFixed(2);
  if (Math.abs(value) >= 1) return value.toFixed(4);
  return value.toFixed(6);
}
