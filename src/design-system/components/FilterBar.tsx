import { ScrollView, Pressable, Text } from "react-native";
import { useTheme } from "../hooks/useTheme";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  options: FilterOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export function FilterBar({ options, selected, onSelect }: FilterBarProps) {
  const { colors } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ gap: 8 }}>
      {options.map((opt) => {
        const isActive = opt.value === selected;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            className="rounded-full px-4 py-2"
            style={{
              backgroundColor: isActive ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: isActive ? colors.primary : colors.border,
              minHeight: 36,
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              className="text-[13px]"
              style={{
                fontFamily: "Inter_500Medium",
                color: isActive ? "#0f0f1a" : colors.textSecondary,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
