import { View, Text, Pressable, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

const SHOP_SECTIONS = [
  { name: "Projects", route: "/shop/projects", description: "Track maker projects across all disciplines" },
  { name: "Inventory", route: "/shop/inventory", description: "Materials, supplies, and consumables" },
  { name: "Clients", route: "/shop/clients", description: "Customer profiles and communication" },
  { name: "Journal", route: "/shop/journal", description: "Daily shop log and time tracking" },
  { name: "Quotes & Invoices", route: "/shop/quotes", description: "Estimates, billing, and payments" },
  { name: "Revenue", route: "/shop/revenue", description: "Business analytics and reporting" },
];

export default function ShopHub() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[18px] mb-4"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Shop Management
        </Text>
        {SHOP_SECTIONS.map((section) => (
          <Pressable
            key={section.name}
            onPress={() => router.push(section.route as any)}
            className="rounded-xl p-4 mb-3"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 48 }}
            accessibilityRole="button"
          >
            <Text
              className="text-[15px]"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
            >
              {section.name}
            </Text>
            <Text
              className="text-[13px] mt-1"
              style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
            >
              {section.description}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
