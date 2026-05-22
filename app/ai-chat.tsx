import { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useChat } from "../src/core/hooks/useChat";
import { useSubscription } from "../src/core/hooks/useSubscription";
import { useTheme } from "../src/design-system/hooks/useTheme";
import { UpgradeModal } from "../src/design-system/components/UpgradeModal";
import { AIService } from "../src/core/services/AIService";
import { FREE_LIMITS } from "../src/core/types";
import type { ChatMessage } from "../src/core/types";

const SUGGESTED_PROMPTS = [
  "What finish should I use for a cutting board?",
  "Help me price a custom project",
  "What speed settings for acrylic on a 40W laser?",
  "Tips for my first knife build",
  "How do I calculate resin for a river table?",
];

export default function AIChatScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { messages, streaming, streamingText, error, limitReached, send, clearHistory } =
    useChat();
  const { tier } = useSubscription();
  const flatListRef = useRef<FlatList>(null);
  const [input, setInput] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isPro = tier === "pro";
  const todayCount = AIService.getTodayMessageCount();
  const remaining = isPro ? Infinity : FREE_LIMITS.aiMessagesPerDay - todayCount;

  useEffect(() => {
    if (limitReached) setShowUpgrade(true);
  }, [limitReached]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;
    setInput("");
    await send(trimmed, "", isPro);
  };

  const handleSuggestion = (prompt: string) => {
    setInput(prompt);
  };

  const handleClear = () => {
    Alert.alert("Clear Chat", "Delete all chat history?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clearHistory },
    ]);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    return (
      <View className={`mb-3 px-4 ${isUser ? "items-end" : "items-start"}`}>
        <View
          className="rounded-2xl px-4 py-3 max-w-[85%]"
          style={{
            backgroundColor: isUser ? colors.primary : colors.surface,
            borderWidth: isUser ? 0 : 1,
            borderColor: colors.border,
          }}
        >
          <Text
            className="text-[14px] leading-[20px]"
            style={{
              fontFamily: "Inter_400Regular",
              color: isUser ? "#0f0f1a" : colors.textPrimary,
            }}
          >
            {item.content}
          </Text>
        </View>
        <Text
          className="text-[10px] mt-1 mx-1"
          style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
        >
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  const showSuggestions = messages.length === 0 && !streaming;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-4 py-3"
          style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          <Pressable onPress={() => router.back()} className="py-2 pr-4">
            <Text
              className="text-[14px]"
              style={{ fontFamily: "Inter_500Medium", color: colors.primary }}
            >
              Back
            </Text>
          </Pressable>
          <Text
            className="text-[17px]"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
          >
            AI Assistant
          </Text>
          <Pressable onPress={handleClear} className="py-2 pl-4">
            <Text
              className="text-[13px]"
              style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
            >
              Clear
            </Text>
          </Pressable>
        </View>

        {/* Messages */}
        {showSuggestions ? (
          <View className="flex-1 justify-center px-6">
            <Text
              className="text-[20px] text-center mb-2"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
            >
              MakerOS Assistant
            </Text>
            <Text
              className="text-[14px] text-center mb-6"
              style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
            >
              Ask me anything about your craft
            </Text>
            {SUGGESTED_PROMPTS.map((prompt) => (
              <Pressable
                key={prompt}
                onPress={() => handleSuggestion(prompt)}
                className="rounded-xl px-4 py-3 mb-2"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="text-[13px]"
                  style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
                >
                  {prompt}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ paddingVertical: 16 }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            ListFooterComponent={
              streaming ? (
                <View className="mb-3 px-4 items-start">
                  <View
                    className="rounded-2xl px-4 py-3 max-w-[85%]"
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      className="text-[14px] leading-[20px]"
                      style={{
                        fontFamily: "Inter_400Regular",
                        color: colors.textPrimary,
                      }}
                    >
                      {streamingText || "Thinking..."}
                    </Text>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {/* Error */}
        {error && (
          <View className="px-4 py-2" style={{ backgroundColor: "#ef444420" }}>
            <Text
              className="text-[12px]"
              style={{ fontFamily: "Inter_400Regular", color: "#ef4444" }}
            >
              {error}
            </Text>
          </View>
        )}

        {/* Remaining messages indicator */}
        {!isPro && (
          <View className="items-center py-1">
            <Text
              className="text-[11px]"
              style={{
                fontFamily: "Inter_400Regular",
                color: remaining <= 3 ? "#ef4444" : colors.textMuted,
              }}
            >
              {remaining > 0
                ? `${remaining} free messages remaining today`
                : "Daily limit reached"}
            </Text>
          </View>
        )}

        {/* Input */}
        <View
          className="flex-row items-end px-4 py-3 gap-2"
          style={{ borderTopWidth: 1, borderTopColor: colors.border }}
        >
          <TextInput
            className="flex-1 rounded-2xl px-4 py-3 text-[15px] max-h-[100px]"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.textPrimary,
              fontFamily: "Inter_400Regular",
            }}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your craft..."
            placeholderTextColor={colors.textMuted}
            multiline
            returnKeyType="default"
            editable={!streaming}
          />
          <Pressable
            onPress={handleSend}
            className="rounded-full w-[44px] h-[44px] items-center justify-center"
            style={{
              backgroundColor: input.trim() && !streaming ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: input.trim() && !streaming ? colors.primary : colors.border,
            }}
          >
            <Text
              className="text-[18px]"
              style={{
                color: input.trim() && !streaming ? "#0f0f1a" : colors.textMuted,
              }}
            >
              {"↑"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <UpgradeModal
        visible={showUpgrade}
        onDismiss={() => setShowUpgrade(false)}
        feature="AI Assistant"
        limit={`${FREE_LIMITS.aiMessagesPerDay} messages per day`}
      />
    </SafeAreaView>
  );
}
