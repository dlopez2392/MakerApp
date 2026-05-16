import { SafeAreaView, ScrollView, View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/design-system/hooks/useTheme";
import { useProjects } from "../../src/core/hooks/useProjects";
import { useInventory } from "../../src/core/hooks/useInventory";
import { useInvoices } from "../../src/core/hooks/useInvoices";
import { useJournal } from "../../src/core/hooks/useJournal";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const QUICK_CALCS = [
  { name: "Board Foot", route: "/make/woodworking/board-foot" },
  { name: "Cut List", route: "/make/woodworking/cut-list" },
  { name: "Fractions", route: "/make/woodworking/fraction-calc" },
  { name: "Unit Convert", route: "/utilities/unit-converter" },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { projects } = useProjects();
  const { lowStockItems } = useInventory();
  const { invoices } = useInvoices();
  const { entries } = useJournal();

  const activeProjects = projects.filter((p) =>
    ["idea", "design", "in-progress", "finishing"].includes(p.status)
  ).slice(0, 3);

  const outstandingInvoices = invoices.filter((inv) =>
    ["sent", "viewed", "partial", "overdue"].includes(inv.status)
  );

  const recentJournal = entries.slice(0, 2);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Text
          className="text-[24px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          {getGreeting()}
        </Text>
        <Text
          className="text-[13px] mb-6"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          {today}
        </Text>

        {/* Active Projects */}
        <DashboardSection title="Active Projects" colors={colors}>
          {activeProjects.length === 0 ? (
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
              No active projects
            </Text>
          ) : (
            activeProjects.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/shop/projects/${p.id}` as any)}
                className="flex-row justify-between items-center py-2"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
              >
                <Text className="text-[14px] flex-1" style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }} numberOfLines={1}>
                  {p.name}
                </Text>
                <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: colors.surfaceElevated }}>
                  <Text className="text-[11px]" style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}>
                    {p.status}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </DashboardSection>

        {/* Outstanding Invoices */}
        <DashboardSection title="Outstanding Invoices" colors={colors}>
          {outstandingInvoices.length === 0 ? (
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
              All caught up
            </Text>
          ) : (
            <Text className="text-[28px]" style={{ fontFamily: "JetBrainsMono_700Bold", color: colors.primary }}>
              {outstandingInvoices.length}
            </Text>
          )}
        </DashboardSection>

        {/* Low Stock */}
        {lowStockItems.length > 0 && (
          <DashboardSection title="Low Stock Alert" colors={colors}>
            {lowStockItems.slice(0, 3).map((item) => (
              <View key={item.id} className="flex-row justify-between py-1">
                <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}>
                  {item.name}
                </Text>
                <Text className="text-[13px]" style={{ fontFamily: "JetBrainsMono_500Medium", color: "#ef4444" }}>
                  {item.quantity} {item.unit}
                </Text>
              </View>
            ))}
          </DashboardSection>
        )}

        {/* Recent Journal */}
        <DashboardSection title="Recent Journal" colors={colors}>
          {recentJournal.length === 0 ? (
            <Text className="text-[13px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
              No entries yet
            </Text>
          ) : (
            recentJournal.map((entry) => (
              <View key={entry.id} className="py-2" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text className="text-[12px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
                  {entry.entryDate}
                </Text>
                {entry.title && (
                  <Text className="text-[13px]" style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}>
                    {entry.title}
                  </Text>
                )}
              </View>
            ))
          )}
        </DashboardSection>

        {/* Quick Calculators */}
        <Text
          className="text-[12px] uppercase tracking-wider mt-6 mb-3"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
        >
          Quick Calculators
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {QUICK_CALCS.map((calc) => (
            <Pressable
              key={calc.name}
              onPress={() => router.push(calc.route as any)}
              className="rounded-lg px-4 py-3"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            >
              <Text className="text-[13px]" style={{ fontFamily: "Inter_500Medium", color: colors.primary }}>
                {calc.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

function DashboardSection({ title, colors, children }: { title: string; colors: any; children: React.ReactNode }) {
  return (
    <View
      className="rounded-xl p-4 mb-4"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <Text
        className="text-[12px] uppercase tracking-wider mb-3"
        style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}
