import { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { StatusBadge } from "../../../../src/design-system/components/StatusBadge";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useInvoices } from "../../../../src/core/hooks/useInvoices";
import { useClients } from "../../../../src/core/hooks/useClients";
import type { PaymentMethod } from "../../../../src/core/types";

const TERMS_LABELS: Record<string, string> = {
  due_on_receipt: "Due on Receipt",
  net_7: "Net 7",
  net_15: "Net 15",
  net_30: "Net 30",
  net_60: "Net 60",
};

const PAYMENT_METHOD_OPTIONS = [
  { label: "Cash", value: "cash" },
  { label: "Check", value: "check" },
  { label: "Venmo", value: "venmo" },
  { label: "Zelle", value: "zelle" },
  { label: "PayPal", value: "paypal" },
  { label: "Card", value: "card" },
  { label: "Other", value: "other" },
];

export default function InvoiceDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { invoices, update, recordPayment, remove } = useInvoices();
  const { clients } = useClients();

  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [recording, setRecording] = useState(false);

  const invoice = invoices.find((i) => i.id === id);
  const client = invoice ? clients.find((c) => c.id === invoice.clientId) : null;

  if (!invoice) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center p-4">
          <Text
            className="text-[16px]"
            style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
          >
            Invoice not found
          </Text>
          <Pressable onPress={() => router.back()} className="mt-4">
            <Text style={{ fontFamily: "Inter_500Medium", color: colors.primary }}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isOverdue = invoice.status === "overdue";

  const handleMarkSent = () => {
    update(id!, { status: "sent" });
  };

  const handleMarkPaid = () => {
    update(id!, { status: "paid" });
  };

  const handleRecordPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid payment amount.");
      return;
    }
    setRecording(true);
    try {
      recordPayment(id!, amount, paymentMethod);
      setPaymentAmount("");
      setShowPayment(false);
    } catch {
      Alert.alert("Error", "Could not record payment.");
    }
    setRecording(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Invoice",
      `Are you sure you want to delete invoice ${invoice.invoiceNumber}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            remove(id!);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View
          className="rounded-xl p-4 mb-4"
          style={{
            backgroundColor: colors.surface,
            borderWidth: isOverdue ? 2 : 1,
            borderColor: isOverdue ? "#ef4444" : colors.border,
          }}
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text
              className="text-[20px]"
              style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
            >
              {invoice.invoiceNumber}
            </Text>
            <StatusBadge status={invoice.status} />
          </View>
          {client && (
            <Text
              className="text-[15px]"
              style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
            >
              {client.fullName}
            </Text>
          )}
        </View>

        {/* Details */}
        <View className="mb-4">
          <InfoRow label="Status" value={invoice.status} colors={colors} />
          <InfoRow label="Issue Date" value={invoice.issueDate} colors={colors} />
          {invoice.dueDate && <InfoRow label="Due Date" value={invoice.dueDate} colors={colors} />}
          <InfoRow label="Payment Terms" value={TERMS_LABELS[invoice.paymentTerms] || invoice.paymentTerms} colors={colors} />
          {invoice.taxRate != null && invoice.taxRate > 0 && (
            <InfoRow label="Tax Rate" value={`${invoice.taxRate}%`} colors={colors} />
          )}
          {invoice.discountType && invoice.discountValue != null && (
            <InfoRow
              label="Discount"
              value={invoice.discountType === "percentage" ? `${invoice.discountValue}%` : `$${invoice.discountValue}`}
              colors={colors}
            />
          )}
        </View>

        {/* Client Notes */}
        {invoice.notesClient ? (
          <View className="mb-4">
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
              {invoice.notesClient}
            </Text>
          </View>
        ) : null}

        {/* Status Actions */}
        <View className="flex-row gap-3 mb-4">
          {(invoice.status === "draft") && (
            <Pressable
              onPress={handleMarkSent}
              className="flex-1 rounded-lg py-3 items-center"
              style={{ backgroundColor: "#3b82f630", borderWidth: 1, borderColor: "#3b82f650" }}
              accessibilityRole="button"
            >
              <Text
                className="text-[14px]"
                style={{ fontFamily: "Inter_600SemiBold", color: "#60a5fa" }}
              >
                Mark as Sent
              </Text>
            </Pressable>
          )}
          {(invoice.status === "sent" || invoice.status === "viewed" || invoice.status === "partial") && (
            <Pressable
              onPress={handleMarkPaid}
              className="flex-1 rounded-lg py-3 items-center"
              style={{ backgroundColor: "#10b98130", borderWidth: 1, borderColor: "#10b98150" }}
              accessibilityRole="button"
            >
              <Text
                className="text-[14px]"
                style={{ fontFamily: "Inter_600SemiBold", color: "#10b981" }}
              >
                Mark as Paid
              </Text>
            </Pressable>
          )}
        </View>

        {/* Record Payment */}
        <Pressable
          onPress={() => setShowPayment(!showPayment)}
          className="rounded-lg py-3 items-center mb-2"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.primary,
          }}
          accessibilityRole="button"
        >
          <Text
            className="text-[14px]"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.primary }}
          >
            {showPayment ? "Cancel Payment" : "Record Payment"}
          </Text>
        </Pressable>

        {showPayment && (
          <View
            className="rounded-xl p-4 mb-4"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <Text
              className="text-[14px] mb-2"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
            >
              Amount
            </Text>
            <TextInput
              className="rounded-lg px-4 py-3 mb-3 text-[16px]"
              style={{
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.textPrimary,
                fontFamily: "JetBrainsMono_400Regular",
              }}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />

            <Text
              className="text-[14px] mb-2"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
            >
              Payment Method
            </Text>
            <FilterBar
              options={PAYMENT_METHOD_OPTIONS}
              selected={paymentMethod}
              onSelect={(v) => setPaymentMethod(v as PaymentMethod)}
            />

            <Pressable
              onPress={handleRecordPayment}
              disabled={recording}
              className="rounded-lg py-3 items-center mt-1"
              style={{ backgroundColor: recording ? colors.border : colors.primary, minHeight: 44 }}
              accessibilityRole="button"
            >
              <Text
                className="text-[15px]"
                style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
              >
                {recording ? "Recording..." : "Submit Payment"}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Delete */}
        <Pressable
          onPress={handleDelete}
          className="rounded-lg py-3 items-center mt-4"
          style={{
            backgroundColor: "#ef444415",
            borderWidth: 1,
            borderColor: "#ef444440",
          }}
          accessibilityRole="button"
        >
          <Text
            className="text-[14px]"
            style={{ fontFamily: "Inter_600SemiBold", color: "#ef4444" }}
          >
            Delete Invoice
          </Text>
        </Pressable>

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
