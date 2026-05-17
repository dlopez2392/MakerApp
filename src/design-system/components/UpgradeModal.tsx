import { View, Text, Pressable, Modal } from "react-native";
import { useTheme } from "../hooks/useTheme";

export interface UpgradeModalProps {
  visible: boolean;
  onDismiss?: () => void;
  onClose?: () => void;
  feature: string;
  limit?: string;
}

export function UpgradeModal({ visible, onDismiss, onClose, feature, limit = "the free tier" }: UpgradeModalProps) {
  const dismiss = onDismiss || onClose || (() => {});
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onPress={dismiss}>
        <View
          className="rounded-t-2xl p-6 pb-10"
          style={{ backgroundColor: colors.surfaceElevated }}
          onStartShouldSetResponder={() => true}
        >
          <Text
            className="text-[18px] mb-2"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
          >
            Upgrade to MakerOS Pro
          </Text>
          <Text
            className="text-[15px] mb-4"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            You've reached the free tier limit of {limit} for {feature}. Upgrade to Pro for unlimited access, cloud sync, and the AI assistant.
          </Text>
          <Pressable
            className="rounded-lg py-4 items-center mb-3"
            style={{ backgroundColor: colors.primary, minHeight: 48 }}
            accessibilityRole="button"
          >
            <Text className="text-[15px]" style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}>
              Start 7-Day Free Trial
            </Text>
          </Pressable>
          <Pressable onPress={dismiss} className="items-center py-2" accessibilityRole="button">
            <Text className="text-[15px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
              Maybe Later
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
