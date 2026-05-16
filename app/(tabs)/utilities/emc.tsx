import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { calculateEMC } from "../../../src/modules/utilities/calculators/emc";
import { CalculatorInput } from "../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../src/design-system/components/ResultCard";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

const REGIONAL_EXAMPLES = [
  { region: "Southwest US (summer)", rh: 20, temp: 95, emc: "4-5%" },
  { region: "Pacific NW (winter)", rh: 80, temp: 45, emc: "16-17%" },
  { region: "Heated indoor (winter)", rh: 30, temp: 70, emc: "6%" },
  { region: "Non-AC indoor (summer)", rh: 65, temp: 78, emc: "12%" },
];

export default function EMCScreen() {
  const { colors } = useTheme();
  const [humidity, setHumidity] = useState("");
  const [temperature, setTemperature] = useState("");

  const result = useMemo(() => {
    const rh = parseFloat(humidity);
    const temp = parseFloat(temperature);
    if (!rh || !temp || rh <= 0 || rh > 100) return null;
    return calculateEMC(rh, temp);
  }, [humidity, temperature]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          EMC Calculator
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Equilibrium Moisture Content (Hailwood-Horrobin)
        </Text>

        <CalculatorInput
          label="Relative Humidity"
          value={humidity}
          onChangeText={setHumidity}
          unit="%"
          placeholder="50"
        />
        <CalculatorInput
          label="Temperature"
          value={temperature}
          onChangeText={setTemperature}
          unit="°F"
          placeholder="70"
        />

        {result !== null && (
          <ResultCard
            title="Equilibrium Moisture Content"
            results={[
              { label: "EMC", value: result.toFixed(1), unit: "%", highlight: true },
            ]}
          />
        )}

        {result === null && (
          <View
            className="rounded-xl p-4 mt-4 items-center justify-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 80 }}
          >
            <Text
              className="text-[13px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              Enter humidity and temperature
            </Text>
          </View>
        )}

        <Text
          className="text-[12px] uppercase tracking-wider mt-6 mb-3"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
        >
          Regional Reference
        </Text>
        <View
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          {REGIONAL_EXAMPLES.map((ex, i) => (
            <View
              key={ex.region}
              className="flex-row justify-between px-4 py-3"
              style={i < REGIONAL_EXAMPLES.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.border } : {}}
            >
              <View className="flex-1">
                <Text
                  className="text-[13px]"
                  style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}
                >
                  {ex.region}
                </Text>
                <Text
                  className="text-[11px]"
                  style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
                >
                  {ex.rh}% RH, {ex.temp}°F
                </Text>
              </View>
              <Text
                className="text-[14px]"
                style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.primary }}
              >
                {ex.emc}
              </Text>
            </View>
          ))}
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
