import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Linking,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../src/design-system/hooks/useTheme";
import Constants from "expo-constants";

const FEEDBACK_EMAIL = "danlopez508@gmail.com";

type FeedbackType = "bug" | "feature" | "improvement";

const TYPES: { label: string; value: FeedbackType; icon: string; description: string }[] = [
  { label: "Bug Report", value: "bug", icon: "!", description: "Something isn't working correctly" },
  { label: "Feature Request", value: "feature", icon: "+", description: "Suggest a new feature" },
  { label: "Improvement", value: "improvement", icon: "^", description: "Make something better" },
];

export default function FeedbackScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [type, setType] = useState<FeedbackType>("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const appVersion = Constants.expoConfig?.version ?? "unknown";

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please add a short title describing the issue.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Missing Description", "Please describe the issue or suggestion.");
      return;
    }

    const typeLabel = TYPES.find((t) => t.value === type)?.label ?? type;
    const subject = encodeURIComponent(`[MakerOS ${typeLabel}] ${title.trim()}`);
    const body = encodeURIComponent(
      `${description.trim()}\n\n` +
        `---\n` +
        `Type: ${typeLabel}\n` +
        `App Version: ${appVersion}\n` +
        `Platform: ${Platform.OS} ${Platform.Version}\n`,
    );

    const url = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "No Email App",
          `No email client found. Please send your feedback to ${FEEDBACK_EMAIL}`,
        );
      }
    } catch {
      Alert.alert("Error", "Could not open email client.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-2">
          <Text
            className="text-[22px]"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
          >
            Send Feedback
          </Text>
          <Pressable onPress={() => router.back()} className="px-3 py-2">
            <Text
              className="text-[14px]"
              style={{ fontFamily: "Inter_500Medium", color: colors.primary }}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
        <Text
          className="text-[13px] mb-6"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Help us improve MakerOS — report bugs or suggest features
        </Text>

        {/* Type selector */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
        >
          Type
        </Text>
        <View className="gap-2 mb-6">
          {TYPES.map((t) => {
            const active = type === t.value;
            return (
              <Pressable
                key={t.value}
                onPress={() => setType(t.value)}
                className="flex-row items-center rounded-xl p-4"
                style={{
                  backgroundColor: active ? colors.primary + "15" : colors.surface,
                  borderWidth: 1.5,
                  borderColor: active ? colors.primary : colors.border,
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor: active ? colors.primary : colors.surfaceElevated,
                  }}
                >
                  <Text
                    className="text-[18px]"
                    style={{
                      fontFamily: "Inter_700Bold",
                      color: active ? "#0f0f1a" : colors.textMuted,
                    }}
                  >
                    {t.icon}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    className="text-[15px]"
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      color: active ? colors.primary : colors.textPrimary,
                    }}
                  >
                    {t.label}
                  </Text>
                  <Text
                    className="text-[12px]"
                    style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
                  >
                    {t.description}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Title */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
        >
          Title
        </Text>
        <TextInput
          className="rounded-xl px-4 py-3 text-[15px] mb-4"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.textPrimary,
            fontFamily: "Inter_400Regular",
          }}
          value={title}
          onChangeText={setTitle}
          placeholder={
            type === "bug"
              ? "e.g. Fraction calculator crashes on divide by zero"
              : type === "feature"
                ? "e.g. Add leather thickness calculator"
                : "e.g. Improve cut list visualization colors"
          }
          placeholderTextColor={colors.textMuted}
          maxLength={120}
        />

        {/* Description */}
        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
        >
          Description
        </Text>
        <TextInput
          className="rounded-xl px-4 py-3 text-[15px] mb-6"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            color: colors.textPrimary,
            fontFamily: "Inter_400Regular",
            minHeight: 140,
            textAlignVertical: "top",
          }}
          value={description}
          onChangeText={setDescription}
          placeholder={
            type === "bug"
              ? "Steps to reproduce:\n1. Go to...\n2. Tap on...\n3. See error...\n\nExpected: ...\nActual: ..."
              : "Describe what you'd like and why it would be useful..."
          }
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={6}
          maxLength={2000}
        />

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          className="rounded-xl py-4 items-center mb-4"
          style={{
            backgroundColor: title.trim() && description.trim() ? colors.primary : colors.surface,
            borderWidth: 1,
            borderColor: title.trim() && description.trim() ? colors.primary : colors.border,
          }}
        >
          <Text
            className="text-[16px]"
            style={{
              fontFamily: "Inter_600SemiBold",
              color: title.trim() && description.trim() ? "#0f0f1a" : colors.textMuted,
            }}
          >
            Open Email to Send
          </Text>
        </Pressable>

        <Text
          className="text-[11px] text-center mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
        >
          This will open your email app with a pre-filled message.{"\n"}
          App info is automatically included to help us diagnose issues.
        </Text>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
