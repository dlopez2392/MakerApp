import { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { UpgradeModal } from "../../../../src/design-system/components/UpgradeModal";
import { useQuotes } from "../../../../src/core/hooks/useQuotes";
import { useClients } from "../../../../src/core/hooks/useClients";

export default function NewQuoteScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { create, limitReached } = useQuotes();
  const { clients, loading: clientsLoading } = useClients();

  const [clientId, setClientId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [notesClient, setNotesClient] = useState("");
  const [terms, setTerms] = useState("");
  const [saving, setSaving] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleCreate = () => {
    if (!clientId) return;
    setSaving(true);

    const quote = create(
      {
        clientId,
        status: "draft",
        validUntil: validUntil || undefined,
        taxRate: parseFloat(taxRate) || 0,
        notesClient: notesClient || undefined,
        terms: terms || undefined,
      },
      "Q",
    );

    if (!quote) {
      setSaving(false);
      setShowUpgrade(true);
      return;
    }

    router.replace(`/shop/quotes/${quote.id}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        {/* ── Client Picker ── */}
        <Text
          className="text-[14px] mb-2"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
        >
          Client
        </Text>
        {clientsLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginBottom: 16 }} />
        ) : clients.length === 0 ? (
          <Text
            className="text-[13px] mb-4"
            style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
          >
            No clients yet. Add a client first.
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
            contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
          >
            {clients.map((c) => {
              const selected = c.id === clientId;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setClientId(c.id)}
                  className="rounded-full px-4 py-2"
                  style={{
                    backgroundColor: selected ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                    minHeight: 36,
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text
                    className="text-[13px]"
                    style={{
                      fontFamily: "Inter_500Medium",
                      color: selected ? "#0f0f1a" : colors.textSecondary,
                    }}
                  >
                    {c.fullName}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* ── Valid Until ── */}
        <Text
          className="text-[14px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
        >
          Valid Until
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.textPrimary,
            fontFamily: "Inter_400Regular",
          }}
          value={validUntil}
          onChangeText={setValidUntil}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
        />

        {/* ── Tax Rate ── */}
        <Text
          className="text-[14px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
        >
          Tax Rate (%)
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.textPrimary,
            fontFamily: "Inter_400Regular",
          }}
          value={taxRate}
          onChangeText={setTaxRate}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
        />

        {/* ── Notes for Client ── */}
        <Text
          className="text-[14px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
        >
          Notes for Client
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.textPrimary,
            fontFamily: "Inter_400Regular",
            minHeight: 80,
            textAlignVertical: "top",
          }}
          value={notesClient}
          onChangeText={setNotesClient}
          placeholder="Visible to the client on the quote"
          placeholderTextColor={colors.textMuted}
          multiline
        />

        {/* ── Terms ── */}
        <Text
          className="text-[14px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
        >
          Terms
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.textPrimary,
            fontFamily: "Inter_400Regular",
            minHeight: 80,
            textAlignVertical: "top",
          }}
          value={terms}
          onChangeText={setTerms}
          placeholder="Payment terms, conditions, etc."
          placeholderTextColor={colors.textMuted}
          multiline
        />

        {/* ── Create Button ── */}
        <Pressable
          onPress={handleCreate}
          disabled={!clientId || saving}
          className="rounded-lg py-4 items-center mt-4"
          style={{
            backgroundColor: clientId ? colors.primary : colors.surface,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator color="#0f0f1a" />
          ) : (
            <Text
              className="text-[16px]"
              style={{
                fontFamily: "Inter_600SemiBold",
                color: clientId ? "#0f0f1a" : colors.textMuted,
              }}
            >
              Create Draft Quote
            </Text>
          )}
        </Pressable>
      </ScrollView>

      <UpgradeModal
        visible={showUpgrade || limitReached}
        onDismiss={() => setShowUpgrade(false)}
        feature="quotes & invoices"
      />
    </SafeAreaView>
  );
}
