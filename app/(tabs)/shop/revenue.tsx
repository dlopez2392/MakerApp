import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, View, Text, Pressable, Alert } from "react-native";
import { useInvoices } from "../../../src/core/hooks/useInvoices";
import { useProjects } from "../../../src/core/hooks/useProjects";
import { FilterBar } from "../../../src/design-system/components/FilterBar";
import { UpgradeModal } from "../../../src/design-system/components/UpgradeModal";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

const PERIOD_OPTIONS = [
  { label: "MTD", value: "mtd" },
  { label: "YTD", value: "ytd" },
  { label: "All Time", value: "all" },
];

export default function RevenueScreen() {
  const { colors } = useTheme();
  const { invoices } = useInvoices();
  const { projects } = useProjects();
  const [period, setPeriod] = useState("mtd");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const paidInvoices = invoices.filter((inv) => inv.status === "paid");
    const filtered = paidInvoices.filter((inv) => {
      const date = new Date(inv.issueDate);
      if (period === "mtd") return date >= startOfMonth;
      if (period === "ytd") return date >= startOfYear;
      return true;
    });

    const outstanding = invoices.filter((inv) =>
      ["sent", "viewed", "partial", "overdue"].includes(inv.status)
    );
    const overdue = invoices.filter((inv) => inv.status === "overdue");

    return {
      paidCount: filtered.length,
      outstandingCount: outstanding.length,
      overdueCount: overdue.length,
      totalProjects: projects.length,
      completedProjects: projects.filter((p) => ["complete", "delivered"].includes(p.status)).length,
    };
  }, [invoices, projects, period]);

  const handleExport = () => {
    // Pro feature gate
    setShowUpgrade(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Revenue Dashboard
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Business performance at a glance
        </Text>

        <FilterBar options={PERIOD_OPTIONS} selected={period} onSelect={setPeriod} />

        {/* Key Metrics */}
        <View className="flex-row gap-3 mb-4">
          <MetricCard label="Paid" value={stats.paidCount.toString()} color={colors.success} colors={colors} />
          <MetricCard label="Outstanding" value={stats.outstandingCount.toString()} color={colors.primary} colors={colors} />
          <MetricCard label="Overdue" value={stats.overdueCount.toString()} color="#ef4444" colors={colors} />
        </View>

        {/* Projects Overview */}
        <View
          className="rounded-xl p-4 mb-4"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text
            className="text-[12px] uppercase tracking-wider mb-3"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
          >
            Projects
          </Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-[28px]" style={{ fontFamily: "JetBrainsMono_700Bold", color: colors.textPrimary }}>
                {stats.totalProjects}
              </Text>
              <Text className="text-[12px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>Total</Text>
            </View>
            <View>
              <Text className="text-[28px]" style={{ fontFamily: "JetBrainsMono_700Bold", color: colors.success }}>
                {stats.completedProjects}
              </Text>
              <Text className="text-[12px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Aging Buckets */}
        <View
          className="rounded-xl p-4 mb-4"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text
            className="text-[12px] uppercase tracking-wider mb-3"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
          >
            Invoice Aging
          </Text>
          <AgingRow label="Current (< 30 days)" count={stats.outstandingCount - stats.overdueCount} colors={colors} />
          <AgingRow label="Overdue" count={stats.overdueCount} colors={colors} danger />
        </View>

        {/* Export */}
        <Pressable
          onPress={handleExport}
          className="rounded-xl py-4 items-center"
          style={{ backgroundColor: colors.surfaceElevated }}
        >
          <Text className="text-[14px]" style={{ fontFamily: "Inter_500Medium", color: colors.primary }}>
            Export CSV (Pro)
          </Text>
        </Pressable>

        <View className="h-8" />
      </ScrollView>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} feature="revenue" />
    </SafeAreaView>
  );
}

function MetricCard({ label, value, color, colors }: { label: string; value: string; color: string; colors: any }) {
  return (
    <View
      className="flex-1 rounded-xl p-3 items-center"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <Text className="text-[28px]" style={{ fontFamily: "JetBrainsMono_700Bold", color }}>
        {value}
      </Text>
      <Text className="text-[11px]" style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}>
        {label}
      </Text>
    </View>
  );
}

function AgingRow({ label, count, colors, danger }: { label: string; count: number; colors: any; danger?: boolean }) {
  return (
    <View className="flex-row justify-between py-2" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}>{label}</Text>
      <Text className="text-[14px]" style={{ fontFamily: "JetBrainsMono_500Medium", color: danger ? "#ef4444" : colors.textPrimary }}>
        {count}
      </Text>
    </View>
  );
}
