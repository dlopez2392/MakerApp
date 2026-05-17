import { useState } from "react";
import { SafeAreaView, View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function NewQuoteScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        <Text className="text-[14px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}>
          Client
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, fontFamily: "Inter_400Regular" }}
          value={clientName}
          onChangeText={setClientName}
          placeholder="Client name"
          placeholderTextColor={colors.textMuted}
        />

        <Text className="text-[14px] mb-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}>
          Description
        </Text>
        <TextInput
          className="rounded-lg px-4 py-3 mb-4 text-[16px]"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, fontFamily: "Inter_400Regular", minHeight: 100, textAlignVertical: "top" }}
          value={description}
          onChangeText={setDescription}
          placeholder="Project description and scope"
          placeholderTextColor={colors.textMuted}
          multiline
        />

        <Pressable
          onPress={handleSave}
          className="rounded-lg py-4 items-center mt-4"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-[16px]" style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}>
            Save Quote
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
