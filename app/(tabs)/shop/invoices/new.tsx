import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { UpgradeModal } from "../../../../src/design-system/components/UpgradeModal";
import { useInvoices } from "../../../../src/core/hooks/useInvoices";
import { useClients } from "../../../../src/core/hooks/useClients";
import type { PaymentTerms } from "../../../../src/core/types";

const PAYMENT_TERMS_OPTIONS = [
  { label: "Due on Receipt", value: "due_on_receipt" },
  { label: "Net 7", value: "net_7" },
  { label: "Net 15", value: "net_15" },
  { label: "Net 30", value: "net_30" },
  { label: "Net 60", value: "net_60" },
];

function todayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysForTerms(terms: PaymentTerms): number | null {
  switch (terms) {
    case "due_on_receipt": return 0;
    case "net_7": return 7;
    case "net_15": return 15;
    case "net_30": return 30;
    case "net_60": return 60;
    default: return null;
  }
}

export default function NewInvoiceScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { create, limitReached } = useInvoices();
  const { clients } = useClients();

  const [clientId, setClientId] = useState("");
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>("net_30");
  const [issueDate, setIssueDate] = useState(todayISO());
  const [dueDateManual, setDueDateManual] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [notesClient, setNotesClient] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [saving, setSaving] = useState(false);

  const dueDate = useMemo(() => {
    if (dueDateManual) return dueDateManual;
    const days = daysForTerms(paymentTerms);
    if (days !== null && issueDate) return addDays(issueDate, days);
    return "";
  }, [paymentTerms, issueDate, dueDateManual]);

  const handleTermsChange = (value: string) => {
    setPaymentTerms(value as PaymentTerms);
    setDueDateManual("");
  };

  const handleCreate = () => {
    if (!clientId) {
      Alert.alert("Missing Client", "Please select a client for this invoice.");
      return;
    }
    setSaving(true);
    try {
      const invoice = create(
        {
          clientId,
          paymentTerms,
          issueDate,
          dueDate: dueDate || undefined,
          taxRate: taxRate ? parseFloat(taxRate) : undefined,
          notesClient: notesClient || undefined,
          status: "draft",
        },
      );
      if (!invoice) {
        setShowUpgrade(true);
        setSaving(false);
        return;
      }
      router.replace(`/shop/invoices/${invoice.id}`);
    } catch {
      Alert.alert("Error", "Could not create invoice.");
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* Client Picker */}
        <Text
          className="text-[14px] mb-2"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
        >
          Client
        </Text>
        {clients.length === 0 ? (
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
            contentContainerStyle={{ gap: 8 }}
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

        {/* Payment Terms */}
        <Text
          className="text-[14px] mb-2"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
        >
          Payment Terms
        </Text>
        <FilterBar
          options={PAYMENT_TERMS_OPTIONS}
          selected={paymentTerms}
          onSelect={handleTermsChange}
        />

        {/* Issue Date */}
        <Text
          className="text-[14px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
        >
          Issue Date
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.textPrimary,
            fontFamily: "JetBrainsMono_400Regular",
          }}
          value={issueDate}
          onChangeText={setIssueDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
        />

        {/* Due Date */}
        <Text
          className="text-[14px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
        >
          Due Date
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.textPrimary,
            fontFamily: "JetBrainsMono_400Regular",
          }}
          value={dueDateManual || dueDate}
          onChangeText={setDueDateManual}
          placeholder="Auto-calculated or manual"
          placeholderTextColor={colors.textMuted}
        />

        {/* Tax Rate */}
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
            fontFamily: "JetBrainsMono_400Regular",
          }}
          value={taxRate}
          onChangeText={setTaxRate}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
        />

        {/* Notes for Client */}
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
            minHeight: 100,
            textAlignVertical: "top",
          }}
          value={notesClient}
          onChangeText={setNotesClient}
          placeholder="Thank you for your business..."
          placeholderTextColor={colors.textMuted}
          multiline
        />

        {/* Create Button */}
        <Pressable
          onPress={handleCreate}
          disabled={saving}
          className="rounded-lg py-4 items-center mt-2"
          style={{ backgroundColor: saving ? colors.border : colors.primary, minHeight: 48 }}
          accessibilityRole="button"
        >
          <Text
            className="text-[16px]"
            style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
          >
            {saving ? "Creating..." : "Create Invoice"}
          </Text>
        </Pressable>

        <View className="h-8" />
      </ScrollView>

      <UpgradeModal
        visible={showUpgrade || limitReached}
        onDismiss={() => setShowUpgrade(false)}
        feature="invoices"
        limit="the free tier"
      />
    </SafeAreaView>
  );
}
