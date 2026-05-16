import { Stack } from "expo-router";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

export default function ShopLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Shop" }} />
      <Stack.Screen name="projects/index" options={{ title: "Projects" }} />
      <Stack.Screen name="projects/new" options={{ title: "New Project" }} />
      <Stack.Screen name="projects/[id]" options={{ title: "Project" }} />
      <Stack.Screen name="inventory/index" options={{ title: "Inventory" }} />
      <Stack.Screen name="inventory/new" options={{ title: "Add Item" }} />
      <Stack.Screen name="inventory/[id]" options={{ title: "Item" }} />
      <Stack.Screen name="clients/index" options={{ title: "Clients" }} />
      <Stack.Screen name="clients/new" options={{ title: "New Client" }} />
      <Stack.Screen name="clients/[id]" options={{ title: "Client" }} />
      <Stack.Screen name="journal/index" options={{ title: "Journal" }} />
      <Stack.Screen name="journal/new" options={{ title: "New Entry" }} />
      <Stack.Screen name="journal/[id]" options={{ title: "Entry" }} />
      <Stack.Screen name="quotes/index" options={{ title: "Quotes" }} />
      <Stack.Screen name="quotes/new" options={{ title: "New Quote" }} />
      <Stack.Screen name="quotes/[id]" options={{ title: "Quote" }} />
      <Stack.Screen name="invoices/index" options={{ title: "Invoices" }} />
      <Stack.Screen name="invoices/new" options={{ title: "New Invoice" }} />
      <Stack.Screen name="invoices/[id]" options={{ title: "Invoice" }} />
      <Stack.Screen name="revenue" options={{ title: "Revenue" }} />
    </Stack>
  );
}
