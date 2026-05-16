import { SafeAreaView, ScrollView, View, Text, Pressable, Switch, Alert } from "react-native";
import { useSettings } from "../../../src/core/hooks/useSettings";
import { useTheme } from "../../../src/design-system/hooks/useTheme";
import { CalculatorInput } from "../../../src/design-system/components/CalculatorInput";
import type { UnitSystem } from "../../../src/core/types";

export default function SettingsScreen() {
  const { colors, mode, toggle: toggleTheme } = useTheme();
  const { settings, set } = useSettings();

  const handleUnitToggle = () => {
    const next: UnitSystem = settings.unitSystem === "imperial" ? "metric" : "imperial";
    set("unitSystem", next);
  };

  const handleExport = () => {
    Alert.alert("Coming Soon", "Data export will be available in a future update.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-6" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          Settings
        </Text>

        <SettingRow label="Unit System" colors={colors}>
          <Pressable onPress={handleUnitToggle} className="rounded-lg px-3 py-2" style={{ backgroundColor: colors.surfaceElevated }}>
            <Text className="text-[14px]" style={{ fontFamily: "Inter_500Medium", color: colors.primary }}>
              {settings.unitSystem === "imperial" ? "Imperial" : "Metric"}
            </Text>
          </Pressable>
        </SettingRow>

        <SettingRow label="Dark Mode" colors={colors}>
          <Switch value={mode === "dark"} onValueChange={toggleTheme} trackColor={{ true: colors.primary }} />
        </SettingRow>

        <SectionHeader title="Shop Info" colors={colors} />
        <CalculatorInput
          label="Shop Name"
          value={settings.shopName || ""}
          onChangeText={(v) => set("shopName", v)}
          placeholder="My Workshop"
          keyboardType="decimal-pad"
        />
        <CalculatorInput
          label="Hourly Rate"
          value={settings.hourlyRate?.toString() || ""}
          onChangeText={(v) => set("hourlyRate", parseFloat(v) || 0)}
          unit="$/hr"
          placeholder="50"
        />
        <CalculatorInput
          label="Tax Rate"
          value={settings.taxRate?.toString() || ""}
          onChangeText={(v) => set("taxRate", parseFloat(v) || 0)}
          unit="%"
          placeholder="0"
        />
        <CalculatorInput
          label="Default Markup"
          value={settings.markupPercent?.toString() || ""}
          onChangeText={(v) => set("markupPercent", parseFloat(v) || 0)}
          unit="%"
          placeholder="30"
        />

        <SectionHeader title="Documents" colors={colors} />
        <CalculatorInput
          label="Quote Prefix"
          value={settings.quotePrefix || ""}
          onChangeText={(v) => set("quotePrefix", v)}
          placeholder="Q-"
          keyboardType="decimal-pad"
        />
        <CalculatorInput
          label="Invoice Prefix"
          value={settings.invoicePrefix || ""}
          onChangeText={(v) => set("invoicePrefix", v)}
          placeholder="INV-"
          keyboardType="decimal-pad"
        />

        <SectionHeader title="Data" colors={colors} />
        <Pressable
          onPress={handleExport}
          className="rounded-xl py-4 items-center"
          style={{ backgroundColor: colors.surfaceElevated }}
        >
          <Text className="text-[14px]" style={{ fontFamily: "Inter_500Medium", color: colors.primary }}>
            Export All Data (CSV)
          </Text>
        </Pressable>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, colors }: { title: string; colors: any }) {
  return (
    <Text className="text-[12px] uppercase tracking-wider mt-6 mb-3" style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}>
      {title}
    </Text>
  );
}

function SettingRow({ label, colors, children }: { label: string; colors: any; children: React.ReactNode }) {
  return (
    <View className="flex-row justify-between items-center py-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Text className="text-[15px]" style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}>{label}</Text>
      {children}
    </View>
  );
}
