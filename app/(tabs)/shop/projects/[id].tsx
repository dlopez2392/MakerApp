import { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useProjects } from "../../../../src/core/hooks/useProjects";
import { StatusBadge } from "../../../../src/design-system/components/StatusBadge";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const TABS = [
  { label: "Overview", value: "overview" },
  { label: "Materials", value: "materials" },
  { label: "Calcs", value: "calculators" },
  { label: "Journal", value: "journal" },
  { label: "Financials", value: "financials" },
];

export default function ProjectDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { projects } = useProjects();
  const [activeTab, setActiveTab] = useState("overview");

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center p-4">
          <Text
            className="text-[16px]"
            style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
          >
            Project not found
          </Text>
          <Pressable onPress={() => router.back()} className="mt-4">
            <Text style={{ fontFamily: "Inter_500Medium", color: colors.primary }}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text
            className="text-[22px] flex-1"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
            numberOfLines={2}
          >
            {project.name}
          </Text>
          <StatusBadge status={project.status} />
        </View>

        {project.disciplineTags.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-4">
            {project.disciplineTags.map((tag) => (
              <View
                key={tag}
                className="rounded-full px-2 py-1"
                style={{ backgroundColor: colors.surfaceElevated }}
              >
                <Text
                  className="text-[11px]"
                  style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
                >
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}

        <FilterBar options={TABS} selected={activeTab} onSelect={setActiveTab} />

        {activeTab === "overview" && (
          <View className="mt-4">
            <InfoRow label="Status" value={project.status} colors={colors} />
            {project.budget != null && <InfoRow label="Budget" value={`$${project.budget}`} colors={colors} />}
            {project.estimatedHours != null && <InfoRow label="Estimated" value={`${project.estimatedHours} hrs`} colors={colors} />}
            <InfoRow label="Logged" value={`${project.actualHours} hrs`} colors={colors} />
            {project.startDate && <InfoRow label="Started" value={project.startDate} colors={colors} />}
            {project.targetDate && <InfoRow label="Target" value={project.targetDate} colors={colors} />}
            {project.notes && (
              <View className="mt-4">
                <Text
                  className="text-[12px] uppercase tracking-wider mb-2"
                  style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
                >
                  Notes
                </Text>
                <Text
                  className="text-[14px] leading-5"
                  style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}
                >
                  {project.notes}
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "materials" && (
          <PlaceholderTab message="Materials linked to this project will appear here" colors={colors} />
        )}

        {activeTab === "calculators" && (
          <PlaceholderTab message="Calculator results linked to this project will appear here" colors={colors} />
        )}

        {activeTab === "journal" && (
          <PlaceholderTab message="Journal entries for this project will appear here" colors={colors} />
        )}

        {activeTab === "financials" && (
          <PlaceholderTab message="Quotes and invoices for this project will appear here" colors={colors} />
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View className="flex-row justify-between py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Text
        className="text-[13px]"
        style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
      >
        {label}
      </Text>
      <Text
        className="text-[14px]"
        style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
      >
        {value}
      </Text>
    </View>
  );
}

function PlaceholderTab({ message, colors }: { message: string; colors: any }) {
  return (
    <View
      className="rounded-xl p-6 mt-4 items-center justify-center"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 120 }}
    >
      <Text
        className="text-[13px] text-center"
        style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
      >
        {message}
      </Text>
    </View>
  );
}
