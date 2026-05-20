import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useClients } from "../../../../src/core/hooks/useClients";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import type { ClientTag, ClientSource } from "../../../../src/core/types";

const TAG_OPTIONS: { label: string; value: ClientTag }[] = [
  { label: "Residential", value: "residential" },
  { label: "Commercial", value: "commercial" },
  { label: "Wholesale", value: "wholesale" },
  { label: "Repeat", value: "repeat" },
  { label: "VIP", value: "vip" },
  { label: "Lead", value: "lead" },
];

const SOURCE_OPTIONS: { label: string; value: string }[] = [
  { label: "Referral", value: "referral" },
  { label: "Instagram", value: "instagram" },
  { label: "Etsy", value: "etsy" },
  { label: "Website", value: "website" },
  { label: "Word of Mouth", value: "word_of_mouth" },
  { label: "Other", value: "other" },
];

const SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  SOURCE_OPTIONS.map((s) => [s.value, s.label])
);

const TAG_LABELS: Record<string, string> = Object.fromEntries(
  TAG_OPTIONS.map((t) => [t.value, t.label])
);

export default function ClientDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clients, loading, update, remove } = useClients();

  const client = clients.find((c) => c.id === id);

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContact, setPreferredContact] = useState("");
  const [tags, setTags] = useState<ClientTag[]>([]);
  const [source, setSource] = useState<ClientSource | "">("");
  const [notes, setNotes] = useState("");

  const startEditing = () => {
    if (!client) return;
    setFullName(client.fullName);
    setCompany(client.company || "");
    setEmail(client.email || "");
    setPhone(client.phone || "");
    setPreferredContact(client.preferredContact || "");
    setTags([...client.tags]);
    setSource(client.source || "");
    setNotes(client.notes || "");
    setEditing(true);
  };

  const toggleTag = (tag: ClientTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert("Required", "Full name is required.");
      return;
    }
    update(id!, {
      fullName: fullName.trim(),
      company: company.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      preferredContact: preferredContact.trim() || undefined,
      tags,
      source: (source as ClientSource) || undefined,
      notes: notes.trim() || undefined,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Client",
      `Are you sure you want to delete ${client?.fullName}? This cannot be undone.`,
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
      ]
    );
  };

  const inputStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontFamily: "Inter_400Regular",
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!client) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center p-4">
          <Text
            className="text-[16px]"
            style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
          >
            Client not found.
          </Text>
          <Pressable onPress={() => router.back()} className="mt-4 py-3">
            <Text
              className="text-[14px]"
              style={{ fontFamily: "Inter_500Medium", color: colors.primary }}
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /* ── Info Row helper ── */
  const InfoRow = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
      <View className="mb-4">
        <Text
          className="text-[12px] uppercase tracking-wider mb-1"
          style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
        >
          {label}
        </Text>
        <Text
          className="text-[15px]"
          style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}
        >
          {value}
        </Text>
      </View>
    );
  };

  /* ── VIEW MODE ── */
  if (!editing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView className="flex-1 p-4">
          {/* Header */}
          <Text
            className="text-[22px] mb-1"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
          >
            {client.fullName}
          </Text>
          {client.company && (
            <Text
              className="text-[15px] mb-4"
              style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
            >
              {client.company}
            </Text>
          )}

          <View
            className="rounded-xl p-4 mb-4"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <InfoRow label="Email" value={client.email} />
            <InfoRow label="Phone" value={client.phone} />
            <InfoRow label="Preferred Contact" value={client.preferredContact} />
            <InfoRow label="Billing Address" value={client.billingAddress} />
            <InfoRow label="Shipping Address" value={client.shippingAddress} />
            <InfoRow
              label="Source"
              value={client.source ? SOURCE_LABELS[client.source] || client.source : undefined}
            />
            <InfoRow label="Notes" value={client.notes} />

            {/* Tags */}
            {client.tags.length > 0 && (
              <View className="mb-2">
                <Text
                  className="text-[12px] uppercase tracking-wider mb-2"
                  style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
                >
                  Tags
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {client.tags.map((tag) => (
                    <View
                      key={tag}
                      className="rounded-full px-3 py-2"
                      style={{
                        backgroundColor: colors.primary,
                      }}
                    >
                      <Text
                        className="text-[13px]"
                        style={{ fontFamily: "Inter_500Medium", color: "#0f0f1a" }}
                      >
                        {TAG_LABELS[tag] || tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Edit Button */}
          <Pressable
            onPress={startEditing}
            className="rounded-xl py-4 items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="text-[16px]"
              style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
            >
              Edit Client
            </Text>
          </Pressable>

          {/* Delete Button */}
          <Pressable
            onPress={handleDelete}
            className="rounded-xl py-4 items-center mt-3"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              className="text-[16px]"
              style={{ fontFamily: "Inter_600SemiBold", color: "#ef4444" }}
            >
              Delete Client
            </Text>
          </Pressable>

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ── EDIT MODE ── */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-6"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Edit Client
        </Text>

        {/* Full Name */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Full Name *
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={inputStyle}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Client name"
          placeholderTextColor={colors.textMuted}
        />

        {/* Company */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Company
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={inputStyle}
          value={company}
          onChangeText={setCompany}
          placeholder="Company name"
          placeholderTextColor={colors.textMuted}
        />

        {/* Email */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Email
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={inputStyle}
          value={email}
          onChangeText={setEmail}
          placeholder="email@example.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Phone */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Phone
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={inputStyle}
          value={phone}
          onChangeText={setPhone}
          placeholder="(555) 123-4567"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
        />

        {/* Preferred Contact */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Preferred Contact
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={inputStyle}
          value={preferredContact}
          onChangeText={setPreferredContact}
          placeholder="e.g. Text, Email, Phone"
          placeholderTextColor={colors.textMuted}
        />

        {/* Tags */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Tags
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {TAG_OPTIONS.map((t) => {
            const isActive = tags.includes(t.value);
            return (
              <Pressable
                key={t.value}
                onPress={() => toggleTag(t.value)}
                className="rounded-full px-3 py-2"
                style={{
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: isActive ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="text-[13px]"
                  style={{
                    fontFamily: "Inter_500Medium",
                    color: isActive ? "#0f0f1a" : colors.textSecondary,
                  }}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Source */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Source
        </Text>
        <FilterBar
          options={SOURCE_OPTIONS}
          selected={source}
          onSelect={(v) => setSource(v as ClientSource)}
        />

        {/* Notes */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Notes
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={{ ...inputStyle, minHeight: 100, textAlignVertical: "top" }}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any notes about this client..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
        />

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          className="rounded-xl py-4 items-center mt-6"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="text-[16px]"
            style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
          >
            Save Changes
          </Text>
        </Pressable>

        {/* Cancel Edit */}
        <Pressable onPress={() => setEditing(false)} className="items-center mt-4 py-3">
          <Text
            className="text-[14px]"
            style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
          >
            Cancel
          </Text>
        </Pressable>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
