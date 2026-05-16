import { useState } from "react";
import { SafeAreaView, View, Text, FlatList, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useProjects } from "../../../../src/core/hooks/useProjects";
import { StatusBadge } from "../../../../src/design-system/components/StatusBadge";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { EmptyState } from "../../../../src/design-system/components/EmptyState";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import type { Project, ProjectStatus } from "../../../../src/core/types";

const VIEW_OPTIONS = [
  { label: "List", value: "list" },
  { label: "Kanban", value: "kanban" },
];

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Complete", value: "complete" },
  { label: "Archived", value: "archived" },
];

const KANBAN_COLUMNS: { status: ProjectStatus; label: string }[] = [
  { status: "idea", label: "Ideas" },
  { status: "design", label: "Design" },
  { status: "in-progress", label: "In Progress" },
  { status: "finishing", label: "Finishing" },
  { status: "complete", label: "Complete" },
  { status: "delivered", label: "Delivered" },
];

export default function ProjectsListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { projects, loading } = useProjects();
  const [viewMode, setViewMode] = useState("list");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProjects = projects.filter((p) => {
    if (statusFilter === "all") return p.status !== "archived";
    if (statusFilter === "active") return ["idea", "design", "in-progress", "finishing"].includes(p.status);
    if (statusFilter === "complete") return ["complete", "delivered"].includes(p.status);
    if (statusFilter === "archived") return p.status === "archived";
    return true;
  });

  const renderProjectCard = ({ item }: { item: Project }) => (
    <Pressable
      onPress={() => router.push(`/shop/projects/${item.id}` as any)}
      className="rounded-xl p-4 mb-3"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text
          className="text-[16px] flex-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <StatusBadge status={item.status} />
      </View>
      <View className="flex-row gap-4">
        {item.disciplineTags.length > 0 && (
          <Text
            className="text-[12px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            {item.disciplineTags.join(", ")}
          </Text>
        )}
        {item.budget != null && (
          <Text
            className="text-[12px]"
            style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textSecondary }}
          >
            ${item.budget}
          </Text>
        )}
      </View>
    </Pressable>
  );

  const renderKanban = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
      <View className="flex-row gap-3 p-2">
        {KANBAN_COLUMNS.map((col) => {
          const colProjects = projects.filter((p) => p.status === col.status);
          return (
            <View
              key={col.status}
              className="rounded-xl p-3"
              style={{ backgroundColor: colors.surface, width: 220, minHeight: 300 }}
            >
              <Text
                className="text-[12px] uppercase tracking-wider mb-3"
                style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
              >
                {col.label} ({colProjects.length})
              </Text>
              {colProjects.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/shop/projects/${p.id}` as any)}
                  className="rounded-lg p-3 mb-2"
                  style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
                >
                  <Text
                    className="text-[13px]"
                    style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
                    numberOfLines={2}
                  >
                    {p.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text
            className="text-[22px]"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
          >
            Projects
          </Text>
          <Pressable
            onPress={() => router.push("/shop/projects/new" as any)}
            className="rounded-lg px-4 py-2"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="text-[14px]"
              style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
            >
              + New
            </Text>
          </Pressable>
        </View>

        <FilterBar options={VIEW_OPTIONS} selected={viewMode} onSelect={setViewMode} />
        {viewMode === "list" && (
          <FilterBar options={STATUS_OPTIONS} selected={statusFilter} onSelect={setStatusFilter} />
        )}

        {filteredProjects.length === 0 && !loading ? (
          <EmptyState
            title="No projects yet"
            message="Create your first project to start tracking work"
          />
        ) : viewMode === "list" ? (
          <FlatList
            data={filteredProjects}
            renderItem={renderProjectCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderKanban()
        )}
      </View>
    </SafeAreaView>
  );
}
