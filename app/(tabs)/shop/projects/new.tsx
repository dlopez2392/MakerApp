import { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useProjects } from "../../../../src/core/hooks/useProjects";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { UpgradeModal } from "../../../../src/design-system/components/UpgradeModal";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import type { ProjectStatus, Discipline } from "../../../../src/core/types";

const STATUS_OPTIONS: { label: string; value: ProjectStatus }[] = [
  { label: "Idea", value: "idea" },
  { label: "Design", value: "design" },
  { label: "In Progress", value: "in-progress" },
  { label: "Finishing", value: "finishing" },
];

const DISCIPLINE_OPTIONS: { label: string; value: Discipline }[] = [
  { label: "Woodworking", value: "woodworking" },
  { label: "Laser", value: "laser" },
  { label: "CNC", value: "cnc" },
  { label: "3D Print", value: "3d-print" },
  { label: "Resin", value: "resin" },
  { label: "Knife", value: "knife" },
  { label: "Leather", value: "leather" },
  { label: "Mixed", value: "mixed" },
];

export default function NewProjectScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { create, limitReached } = useProjects();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("idea");
  const [disciplines, setDisciplines] = useState<Discipline[]>(["woodworking"]);
  const [budget, setBudget] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [notes, setNotes] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const toggleDiscipline = (d: Discipline) => {
    setDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert("Required", "Project name is required.");
      return;
    }
    const project = create({
      name: name.trim(),
      status,
      disciplineTags: disciplines,
      budget: budget ? parseFloat(budget) : undefined,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      notes: notes.trim() || undefined,
    });
    if (project) {
      router.back();
    } else if (limitReached) {
      setShowUpgrade(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-6"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          New Project
        </Text>

        <CalculatorInput
          label="Project Name"
          value={name}
          onChangeText={setName}
          placeholder="My project"
          keyboardType="decimal-pad"
        />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Status
        </Text>
        <FilterBar options={STATUS_OPTIONS} selected={status} onSelect={(v) => setStatus(v as ProjectStatus)} />

        <Text
          className="text-[12px] uppercase tracking-wider mb-2 mt-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Disciplines
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {DISCIPLINE_OPTIONS.map((d) => {
            const isActive = disciplines.includes(d.value);
            return (
              <Pressable
                key={d.value}
                onPress={() => toggleDiscipline(d.value)}
                className="rounded-full px-3 py-2"
                style={{
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: isActive ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="text-[13px]"
                  style={{
                    fontFamily: "Inter_500Medium",
                    color: isActive ? "#0f0f1a" : colors.textSecondary,
                  }}
                >
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <CalculatorInput
          label="Budget (optional)"
          value={budget}
          onChangeText={setBudget}
          unit="$"
          placeholder="0"
        />
        <CalculatorInput
          label="Estimated Hours (optional)"
          value={estimatedHours}
          onChangeText={setEstimatedHours}
          unit="hrs"
          placeholder="0"
        />

        <Pressable
          onPress={handleCreate}
          className="rounded-xl py-4 items-center mt-6"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="text-[16px]"
            style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
          >
            Create Project
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()} className="items-center mt-4 py-3">
          <Text
            className="text-[14px]"
            style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
          >
            Cancel
          </Text>
        </Pressable>

        <View className="h-8" />
      </ScrollView>

      <UpgradeModal
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="projects"
      />
    </SafeAreaView>
  );
}
