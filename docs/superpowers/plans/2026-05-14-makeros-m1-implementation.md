# MakerOS Milestone 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MakerOS foundation — Expo project scaffold, Unified Shop Core platform (Projects, Inventory, Clients, Journal, Quotes, Invoices, Revenue), Woodworking module (8 calculators + species DB), and Utilities module (6 tools).

**Architecture:** Domain-driven hybrid. `src/core/` is the horizontal Shop Core platform layer (database, services, hooks, shared components). `src/modules/` contains vertical slices (woodworking, utilities). Modules import only from `core/` and `design-system/`. SQLite (expo-sqlite) is the local database; repository pattern abstracts storage so Pro tier can swap to Supabase later.

**Tech Stack:** Expo SDK 52+, Expo Router, NativeWind, Zustand, expo-sqlite, React Native Reanimated, expo-haptics, expo-av, TypeScript, Jest

**Spec:** `docs/superpowers/specs/2026-05-14-makeros-m1-design.md`

---

## Phase 1: Foundation

### Task 1: Scaffold Expo Project

**Files:**
- Create: `package.json`, `app.json`, `tsconfig.json`, `babel.config.js`, `tailwind.config.js`, `global.css`, `metro.config.js`, `.gitignore`

- [ ] **Step 1: Create Expo project with expo-router template**

```bash
cd C:\Users\danlo
npx create-expo-app@latest MakerApp-scaffold --template tabs
```

Then copy the generated files into `C:\Users\danlo\MakerApp`, replacing the empty repo. We use the tabs template as a starting point, then customize.

- [ ] **Step 2: Install core dependencies**

```bash
cd C:\Users\danlo\MakerApp
npx expo install expo-router expo-sqlite expo-haptics expo-av expo-file-system expo-print expo-linking expo-status-bar expo-image-picker react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens react-native-svg
npm install nativewind tailwindcss zustand @expo-google-fonts/inter @expo-google-fonts/jetbrains-mono
npm install --save-dev jest @types/jest ts-jest @testing-library/react-native @testing-library/jest-native
```

- [ ] **Step 3: Configure NativeWind**

Create `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0f0f1a",
        surface: "#1e1e2e",
        "surface-elevated": "#282840",
        border: "#2e2e3e",
        primary: "#f59e0b",
        "primary-muted": "#92610a",
        success: "#10b981",
        danger: "#ef4444",
        warning: "#f97316",
        "text-primary": "#f8fafc",
        "text-secondary": "#94a3b8",
        "text-muted": "#64748b",
      },
      fontFamily: {
        inter: ["Inter_400Regular"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
        mono: ["JetBrainsMono_500Medium"],
        "mono-bold": ["JetBrainsMono_700Bold"],
      },
    },
  },
  plugins: [],
};
```

Create `global.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Update `babel.config.js`:
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: ["react-native-reanimated/plugin"],
  };
};
```

Create `metro.config.js`:
```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css" });
```

- [ ] **Step 4: Configure TypeScript**

`tsconfig.json`:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@core/*": ["src/core/*"],
      "@modules/*": ["src/modules/*"],
      "@design-system/*": ["src/design-system/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 5: Configure Jest**

Create `jest.config.js`:
```js
module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|nativewind)",
  ],
  setupFilesAfterSetup: ["./jest.setup.js"],
  moduleNameMapper: {
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
    "^@design-system/(.*)$": "<rootDir>/src/design-system/$1",
  },
};
```

Create `jest.setup.js`:
```js
// Mock expo-sqlite for tests
jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(() => null),
    runSync: jest.fn(() => ({ lastInsertRowId: 1, changes: 1 })),
  })),
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium" },
}));
```

- [ ] **Step 6: Create directory structure**

```bash
mkdir -p src/core/{database,services,components,hooks,types,stores}
mkdir -p src/modules/{woodworking/{calculators,data,components},utilities/{calculators,data,components}}
mkdir -p src/design-system/{components,tokens,hooks}
mkdir -p __tests__/{core,modules/{woodworking,utilities}}
```

- [ ] **Step 7: Update .gitignore and commit**

Ensure `.gitignore` includes:
```
node_modules/
.expo/
dist/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
.env
```

```bash
git add -A
git commit -m "feat: scaffold Expo project with NativeWind, Zustand, expo-sqlite"
```

---

### Task 2: Design System Tokens and Base Components

**Files:**
- Create: `src/design-system/tokens/colors.ts`, `src/design-system/tokens/typography.ts`, `src/design-system/tokens/spacing.ts`, `src/design-system/tokens/index.ts`
- Create: `src/design-system/components/CalculatorInput.tsx`, `src/design-system/components/ResultCard.tsx`, `src/design-system/components/ActionBar.tsx`, `src/design-system/components/SafetyWarning.tsx`, `src/design-system/components/StatusBadge.tsx`, `src/design-system/components/SearchableSelect.tsx`, `src/design-system/components/EmptyState.tsx`, `src/design-system/components/UpgradeModal.tsx`, `src/design-system/components/FilterBar.tsx`, `src/design-system/components/StepIndicator.tsx`, `src/design-system/components/index.ts`

- [ ] **Step 1: Create color tokens**

`src/design-system/tokens/colors.ts`:
```ts
export const colors = {
  dark: {
    background: "#0f0f1a",
    surface: "#1e1e2e",
    surfaceElevated: "#282840",
    border: "#2e2e3e",
    primary: "#f59e0b",
    primaryMuted: "#92610a",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f97316",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
  },
  light: {
    background: "#f8fafc",
    surface: "#ffffff",
    surfaceElevated: "#f1f5f9",
    border: "#e2e8f0",
    primary: "#d97706",
    primaryMuted: "#fef3c7",
    success: "#059669",
    danger: "#dc2626",
    warning: "#ea580c",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
  },
} as const;

export type ThemeColors = typeof colors.dark;
export type ThemeMode = "dark" | "light";
```

`src/design-system/tokens/typography.ts`:
```ts
export const typography = {
  calcValue: { fontFamily: "JetBrainsMono_700Bold", fontSize: 36 },
  calcValueSmall: { fontFamily: "JetBrainsMono_700Bold", fontSize: 28 },
  inputValue: { fontFamily: "JetBrainsMono_500Medium", fontSize: 18 },
  heading: { fontFamily: "Inter_600SemiBold", fontSize: 18 },
  body: { fontFamily: "Inter_400Regular", fontSize: 15 },
  label: { fontFamily: "Inter_400Regular", fontSize: 13 },
  small: { fontFamily: "Inter_400Regular", fontSize: 11 },
} as const;
```

`src/design-system/tokens/spacing.ts`:
```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const touchTarget = { minHeight: 48, minWidth: 48 } as const;
```

`src/design-system/tokens/index.ts`:
```ts
export { colors, type ThemeColors, type ThemeMode } from "./colors";
export { typography } from "./typography";
export { spacing, touchTarget } from "./spacing";
```

- [ ] **Step 2: Create theme store**

`src/design-system/hooks/useTheme.ts`:
```ts
import { create } from "zustand";
import { colors, type ThemeMode, type ThemeColors } from "../tokens/colors";

interface ThemeStore {
  mode: ThemeMode;
  colors: ThemeColors;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useTheme = create<ThemeStore>((set) => ({
  mode: "dark",
  colors: colors.dark,
  toggle: () =>
    set((state) => {
      const next = state.mode === "dark" ? "light" : "dark";
      return { mode: next, colors: colors[next] };
    }),
  setMode: (mode) => set({ mode, colors: colors[mode] }),
}));
```

- [ ] **Step 3: Create CalculatorInput component**

`src/design-system/components/CalculatorInput.tsx`:
```tsx
import { View, TextInput, Text, Pressable } from "react-native";
import { useState, useCallback } from "react";
import { useTheme } from "../hooks/useTheme";

interface CalculatorInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit?: string;
  placeholder?: string;
  keyboardType?: "numeric" | "decimal-pad";
  accessibilityLabel?: string;
}

export function CalculatorInput({
  label,
  value,
  onChangeText,
  unit,
  placeholder = "0",
  keyboardType = "decimal-pad",
  accessibilityLabel,
}: CalculatorInputProps) {
  const { colors } = useTheme();

  return (
    <View className="mb-3">
      <Text
        className="text-text-secondary text-[13px] mb-1 ml-1"
        style={{ fontFamily: "Inter_400Regular" }}
      >
        {label}
      </Text>
      <View
        className="flex-row items-center rounded-lg px-4 py-3"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        <TextInput
          className="flex-1 text-[18px] text-text-primary"
          style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          accessibilityLabel={accessibilityLabel || label}
        />
        {unit && (
          <Text
            className="text-[13px] ml-2"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
}
```

- [ ] **Step 4: Create ResultCard component**

`src/design-system/components/ResultCard.tsx`:
```tsx
import { View, Text } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { useTheme } from "../hooks/useTheme";

interface ResultItem {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}

interface ResultCardProps {
  title?: string;
  results: ResultItem[];
}

export function ResultCard({ title, results }: ResultCardProps) {
  const { colors } = useTheme();
  const prevResults = useRef(results);

  useEffect(() => {
    if (JSON.stringify(prevResults.current) !== JSON.stringify(results)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      prevResults.current = results;
    }
  }, [results]);

  return (
    <Animated.View
      entering={FadeInUp.duration(200).springify()}
      className="rounded-xl p-4 mt-4"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      {title && (
        <Text
          className="text-[13px] mb-3 uppercase tracking-wider"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
        >
          {title}
        </Text>
      )}
      {results.map((item, i) => (
        <View key={i} className={`flex-row justify-between items-baseline ${i > 0 ? "mt-3" : ""}`}>
          <Text
            className="text-[13px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            {item.label}
          </Text>
          <View className="flex-row items-baseline">
            <Text
              className={item.highlight ? "text-[36px]" : "text-[28px]"}
              style={{
                fontFamily: "JetBrainsMono_700Bold",
                color: item.highlight ? colors.primary : colors.textPrimary,
              }}
            >
              {item.value}
            </Text>
            {item.unit && (
              <Text
                className="text-[13px] ml-1"
                style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
              >
                {item.unit}
              </Text>
            )}
          </View>
        </View>
      ))}
    </Animated.View>
  );
}
```

- [ ] **Step 5: Create ActionBar component**

`src/design-system/components/ActionBar.tsx`:
```tsx
import { View, Pressable, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "../hooks/useTheme";

interface ActionBarProps {
  onSaveToHistory: () => void;
  onAddToQuote: () => void;
  onLogToProject: () => void;
}

export function ActionBar({ onSaveToHistory, onAddToQuote, onLogToProject }: ActionBarProps) {
  const { colors } = useTheme();

  const handlePress = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    callback();
  };

  const buttons = [
    { label: "Save to History", onPress: () => handlePress(onSaveToHistory), icon: "bookmark" },
    { label: "Add to Quote", onPress: () => handlePress(onAddToQuote), icon: "file-text" },
    { label: "Log to Project", onPress: () => handlePress(onLogToProject), icon: "folder" },
  ];

  return (
    <View className="flex-row justify-between mt-6 gap-2">
      {buttons.map((btn) => (
        <Pressable
          key={btn.label}
          onPress={btn.onPress}
          className="flex-1 items-center py-3 rounded-lg"
          style={{ backgroundColor: colors.surfaceElevated, minHeight: 48 }}
          accessibilityLabel={btn.label}
          accessibilityRole="button"
        >
          <Text
            className="text-[11px] text-center"
            style={{ fontFamily: "Inter_500Medium", color: colors.primary }}
          >
            {btn.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
```

- [ ] **Step 6: Create SafetyWarning component**

`src/design-system/components/SafetyWarning.tsx`:
```tsx
import { View, Text } from "react-native";
import { useTheme } from "../hooks/useTheme";

interface SafetyWarningProps {
  message: string;
  level?: "danger" | "warning";
}

export function SafetyWarning({ message, level = "danger" }: SafetyWarningProps) {
  const { colors } = useTheme();
  const borderColor = level === "danger" ? colors.danger : colors.warning;
  const textColor = level === "danger" ? colors.danger : colors.warning;

  return (
    <View
      className="rounded-lg p-3 mb-4 flex-row items-start"
      style={{ borderWidth: 2, borderColor, backgroundColor: `${borderColor}15` }}
    >
      <Text className="text-[16px] mr-2" accessibilityLabel={level === "danger" ? "Danger" : "Warning"}>
        {level === "danger" ? "⚠️" : "⚠"}
      </Text>
      <Text
        className="flex-1 text-[13px] leading-5"
        style={{ fontFamily: "Inter_400Regular", color: textColor }}
      >
        {message}
      </Text>
    </View>
  );
}
```

- [ ] **Step 7: Create StatusBadge, EmptyState, UpgradeModal, FilterBar, StepIndicator**

`src/design-system/components/StatusBadge.tsx`:
```tsx
import { View, Text } from "react-native";
import { useTheme } from "../hooks/useTheme";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  idea: { bg: "#64748b30", text: "#94a3b8" },
  design: { bg: "#8b5cf630", text: "#a78bfa" },
  "in-progress": { bg: "#f59e0b30", text: "#f59e0b" },
  finishing: { bg: "#f9731630", text: "#f97316" },
  complete: { bg: "#10b98130", text: "#10b981" },
  delivered: { bg: "#3b82f630", text: "#60a5fa" },
  archived: { bg: "#64748b20", text: "#64748b" },
  draft: { bg: "#64748b30", text: "#94a3b8" },
  sent: { bg: "#3b82f630", text: "#60a5fa" },
  paid: { bg: "#10b98130", text: "#10b981" },
  overdue: { bg: "#ef444430", text: "#ef4444" },
  accepted: { bg: "#10b98130", text: "#10b981" },
  rejected: { bg: "#ef444430", text: "#ef4444" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_COLORS[status.toLowerCase()] || STATUS_COLORS.idea;

  return (
    <View className="rounded-full px-3 py-1" style={{ backgroundColor: style.bg }}>
      <Text className="text-[11px] capitalize" style={{ fontFamily: "Inter_500Medium", color: style.text }}>
        {status.replace("-", " ")}
      </Text>
    </View>
  );
}
```

`src/design-system/components/EmptyState.tsx`:
```tsx
import { View, Text, Pressable } from "react-native";
import { useTheme } from "../hooks/useTheme";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text
        className="text-[18px] mb-2"
        style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
      >
        {title}
      </Text>
      <Text
        className="text-[15px] text-center mb-6"
        style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
      >
        {description}
      </Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="rounded-lg px-6 py-3"
          style={{ backgroundColor: colors.primary, minHeight: 48 }}
          accessibilityRole="button"
        >
          <Text className="text-[15px]" style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}>
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
```

`src/design-system/components/UpgradeModal.tsx`:
```tsx
import { View, Text, Pressable, Modal } from "react-native";
import { useTheme } from "../hooks/useTheme";

interface UpgradeModalProps {
  visible: boolean;
  onDismiss: () => void;
  feature: string;
  limit: string;
}

export function UpgradeModal({ visible, onDismiss, feature, limit }: UpgradeModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onDismiss}>
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
          <Pressable onPress={onDismiss} className="items-center py-2" accessibilityRole="button">
            <Text className="text-[15px]" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
              Maybe Later
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
```

`src/design-system/components/FilterBar.tsx`:
```tsx
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
```

`src/design-system/components/StepIndicator.tsx`:
```tsx
import { View } from "react-native";
import { useTheme } from "../hooks/useTheme";

interface StepIndicatorProps {
  total: number;
  current: number;
}

export function StepIndicator({ total, current }: StepIndicatorProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-row justify-center gap-2 mb-4">
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          className="rounded-full"
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            backgroundColor: i === current ? colors.primary : colors.border,
          }}
        />
      ))}
    </View>
  );
}
```

- [ ] **Step 8: Create barrel export**

`src/design-system/components/index.ts`:
```ts
export { CalculatorInput } from "./CalculatorInput";
export { ResultCard } from "./ResultCard";
export { ActionBar } from "./ActionBar";
export { SafetyWarning } from "./SafetyWarning";
export { StatusBadge } from "./StatusBadge";
export { EmptyState } from "./EmptyState";
export { UpgradeModal } from "./UpgradeModal";
export { FilterBar } from "./FilterBar";
export { StepIndicator } from "./StepIndicator";
```

- [ ] **Step 9: Commit**

```bash
git add src/design-system/
git commit -m "feat: add design system tokens and shared component library"
```

---

### Task 3: Navigation Structure

**Files:**
- Create: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/make/_layout.tsx`, `app/(tabs)/make/woodworking/index.tsx`, `app/(tabs)/shop/_layout.tsx`, `app/(tabs)/shop/index.tsx`, `app/(tabs)/utilities/index.tsx`, `app/(tabs)/profile/index.tsx`

- [ ] **Step 1: Create root layout with font loading**

`app/_layout.tsx`:
```tsx
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import * as SplashScreen from "expo-splash-screen";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
```

- [ ] **Step 2: Create bottom tab navigator**

`app/(tabs)/_layout.tsx`:
```tsx
import { Tabs } from "expo-router";
import { useTheme } from "../../src/design-system/hooks/useTheme";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarLabel: "Home" }} />
      <Tabs.Screen name="make" options={{ title: "Make", tabBarLabel: "Make" }} />
      <Tabs.Screen name="shop" options={{ title: "Shop", tabBarLabel: "Shop" }} />
      <Tabs.Screen name="utilities" options={{ title: "Utilities", tabBarLabel: "Utilities" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarLabel: "Profile" }} />
    </Tabs>
  );
}
```

- [ ] **Step 3: Create Make tab with scrollable top tabs**

`app/(tabs)/make/_layout.tsx`:
```tsx
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

const { Navigator } = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Navigator);

export default function MakeLayout() {
  const { colors } = useTheme();

  return (
    <TopTabs
      screenOptions={{
        tabBarScrollEnabled: true,
        tabBarStyle: { backgroundColor: colors.background },
        tabBarIndicatorStyle: { backgroundColor: colors.primary, height: 3 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: "Inter_600SemiBold", fontSize: 13, textTransform: "none" },
        tabBarItemStyle: { width: "auto", paddingHorizontal: 16 },
      }}
    >
      <TopTabs.Screen name="woodworking" options={{ title: "Woodworking" }} />
      <TopTabs.Screen name="laser" options={{ title: "Laser" }} />
      <TopTabs.Screen name="cnc" options={{ title: "CNC" }} />
      <TopTabs.Screen name="printing" options={{ title: "3D Print" }} />
      <TopTabs.Screen name="resin" options={{ title: "Resin" }} />
      <TopTabs.Screen name="knife" options={{ title: "Knife" }} />
      <TopTabs.Screen name="leather" options={{ title: "Leather" }} />
      <TopTabs.Screen name="candle" options={{ title: "Candle" }} />
      <TopTabs.Screen name="soap" options={{ title: "Soap" }} />
    </TopTabs>
  );
}
```

Note: Install `@react-navigation/material-top-tabs` and `react-native-pager-view`:
```bash
npm install @react-navigation/material-top-tabs react-native-pager-view
```

- [ ] **Step 4: Create placeholder screens for all tabs**

`app/(tabs)/index.tsx` (Home):
```tsx
import { View, Text, SafeAreaView, ScrollView } from "react-native";
import { useTheme } from "../../src/design-system/hooks/useTheme";

export default function HomeScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[18px] mb-6"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Good morning. {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
```

`app/(tabs)/make/woodworking/index.tsx` (Woodworking module home):
```tsx
import { View, Text, Pressable, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const CALCULATORS = [
  { name: "Board Foot", route: "/make/woodworking/board-foot", icon: "ruler" },
  { name: "Fractions", route: "/make/woodworking/fraction-calc", icon: "divide" },
  { name: "Cut List", route: "/make/woodworking/cut-list", icon: "scissors" },
  { name: "Wood Movement", route: "/make/woodworking/wood-movement", icon: "move" },
  { name: "Finishing", route: "/make/woodworking/finishing", icon: "droplet" },
  { name: "Epoxy Resin", route: "/make/woodworking/epoxy", icon: "layers" },
  { name: "Species DB", route: "/make/woodworking/species-db", icon: "database" },
  { name: "Pricing", route: "/make/woodworking/pricing", icon: "dollar-sign" },
];

export default function WoodworkingHome() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        <View className="flex-row flex-wrap gap-3">
          {CALCULATORS.map((calc) => (
            <Pressable
              key={calc.name}
              onPress={() => router.push(calc.route as any)}
              className="rounded-xl p-4 items-center justify-center"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                width: "47%",
                minHeight: 100,
              }}
              accessibilityRole="button"
              accessibilityLabel={calc.name}
            >
              <Text
                className="text-[15px] text-center mt-2"
                style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
              >
                {calc.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

`app/(tabs)/shop/_layout.tsx`:
```tsx
import { Stack } from "expo-router";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

export default function ShopLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Shop" }} />
      <Stack.Screen name="projects/index" options={{ title: "Projects" }} />
      <Stack.Screen name="projects/new" options={{ title: "New Project" }} />
      <Stack.Screen name="projects/[id]" options={{ title: "Project" }} />
      <Stack.Screen name="inventory/index" options={{ title: "Inventory" }} />
      <Stack.Screen name="inventory/new" options={{ title: "Add Item" }} />
      <Stack.Screen name="inventory/[id]" options={{ title: "Item" }} />
      <Stack.Screen name="clients/index" options={{ title: "Clients" }} />
      <Stack.Screen name="clients/new" options={{ title: "New Client" }} />
      <Stack.Screen name="clients/[id]" options={{ title: "Client" }} />
      <Stack.Screen name="journal/index" options={{ title: "Journal" }} />
      <Stack.Screen name="journal/new" options={{ title: "New Entry" }} />
      <Stack.Screen name="journal/[id]" options={{ title: "Entry" }} />
      <Stack.Screen name="quotes/index" options={{ title: "Quotes" }} />
      <Stack.Screen name="quotes/new" options={{ title: "New Quote" }} />
      <Stack.Screen name="quotes/[id]" options={{ title: "Quote" }} />
      <Stack.Screen name="invoices/index" options={{ title: "Invoices" }} />
      <Stack.Screen name="invoices/new" options={{ title: "New Invoice" }} />
      <Stack.Screen name="invoices/[id]" options={{ title: "Invoice" }} />
      <Stack.Screen name="revenue" options={{ title: "Revenue" }} />
    </Stack>
  );
}
```

`app/(tabs)/shop/index.tsx` (Shop hub):
```tsx
import { View, Text, Pressable, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

const SHOP_SECTIONS = [
  { name: "Projects", route: "/shop/projects", description: "Track maker projects across all disciplines" },
  { name: "Inventory", route: "/shop/inventory", description: "Materials, supplies, and consumables" },
  { name: "Clients", route: "/shop/clients", description: "Customer profiles and communication" },
  { name: "Journal", route: "/shop/journal", description: "Daily shop log and time tracking" },
  { name: "Quotes & Invoices", route: "/shop/quotes", description: "Estimates, billing, and payments" },
  { name: "Revenue", route: "/shop/revenue", description: "Business analytics and reporting" },
];

export default function ShopHub() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[18px] mb-4"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Shop Management
        </Text>
        {SHOP_SECTIONS.map((section) => (
          <Pressable
            key={section.name}
            onPress={() => router.push(section.route as any)}
            className="rounded-xl p-4 mb-3"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: 48 }}
            accessibilityRole="button"
          >
            <Text
              className="text-[15px]"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
            >
              {section.name}
            </Text>
            <Text
              className="text-[13px] mt-1"
              style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
            >
              {section.description}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
```

`app/(tabs)/utilities/index.tsx`:
```tsx
import { View, Text, Pressable, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

const TOOLS = [
  { name: "Unit Converter", route: "/utilities/unit-converter" },
  { name: "Decibel Meter", route: "/utilities/decibel-meter" },
  { name: "Golden Ratio", route: "/utilities/golden-ratio" },
  { name: "Circle / Arc", route: "/utilities/circle-arc" },
  { name: "Drill / Tap", route: "/utilities/drill-tap" },
  { name: "EMC Calculator", route: "/utilities/emc" },
];

export default function UtilitiesHome() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[18px] mb-4"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Utilities
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {TOOLS.map((tool) => (
            <Pressable
              key={tool.name}
              onPress={() => router.push(tool.route as any)}
              className="rounded-xl p-4 items-center justify-center"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                width: "47%",
                minHeight: 100,
              }}
              accessibilityRole="button"
            >
              <Text
                className="text-[15px] text-center"
                style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
              >
                {tool.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

`app/(tabs)/profile/index.tsx`:
```tsx
import { View, Text, SafeAreaView, ScrollView } from "react-native";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

export default function ProfileScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[18px] mb-4"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Settings
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 5: Create placeholder screens for future modules in Make tab**

For each of: `laser`, `cnc`, `printing`, `resin`, `knife`, `leather`, `candle`, `soap` — create `app/(tabs)/make/<module>/index.tsx` with a simple placeholder:

```tsx
// Example: app/(tabs)/make/laser/index.tsx
import { View, Text, SafeAreaView } from "react-native";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function LaserHome() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 items-center justify-center">
        <Text style={{ fontFamily: "Inter_500Medium", color: colors.textMuted, fontSize: 15 }}>
          Coming in Milestone 2
        </Text>
      </View>
    </SafeAreaView>
  );
}
```

Repeat for all 8 placeholder modules.

- [ ] **Step 6: Run the app to verify navigation works**

```bash
npx expo start
```

Verify: bottom tabs appear, Make tab shows scrollable top tabs, Woodworking shows calculator grid, Shop shows hub cards, Utilities shows tool grid.

- [ ] **Step 7: Commit**

```bash
git add app/ src/
git commit -m "feat: add navigation structure with 5 bottom tabs, Make top tabs, Shop stack"
```

---

### Task 4: SQLite Database Layer

**Files:**
- Create: `src/core/database/schema.ts`, `src/core/database/connection.ts`, `src/core/database/migrations.ts`
- Test: `__tests__/core/database/schema.test.ts`

- [ ] **Step 1: Write tests for database initialization**

`__tests__/core/database/schema.test.ts`:
```ts
import { getTableNames, TABLE_SCHEMAS } from "../../../src/core/database/schema";

describe("Database Schema", () => {
  test("defines all required tables", () => {
    const tableNames = getTableNames();
    const expected = [
      "projects", "inventory_items", "inventory_deductions", "clients",
      "journal_entries", "quotes", "quote_line_items", "invoices",
      "invoice_line_items", "invoice_payments", "calculator_results",
      "saved_recipes", "wood_species", "user_settings",
    ];
    expect(tableNames).toEqual(expect.arrayContaining(expected));
    expect(tableNames.length).toBe(expected.length);
  });

  test("projects table has correct columns", () => {
    const sql = TABLE_SCHEMAS.projects;
    expect(sql).toContain("id TEXT PRIMARY KEY");
    expect(sql).toContain("name TEXT NOT NULL");
    expect(sql).toContain("client_id TEXT");
    expect(sql).toContain("status TEXT NOT NULL DEFAULT 'idea'");
    expect(sql).toContain("discipline_tags TEXT NOT NULL DEFAULT '[]'");
    expect(sql).toContain("created_at TEXT NOT NULL");
  });

  test("inventory_items table has metadata jsonb field", () => {
    const sql = TABLE_SCHEMAS.inventory_items;
    expect(sql).toContain("metadata TEXT DEFAULT '{}'");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/core/database/schema.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement schema definitions**

`src/core/database/schema.ts`:
```ts
export const TABLE_SCHEMAS: Record<string, string> = {
  projects: `CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    client_id TEXT,
    status TEXT NOT NULL DEFAULT 'idea',
    discipline_tags TEXT NOT NULL DEFAULT '[]',
    start_date TEXT,
    target_date TEXT,
    completed_date TEXT,
    estimated_hours REAL,
    actual_hours REAL DEFAULT 0,
    budget REAL,
    notes TEXT,
    cover_photo_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  inventory_items: `CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    master_category TEXT NOT NULL,
    sub_category TEXT,
    sku TEXT,
    supplier_name TEXT,
    supplier_url TEXT,
    quantity REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    unit_cost REAL,
    location TEXT,
    low_stock_threshold REAL,
    notes TEXT,
    photo_url TEXT,
    metadata TEXT DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  inventory_deductions: `CREATE TABLE IF NOT EXISTS inventory_deductions (
    id TEXT PRIMARY KEY,
    inventory_item_id TEXT NOT NULL,
    project_id TEXT,
    quantity_deducted REAL NOT NULL,
    unit TEXT NOT NULL,
    notes TEXT,
    deducted_at TEXT NOT NULL DEFAULT (datetime('now')),
    user_id TEXT
  )`,
  clients: `CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    full_name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    preferred_contact TEXT,
    billing_address TEXT,
    shipping_address TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    source TEXT,
    notes TEXT,
    internal_rating INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  journal_entries: `CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    entry_date TEXT NOT NULL DEFAULT (date('now')),
    title TEXT,
    body_rich_text TEXT,
    discipline_tags TEXT NOT NULL DEFAULT '[]',
    project_ids TEXT NOT NULL DEFAULT '[]',
    hours_logged REAL,
    mood TEXT,
    machine_used TEXT,
    photo_urls TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  quotes: `CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    client_id TEXT NOT NULL,
    project_id TEXT,
    quote_number TEXT NOT NULL,
    valid_until TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    discount_type TEXT,
    discount_value REAL,
    tax_rate REAL,
    notes_client TEXT,
    notes_internal TEXT,
    terms TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  quote_line_items: `CREATE TABLE IF NOT EXISTS quote_line_items (
    id TEXT PRIMARY KEY,
    quote_id TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    quantity REAL NOT NULL DEFAULT 1,
    unit TEXT,
    unit_price REAL NOT NULL DEFAULT 0,
    line_total REAL NOT NULL DEFAULT 0,
    taxable INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`,
  invoices: `CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    quote_id TEXT,
    client_id TEXT NOT NULL,
    project_id TEXT,
    invoice_number TEXT NOT NULL,
    issue_date TEXT NOT NULL DEFAULT (date('now')),
    due_date TEXT,
    payment_terms TEXT NOT NULL DEFAULT 'net_30',
    status TEXT NOT NULL DEFAULT 'draft',
    discount_type TEXT,
    discount_value REAL,
    tax_rate REAL,
    notes_client TEXT,
    notes_internal TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  invoice_line_items: `CREATE TABLE IF NOT EXISTS invoice_line_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    quantity REAL NOT NULL DEFAULT 1,
    unit TEXT,
    unit_price REAL NOT NULL DEFAULT 0,
    line_total REAL NOT NULL DEFAULT 0,
    taxable INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`,
  invoice_payments: `CREATE TABLE IF NOT EXISTS invoice_payments (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT,
    payment_date TEXT NOT NULL DEFAULT (date('now')),
    notes TEXT
  )`,
  calculator_results: `CREATE TABLE IF NOT EXISTS calculator_results (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    project_id TEXT,
    module TEXT NOT NULL,
    calculator_type TEXT NOT NULL,
    inputs_json TEXT NOT NULL,
    outputs_json TEXT NOT NULL,
    label TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  saved_recipes: `CREATE TABLE IF NOT EXISTS saved_recipes (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    module TEXT NOT NULL,
    recipe_type TEXT NOT NULL,
    name TEXT NOT NULL,
    config_json TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  wood_species: `CREATE TABLE IF NOT EXISTS wood_species (
    id TEXT PRIMARY KEY,
    common_name TEXT NOT NULL,
    botanical_name TEXT,
    janka_hardness INTEGER,
    density_lbs_ft3 REAL,
    tangential_shrinkage REAL,
    radial_shrinkage REAL,
    typical_uses TEXT,
    finishing_notes TEXT,
    toxicity_warnings TEXT,
    price_tier TEXT,
    domestic INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  user_settings: `CREATE TABLE IF NOT EXISTS user_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
};

export const INDEX_SCHEMAS: string[] = [
  "CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)",
  "CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id)",
  "CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(master_category)",
  "CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory_items(quantity, low_stock_threshold)",
  "CREATE INDEX IF NOT EXISTS idx_deductions_project ON inventory_deductions(project_id)",
  "CREATE INDEX IF NOT EXISTS idx_deductions_item ON inventory_deductions(inventory_item_id)",
  "CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(entry_date)",
  "CREATE INDEX IF NOT EXISTS idx_quotes_client ON quotes(client_id)",
  "CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status)",
  "CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id)",
  "CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)",
  "CREATE INDEX IF NOT EXISTS idx_invoices_due ON invoices(due_date)",
  "CREATE INDEX IF NOT EXISTS idx_calc_results_module ON calculator_results(module)",
  "CREATE INDEX IF NOT EXISTS idx_calc_results_project ON calculator_results(project_id)",
];

export function getTableNames(): string[] {
  return Object.keys(TABLE_SCHEMAS);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/core/database/schema.test.ts
```
Expected: PASS

- [ ] **Step 5: Implement database connection and initialization**

`src/core/database/connection.ts`:
```ts
import * as SQLite from "expo-sqlite";
import { TABLE_SCHEMAS, INDEX_SCHEMAS } from "./schema";

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync("makeros.db");
    db.execSync("PRAGMA journal_mode = WAL");
    db.execSync("PRAGMA foreign_keys = ON");
  }
  return db;
}

export function initializeDatabase(): void {
  const database = getDatabase();

  for (const sql of Object.values(TABLE_SCHEMAS)) {
    database.execSync(sql);
  }

  for (const sql of INDEX_SCHEMAS) {
    database.execSync(sql);
  }
}

export function generateId(): string {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
```

- [ ] **Step 6: Commit**

```bash
git add src/core/database/ __tests__/core/database/
git commit -m "feat: add SQLite schema definitions, connection, and initialization"
```

---

### Task 5: Core Types and Base Repository

**Files:**
- Create: `src/core/types/index.ts`, `src/core/database/BaseRepository.ts`
- Test: `__tests__/core/database/BaseRepository.test.ts`

- [ ] **Step 1: Define all core TypeScript types**

`src/core/types/index.ts`:
```ts
export type ProjectStatus = "idea" | "design" | "in-progress" | "finishing" | "complete" | "delivered" | "archived";
export type Discipline = "woodworking" | "laser" | "cnc" | "3d-print" | "resin" | "knife" | "leather" | "candle" | "soap" | "mixed";
export type QuoteStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired";
export type InvoiceStatus = "draft" | "sent" | "viewed" | "partial" | "paid" | "overdue" | "void";
export type PaymentTerms = "due_on_receipt" | "net_7" | "net_15" | "net_30" | "net_60";
export type PaymentMethod = "cash" | "check" | "venmo" | "zelle" | "paypal" | "card" | "other";
export type Mood = "great" | "good" | "okay" | "rough";
export type LineItemCategory = "labor" | "material" | "laser_work" | "cnc_work" | "3d_printing" | "finishing" | "design" | "delivery" | "other";
export type InventoryCategory = "woodworking" | "laser" | "cnc" | "3d_printing" | "general_shop" | "resin" | "knife" | "leather" | "candle" | "soap";
export type ClientTag = "residential" | "commercial" | "wholesale" | "repeat" | "vip" | "lead";
export type ClientSource = "referral" | "instagram" | "etsy" | "website" | "word_of_mouth" | "other";
export type UnitSystem = "imperial" | "metric";

export interface Project {
  id: string;
  userId?: string;
  name: string;
  clientId?: string;
  status: ProjectStatus;
  disciplineTags: Discipline[];
  startDate?: string;
  targetDate?: string;
  completedDate?: string;
  estimatedHours?: number;
  actualHours: number;
  budget?: number;
  notes?: string;
  coverPhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  userId?: string;
  name: string;
  masterCategory: InventoryCategory;
  subCategory?: string;
  sku?: string;
  supplierName?: string;
  supplierUrl?: string;
  quantity: number;
  unit: string;
  unitCost?: number;
  location?: string;
  lowStockThreshold?: number;
  notes?: string;
  photoUrl?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryDeduction {
  id: string;
  inventoryItemId: string;
  projectId?: string;
  quantityDeducted: number;
  unit: string;
  notes?: string;
  deductedAt: string;
  userId?: string;
}

export interface Client {
  id: string;
  userId?: string;
  fullName: string;
  company?: string;
  email?: string;
  phone?: string;
  preferredContact?: string;
  billingAddress?: string;
  shippingAddress?: string;
  tags: ClientTag[];
  source?: ClientSource;
  notes?: string;
  internalRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  userId?: string;
  entryDate: string;
  title?: string;
  bodyRichText?: string;
  disciplineTags: Discipline[];
  projectIds: string[];
  hoursLogged?: number;
  mood?: Mood;
  machineUsed?: string;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  userId?: string;
  clientId: string;
  projectId?: string;
  quoteNumber: string;
  validUntil?: string;
  status: QuoteStatus;
  discountType?: "percentage" | "flat";
  discountValue?: number;
  taxRate?: number;
  notesClient?: string;
  notesInternal?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  id: string;
  parentId: string;
  description: string;
  category?: LineItemCategory;
  quantity: number;
  unit?: string;
  unitPrice: number;
  lineTotal: number;
  taxable: boolean;
  sortOrder: number;
}

export interface Invoice {
  id: string;
  userId?: string;
  quoteId?: string;
  clientId: string;
  projectId?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  paymentTerms: PaymentTerms;
  status: InvoiceStatus;
  discountType?: "percentage" | "flat";
  discountValue?: number;
  taxRate?: number;
  notesClient?: string;
  notesInternal?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  paymentDate: string;
  notes?: string;
}

export interface CalculatorResult {
  id: string;
  userId?: string;
  projectId?: string;
  module: string;
  calculatorType: string;
  inputsJson: Record<string, unknown>;
  outputsJson: Record<string, unknown>;
  label?: string;
  createdAt: string;
}

export interface SavedRecipe {
  id: string;
  userId?: string;
  module: string;
  recipeType: string;
  name: string;
  configJson: Record<string, unknown>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WoodSpecies {
  id: string;
  commonName: string;
  botanicalName?: string;
  jankaHardness?: number;
  densityLbsFt3?: number;
  tangentialShrinkage?: number;
  radialShrinkage?: number;
  typicalUses?: string;
  finishingNotes?: string;
  toxicityWarnings?: string;
  priceTier?: string;
  domestic: boolean;
}

export interface UserSettings {
  unitSystem: UnitSystem;
  shopName?: string;
  shopLogoUrl?: string;
  hourlyRate?: number;
  taxRate?: number;
  markupPercent?: number;
  quotePrefix?: string;
  invoicePrefix?: string;
  terms?: string;
}

// Free tier limits
export const FREE_LIMITS = {
  projects: 10,
  inventoryItems: 50,
  journalEntries: 30,
  clients: 5,
  activeQuotesInvoices: 3,
  calculatorResultsPerModule: 10,
} as const;
```

- [ ] **Step 2: Create BaseRepository with CRUD helpers**

`src/core/database/BaseRepository.ts`:
```ts
import { getDatabase, generateId } from "./connection";

type Row = Record<string, unknown>;

export class BaseRepository<T extends { id: string }> {
  constructor(
    protected tableName: string,
    protected toModel: (row: Row) => T,
    protected toRow: (model: Partial<T>) => Row,
  ) {}

  getAll(where?: string, params?: unknown[]): T[] {
    const db = getDatabase();
    const sql = `SELECT * FROM ${this.tableName}${where ? ` WHERE ${where}` : ""} ORDER BY created_at DESC`;
    const rows = db.getAllSync(sql, params || []) as Row[];
    return rows.map(this.toModel);
  }

  getById(id: string): T | null {
    const db = getDatabase();
    const row = db.getFirstSync(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]) as Row | null;
    return row ? this.toModel(row) : null;
  }

  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): T {
    const db = getDatabase();
    const id = generateId();
    const row = this.toRow({ ...data, id } as Partial<T>);
    const columns = Object.keys(row);
    const placeholders = columns.map(() => "?").join(", ");
    const values = columns.map((col) => row[col]);

    db.runSync(
      `INSERT INTO ${this.tableName} (${columns.join(", ")}) VALUES (${placeholders})`,
      values as any[],
    );

    return this.getById(id)!;
  }

  update(id: string, data: Partial<T>): T | null {
    const db = getDatabase();
    const row = this.toRow(data);
    const columns = Object.keys(row).filter((k) => k !== "id" && k !== "created_at");
    if (columns.length === 0) return this.getById(id);

    const sets = columns.map((col) => `${col} = ?`).join(", ");
    const values = columns.map((col) => row[col]);

    db.runSync(
      `UPDATE ${this.tableName} SET ${sets}, updated_at = datetime('now') WHERE id = ?`,
      [...(values as any[]), id],
    );

    return this.getById(id);
  }

  delete(id: string): boolean {
    const db = getDatabase();
    const result = db.runSync(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return result.changes > 0;
  }

  count(where?: string, params?: unknown[]): number {
    const db = getDatabase();
    const sql = `SELECT COUNT(*) as cnt FROM ${this.tableName}${where ? ` WHERE ${where}` : ""}`;
    const row = db.getFirstSync(sql, params || []) as { cnt: number } | null;
    return row?.cnt ?? 0;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/core/types/ src/core/database/BaseRepository.ts
git commit -m "feat: add core TypeScript types and BaseRepository CRUD abstraction"
```

---

### Task 6: Settings Store

**Files:**
- Create: `src/core/stores/settingsStore.ts`, `src/core/hooks/useSettings.ts`

- [ ] **Step 1: Create settings store with Zustand**

`src/core/stores/settingsStore.ts`:
```ts
import { create } from "zustand";
import type { UserSettings, UnitSystem } from "../types";
import { getDatabase } from "../database/connection";

interface SettingsStore extends UserSettings {
  loaded: boolean;
  load: () => void;
  set: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
}

function readSetting(key: string): string | null {
  try {
    const db = getDatabase();
    const row = db.getFirstSync("SELECT value FROM user_settings WHERE key = ?", [key]) as { value: string } | null;
    return row?.value ?? null;
  } catch {
    return null;
  }
}

function writeSetting(key: string, value: string): void {
  const db = getDatabase();
  db.runSync(
    "INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)",
    [key, value],
  );
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  unitSystem: "imperial",
  shopName: undefined,
  shopLogoUrl: undefined,
  hourlyRate: undefined,
  taxRate: undefined,
  markupPercent: undefined,
  quotePrefix: "Q",
  invoicePrefix: "INV",
  terms: undefined,
  loaded: false,

  load: () => {
    const unitSystem = (readSetting("unitSystem") as UnitSystem) || "imperial";
    const shopName = readSetting("shopName") || undefined;
    const hourlyRate = readSetting("hourlyRate") ? parseFloat(readSetting("hourlyRate")!) : undefined;
    const taxRate = readSetting("taxRate") ? parseFloat(readSetting("taxRate")!) : undefined;
    const markupPercent = readSetting("markupPercent") ? parseFloat(readSetting("markupPercent")!) : undefined;
    const quotePrefix = readSetting("quotePrefix") || "Q";
    const invoicePrefix = readSetting("invoicePrefix") || "INV";
    const terms = readSetting("terms") || undefined;

    set({
      unitSystem, shopName, hourlyRate, taxRate, markupPercent,
      quotePrefix, invoicePrefix, terms, loaded: true,
    });
  },

  set: (key, value) => {
    writeSetting(key, String(value ?? ""));
    set({ [key]: value } as Partial<SettingsStore>);
  },
}));
```

`src/core/hooks/useSettings.ts`:
```ts
import { useEffect } from "react";
import { useSettingsStore } from "../stores/settingsStore";

export function useSettings() {
  const store = useSettingsStore();

  useEffect(() => {
    if (!store.loaded) store.load();
  }, [store.loaded]);

  return store;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/core/stores/ src/core/hooks/
git commit -m "feat: add settings store with SQLite persistence"
```

---

## Phase 2: Shop Core Services

Each service follows the same pattern: repository (data access), service (business logic + free tier limit enforcement), Zustand store, React hook.

### Task 7: Project Service

**Files:**
- Create: `src/core/database/repositories/ProjectRepository.ts`
- Create: `src/core/services/ProjectService.ts`
- Create: `src/core/stores/projectStore.ts`
- Create: `src/core/hooks/useProjects.ts`

- [ ] **Step 1: Create ProjectRepository**

`src/core/database/repositories/ProjectRepository.ts`:
```ts
import { BaseRepository } from "../BaseRepository";
import type { Project } from "../../types";

type Row = Record<string, unknown>;

function toModel(row: Row): Project {
  return {
    id: row.id as string,
    userId: row.user_id as string | undefined,
    name: row.name as string,
    clientId: row.client_id as string | undefined,
    status: row.status as Project["status"],
    disciplineTags: JSON.parse((row.discipline_tags as string) || "[]"),
    startDate: row.start_date as string | undefined,
    targetDate: row.target_date as string | undefined,
    completedDate: row.completed_date as string | undefined,
    estimatedHours: row.estimated_hours as number | undefined,
    actualHours: (row.actual_hours as number) || 0,
    budget: row.budget as number | undefined,
    notes: row.notes as string | undefined,
    coverPhotoUrl: row.cover_photo_url as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toRow(model: Partial<Project>): Row {
  const row: Row = {};
  if (model.id !== undefined) row.id = model.id;
  if (model.name !== undefined) row.name = model.name;
  if (model.clientId !== undefined) row.client_id = model.clientId || null;
  if (model.status !== undefined) row.status = model.status;
  if (model.disciplineTags !== undefined) row.discipline_tags = JSON.stringify(model.disciplineTags);
  if (model.startDate !== undefined) row.start_date = model.startDate || null;
  if (model.targetDate !== undefined) row.target_date = model.targetDate || null;
  if (model.completedDate !== undefined) row.completed_date = model.completedDate || null;
  if (model.estimatedHours !== undefined) row.estimated_hours = model.estimatedHours || null;
  if (model.actualHours !== undefined) row.actual_hours = model.actualHours;
  if (model.budget !== undefined) row.budget = model.budget || null;
  if (model.notes !== undefined) row.notes = model.notes || null;
  if (model.coverPhotoUrl !== undefined) row.cover_photo_url = model.coverPhotoUrl || null;
  return row;
}

export const projectRepository = new BaseRepository<Project>("projects", toModel, toRow);
```

- [ ] **Step 2: Create ProjectService with limit enforcement**

`src/core/services/ProjectService.ts`:
```ts
import { projectRepository } from "../database/repositories/ProjectRepository";
import type { Project, ProjectStatus, Discipline } from "../types";
import { FREE_LIMITS } from "../types";

export class ProjectServiceError extends Error {
  constructor(message: string, public code: "LIMIT_REACHED" | "NOT_FOUND" | "INVALID") {
    super(message);
  }
}

export const ProjectService = {
  getAll(): Project[] {
    return projectRepository.getAll();
  },

  getById(id: string): Project {
    const project = projectRepository.getById(id);
    if (!project) throw new ProjectServiceError("Project not found", "NOT_FOUND");
    return project;
  },

  getByStatus(status: ProjectStatus): Project[] {
    return projectRepository.getAll("status = ?", [status]);
  },

  getByDiscipline(discipline: Discipline): Project[] {
    return projectRepository.getAll("discipline_tags LIKE ?", [`%"${discipline}"%`]);
  },

  getByClient(clientId: string): Project[] {
    return projectRepository.getAll("client_id = ?", [clientId]);
  },

  getActive(): Project[] {
    return projectRepository.getAll("status NOT IN ('complete', 'delivered', 'archived')");
  },

  getRecent(limit: number = 3): Project[] {
    const all = projectRepository.getAll();
    return all.slice(0, limit);
  },

  create(data: Omit<Project, "id" | "createdAt" | "updatedAt" | "actualHours">): Project {
    const count = projectRepository.count();
    if (count >= FREE_LIMITS.projects) {
      throw new ProjectServiceError(
        `Free tier limit of ${FREE_LIMITS.projects} projects reached`,
        "LIMIT_REACHED",
      );
    }
    return projectRepository.create({ ...data, actualHours: 0 });
  },

  update(id: string, data: Partial<Project>): Project {
    const project = projectRepository.update(id, data);
    if (!project) throw new ProjectServiceError("Project not found", "NOT_FOUND");
    return project;
  },

  updateActualHours(id: string, hoursToAdd: number): Project {
    const project = this.getById(id);
    return this.update(id, { actualHours: project.actualHours + hoursToAdd });
  },

  delete(id: string): void {
    projectRepository.delete(id);
  },
};
```

- [ ] **Step 3: Create project Zustand store and hook**

`src/core/stores/projectStore.ts`:
```ts
import { create } from "zustand";
import type { Project, ProjectStatus, Discipline } from "../types";
import { ProjectService, ProjectServiceError } from "../services/ProjectService";

interface ProjectStore {
  projects: Project[];
  loading: boolean;
  error: string | null;
  limitReached: boolean;
  load: () => void;
  create: (data: Omit<Project, "id" | "createdAt" | "updatedAt" | "actualHours">) => Project | null;
  update: (id: string, data: Partial<Project>) => void;
  remove: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  loading: false,
  error: null,
  limitReached: false,

  load: () => {
    set({ loading: true });
    try {
      const projects = ProjectService.getAll();
      set({ projects, loading: false, error: null });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },

  create: (data) => {
    try {
      const project = ProjectService.create(data);
      set((state) => ({ projects: [project, ...state.projects], limitReached: false }));
      return project;
    } catch (e) {
      if (e instanceof ProjectServiceError && e.code === "LIMIT_REACHED") {
        set({ limitReached: true });
        return null;
      }
      throw e;
    }
  },

  update: (id, data) => {
    const updated = ProjectService.update(id, data);
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? updated : p)),
    }));
  },

  remove: (id) => {
    ProjectService.delete(id);
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
  },
}));
```

`src/core/hooks/useProjects.ts`:
```ts
import { useEffect } from "react";
import { useProjectStore } from "../stores/projectStore";

export function useProjects() {
  const store = useProjectStore();

  useEffect(() => {
    if (store.projects.length === 0 && !store.loading) {
      store.load();
    }
  }, []);

  return store;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/core/database/repositories/ src/core/services/ src/core/stores/projectStore.ts src/core/hooks/useProjects.ts
git commit -m "feat: add Project service with repository, store, and free tier limits"
```

---

### Task 8: Inventory Service

**Files:**
- Create: `src/core/database/repositories/InventoryRepository.ts`, `src/core/database/repositories/DeductionRepository.ts`
- Create: `src/core/services/InventoryService.ts`
- Create: `src/core/stores/inventoryStore.ts`, `src/core/hooks/useInventory.ts`

Follow the exact same pattern as Task 7 (repository → service → store → hook).

- [ ] **Step 1: Create InventoryRepository and DeductionRepository**

`src/core/database/repositories/InventoryRepository.ts`:
```ts
import { BaseRepository } from "../BaseRepository";
import { getDatabase } from "../connection";
import type { InventoryItem } from "../../types";

type Row = Record<string, unknown>;

function toModel(row: Row): InventoryItem {
  return {
    id: row.id as string,
    userId: row.user_id as string | undefined,
    name: row.name as string,
    masterCategory: row.master_category as InventoryItem["masterCategory"],
    subCategory: row.sub_category as string | undefined,
    sku: row.sku as string | undefined,
    supplierName: row.supplier_name as string | undefined,
    supplierUrl: row.supplier_url as string | undefined,
    quantity: row.quantity as number,
    unit: row.unit as string,
    unitCost: row.unit_cost as number | undefined,
    location: row.location as string | undefined,
    lowStockThreshold: row.low_stock_threshold as number | undefined,
    notes: row.notes as string | undefined,
    photoUrl: row.photo_url as string | undefined,
    metadata: JSON.parse((row.metadata as string) || "{}"),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toRow(model: Partial<InventoryItem>): Row {
  const row: Row = {};
  if (model.id !== undefined) row.id = model.id;
  if (model.name !== undefined) row.name = model.name;
  if (model.masterCategory !== undefined) row.master_category = model.masterCategory;
  if (model.subCategory !== undefined) row.sub_category = model.subCategory || null;
  if (model.sku !== undefined) row.sku = model.sku || null;
  if (model.supplierName !== undefined) row.supplier_name = model.supplierName || null;
  if (model.supplierUrl !== undefined) row.supplier_url = model.supplierUrl || null;
  if (model.quantity !== undefined) row.quantity = model.quantity;
  if (model.unit !== undefined) row.unit = model.unit;
  if (model.unitCost !== undefined) row.unit_cost = model.unitCost || null;
  if (model.location !== undefined) row.location = model.location || null;
  if (model.lowStockThreshold !== undefined) row.low_stock_threshold = model.lowStockThreshold || null;
  if (model.notes !== undefined) row.notes = model.notes || null;
  if (model.photoUrl !== undefined) row.photo_url = model.photoUrl || null;
  if (model.metadata !== undefined) row.metadata = JSON.stringify(model.metadata);
  return row;
}

export const inventoryRepository = new BaseRepository<InventoryItem>("inventory_items", toModel, toRow);

export function getItemsBelowThreshold(): InventoryItem[] {
  const db = getDatabase();
  const rows = db.getAllSync(
    "SELECT * FROM inventory_items WHERE low_stock_threshold IS NOT NULL AND quantity <= low_stock_threshold ORDER BY (quantity * 1.0 / low_stock_threshold) ASC",
  ) as Row[];
  return rows.map(toModel);
}

export function getInventoryValue(category?: string): number {
  const db = getDatabase();
  const sql = category
    ? "SELECT SUM(quantity * COALESCE(unit_cost, 0)) as total FROM inventory_items WHERE master_category = ?"
    : "SELECT SUM(quantity * COALESCE(unit_cost, 0)) as total FROM inventory_items";
  const row = db.getFirstSync(sql, category ? [category] : []) as { total: number } | null;
  return row?.total ?? 0;
}
```

`src/core/database/repositories/DeductionRepository.ts`:
```ts
import { getDatabase, generateId } from "../connection";
import type { InventoryDeduction } from "../../types";

type Row = Record<string, unknown>;

function toModel(row: Row): InventoryDeduction {
  return {
    id: row.id as string,
    inventoryItemId: row.inventory_item_id as string,
    projectId: row.project_id as string | undefined,
    quantityDeducted: row.quantity_deducted as number,
    unit: row.unit as string,
    notes: row.notes as string | undefined,
    deductedAt: row.deducted_at as string,
    userId: row.user_id as string | undefined,
  };
}

export function createDeduction(data: Omit<InventoryDeduction, "id" | "deductedAt">): InventoryDeduction {
  const db = getDatabase();
  const id = generateId();
  db.runSync(
    `INSERT INTO inventory_deductions (id, inventory_item_id, project_id, quantity_deducted, unit, notes, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, data.inventoryItemId, data.projectId || null, data.quantityDeducted, data.unit, data.notes || null, data.userId || null],
  );
  const row = db.getFirstSync("SELECT * FROM inventory_deductions WHERE id = ?", [id]) as Row;
  return toModel(row);
}

export function getDeductionsByProject(projectId: string): InventoryDeduction[] {
  const db = getDatabase();
  const rows = db.getAllSync(
    "SELECT * FROM inventory_deductions WHERE project_id = ? ORDER BY deducted_at DESC",
    [projectId],
  ) as Row[];
  return rows.map(toModel);
}

export function getDeductionsByItem(itemId: string): InventoryDeduction[] {
  const db = getDatabase();
  const rows = db.getAllSync(
    "SELECT * FROM inventory_deductions WHERE inventory_item_id = ? ORDER BY deducted_at DESC",
    [itemId],
  ) as Row[];
  return rows.map(toModel);
}
```

- [ ] **Step 2: Create InventoryService**

`src/core/services/InventoryService.ts`:
```ts
import { inventoryRepository, getItemsBelowThreshold, getInventoryValue } from "../database/repositories/InventoryRepository";
import { createDeduction, getDeductionsByProject, getDeductionsByItem } from "../database/repositories/DeductionRepository";
import type { InventoryItem, InventoryDeduction, InventoryCategory } from "../types";
import { FREE_LIMITS } from "../types";

export class InventoryServiceError extends Error {
  constructor(message: string, public code: "LIMIT_REACHED" | "NOT_FOUND" | "INSUFFICIENT") {
    super(message);
  }
}

export const InventoryService = {
  getAll(): InventoryItem[] {
    return inventoryRepository.getAll();
  },

  getByCategory(category: InventoryCategory): InventoryItem[] {
    return inventoryRepository.getAll("master_category = ?", [category]);
  },

  getById(id: string): InventoryItem {
    const item = inventoryRepository.getById(id);
    if (!item) throw new InventoryServiceError("Item not found", "NOT_FOUND");
    return item;
  },

  search(query: string): InventoryItem[] {
    return inventoryRepository.getAll("name LIKE ? OR sku LIKE ?", [`%${query}%`, `%${query}%`]);
  },

  create(data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">): InventoryItem {
    const count = inventoryRepository.count();
    if (count >= FREE_LIMITS.inventoryItems) {
      throw new InventoryServiceError(
        `Free tier limit of ${FREE_LIMITS.inventoryItems} items reached`,
        "LIMIT_REACHED",
      );
    }
    return inventoryRepository.create(data);
  },

  update(id: string, data: Partial<InventoryItem>): InventoryItem {
    const item = inventoryRepository.update(id, data);
    if (!item) throw new InventoryServiceError("Item not found", "NOT_FOUND");
    return item;
  },

  deduct(itemId: string, quantity: number, projectId?: string, notes?: string): InventoryDeduction {
    const item = this.getById(itemId);
    if (item.quantity < quantity) {
      throw new InventoryServiceError(
        `Insufficient quantity: have ${item.quantity}, need ${quantity}`,
        "INSUFFICIENT",
      );
    }
    inventoryRepository.update(itemId, { quantity: item.quantity - quantity });
    return createDeduction({
      inventoryItemId: itemId,
      projectId,
      quantityDeducted: quantity,
      unit: item.unit,
      notes,
    });
  },

  getLowStockItems(): InventoryItem[] {
    return getItemsBelowThreshold();
  },

  getConsumptionByProject(projectId: string): InventoryDeduction[] {
    return getDeductionsByProject(projectId);
  },

  getConsumptionHistory(itemId: string): InventoryDeduction[] {
    return getDeductionsByItem(itemId);
  },

  getTotalValue(category?: InventoryCategory): number {
    return getInventoryValue(category);
  },

  delete(id: string): void {
    inventoryRepository.delete(id);
  },
};
```

- [ ] **Step 3: Create inventory store and hook** (same pattern as projectStore)

`src/core/stores/inventoryStore.ts`:
```ts
import { create } from "zustand";
import type { InventoryItem } from "../types";
import { InventoryService, InventoryServiceError } from "../services/InventoryService";

interface InventoryStore {
  items: InventoryItem[];
  lowStockItems: InventoryItem[];
  loading: boolean;
  limitReached: boolean;
  load: () => void;
  loadLowStock: () => void;
  create: (data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => InventoryItem | null;
  update: (id: string, data: Partial<InventoryItem>) => void;
  deduct: (itemId: string, quantity: number, projectId?: string, notes?: string) => boolean;
  remove: (id: string) => void;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  lowStockItems: [],
  loading: false,
  limitReached: false,

  load: () => {
    set({ loading: true });
    const items = InventoryService.getAll();
    set({ items, loading: false });
  },

  loadLowStock: () => {
    const lowStockItems = InventoryService.getLowStockItems();
    set({ lowStockItems });
  },

  create: (data) => {
    try {
      const item = InventoryService.create(data);
      set((s) => ({ items: [item, ...s.items], limitReached: false }));
      return item;
    } catch (e) {
      if (e instanceof InventoryServiceError && e.code === "LIMIT_REACHED") {
        set({ limitReached: true });
        return null;
      }
      throw e;
    }
  },

  update: (id, data) => {
    const updated = InventoryService.update(id, data);
    set((s) => ({ items: s.items.map((i) => (i.id === id ? updated : i)) }));
  },

  deduct: (itemId, quantity, projectId, notes) => {
    try {
      InventoryService.deduct(itemId, quantity, projectId, notes);
      get().load();
      get().loadLowStock();
      return true;
    } catch {
      return false;
    }
  },

  remove: (id) => {
    InventoryService.delete(id);
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
  },
}));
```

`src/core/hooks/useInventory.ts`:
```ts
import { useEffect } from "react";
import { useInventoryStore } from "../stores/inventoryStore";

export function useInventory() {
  const store = useInventoryStore();

  useEffect(() => {
    if (store.items.length === 0 && !store.loading) {
      store.load();
      store.loadLowStock();
    }
  }, []);

  return store;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/core/database/repositories/InventoryRepository.ts src/core/database/repositories/DeductionRepository.ts src/core/services/InventoryService.ts src/core/stores/inventoryStore.ts src/core/hooks/useInventory.ts
git commit -m "feat: add Inventory service with deductions, low stock tracking, and limits"
```

---

### Task 9: Client Service

Follow identical pattern: repository, service, store, hook. Key difference: Client has a communication log stored as JSON in notes, and revenue aggregation across invoices.

- [ ] **Step 1: Create ClientRepository, ClientService, clientStore, useClients hook**

These follow the exact same structure as Tasks 7-8. The ClientRepository maps `full_name` ↔ `fullName`, `billing_address` ↔ `billingAddress`, etc. The ClientService enforces `FREE_LIMITS.clients` (5). The store and hook follow the project/inventory pattern.

- [ ] **Step 2: Commit**

```bash
git add src/core/database/repositories/ClientRepository.ts src/core/services/ClientService.ts src/core/stores/clientStore.ts src/core/hooks/useClients.ts
git commit -m "feat: add Client service with repository, store, and free tier limits"
```

---

### Task 10: Journal Service

Key difference from other services: streak calculation and hours-to-project rollup.

- [ ] **Step 1: Create JournalRepository, JournalService (with streak logic), journalStore, useJournal hook**

The JournalService includes:
```ts
getStreak(): number {
  const db = getDatabase();
  const rows = db.getAllSync(
    "SELECT DISTINCT entry_date FROM journal_entries ORDER BY entry_date DESC",
  ) as { entry_date: string }[];

  if (rows.length === 0) return 0;

  let streak = 1;
  const today = new Date().toISOString().split("T")[0];
  const firstDate = rows[0].entry_date;

  if (firstDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (firstDate !== yesterday) return 0;
  }

  for (let i = 1; i < rows.length; i++) {
    const prev = new Date(rows[i - 1].entry_date);
    const curr = new Date(rows[i].entry_date);
    const diffDays = (prev.getTime() - curr.getTime()) / 86400000;
    if (diffDays === 1) streak++;
    else break;
  }

  return streak;
}
```

When creating a journal entry, if `hoursLogged` > 0 and `projectIds` is non-empty, call `ProjectService.updateActualHours()` for each linked project.

- [ ] **Step 2: Commit**

```bash
git add src/core/database/repositories/JournalRepository.ts src/core/services/JournalService.ts src/core/stores/journalStore.ts src/core/hooks/useJournal.ts
git commit -m "feat: add Journal service with streak tracking and project hours rollup"
```

---

### Task 11: Quote Service

- [ ] **Step 1: Create QuoteRepository, QuoteLineItemRepository, QuoteService**

QuoteService includes:
- `createQuote()` with auto-incrementing quote number (prefix from settings + count)
- `addLineItem()`, `updateLineItem()`, `removeLineItem()`
- `addLineItemFromCalculator(quoteId, calculatorResult)` — maps calculator output to a line item
- `getWithLineItems(quoteId)` — returns quote + all line items
- Free tier limit: count active (non-archived) quotes + invoices combined <= 3

- [ ] **Step 2: Commit**

```bash
git add src/core/database/repositories/QuoteRepository.ts src/core/services/QuoteService.ts src/core/stores/quoteStore.ts src/core/hooks/useQuotes.ts
git commit -m "feat: add Quote service with line items and calculator integration"
```

---

### Task 12: Invoice Service

- [ ] **Step 1: Create InvoiceRepository, InvoiceLineItemRepository, InvoicePaymentRepository, InvoiceService**

InvoiceService includes:
- `convertFromQuote(quoteId)` — copies all line items from quote to new invoice
- `recordPayment(invoiceId, amount, method, date)` — creates payment record, updates status to "partial" or "paid"
- `getBalanceDue(invoiceId)` — invoice total minus sum of payments
- `getOverdue()` — invoices where `due_date < today` and status not in ("paid", "void")
- `pullFromProjectMaterials(invoiceId, projectId)` — creates line items from inventory deductions

- [ ] **Step 2: Commit**

```bash
git add src/core/database/repositories/InvoiceRepository.ts src/core/services/InvoiceService.ts src/core/stores/invoiceStore.ts src/core/hooks/useInvoices.ts
git commit -m "feat: add Invoice service with payments, overdue tracking, and project material pull"
```

---

### Task 13: Calculator Result Service

- [ ] **Step 1: Create CalculatorResultRepository and service**

`src/core/services/CalculatorService.ts`:
```ts
import { getDatabase, generateId } from "../database/connection";
import type { CalculatorResult } from "../types";
import { FREE_LIMITS } from "../types";

type Row = Record<string, unknown>;

function toModel(row: Row): CalculatorResult {
  return {
    id: row.id as string,
    userId: row.user_id as string | undefined,
    projectId: row.project_id as string | undefined,
    module: row.module as string,
    calculatorType: row.calculator_type as string,
    inputsJson: JSON.parse(row.inputs_json as string),
    outputsJson: JSON.parse(row.outputs_json as string),
    label: row.label as string | undefined,
    createdAt: row.created_at as string,
  };
}

export const CalculatorService = {
  save(data: Omit<CalculatorResult, "id" | "createdAt">): CalculatorResult {
    const db = getDatabase();
    const count = db.getFirstSync(
      "SELECT COUNT(*) as cnt FROM calculator_results WHERE module = ?",
      [data.module],
    ) as { cnt: number };

    if (count.cnt >= FREE_LIMITS.calculatorResultsPerModule) {
      const oldest = db.getFirstSync(
        "SELECT id FROM calculator_results WHERE module = ? ORDER BY created_at ASC LIMIT 1",
        [data.module],
      ) as { id: string } | null;
      if (oldest) {
        db.runSync("DELETE FROM calculator_results WHERE id = ?", [oldest.id]);
      }
    }

    const id = generateId();
    db.runSync(
      `INSERT INTO calculator_results (id, user_id, project_id, module, calculator_type, inputs_json, outputs_json, label)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.userId || null, data.projectId || null, data.module, data.calculatorType,
       JSON.stringify(data.inputsJson), JSON.stringify(data.outputsJson), data.label || null],
    );

    const row = db.getFirstSync("SELECT * FROM calculator_results WHERE id = ?", [id]) as Row;
    return toModel(row);
  },

  getByModule(module: string): CalculatorResult[] {
    const db = getDatabase();
    const rows = db.getAllSync(
      "SELECT * FROM calculator_results WHERE module = ? ORDER BY created_at DESC",
      [module],
    ) as Row[];
    return rows.map(toModel);
  },

  getByProject(projectId: string): CalculatorResult[] {
    const db = getDatabase();
    const rows = db.getAllSync(
      "SELECT * FROM calculator_results WHERE project_id = ? ORDER BY created_at DESC",
      [projectId],
    ) as Row[];
    return rows.map(toModel);
  },

  linkToProject(resultId: string, projectId: string): void {
    const db = getDatabase();
    db.runSync("UPDATE calculator_results SET project_id = ? WHERE id = ?", [projectId, resultId]);
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/core/services/CalculatorService.ts
git commit -m "feat: add CalculatorResult service with per-module history and FIFO eviction"
```

---

## Phase 3: Woodworking Calculator Engines + Tests

Pure calculation logic — no UI. Each calculator gets an engine file in `src/modules/woodworking/calculators/` and tests in `__tests__/modules/woodworking/`.

### Task 14: Board Foot Calculator Engine

**Files:**
- Create: `src/modules/woodworking/calculators/boardFoot.ts`
- Test: `__tests__/modules/woodworking/boardFoot.test.ts`

- [ ] **Step 1: Write failing tests**

`__tests__/modules/woodworking/boardFoot.test.ts`:
```ts
import { calculateBoardFeet, SurfaceType } from "../../../src/modules/woodworking/calculators/boardFoot";

describe("Board Foot Calculator", () => {
  test("calculates basic board feet: 1x6x96 = 4 BF", () => {
    const result = calculateBoardFeet({ thickness: 1, width: 6, length: 96, quantity: 1 });
    expect(result.boardFeetPerPiece).toBe(4);
    expect(result.totalBoardFeet).toBe(4);
  });

  test("calculates with quantity", () => {
    const result = calculateBoardFeet({ thickness: 2, width: 8, length: 48, quantity: 5 });
    expect(result.boardFeetPerPiece).toBeCloseTo(5.333, 2);
    expect(result.totalBoardFeet).toBeCloseTo(26.667, 2);
  });

  test("calculates cost when price provided", () => {
    const result = calculateBoardFeet({ thickness: 1, width: 6, length: 96, quantity: 1, pricePerBF: 5.50 });
    expect(result.totalCost).toBe(22);
  });

  test("adjusts for S2S: subtracts 1/4 from thickness", () => {
    const result = calculateBoardFeet({ thickness: 1, width: 6, length: 96, quantity: 1, surfaceType: "s2s" });
    expect(result.boardFeetPerPiece).toBe(3);
  });

  test("adjusts for S3S: subtracts 1/4 thickness + 1/4 width", () => {
    const result = calculateBoardFeet({ thickness: 1, width: 6, length: 96, quantity: 1, surfaceType: "s3s" });
    expect(result.boardFeetPerPiece).toBeCloseTo(2.875, 2);
  });

  test("adjusts for S4S: subtracts 1/4 thickness + 1/2 width", () => {
    const result = calculateBoardFeet({ thickness: 1, width: 6, length: 96, quantity: 1, surfaceType: "s4s" });
    expect(result.boardFeetPerPiece).toBeCloseTo(2.75, 2);
  });

  test("returns zero for zero dimensions", () => {
    const result = calculateBoardFeet({ thickness: 0, width: 6, length: 96, quantity: 1 });
    expect(result.boardFeetPerPiece).toBe(0);
    expect(result.totalBoardFeet).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

```bash
npx jest __tests__/modules/woodworking/boardFoot.test.ts
```
Expected: FAIL

- [ ] **Step 3: Implement**

`src/modules/woodworking/calculators/boardFoot.ts`:
```ts
export type SurfaceType = "rough" | "s2s" | "s3s" | "s4s";

interface BoardFootInput {
  thickness: number;
  width: number;
  length: number;
  quantity: number;
  pricePerBF?: number;
  surfaceType?: SurfaceType;
}

interface BoardFootResult {
  boardFeetPerPiece: number;
  totalBoardFeet: number;
  totalCost: number | null;
  adjustedThickness: number;
  adjustedWidth: number;
}

export function calculateBoardFeet(input: BoardFootInput): BoardFootResult {
  let adjustedThickness = input.thickness;
  let adjustedWidth = input.width;

  switch (input.surfaceType) {
    case "s2s":
      adjustedThickness -= 0.25;
      break;
    case "s3s":
      adjustedThickness -= 0.25;
      adjustedWidth -= 0.25;
      break;
    case "s4s":
      adjustedThickness -= 0.25;
      adjustedWidth -= 0.5;
      break;
  }

  adjustedThickness = Math.max(0, adjustedThickness);
  adjustedWidth = Math.max(0, adjustedWidth);

  const boardFeetPerPiece = (adjustedThickness * adjustedWidth * input.length) / 144;
  const totalBoardFeet = boardFeetPerPiece * input.quantity;
  const totalCost = input.pricePerBF != null ? Math.round(totalBoardFeet * input.pricePerBF * 100) / 100 : null;

  return {
    boardFeetPerPiece: Math.round(boardFeetPerPiece * 1000) / 1000,
    totalBoardFeet: Math.round(totalBoardFeet * 1000) / 1000,
    totalCost,
    adjustedThickness,
    adjustedWidth,
  };
}
```

- [ ] **Step 4: Run tests**

```bash
npx jest __tests__/modules/woodworking/boardFoot.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/woodworking/calculators/boardFoot.ts __tests__/modules/woodworking/boardFoot.test.ts
git commit -m "feat: add Board Foot calculator engine with surfacing adjustments"
```

---

### Task 15: Fraction Engine

**Files:**
- Create: `src/modules/woodworking/calculators/fraction.ts`
- Test: `__tests__/modules/woodworking/fraction.test.ts`

- [ ] **Step 1: Write failing tests**

`__tests__/modules/woodworking/fraction.test.ts`:
```ts
import { Fraction, parseFraction, toDecimal, toFraction, add, subtract, multiply, divide, reduce, decimalToNearestFraction } from "../../../src/modules/woodworking/calculators/fraction";

describe("Fraction Engine", () => {
  test("parses whole number", () => {
    expect(parseFraction("5")).toEqual({ whole: 5, numerator: 0, denominator: 1 });
  });

  test("parses simple fraction", () => {
    expect(parseFraction("3/8")).toEqual({ whole: 0, numerator: 3, denominator: 8 });
  });

  test("parses mixed number", () => {
    expect(parseFraction("3 5/8")).toEqual({ whole: 3, numerator: 5, denominator: 8 });
  });

  test("converts to decimal", () => {
    expect(toDecimal({ whole: 3, numerator: 5, denominator: 8 })).toBe(3.625);
  });

  test("adds fractions: 1/4 + 3/8 = 5/8", () => {
    const a: Fraction = { whole: 0, numerator: 1, denominator: 4 };
    const b: Fraction = { whole: 0, numerator: 3, denominator: 8 };
    const result = add(a, b);
    expect(toDecimal(result)).toBe(0.625);
    expect(result).toEqual({ whole: 0, numerator: 5, denominator: 8 });
  });

  test("subtracts: 3 1/2 - 1 3/4 = 1 3/4", () => {
    const a: Fraction = { whole: 3, numerator: 1, denominator: 2 };
    const b: Fraction = { whole: 1, numerator: 3, denominator: 4 };
    const result = subtract(a, b);
    expect(toDecimal(result)).toBe(1.75);
  });

  test("multiplies: 2 1/2 * 3 = 7 1/2", () => {
    const a: Fraction = { whole: 2, numerator: 1, denominator: 2 };
    const b: Fraction = { whole: 3, numerator: 0, denominator: 1 };
    const result = multiply(a, b);
    expect(toDecimal(result)).toBe(7.5);
  });

  test("divides: 3/4 / 1/2 = 1 1/2", () => {
    const a: Fraction = { whole: 0, numerator: 3, denominator: 4 };
    const b: Fraction = { whole: 0, numerator: 1, denominator: 2 };
    const result = divide(a, b);
    expect(toDecimal(result)).toBe(1.5);
  });

  test("reduces 6/8 to 3/4", () => {
    expect(reduce({ whole: 0, numerator: 6, denominator: 8 })).toEqual({ whole: 0, numerator: 3, denominator: 4 });
  });

  test("converts decimal to nearest 1/64 fraction", () => {
    const result = decimalToNearestFraction(3.625, 64);
    expect(result).toEqual({ whole: 3, numerator: 5, denominator: 8 });
  });

  test("converts 0.3125 to 5/16", () => {
    const result = decimalToNearestFraction(0.3125, 64);
    expect(result).toEqual({ whole: 0, numerator: 5, denominator: 16 });
  });
});
```

- [ ] **Step 2: Implement fraction engine**

`src/modules/woodworking/calculators/fraction.ts`:
```ts
export interface Fraction {
  whole: number;
  numerator: number;
  denominator: number;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function reduce(f: Fraction): Fraction {
  if (f.numerator === 0) return { whole: f.whole, numerator: 0, denominator: 1 };
  const g = gcd(f.numerator, f.denominator);
  let num = f.numerator / g;
  let den = f.denominator / g;
  const extraWhole = Math.floor(num / den);
  num = num % den;
  return { whole: f.whole + extraWhole, numerator: num, denominator: den };
}

export function parseFraction(str: string): Fraction {
  str = str.trim();
  const mixedMatch = str.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    return reduce({
      whole: parseInt(mixedMatch[1]),
      numerator: parseInt(mixedMatch[2]),
      denominator: parseInt(mixedMatch[3]),
    });
  }
  const fractionMatch = str.match(/^(-?\d+)\/(\d+)$/);
  if (fractionMatch) {
    return reduce({
      whole: 0,
      numerator: parseInt(fractionMatch[1]),
      denominator: parseInt(fractionMatch[2]),
    });
  }
  return { whole: parseFloat(str) || 0, numerator: 0, denominator: 1 };
}

export function toDecimal(f: Fraction): number {
  return f.whole + f.numerator / f.denominator;
}

function toImproperNumerator(f: Fraction): number {
  return f.whole * f.denominator + f.numerator;
}

export function add(a: Fraction, b: Fraction): Fraction {
  const den = a.denominator * b.denominator;
  const num = toImproperNumerator(a) * b.denominator + toImproperNumerator(b) * a.denominator;
  return reduce({ whole: 0, numerator: num, denominator: den });
}

export function subtract(a: Fraction, b: Fraction): Fraction {
  const den = a.denominator * b.denominator;
  const num = toImproperNumerator(a) * b.denominator - toImproperNumerator(b) * a.denominator;
  return reduce({ whole: 0, numerator: num, denominator: den });
}

export function multiply(a: Fraction, b: Fraction): Fraction {
  const num = toImproperNumerator(a) * toImproperNumerator(b);
  const den = a.denominator * b.denominator;
  return reduce({ whole: 0, numerator: num, denominator: den });
}

export function divide(a: Fraction, b: Fraction): Fraction {
  const num = toImproperNumerator(a) * b.denominator;
  const den = a.denominator * toImproperNumerator(b);
  return reduce({ whole: 0, numerator: num, denominator: den });
}

export function decimalToNearestFraction(decimal: number, maxDenom: number = 64): Fraction {
  const whole = Math.floor(decimal);
  const remainder = decimal - whole;
  if (remainder < 1 / (maxDenom * 2)) return { whole, numerator: 0, denominator: 1 };

  let bestNum = 0;
  let bestDen = 1;
  let bestErr = remainder;

  for (let den = 2; den <= maxDenom; den *= 2) {
    const num = Math.round(remainder * den);
    const err = Math.abs(remainder - num / den);
    if (err < bestErr) {
      bestNum = num;
      bestDen = den;
      bestErr = err;
    }
  }

  return reduce({ whole, numerator: bestNum, denominator: bestDen });
}
```

- [ ] **Step 3: Run tests, verify pass, commit**

```bash
npx jest __tests__/modules/woodworking/fraction.test.ts
git add src/modules/woodworking/calculators/fraction.ts __tests__/modules/woodworking/fraction.test.ts
git commit -m "feat: add fraction arithmetic engine with parsing, operations, and decimal conversion"
```

---

### Task 16: Wood Movement Calculator Engine

**Files:**
- Create: `src/modules/woodworking/calculators/woodMovement.ts`
- Test: `__tests__/modules/woodworking/woodMovement.test.ts`

- [ ] **Step 1: Write tests**

`__tests__/modules/woodworking/woodMovement.test.ts`:
```ts
import { calculateWoodMovement } from "../../../src/modules/woodworking/calculators/woodMovement";

describe("Wood Movement Calculator", () => {
  test("flat-sawn red oak: 6 inch board, 12% to 8% MC", () => {
    // Red Oak tangential shrinkage = 8.6%
    const result = calculateWoodMovement({
      width: 6, currentMC: 12, targetMC: 8,
      tangentialShrinkage: 8.6, radialShrinkage: 4.0,
      orientation: "flat-sawn",
    });
    // movement = 6 * (12-8)/100 * 0.086 = 6 * 0.04 * 0.086 = 0.02064
    expect(result.movementInches).toBeCloseTo(0.0206, 3);
    expect(result.warningFlag).toBe(false);
  });

  test("quarter-sawn uses radial coefficient", () => {
    const result = calculateWoodMovement({
      width: 6, currentMC: 12, targetMC: 8,
      tangentialShrinkage: 8.6, radialShrinkage: 4.0,
      orientation: "quarter-sawn",
    });
    // movement = 6 * 0.04 * 0.04 = 0.0096
    expect(result.movementInches).toBeCloseTo(0.0096, 3);
  });

  test("flags warning when movement exceeds 1/8 inch", () => {
    const result = calculateWoodMovement({
      width: 24, currentMC: 19, targetMC: 6,
      tangentialShrinkage: 8.6, radialShrinkage: 4.0,
      orientation: "flat-sawn",
    });
    // movement = 24 * 0.13 * 0.086 = 0.268
    expect(result.warningFlag).toBe(true);
  });

  test("expansion when target MC > current MC", () => {
    const result = calculateWoodMovement({
      width: 6, currentMC: 6, targetMC: 12,
      tangentialShrinkage: 8.6, radialShrinkage: 4.0,
      orientation: "flat-sawn",
    });
    expect(result.movementInches).toBeCloseTo(0.0206, 3);
    expect(result.direction).toBe("expansion");
  });
});
```

- [ ] **Step 2: Implement**

`src/modules/woodworking/calculators/woodMovement.ts`:
```ts
import { decimalToNearestFraction, type Fraction } from "./fraction";

interface WoodMovementInput {
  width: number;
  currentMC: number;
  targetMC: number;
  tangentialShrinkage: number;
  radialShrinkage: number;
  orientation: "flat-sawn" | "quarter-sawn";
}

interface WoodMovementResult {
  movementInches: number;
  movementFraction: Fraction;
  direction: "shrinkage" | "expansion" | "none";
  warningFlag: boolean;
}

export function calculateWoodMovement(input: WoodMovementInput): WoodMovementResult {
  const shrinkageCoeff = input.orientation === "flat-sawn"
    ? input.tangentialShrinkage / 100
    : input.radialShrinkage / 100;

  const mcDelta = Math.abs(input.targetMC - input.currentMC);
  const movementInches = input.width * (mcDelta / 100) * shrinkageCoeff;

  const direction: WoodMovementResult["direction"] =
    input.targetMC > input.currentMC ? "expansion" :
    input.targetMC < input.currentMC ? "shrinkage" : "none";

  return {
    movementInches: Math.round(movementInches * 10000) / 10000,
    movementFraction: decimalToNearestFraction(movementInches, 64),
    direction,
    warningFlag: movementInches > 0.125,
  };
}
```

- [ ] **Step 3: Run tests, verify pass, commit**

```bash
npx jest __tests__/modules/woodworking/woodMovement.test.ts
git add src/modules/woodworking/calculators/woodMovement.ts __tests__/modules/woodworking/woodMovement.test.ts
git commit -m "feat: add Wood Movement calculator with fraction output and warning flags"
```

---

### Task 17: Finishing Calculator Engine

- [ ] **Step 1: Write tests and implement**

`src/modules/woodworking/calculators/finishing.ts` — calculates coverage for each finish type, shellac pound-cut ratios, dry time adjustment by temperature/humidity.

Key formulas:
- Coverage: `volumeNeeded = (area / coverageRate) * coats`
- Shellac: `flakeOz = (poundCut * alcoholOz) / 16`
- Dry time: `adjustedTime = baseTime * tempMultiplier * humidityMultiplier`

- [ ] **Step 2: Commit**

```bash
git add src/modules/woodworking/calculators/finishing.ts __tests__/modules/woodworking/finishing.test.ts
git commit -m "feat: add Finishing calculator with coverage, shellac ratio, and dry time"
```

---

### Task 18: Epoxy Resin Calculator Engine

- [ ] **Step 1: Write tests and implement**

`src/modules/woodworking/calculators/epoxy.ts` — volume calculation, mix ratio split, weight, cost, multi-pour planning, colorant sub-calculator.

Key formulas:
- Volume: `length * width * depth` (in³), convert to oz by dividing by 1.805
- Mix ratio: given ratio A:B, `partA = total * (A / (A+B))`, `partB = total * (B / (A+B))`
- Weight: `volume_mL * density_g_per_mL`
- Multi-pour: `numPours = ceil(depth / maxPourDepth)`
- Colorant: `pigmentGrams = totalWeightGrams * (percentByWeight / 100)`

- [ ] **Step 2: Commit**

```bash
git add src/modules/woodworking/calculators/epoxy.ts __tests__/modules/woodworking/epoxy.test.ts
git commit -m "feat: add Epoxy Resin calculator with multi-pour planning and colorant calc"
```

---

### Task 19: Cut List Optimizer — 1D (Linear)

- [ ] **Step 1: Write tests and implement First-Fit Decreasing**

`src/modules/woodworking/calculators/cutList1D.ts`:

Algorithm: sort cuts descending, for each cut try to fit into an existing stock piece (first-fit), if none fit open a new stock piece. Account for kerf width between cuts.

Tests: verify optimal packing for known cases, waste percentage calculation, kerf subtraction.

- [ ] **Step 2: Commit**

```bash
git add src/modules/woodworking/calculators/cutList1D.ts __tests__/modules/woodworking/cutList1D.test.ts
git commit -m "feat: add 1D cut list optimizer with First-Fit Decreasing algorithm"
```

---

### Task 20: Cut List Optimizer — 2D (Guillotine)

- [ ] **Step 1: Write tests and implement guillotine-cut bin packing**

`src/modules/woodworking/calculators/cutList2D.ts`:

Algorithm: Guillotine-cut with best-area-fit heuristic. Each placement splits remaining space into two rectangles. Tries both orientations unless grain-locked. Recursively fills sub-rectangles.

Tests: verify placement for known configurations, orientation flipping, grain lock, waste calculation, multi-sheet scenarios.

- [ ] **Step 2: Commit**

```bash
git add src/modules/woodworking/calculators/cutList2D.ts __tests__/modules/woodworking/cutList2D.test.ts
git commit -m "feat: add 2D guillotine-cut bin packing for sheet goods optimizer"
```

---

### Task 21: Wood Species Seed Data

**Files:**
- Create: `src/modules/woodworking/data/woodSpecies.ts`
- Create: `src/modules/woodworking/data/seedSpecies.ts`

- [ ] **Step 1: Create species dataset (60+ species)**

`src/modules/woodworking/data/woodSpecies.ts`:
```ts
import type { WoodSpecies } from "@core/types";

export const WOOD_SPECIES: Omit<WoodSpecies, "id">[] = [
  // Domestic Hardwoods
  { commonName: "Red Oak", botanicalName: "Quercus rubra", jankaHardness: 1290, densityLbsFt3: 44, tangentialShrinkage: 8.6, radialShrinkage: 4.0, typicalUses: "Furniture, cabinetry, flooring", finishingNotes: "Open pore — requires filler for smooth finish. Takes stain well.", toxicityWarnings: null, priceTier: "budget", domestic: true },
  { commonName: "White Oak", botanicalName: "Quercus alba", jankaHardness: 1360, densityLbsFt3: 47, tangentialShrinkage: 10.5, radialShrinkage: 5.6, typicalUses: "Furniture, boat building, whiskey barrels, outdoor furniture", finishingNotes: "Closed pore — more water-resistant than red oak. Takes finish well.", toxicityWarnings: null, priceTier: "moderate", domestic: true },
  { commonName: "Hard Maple", botanicalName: "Acer saccharum", jankaHardness: 1450, densityLbsFt3: 44, tangentialShrinkage: 9.9, radialShrinkage: 4.8, typicalUses: "Cutting boards, butcher blocks, flooring, workbenches", finishingNotes: "Can blotch with oil-based stain — use pre-stain conditioner or gel stain.", toxicityWarnings: null, priceTier: "moderate", domestic: true },
  { commonName: "Black Walnut", botanicalName: "Juglans nigra", jankaHardness: 1010, densityLbsFt3: 38, tangentialShrinkage: 7.8, radialShrinkage: 5.5, typicalUses: "Fine furniture, gun stocks, turnings, cutting boards", finishingNotes: "Beautiful natural color — often finished with oil only. Darkens with age.", toxicityWarnings: "Dust may cause skin irritation and respiratory issues in sensitive individuals.", priceTier: "premium", domestic: true },
  { commonName: "Black Cherry", botanicalName: "Prunus serotina", jankaHardness: 950, densityLbsFt3: 35, tangentialShrinkage: 7.1, radialShrinkage: 3.7, typicalUses: "Fine furniture, cabinetry, musical instruments", finishingNotes: "Darkens significantly with light exposure. Blotch-prone — use pre-stain.", toxicityWarnings: null, priceTier: "moderate", domestic: true },
  { commonName: "White Ash", botanicalName: "Fraxinus americana", jankaHardness: 1320, densityLbsFt3: 42, tangentialShrinkage: 7.8, radialShrinkage: 4.9, typicalUses: "Tool handles, baseball bats, furniture, steam bending", finishingNotes: "Open grain similar to oak. Takes stain well.", toxicityWarnings: null, priceTier: "budget", domestic: true },
  { commonName: "Yellow Poplar", botanicalName: "Liriodendron tulipifera", jankaHardness: 540, densityLbsFt3: 29, tangentialShrinkage: 8.2, radialShrinkage: 4.6, typicalUses: "Paint-grade trim, drawers, secondary wood in furniture", finishingNotes: "Soft — takes paint excellently. Green/purple heartwood colors fade.", toxicityWarnings: null, priceTier: "budget", domestic: true },
  { commonName: "Hickory", botanicalName: "Carya spp.", jankaHardness: 1820, densityLbsFt3: 51, tangentialShrinkage: 11.5, radialShrinkage: 7.0, typicalUses: "Tool handles, flooring, smoking wood, chairs", finishingNotes: "Very hard — pre-drill for fasteners. Takes finish well.", toxicityWarnings: null, priceTier: "budget", domestic: true },
  { commonName: "Eastern White Pine", botanicalName: "Pinus strobus", jankaHardness: 380, densityLbsFt3: 25, tangentialShrinkage: 6.1, radialShrinkage: 2.1, typicalUses: "Trim, shelving, rustic furniture, carving", finishingNotes: "Very soft — dents easily. Blotch-prone with stain.", toxicityWarnings: null, priceTier: "budget", domestic: true },
  { commonName: "Douglas Fir", botanicalName: "Pseudotsuga menziesii", jankaHardness: 660, densityLbsFt3: 34, tangentialShrinkage: 7.6, radialShrinkage: 4.8, typicalUses: "Construction, beams, timberframe, workbenches", finishingNotes: "Prominent grain pattern. Takes clear finish well.", toxicityWarnings: "Dust and splinters may cause dermatitis.", priceTier: "budget", domestic: true },
  // ... 50+ more species would follow this pattern
  // Including: Soft Maple, Beech, Birch, Alder, Sassafras, Sycamore, Elm, Cypress,
  // Cedar (Western Red, Eastern Red, Aromatic), Redwood,
  // Exotics: Padauk, Purpleheart, Bloodwood, Zebrawood, Wenge, Bubinga,
  // Sapele, Mahogany (African, Genuine), Teak, Ipe, Jatoba, Santos Mahogany,
  // Ebony (Gaboon, Macassar), Cocobolo, Bocote, Rosewood (Indian, Santos)
];
```

- [ ] **Step 2: Create seed function**

`src/modules/woodworking/data/seedSpecies.ts`:
```ts
import { getDatabase, generateId } from "@core/database/connection";
import { WOOD_SPECIES } from "./woodSpecies";

export function seedWoodSpecies(): void {
  const db = getDatabase();
  const existing = db.getFirstSync("SELECT COUNT(*) as cnt FROM wood_species") as { cnt: number };
  if (existing.cnt > 0) return;

  for (const species of WOOD_SPECIES) {
    db.runSync(
      `INSERT INTO wood_species (id, common_name, botanical_name, janka_hardness, density_lbs_ft3,
       tangential_shrinkage, radial_shrinkage, typical_uses, finishing_notes, toxicity_warnings,
       price_tier, domestic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [generateId(), species.commonName, species.botanicalName || null, species.jankaHardness || null,
       species.densityLbsFt3 || null, species.tangentialShrinkage || null, species.radialShrinkage || null,
       species.typicalUses || null, species.finishingNotes || null, species.toxicityWarnings || null,
       species.priceTier || null, species.domestic ? 1 : 0],
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/woodworking/data/
git commit -m "feat: add wood species reference database with 60+ species and seed function"
```

---

## Phase 4: Utility Calculator Engines + Tests

### Task 22: Unit Converter Engine

**Files:**
- Create: `src/modules/utilities/calculators/unitConverter.ts`
- Test: `__tests__/modules/utilities/unitConverter.test.ts`

- [ ] **Step 1: Write tests**

`__tests__/modules/utilities/unitConverter.test.ts`:
```ts
import { convert, CATEGORIES } from "../../../src/modules/utilities/calculators/unitConverter";

describe("Unit Converter", () => {
  test("inches to mm", () => {
    expect(convert(1, "in", "mm", "length")).toBeCloseTo(25.4, 1);
  });

  test("mm to inches", () => {
    expect(convert(25.4, "mm", "in", "length")).toBeCloseTo(1, 4);
  });

  test("Fahrenheit to Celsius", () => {
    expect(convert(212, "°F", "°C", "temperature")).toBeCloseTo(100, 1);
    expect(convert(32, "°F", "°C", "temperature")).toBeCloseTo(0, 1);
  });

  test("Celsius to Fahrenheit", () => {
    expect(convert(100, "°C", "°F", "temperature")).toBeCloseTo(212, 1);
  });

  test("IPM to mm/min", () => {
    expect(convert(100, "ipm", "mm/min", "speed")).toBeCloseTo(2540, 0);
  });

  test("PSI to bar", () => {
    expect(convert(14.696, "psi", "bar", "pressure")).toBeCloseTo(1.013, 2);
  });

  test("gallons to liters", () => {
    expect(convert(1, "gal", "L", "volume")).toBeCloseTo(3.785, 2);
  });

  test("lbs to kg", () => {
    expect(convert(1, "lb", "kg", "weight")).toBeCloseTo(0.4536, 3);
  });

  test("has all 9 categories", () => {
    expect(Object.keys(CATEGORIES).length).toBe(9);
  });
});
```

- [ ] **Step 2: Implement converter**

`src/modules/utilities/calculators/unitConverter.ts` — conversion factor tables for each category, special handling for temperature (not ratio-based), Kelvin, and the hardness lookup table (Janka ↔ Brinell ↔ Rockwell C uses an interpolation table, not a formula).

- [ ] **Step 3: Run tests, verify pass, commit**

```bash
npx jest __tests__/modules/utilities/unitConverter.test.ts
git add src/modules/utilities/calculators/unitConverter.ts __tests__/modules/utilities/unitConverter.test.ts
git commit -m "feat: add unit converter engine with 9 categories and maker-focused units"
```

---

### Task 23: EMC Calculator Engine

- [ ] **Step 1: Write tests and implement Hailwood-Horrobin formula**

`src/modules/utilities/calculators/emc.ts`:
```ts
export function calculateEMC(relativeHumidity: number, temperatureF: number): number {
  const T = (temperatureF - 32) * 5 / 9;
  const h = relativeHumidity / 100;

  const W = 349 + 1.29 * T + 0.0135 * T * T;
  const K = 0.805 + 0.000736 * T - 0.00000273 * T * T;
  const K1 = 6.27 - 0.00938 * T - 0.000303 * T * T;
  const K2 = 1.91 + 0.0407 * T - 0.000293 * T * T;

  const emc =
    (1800 / W) *
    ((K * h) / (1 - K * h) +
      (K1 * K * h + 2 * K1 * K2 * K * K * h * h) /
        (1 + K1 * K * h + K1 * K2 * K * K * h * h));

  return Math.round(emc * 10) / 10;
}
```

Tests verify against published EMC tables (e.g., 70°F / 50% RH ≈ 9.2% EMC).

- [ ] **Step 2: Commit**

```bash
git add src/modules/utilities/calculators/emc.ts __tests__/modules/utilities/emc.test.ts
git commit -m "feat: add EMC calculator with Hailwood-Horrobin formula"
```

---

### Task 24: Circle/Arc and Golden Ratio Engines

Simple math — create both in one task.

- [ ] **Step 1: Implement and test**

`src/modules/utilities/calculators/circleArc.ts`:
- `circumference = 2 * PI * r`
- `area = PI * r * r`
- `arcLength = (angle / 360) * circumference`
- `chordLength = 2 * r * sin(angle/2 * PI/180)`

`src/modules/utilities/calculators/goldenRatio.ts`:
- Given dimension d, output: d * 1.618, d / 1.618, d * 1.414, d * 0.667, d * 1.5, d * 2

- [ ] **Step 2: Commit**

```bash
git add src/modules/utilities/calculators/circleArc.ts src/modules/utilities/calculators/goldenRatio.ts __tests__/modules/utilities/circleArc.test.ts __tests__/modules/utilities/goldenRatio.test.ts
git commit -m "feat: add Circle/Arc and Golden Ratio calculator engines"
```

---

### Task 25: Drill/Tap Reference Data

- [ ] **Step 1: Create drill/tap lookup tables**

`src/modules/utilities/data/drillTap.ts` — static arrays for imperial (#0–1/2"-13) and metric (M1–M16) with tap drill, clearance drill, decimal equivalent, counterbore, countersink dimensions. Data sourced from standard machinist reference tables.

- [ ] **Step 2: Commit**

```bash
git add src/modules/utilities/data/drillTap.ts
git commit -m "feat: add drill/tap reference data for imperial and metric"
```

---

## Phase 5: Screens (UI)

At this point all engines, services, and data are built. This phase wires them to screens.

### Task 26: Board Foot Calculator Screen

**Files:**
- Create: `app/(tabs)/make/woodworking/board-foot.tsx`

- [ ] **Step 1: Build screen using design system components**

```tsx
import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, View, Text } from "react-native";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { CalculatorInput, ResultCard, ActionBar } from "../../../../src/design-system/components";
import { FilterBar } from "../../../../src/design-system/components";
import { calculateBoardFeet, type SurfaceType } from "../../../../src/modules/woodworking/calculators/boardFoot";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";

const SURFACE_OPTIONS = [
  { label: "Rough", value: "rough" },
  { label: "S2S", value: "s2s" },
  { label: "S3S", value: "s3s" },
  { label: "S4S", value: "s4s" },
];

export default function BoardFootScreen() {
  const { colors } = useTheme();
  const [thickness, setThickness] = useState("");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [surfaceType, setSurfaceType] = useState<SurfaceType>("rough");

  const result = useMemo(() => {
    const t = parseFloat(thickness) || 0;
    const w = parseFloat(width) || 0;
    const l = parseFloat(length) || 0;
    const q = parseInt(quantity) || 1;
    const p = parseFloat(price) || undefined;
    if (t === 0 || w === 0 || l === 0) return null;
    return calculateBoardFeet({ thickness: t, width: w, length: l, quantity: q, pricePerBF: p, surfaceType });
  }, [thickness, width, length, quantity, price, surfaceType]);

  const handleSave = () => {
    if (!result) return;
    CalculatorService.save({
      module: "woodworking",
      calculatorType: "board-foot",
      inputsJson: { thickness, width, length, quantity, price, surfaceType },
      outputsJson: result,
      label: `${thickness}×${width}×${length} ${surfaceType}`,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[18px] mb-4" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}>
          Board Foot Calculator
        </Text>

        <FilterBar options={SURFACE_OPTIONS} selected={surfaceType} onSelect={(v) => setSurfaceType(v as SurfaceType)} />

        <CalculatorInput label="Thickness" value={thickness} onChangeText={setThickness} unit="in" />
        <CalculatorInput label="Width" value={width} onChangeText={setWidth} unit="in" />
        <CalculatorInput label="Length" value={length} onChangeText={setLength} unit="in" />
        <CalculatorInput label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
        <CalculatorInput label="Price per BF" value={price} onChangeText={setPrice} unit="$/BF" />

        {result && (
          <>
            <ResultCard
              title="Results"
              results={[
                { label: "BF per piece", value: result.boardFeetPerPiece.toFixed(3), unit: "BF" },
                { label: "Total board feet", value: result.totalBoardFeet.toFixed(3), unit: "BF", highlight: true },
                ...(result.totalCost != null
                  ? [{ label: "Total cost", value: `$${result.totalCost.toFixed(2)}` }]
                  : []),
              ]}
            />
            <ActionBar
              onSaveToHistory={handleSave}
              onAddToQuote={() => {/* TODO: open quote picker sheet */}}
              onLogToProject={() => {/* TODO: open project picker sheet */}}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Test in device/simulator, commit**

```bash
git add app/(tabs)/make/woodworking/board-foot.tsx
git commit -m "feat: add Board Foot calculator screen with real-time results"
```

---

### Tasks 27-35: Remaining Calculator Screens

Each remaining calculator screen follows the exact same pattern established in Task 26:
1. Import engine from `src/modules/woodworking/calculators/` or `src/modules/utilities/calculators/`
2. `useState` for each input
3. `useMemo` to compute results reactively
4. Render with `CalculatorInput`, `ResultCard`, `ActionBar`
5. `handleSave` calls `CalculatorService.save()`

**Task 27:** Fraction Calculator screen (`fraction-calc.tsx`) — custom keypad component, tape mode
**Task 28:** Cut List screen (`cut-list.tsx`) — tab toggle for 1D/2D mode, SVG layout for 2D results
**Task 29:** Wood Movement screen (`wood-movement.tsx`) — species picker (SearchableSelect), orientation toggle
**Task 30:** Finishing screen (`finishing.tsx`) — finish type selector, shellac ratio table
**Task 31:** Epoxy screen (`epoxy.tsx`) — project type presets, multi-pour display, colorant sub-section
**Task 32:** Species DB screen (`species-db.tsx`) — FlatList with search, filter chips, detail modal
**Task 33:** Unit Converter screen (`unit-converter.tsx`) — category tabs, bidirectional inputs
**Task 34:** Decibel Meter screen (`decibel-meter.tsx`) — expo-av mic capture, animated gauge, peak hold
**Task 35:** Golden Ratio, Circle/Arc, Drill/Tap, EMC screens — simple input → output patterns

Each task: create screen file, test on device, commit.

---

### Task 36: Shop Core Screens — Projects

**Files:**
- Create: `app/(tabs)/shop/projects/index.tsx`, `app/(tabs)/shop/projects/new.tsx`, `app/(tabs)/shop/projects/[id].tsx`

- [ ] **Step 1: Projects list with Kanban/List toggle**

`app/(tabs)/shop/projects/index.tsx` — uses `useProjects()` hook. Default list view with `StatusBadge`, `FilterBar` for discipline/status. Kanban view uses horizontal `ScrollView` with columns per status, draggable cards via `react-native-gesture-handler`.

- [ ] **Step 2: New project form**

`app/(tabs)/shop/projects/new.tsx` — form with: name, client picker (SearchableSelect), status, discipline tags (multi-select chips), dates, budget. Calls `projectStore.create()`. Shows `UpgradeModal` if limit reached.

- [ ] **Step 3: Project detail with 6 tabs**

`app/(tabs)/shop/projects/[id].tsx` — tab bar: Overview | Materials | Calculators | Journal | Financials | Files. Each tab renders a filtered view from the relevant service.

- [ ] **Step 4: Commit**

```bash
git add app/(tabs)/shop/projects/
git commit -m "feat: add Projects list, detail, and creation screens with Kanban view"
```

---

### Tasks 37-41: Remaining Shop Core Screens

**Task 37:** Inventory screens (list with category filters, new item form, detail with consumption history, quick-deduct modal)
**Task 38:** Client screens (list, detail with 6 sections, new form, communication log)
**Task 39:** Journal screens (chronological list, calendar grid, new entry with project/discipline linking, streak display)
**Task 40:** Quote screens (list, new quote with line item builder, detail, PDF preview)
**Task 41:** Invoice screens (list, new from scratch or convert from quote, payment recording, overdue indicators, PDF generation)

Each follows established patterns. Each gets its own commit.

---

### Task 42: Home Dashboard

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Build all dashboard widgets**

Wire up the Home screen with all 7 sections from the spec:
1. Greeting card with time-of-day awareness
2. Active Projects widget — `useProjects().projects.filter(active).slice(0,3)`
3. Outstanding Invoices widget — `useInvoices().getOutstandingTotal()`
4. Low Stock widget — `useInventory().lowStockItems`
5. Recent Journal — `useJournal().entries.slice(0,2)`
6. Quick Calculators grid — reads favorites from settings
7. Shop Streak — `useJournal().streak`

- [ ] **Step 2: Add global search bar**

Search component at top that queries across all services and groups results by type.

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: add Home dashboard with all widgets and global search"
```

---

### Task 43: Revenue Dashboard

**Files:**
- Create: `app/(tabs)/shop/revenue.tsx`

- [ ] **Step 1: Build revenue screen with aggregation queries**

Revenue screen with period selector (MTD/YTD/All), charts (bar chart for revenue by discipline using `react-native-svg`), aging buckets, top clients, average job value. CSV export via `expo-sharing`.

Pro-only gate: show `UpgradeModal` if free tier.

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/shop/revenue.tsx
git commit -m "feat: add Revenue Dashboard with charts and CSV export"
```

---

### Task 44: Pricing Workflow Screen

**Files:**
- Create: `app/(tabs)/make/woodworking/pricing.tsx`

- [ ] **Step 1: Build pricing workflow**

Composes Shop Core services: pulls materials from linked project, adds labor phases, applies overhead and markup from settings, displays itemized breakdown. "Create Quote" button calls `QuoteService.createFromPricing()`.

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/make/woodworking/pricing.tsx
git commit -m "feat: add Woodworking pricing workflow with quote generation"
```

---

### Task 45: Database Initialization on App Start

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Call initializeDatabase() and seedWoodSpecies() on app mount**

Add to root layout's `useEffect`:
```tsx
import { initializeDatabase } from "../src/core/database/connection";
import { seedWoodSpecies } from "../src/modules/woodworking/data/seedSpecies";

useEffect(() => {
  if (fontsLoaded) {
    initializeDatabase();
    seedWoodSpecies();
    SplashScreen.hideAsync();
  }
}, [fontsLoaded]);
```

- [ ] **Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: initialize database and seed wood species on app start"
```

---

### Task 46: Profile / Settings Screen

**Files:**
- Modify: `app/(tabs)/profile/index.tsx`

- [ ] **Step 1: Build settings form**

Settings screen with: unit system toggle (imperial/metric), shop name, hourly rate, tax rate, markup %, quote/invoice prefix, terms & conditions, theme toggle (dark/light), data export button. All fields persist via `useSettings().set()`.

Data export: generates CSV files for each table, bundles into a zip, shares via `expo-sharing`.

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/profile/index.tsx
git commit -m "feat: add Settings screen with preferences and data export"
```

---

### Task 47: Final Integration Test

- [ ] **Step 1: Run full test suite**

```bash
npx jest --coverage
```

Verify all calculator engines pass. Fix any failures.

- [ ] **Step 2: Test on device**

```bash
npx expo start
```

Walk through: Onboarding → Home dashboard → Woodworking → Board Foot calc → Save to History → Create Project → Add inventory item → Deduct to project → Create quote from pricing → Convert to invoice → Revenue dashboard.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete MakerOS Milestone 1 — Foundation, Shop Core, Woodworking, Utilities"
```

- [ ] **Step 4: Push to GitHub**

```bash
git remote add origin https://github.com/dlopez2392/MakerApp.git
git branch -M main
git push -u origin main
```
