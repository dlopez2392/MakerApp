import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import {
  calculateCoverage,
  calculateShellacRatio,
  calculateDryTime,
} from "../../../../src/modules/woodworking/calculators/finishing";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const SECTION_OPTIONS = [
  { label: "Coverage", value: "coverage" },
  { label: "Shellac", value: "shellac" },
  { label: "Dry Time", value: "drytime" },
];

type Section = "coverage" | "shellac" | "drytime";

function formatDryTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function FinishingScreen() {
  const { colors } = useTheme();

  const [section, setSection] = useState<Section>("coverage");

  // Coverage state
  const [area, setArea] = useState("");
  const [coverageRate, setCoverageRate] = useState("");
  const [coats, setCoats] = useState("2");
  const [wasteFactor, setWasteFactor] = useState("10");

  // Shellac state
  const [poundCut, setPoundCut] = useState("2");
  const [alcoholOz, setAlcoholOz] = useState("16");

  // Dry time state
  const [baseTime, setBaseTime] = useState("");
  const [tempF, setTempF] = useState("70");
  const [humidity, setHumidity] = useState("50");

  // Coverage calculation
  const coverageResults = useMemo(() => {
    const a = parseFloat(area);
    const rate = parseFloat(coverageRate);
    const c = parseFloat(coats) || 1;
    const waste = parseFloat(wasteFactor);

    if (!a || !rate || a <= 0 || rate <= 0) return null;

    const wasteMultiplier = waste > 0 ? 1 + waste / 100 : 1.0;

    return calculateCoverage({
      areaSqFt: a,
      coverageRatePerUnit: rate,
      coats: c,
      wasteFactor: wasteMultiplier,
    });
  }, [area, coverageRate, coats, wasteFactor]);

  const coverageResultItems = useMemo(() => {
    if (!coverageResults) return [];
    return [
      {
        label: "Volume per coat",
        value: coverageResults.volumePerCoat.toFixed(3),
        unit: "units",
      },
      {
        label: "Total volume needed",
        value: coverageResults.volumeNeeded.toFixed(3),
        unit: "units",
        highlight: true,
      },
      {
        label: "Total with waste",
        value: coverageResults.totalWithWaste.toFixed(3),
        unit: "units",
      },
    ];
  }, [coverageResults]);

  // Shellac calculation
  const shellacResults = useMemo(() => {
    const cut = parseFloat(poundCut);
    const oz = parseFloat(alcoholOz);

    if (!cut || !oz || cut <= 0 || oz <= 0) return null;

    return calculateShellacRatio({ poundCut: cut, alcoholOz: oz });
  }, [poundCut, alcoholOz]);

  const shellacResultItems = useMemo(() => {
    if (!shellacResults) return [];
    return [
      {
        label: "Flakes needed",
        value: shellacResults.flakeOz.toFixed(3),
        unit: "oz",
        highlight: true,
      },
      {
        label: "Flakes needed",
        value: shellacResults.flakeLbs.toFixed(4),
        unit: "lbs",
      },
    ];
  }, [shellacResults]);

  // Dry time calculation
  const dryTimeResults = useMemo(() => {
    const base = parseFloat(baseTime);
    const temp = parseFloat(tempF);
    const hum = parseFloat(humidity);

    if (!base || base <= 0) return null;

    const t = isNaN(temp) ? 70 : temp;
    const h = isNaN(hum) ? 50 : Math.min(100, Math.max(0, hum));

    return calculateDryTime({
      baseTimeMinutes: base,
      temperatureF: t,
      humidityPercent: h,
    });
  }, [baseTime, tempF, humidity]);

  const dryTimeResultItems = useMemo(() => {
    if (!dryTimeResults) return [];
    return [
      {
        label: "Adjusted dry time",
        value: formatDryTime(dryTimeResults.adjustedTimeMinutes),
        highlight: true,
      },
      {
        label: "Temp multiplier",
        value: dryTimeResults.tempMultiplier.toFixed(3),
        unit: "x",
      },
      {
        label: "Humidity multiplier",
        value: dryTimeResults.humidityMultiplier.toFixed(3),
        unit: "x",
      },
    ];
  }, [dryTimeResults]);

  const handleSave = () => {
    if (section === "coverage") {
      if (!coverageResults) {
        Alert.alert("No Results", "Enter valid area and coverage rate to save.");
        return;
      }
      try {
        CalculatorService.save({
          module: "woodworking",
          calculatorType: "finishing",
          inputsJson: { section, area, coverageRate, coats, wasteFactor },
          outputsJson: coverageResults,
          label: `Coverage: ${coverageResults.totalWithWaste.toFixed(2)} units needed`,
        });
        Alert.alert("Saved", "Result saved to history.");
      } catch {
        Alert.alert("Error", "Failed to save result.");
      }
    } else if (section === "shellac") {
      if (!shellacResults) {
        Alert.alert("No Results", "Enter valid pound cut and alcohol amount to save.");
        return;
      }
      try {
        CalculatorService.save({
          module: "woodworking",
          calculatorType: "finishing",
          inputsJson: { section, poundCut, alcoholOz },
          outputsJson: shellacResults,
          label: `Shellac: ${poundCut}-lb cut, ${shellacResults.flakeOz.toFixed(2)} oz flakes`,
        });
        Alert.alert("Saved", "Result saved to history.");
      } catch {
        Alert.alert("Error", "Failed to save result.");
      }
    } else {
      if (!dryTimeResults) {
        Alert.alert("No Results", "Enter a base dry time to save.");
        return;
      }
      try {
        CalculatorService.save({
          module: "woodworking",
          calculatorType: "finishing",
          inputsJson: { section, baseTime, tempF, humidity },
          outputsJson: dryTimeResults,
          label: `Dry Time: ${formatDryTime(dryTimeResults.adjustedTimeMinutes)} adjusted`,
        });
        Alert.alert("Saved", "Result saved to history.");
      } catch {
        Alert.alert("Error", "Failed to save result.");
      }
    }
  };

  const handleAddToQuote = () => {
    Alert.alert("Coming Soon", "Quote feature coming soon.");
  };

  const handleLogToProject = () => {
    Alert.alert("Coming Soon", "Project logging coming soon.");
  };

  const hasResults =
    (section === "coverage" && !!coverageResults) ||
    (section === "shellac" && !!shellacResults) ||
    (section === "drytime" && !!dryTimeResults);

  const activeResultItems =
    section === "coverage"
      ? coverageResultItems
      : section === "shellac"
      ? shellacResultItems
      : dryTimeResultItems;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1 px-4 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-[24px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Finishing
        </Text>
        <Text
          className="text-[14px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Coverage, shellac mixing, and dry time estimation
        </Text>

        <FilterBar
          options={SECTION_OPTIONS}
          selected={section}
          onSelect={(v) => setSection(v as Section)}
        />

        {/* Coverage Section */}
        {section === "coverage" && (
          <View>
            <CalculatorInput
              label="Area"
              value={area}
              onChangeText={setArea}
              unit="sq ft"
              placeholder="100"
            />
            <CalculatorInput
              label="Coverage rate"
              value={coverageRate}
              onChangeText={setCoverageRate}
              unit="sq ft/unit"
              placeholder="400"
            />
            <CalculatorInput
              label="Number of coats"
              value={coats}
              onChangeText={setCoats}
              unit="coats"
              placeholder="2"
              keyboardType="numeric"
            />
            <CalculatorInput
              label="Waste factor"
              value={wasteFactor}
              onChangeText={setWasteFactor}
              unit="%"
              placeholder="10"
            />
          </View>
        )}

        {/* Shellac Section */}
        {section === "shellac" && (
          <View>
            <CalculatorInput
              label="Pound cut"
              value={poundCut}
              onChangeText={setPoundCut}
              unit="lb"
              placeholder="2"
            />
            <CalculatorInput
              label="Alcohol amount"
              value={alcoholOz}
              onChangeText={setAlcoholOz}
              unit="oz"
              placeholder="16"
            />

            {/* Quick reference table */}
            <View
              className="rounded-xl p-4 mt-2 mb-2"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                className="text-[12px] uppercase tracking-wider mb-3"
                style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
              >
                Common Cuts (per 16 oz alcohol)
              </Text>
              {[
                { cut: "1-lb cut", ratio: "1 oz flakes" },
                { cut: "2-lb cut", ratio: "2 oz flakes" },
                { cut: "3-lb cut", ratio: "3 oz flakes" },
              ].map((row) => (
                <View
                  key={row.cut}
                  className="flex-row justify-between py-2"
                  style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                >
                  <Text
                    className="text-[13px]"
                    style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
                  >
                    {row.cut}
                  </Text>
                  <Text
                    className="text-[13px]"
                    style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textSecondary }}
                  >
                    {row.ratio}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Dry Time Section */}
        {section === "drytime" && (
          <View>
            <CalculatorInput
              label="Base dry time"
              value={baseTime}
              onChangeText={setBaseTime}
              unit="min"
              placeholder="60"
            />
            <CalculatorInput
              label="Temperature"
              value={tempF}
              onChangeText={setTempF}
              unit="°F"
              placeholder="70"
            />
            <CalculatorInput
              label="Humidity"
              value={humidity}
              onChangeText={setHumidity}
              unit="%"
              placeholder="50"
            />
          </View>
        )}

        {/* Results */}
        {hasResults ? (
          <ResultCard title="Results" results={activeResultItems} />
        ) : (
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
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              {section === "coverage"
                ? "Enter area and coverage rate to see results"
                : section === "shellac"
                ? "Enter pound cut and alcohol amount to see results"
                : "Enter base dry time to see results"}
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
    </SafeAreaView>
  );
}
