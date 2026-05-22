import { SafeAreaView, ScrollView, View, Text, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../src/design-system/hooks/useTheme";
import { useSubscription } from "../src/core/hooks/useSubscription";
import { FREE_LIMITS } from "../src/core/types";

const PRO_FEATURES = [
  { title: "Unlimited Projects", free: `${FREE_LIMITS.projects}`, pro: "Unlimited" },
  { title: "Inventory Items", free: `${FREE_LIMITS.inventoryItems}`, pro: "Unlimited" },
  { title: "Journal Entries", free: `${FREE_LIMITS.journalEntries}`, pro: "Unlimited" },
  { title: "Clients", free: `${FREE_LIMITS.clients}`, pro: "Unlimited" },
  { title: "Active Quotes/Invoices", free: `${FREE_LIMITS.activeQuotesInvoices}`, pro: "Unlimited" },
  { title: "AI Messages/Day", free: `${FREE_LIMITS.aiMessagesPerDay}`, pro: "Unlimited" },
  { title: "Cloud Sync", free: "---", pro: "Included" },
  { title: "Data Export", free: "---", pro: "CSV & PDF" },
];

export default function UpgradeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { tier, upgrade } = useSubscription();

  const isPro = tier === "pro";

  const handlePurchase = (plan: "monthly" | "yearly") => {
    Alert.alert(
      "Activate Pro",
      `This will activate MakerOS Pro (${plan === "monthly" ? "$6.99/mo" : "$59.99/yr"}).\n\nIn-app purchases will be available when the app is published. For now, this activates Pro locally.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Activate",
          onPress: () => {
            upgrade();
            Alert.alert("Welcome to Pro!", "All limits have been removed.", [
              { text: "OK", onPress: () => router.back() },
            ]);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="items-center mb-6 mt-4">
          <Text
            className="text-[28px] mb-2"
            style={{ fontFamily: "Inter_700Bold", color: colors.primary }}
          >
            MakerOS Pro
          </Text>
          <Text
            className="text-[15px] text-center px-4"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            Unlock unlimited everything — projects, inventory, AI assistant, cloud sync, and more.
          </Text>
        </View>

        {isPro && (
          <View
            className="rounded-xl p-4 mb-6 items-center"
            style={{ backgroundColor: "#10b98120", borderWidth: 1, borderColor: "#10b981" }}
          >
            <Text
              className="text-[16px]"
              style={{ fontFamily: "Inter_600SemiBold", color: "#10b981" }}
            >
              You're on Pro!
            </Text>
          </View>
        )}

        {/* Comparison table */}
        <View
          className="rounded-xl overflow-hidden mb-6"
          style={{ borderWidth: 1, borderColor: colors.border }}
        >
          {/* Table header */}
          <View
            className="flex-row px-4 py-3"
            style={{ backgroundColor: colors.surfaceElevated }}
          >
            <Text
              className="flex-1 text-[12px] uppercase tracking-wider"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
            >
              Feature
            </Text>
            <Text
              className="w-[70px] text-[12px] uppercase tracking-wider text-center"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
            >
              Free
            </Text>
            <Text
              className="w-[80px] text-[12px] uppercase tracking-wider text-center"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.primary }}
            >
              Pro
            </Text>
          </View>

          {PRO_FEATURES.map((f, i) => (
            <View
              key={f.title}
              className="flex-row items-center px-4 py-3"
              style={{
                backgroundColor: i % 2 === 0 ? colors.surface : colors.background,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <Text
                className="flex-1 text-[13px]"
                style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
              >
                {f.title}
              </Text>
              <Text
                className="w-[70px] text-[13px] text-center"
                style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
              >
                {f.free}
              </Text>
              <Text
                className="w-[80px] text-[13px] text-center"
                style={{ fontFamily: "Inter_600SemiBold", color: colors.primary }}
              >
                {f.pro}
              </Text>
            </View>
          ))}
        </View>

        {/* Pricing */}
        {!isPro && (
          <>
            <Pressable
              onPress={() => handlePurchase("yearly")}
              className="rounded-xl py-4 items-center mb-3"
              style={{ backgroundColor: colors.primary }}
            >
              <Text
                className="text-[16px]"
                style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
              >
                $59.99/year
              </Text>
              <Text
                className="text-[12px] mt-1"
                style={{ fontFamily: "Inter_400Regular", color: "#0f0f1a80" }}
              >
                Save 29% — best value
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handlePurchase("monthly")}
              className="rounded-xl py-4 items-center mb-3"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                className="text-[16px]"
                style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
              >
                $6.99/month
              </Text>
            </Pressable>

            <Text
              className="text-[11px] text-center mb-4"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              7-day free trial included. Cancel anytime.
            </Text>
          </>
        )}

        <Pressable onPress={() => router.back()} className="items-center py-3">
          <Text
            className="text-[14px]"
            style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
          >
            {isPro ? "Done" : "Maybe Later"}
          </Text>
        </Pressable>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
