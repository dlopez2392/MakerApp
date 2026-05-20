import { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useClients } from "../../../../src/core/hooks/useClients";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { UpgradeModal } from "../../../../src/design-system/components/UpgradeModal";
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

export default function NewClientScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { create, limitReached } = useClients();

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContact, setPreferredContact] = useState("");
  const [tags, setTags] = useState<ClientTag[]>([]);
  const [source, setSource] = useState<ClientSource | "">("");
  const [notes, setNotes] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const toggleTag = (tag: ClientTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCreate = () => {
    if (!fullName.trim()) {
      Alert.alert("Required", "Full name is required.");
      return;
    }
    const client = create({
      fullName: fullName.trim(),
      company: company.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      preferredContact: preferredContact.trim() || undefined,
      tags,
      source: (source as ClientSource) || undefined,
      notes: notes.trim() || undefined,
    });
    if (client) {
      router.back();
    } else if (limitReached) {
      setShowUpgrade(true);
    }
  };

  const inputStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontFamily: "Inter_400Regular",
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-6"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Add Client
        </Text>

        {/* Full Name (required) */}
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

        {/* Create Button */}
        <Pressable
          onPress={handleCreate}
          className="rounded-xl py-4 items-center mt-6"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="text-[16px]"
            style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
          >
            Save Client
          </Text>
        </Pressable>

        {/* Cancel */}
        <Pressable onPress={() => router.back()} className="items-center mt-4 py-3">
          <Text
            className="text-[14px]"
            style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
          >
            Cancel
          </Text>
        </Pressable>

        <View className="h-8" />
      </ScrollView>

      <UpgradeModal
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="clients"
      />
    </SafeAreaView>
  );
}
