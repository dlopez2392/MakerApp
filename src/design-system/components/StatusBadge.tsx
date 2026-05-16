import { View, Text } from "react-native";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  idea: { bg: "#64748b30", text: "#94a3b8" },
  design: { bg: "#8b5cf630", text: "#a78bfa" },
  "in-progress": { bg: "#f59e0b30", text: "#f59e0b" },
  finishing: { bg: "#f9731630", text: "#f97316" },
  complete: { bg: "#10b98130", text: "#10b981" },
  delivered: { bg: "#3b82f630", text: "#60a5fa" },
  archived: { bg: "#64748b20", text: "#64748b" },
  draft: { bg: "#64748b30", text: "#94a3b8" },
  sent: { bg: "#3b82f630", text: "#60a5fa" },
  paid: { bg: "#10b98130", text: "#10b981" },
  overdue: { bg: "#ef444430", text: "#ef4444" },
  accepted: { bg: "#10b98130", text: "#10b981" },
  rejected: { bg: "#ef444430", text: "#ef4444" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_COLORS[status.toLowerCase()] || STATUS_COLORS.idea;

  return (
    <View className="rounded-full px-3 py-1" style={{ backgroundColor: style.bg }}>
      <Text className="text-[11px] capitalize" style={{ fontFamily: "Inter_500Medium", color: style.text }}>
        {status.replace("-", " ")}
      </Text>
    </View>
  );
}
