import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, View, Text, Pressable, Alert } from "react-native";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { useSettings } from "../../../../src/core/hooks/useSettings";

interface LaborPhase {
  name: string;
  hours: string;
}

interface MaterialLine {
  name: string;
  cost: string;
}

export default function PricingScreen() {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const [materials, setMaterials] = useState<MaterialLine[]>([{ name: "Material 1", cost: "" }]);
  const [laborPhases, setLaborPhases] = useState<LaborPhase[]>([{ name: "Build", hours: "" }]);
  const [overheadPercent, setOverheadPercent] = useState(settings.markupPercent?.toString() || "15");
  const [markupPercent, setMarkupPercent] = useState("30");

  const hourlyRate = settings.hourlyRate || 50;

  const result = useMemo(() => {
    const materialTotal = materials.reduce((sum, m) => sum + (parseFloat(m.cost) || 0), 0);
    const laborHours = laborPhases.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
    const laborTotal = laborHours * hourlyRate;
    const subtotal = materialTotal + laborTotal;
    const overhead = subtotal * ((parseFloat(overheadPercent) || 0) / 100);
    const beforeMarkup = subtotal + overhead;
    const markup = beforeMarkup * ((parseFloat(markupPercent) || 0) / 100);
    const total = beforeMarkup + markup;

    return { materialTotal, laborHours, laborTotal, overhead, beforeMarkup, markup, total };
  }, [materials, laborPhases, overheadPercent, markupPercent, hourlyRate]);

  const addMaterial = () => setMaterials([...materials, { name: `Material ${materials.length + 1}`, cost: "" }]);
  const addLabor = () => setLaborPhases([...laborPhases, { name: `Phase ${laborPhases.length + 1}`, hours: "" }]);

  const updateMaterial = (i: number, cost: string) => {
    const updated = [...materials];
    updated[i] = { ...updated[i], cost };
    setMaterials(updated);
  };

  const updateLabor = (i: number, hours: string) => {
    const updated = [...laborPhases];
    updated[i] = { ...updated[i], hours };
    setLaborPhases(updated);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[22px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          Pricing Workflow
        </Text>
        <Text className="text-[13px] mb-4" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>
          Materials + Labor + Overhead + Markup = Quote
        </Text>

        {/* Materials */}
        <SectionHeader title={`Materials ($${result.materialTotal.toFixed(2)})`} colors={colors} />
        {materials.map((m, i) => (
          <CalculatorInput key={i} label={m.name} value={m.cost} onChangeText={(v) => updateMaterial(i, v)} unit="$" placeholder="0" />
        ))}
        <AddButton label="+ Add Material" onPress={addMaterial} colors={colors} />

        {/* Labor */}
        <SectionHeader title={`Labor (${result.laborHours}h × $${hourlyRate}/h = $${result.laborTotal.toFixed(2)})`} colors={colors} />
        {laborPhases.map((l, i) => (
          <CalculatorInput key={i} label={l.name} value={l.hours} onChangeText={(v) => updateLabor(i, v)} unit="hrs" placeholder="0" />
        ))}
        <AddButton label="+ Add Phase" onPress={addLabor} colors={colors} />

        {/* Overhead & Markup */}
        <SectionHeader title="Overhead & Markup" colors={colors} />
        <CalculatorInput label="Overhead" value={overheadPercent} onChangeText={setOverheadPercent} unit="%" />
        <CalculatorInput label="Markup" value={markupPercent} onChangeText={setMarkupPercent} unit="%" />

        <ResultCard
          title="Price Breakdown"
          results={[
            { label: "Materials", value: `$${result.materialTotal.toFixed(2)}` },
            { label: "Labor", value: `$${result.laborTotal.toFixed(2)}` },
            { label: "Overhead", value: `$${result.overhead.toFixed(2)}` },
            { label: "Markup", value: `$${result.markup.toFixed(2)}` },
            { label: "Total Price", value: `$${result.total.toFixed(2)}`, highlight: true },
          ]}
        />

        <Pressable
          onPress={() => Alert.alert("Coming Soon", "Quote generation will be available when linked to a project.")}
          className="rounded-xl py-4 items-center mt-4"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-[16px]" style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}>
            Create Quote
          </Text>
        </Pressable>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, colors }: { title: string; colors: any }) {
  return (
    <Text className="text-[12px] uppercase tracking-wider mt-4 mb-2" style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}>
      {title}
    </Text>
  );
}

function AddButton({ label, onPress, colors }: { label: string; onPress: () => void; colors: any }) {
  return (
    <Pressable onPress={onPress} className="rounded-lg py-2 items-center mb-2" style={{ backgroundColor: colors.surfaceElevated }}>
      <Text className="text-[13px]" style={{ fontFamily: "Inter_500Medium", color: colors.primary }}>{label}</Text>
    </Pressable>
  );
}
