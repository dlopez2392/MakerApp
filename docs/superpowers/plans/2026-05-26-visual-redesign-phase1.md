# Visual Redesign Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the module theme system foundation and apply craft-specific visual identities to Woodworking, Leather, and Resin modules with background textures and dynamic navigation theming.

**Architecture:** A `MODULE_THEMES` registry maps each craft to its accent color, background asset, and card style. The existing Zustand `useTheme` store gains an `activeModule` field that drives `ThemedBackground` and `ThemedCard` components. Module layouts call `setActiveModule()` on mount, which propagates the theme to all child screens and the tab bar.

**Tech Stack:** React Native, Expo Router, Zustand, NativeWind, ImageBackground, react-native-reanimated

---

## File Map

### New Files
| File | Responsibility |
|---|---|
| `src/design-system/tokens/moduleThemes.ts` | Theme registry — accent colors, background assets, card styles per module |
| `src/design-system/components/ThemedBackground.tsx` | Screen wrapper with module-specific texture background |
| `src/design-system/components/ThemedCard.tsx` | Card component with module-specific accent/border styling |
| `assets/textures/placeholder-home.png` | Placeholder texture for home (swap for AI-generated later) |
| `assets/textures/placeholder-woodworking.png` | Placeholder texture for woodworking |
| `assets/textures/placeholder-leather.png` | Placeholder texture for leather |
| `assets/textures/placeholder-resin.png` | Placeholder texture for resin |

### Modified Files
| File | Changes |
|---|---|
| `src/design-system/hooks/useTheme.ts` | Add `activeModule`, `moduleTheme`, `setActiveModule()` to store |
| `src/design-system/tokens/index.ts` | Re-export `moduleThemes` |
| `src/design-system/components/index.ts` | Re-export `ThemedBackground`, `ThemedCard` |
| `app/(tabs)/make/woodworking/_layout.tsx` | Call `setActiveModule('woodworking')` on mount |
| `app/(tabs)/make/woodworking/index.tsx` | Use `ThemedBackground` + `ThemedCard` |
| `app/(tabs)/make/leather/_layout.tsx` | Call `setActiveModule('leather')` on mount |
| `app/(tabs)/make/leather/index.tsx` | Use `ThemedBackground` + `ThemedCard` |
| `app/(tabs)/make/resin/_layout.tsx` | Call `setActiveModule('resin')` on mount |
| `app/(tabs)/make/resin/index.tsx` | Use `ThemedBackground` + `ThemedCard` |
| `app/(tabs)/make/_layout.tsx` | Dynamic top tab indicator/tint from `moduleTheme.accent` |
| `app/(tabs)/_layout.tsx` | Dynamic bottom tab bar `activeTintColor` from `moduleTheme.accent` |
| `app/(tabs)/index.tsx` | Wrap home screen in `ThemedBackground` with module `'home'` |

---

## Task 1: Module Theme Registry

**Files:**
- Create: `src/design-system/tokens/moduleThemes.ts`

- [ ] **Step 1: Create the module theme registry**

```ts
// src/design-system/tokens/moduleThemes.ts

export type ModuleId =
  | "home"
  | "woodworking"
  | "leather"
  | "resin"
  | "soap"
  | "cnc"
  | "knife"
  | "candle"
  | "laser"
  | "printing";

export interface ModuleTheme {
  id: ModuleId;
  label: string;
  accent: string;
  accentMuted: string;
  cardBorderColor: string;
  backgroundAsset: number | null;
  darkOverlayOpacity: number;
  lightOverlayOpacity: number;
}

const THEMES: Record<ModuleId, Omit<ModuleTheme, "backgroundAsset">> = {
  home: {
    id: "home",
    label: "Home",
    accent: "#f59e0b",
    accentMuted: "#f59e0b26",
    cardBorderColor: "#f59e0b40",
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  woodworking: {
    id: "woodworking",
    label: "Woodworking",
    accent: "#a0714f",
    accentMuted: "#a0714f26",
    cardBorderColor: "#a0714f40",
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  leather: {
    id: "leather",
    label: "Leather",
    accent: "#c2956b",
    accentMuted: "#c2956b26",
    cardBorderColor: "#c2956b40",
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  resin: {
    id: "resin",
    label: "Resin",
    accent: "#3b82f6",
    accentMuted: "#3b82f626",
    cardBorderColor: "#3b82f640",
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  soap: {
    id: "soap",
    label: "Soap",
    accent: "#a78bfa",
    accentMuted: "#a78bfa26",
    cardBorderColor: "#a78bfa40",
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  cnc: {
    id: "cnc",
    label: "CNC",
    accent: "#6b7280",
    accentMuted: "#6b728026",
    cardBorderColor: "#6b728040",
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  knife: {
    id: "knife",
    label: "Knife",
    accent: "#dc5a34",
    accentMuted: "#dc5a3426",
    cardBorderColor: "#dc5a3440",
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  candle: {
    id: "candle",
    label: "Candle",
    accent: "#e8a030",
    accentMuted: "#e8a03026",
    cardBorderColor: "#e8a03040",
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  laser: {
    id: "laser",
    label: "Laser",
    accent: "#06b6d4",
    accentMuted: "#06b6d426",
    cardBorderColor: "#06b6d440",
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  printing: {
    id: "printing",
    label: "3D Print",
    accent: "#374151",
    accentMuted: "#37415126",
    cardBorderColor: "#37415140",
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
};

// Metro resolves require() statically at build time.
// Only add entries here when the corresponding file exists in assets/textures/.
// Phase 1 ships placeholder PNGs; swap for AI-generated WebP later.
const BACKGROUND_ASSETS: Partial<Record<ModuleId, number>> = {
  home: require("../../../assets/textures/placeholder-home.png"),
  woodworking: require("../../../assets/textures/placeholder-woodworking.png"),
  leather: require("../../../assets/textures/placeholder-leather.png"),
  resin: require("../../../assets/textures/placeholder-resin.png"),
};

export const MODULE_THEMES: Record<ModuleId, ModuleTheme> = Object.fromEntries(
  Object.entries(THEMES).map(([key, theme]) => [
    key,
    { ...theme, backgroundAsset: BACKGROUND_ASSETS[key as ModuleId] ?? null },
  ])
) as Record<ModuleId, ModuleTheme>;

export function getModuleTheme(id: ModuleId): ModuleTheme {
  return MODULE_THEMES[id] ?? MODULE_THEMES.home;
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors related to `moduleThemes.ts`

- [ ] **Step 3: Commit**

```bash
git add src/design-system/tokens/moduleThemes.ts
git commit -m "feat: add module theme registry with per-craft accent colors"
```

---

## Task 2: Extend useTheme Store

**Files:**
- Modify: `src/design-system/hooks/useTheme.ts`

- [ ] **Step 1: Add activeModule and moduleTheme to the Zustand store**

Replace the entire file:

```ts
// src/design-system/hooks/useTheme.ts
import { create } from "zustand";
import { colors, type ThemeMode, type ThemeColors } from "../tokens/colors";
import { MODULE_THEMES, getModuleTheme, type ModuleId, type ModuleTheme } from "../tokens/moduleThemes";

interface ThemeStore {
  mode: ThemeMode;
  colors: ThemeColors;
  activeModule: ModuleId;
  moduleTheme: ModuleTheme;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
  setActiveModule: (id: ModuleId) => void;
}

export const useTheme = create<ThemeStore>((set) => ({
  mode: "dark",
  colors: colors.dark,
  activeModule: "home",
  moduleTheme: getModuleTheme("home"),
  toggle: () =>
    set((state) => {
      const next = state.mode === "dark" ? "light" : "dark";
      return { mode: next, colors: colors[next] };
    }),
  setMode: (mode) => set({ mode, colors: colors[mode] }),
  setActiveModule: (id) => set({ activeModule: id, moduleTheme: getModuleTheme(id) }),
}));
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors. All existing consumers of `useTheme` (destructuring `{ colors }`) continue to work unchanged since the new fields are additive.

- [ ] **Step 3: Commit**

```bash
git add src/design-system/hooks/useTheme.ts
git commit -m "feat: extend useTheme store with activeModule and moduleTheme"
```

---

## Task 3: ThemedBackground Component

**Files:**
- Create: `src/design-system/components/ThemedBackground.tsx`

- [ ] **Step 1: Create ThemedBackground component**

```tsx
// src/design-system/components/ThemedBackground.tsx
import { View, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../hooks/useTheme";
import { getModuleTheme, type ModuleId } from "../tokens/moduleThemes";

interface ThemedBackgroundProps {
  module: ModuleId;
  children: React.ReactNode;
  opacity?: number;
  useSafeArea?: boolean;
}

export function ThemedBackground({
  module,
  children,
  opacity,
  useSafeArea = true,
}: ThemedBackgroundProps) {
  const { colors, mode } = useTheme();
  const theme = getModuleTheme(module);
  const resolvedOpacity =
    opacity ?? (mode === "dark" ? theme.darkOverlayOpacity : theme.lightOverlayOpacity);

  const Container = useSafeArea ? SafeAreaView : View;

  if (!theme.backgroundAsset) {
    return (
      <Container style={{ flex: 1, backgroundColor: colors.background }}>
        {children}
      </Container>
    );
  }

  return (
    <ImageBackground
      source={theme.backgroundAsset}
      resizeMode="cover"
      style={{ flex: 1 }}
      imageStyle={{ opacity: resolvedOpacity }}
    >
      <View style={{ flex: 1, backgroundColor: colors.background + "e6" }}>
        <Container style={{ flex: 1 }}>{children}</Container>
      </View>
    </ImageBackground>
  );
}
```

Key design notes for the implementer:
- `colors.background + "e6"` adds ~90% opacity hex suffix, creating a tinted overlay that lets the texture bleed through subtly.
- When no `backgroundAsset` exists (texture not yet provided), it falls back to the standard solid background — no visual regression.
- `useSafeArea` defaults to `true` so it can replace `SafeAreaView` directly in screens.

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/design-system/components/ThemedBackground.tsx
git commit -m "feat: add ThemedBackground component with texture overlay"
```

---

## Task 4: ThemedCard Component

**Files:**
- Create: `src/design-system/components/ThemedCard.tsx`

- [ ] **Step 1: Create ThemedCard component**

```tsx
// src/design-system/components/ThemedCard.tsx
import { Pressable, Text, type ViewStyle } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { getModuleTheme, type ModuleId } from "../tokens/moduleThemes";

interface ThemedCardProps {
  module?: ModuleId;
  onPress?: () => void;
  children: React.ReactNode;
  highlight?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function ThemedCard({
  module,
  onPress,
  children,
  highlight = false,
  style,
  accessibilityLabel,
}: ThemedCardProps) {
  const { colors, activeModule } = useTheme();
  const resolvedModule = module ?? activeModule;
  const theme = getModuleTheme(resolvedModule);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="rounded-xl p-4 items-center justify-center"
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: highlight ? theme.accent : theme.cardBorderColor,
          width: "47%",
          minHeight: 100,
        },
        style,
      ]}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Pressable>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/design-system/components/ThemedCard.tsx
git commit -m "feat: add ThemedCard component with module accent borders"
```

---

## Task 5: Create Placeholder Texture Assets

**Files:**
- Create: `assets/textures/placeholder-home.png`
- Create: `assets/textures/placeholder-woodworking.png`
- Create: `assets/textures/placeholder-leather.png`
- Create: `assets/textures/placeholder-resin.png`

These are simple 100x100 solid-color placeholder PNGs. They will be replaced with AI-generated 750x1334 WebP textures later. The system works with or without them — `ThemedBackground` has a solid-color fallback.

- [ ] **Step 1: Create the textures directory and placeholder images**

Generate minimal 1x1 PNG files using Node.js (no dependencies needed — writes raw PNG binary):

```bash
mkdir -p assets/textures
node -e "
const fs = require('fs');
// Minimal 1x1 PNG with a single color pixel
function makePng(r, g, b) {
  const zlib = require('zlib');
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  // IHDR
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(1, 8);  // width
  ihdr.writeUInt32BE(1, 12); // height
  ihdr[16] = 8; ihdr[17] = 2; // 8bit RGB
  const ihdrCrc = require('zlib').crc32(ihdr.subarray(4, 21));
  ihdr.writeInt32BE(ihdrCrc, 21);
  // IDAT
  const raw = Buffer.from([0, r, g, b]);
  const compressed = zlib.deflateSync(raw);
  const idat = Buffer.alloc(compressed.length + 12);
  idat.writeUInt32BE(compressed.length, 0);
  idat.write('IDAT', 4);
  compressed.copy(idat, 8);
  const idatCrc = require('zlib').crc32(idat.subarray(4, 8 + compressed.length));
  idat.writeInt32BE(idatCrc, 8 + compressed.length);
  // IEND
  const iend = Buffer.from([0,0,0,0,73,69,78,68,174,66,96,130]);
  return Buffer.concat([sig, ihdr, idat, iend]);
}
fs.writeFileSync('assets/textures/placeholder-home.png', makePng(30, 25, 20));
fs.writeFileSync('assets/textures/placeholder-woodworking.png', makePng(50, 35, 20));
fs.writeFileSync('assets/textures/placeholder-leather.png', makePng(60, 45, 30));
fs.writeFileSync('assets/textures/placeholder-resin.png', makePng(20, 30, 60));
"
```

If the Node PNG generation fails, create empty placeholder files instead:

```bash
# Fallback: create empty files so require() doesn't crash at build time
touch assets/textures/placeholder-home.png
touch assets/textures/placeholder-woodworking.png
touch assets/textures/placeholder-leather.png
touch assets/textures/placeholder-resin.png
```

- [ ] **Step 2: Verify files exist**

Run: `ls assets/textures/`
Expected: Four `.png` files listed

- [ ] **Step 3: Commit**

```bash
git add assets/textures/
git commit -m "feat: add placeholder texture assets for Phase 1 modules"
```

---

## Task 6: Export New Tokens and Components

**Files:**
- Modify: `src/design-system/tokens/index.ts`
- Modify: `src/design-system/components/index.ts`

- [ ] **Step 1: Add moduleThemes export to tokens index**

Replace the entire file:

```ts
// src/design-system/tokens/index.ts
export { colors, type ThemeColors, type ThemeMode } from "./colors";
export { typography } from "./typography";
export { spacing, touchTarget } from "./spacing";
export { MODULE_THEMES, getModuleTheme, type ModuleId, type ModuleTheme } from "./moduleThemes";
```

- [ ] **Step 2: Add new component exports to components index**

Replace the entire file:

```ts
// src/design-system/components/index.ts
export { CalculatorInput } from "./CalculatorInput";
export { ResultCard } from "./ResultCard";
export { ActionBar } from "./ActionBar";
export { SafetyWarning } from "./SafetyWarning";
export { StatusBadge } from "./StatusBadge";
export { EmptyState } from "./EmptyState";
export { UpgradeModal } from "./UpgradeModal";
export { FilterBar } from "./FilterBar";
export { StepIndicator } from "./StepIndicator";
export { ThemedBackground } from "./ThemedBackground";
export { ThemedCard } from "./ThemedCard";
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/design-system/tokens/index.ts src/design-system/components/index.ts
git commit -m "feat: export ThemedBackground, ThemedCard, and moduleThemes from design system"
```

---

## Task 7: Apply Theme to Woodworking Module

**Files:**
- Modify: `app/(tabs)/make/woodworking/_layout.tsx`
- Modify: `app/(tabs)/make/woodworking/index.tsx`

- [ ] **Step 1: Update Woodworking layout to set active module**

Replace the entire file:

```tsx
// app/(tabs)/make/woodworking/_layout.tsx
import { useEffect } from "react";
import { Stack } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function WoodworkingLayout() {
  const { colors, setActiveModule } = useTheme();

  useEffect(() => {
    setActiveModule("woodworking");
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="board-foot" options={{ title: "Board Foot" }} />
      <Stack.Screen name="fraction-calc" options={{ title: "Fractions" }} />
      <Stack.Screen name="cut-list" options={{ title: "Cut List" }} />
      <Stack.Screen name="wood-movement" options={{ title: "Wood Movement" }} />
      <Stack.Screen name="finishing" options={{ title: "Finishing" }} />
      <Stack.Screen name="epoxy" options={{ title: "Epoxy" }} />
      <Stack.Screen name="species-db" options={{ title: "Species DB" }} />
      <Stack.Screen name="pricing" options={{ title: "Pricing" }} />
    </Stack>
  );
}
```

- [ ] **Step 2: Update Woodworking home screen with ThemedBackground and ThemedCard**

Replace the entire file:

```tsx
// app/(tabs)/make/woodworking/index.tsx
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { ThemedBackground } from "../../../../src/design-system/components/ThemedBackground";
import { ThemedCard } from "../../../../src/design-system/components/ThemedCard";

const CALCULATORS = [
  { name: "Board Foot", route: "/make/woodworking/board-foot" },
  { name: "Fractions", route: "/make/woodworking/fraction-calc" },
  { name: "Cut List", route: "/make/woodworking/cut-list" },
  { name: "Wood Movement", route: "/make/woodworking/wood-movement" },
  { name: "Finishing", route: "/make/woodworking/finishing" },
  { name: "Epoxy Resin", route: "/make/woodworking/epoxy" },
  { name: "Species DB", route: "/make/woodworking/species-db" },
  { name: "Pricing", route: "/make/woodworking/pricing" },
];

export default function WoodworkingHome() {
  const router = useRouter();
  const { colors, moduleTheme } = useTheme();

  return (
    <ThemedBackground module="woodworking">
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Woodworking
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: moduleTheme.accent }}
        >
          {CALCULATORS.length} calculators
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {CALCULATORS.map((calc) => (
            <ThemedCard
              key={calc.name}
              module="woodworking"
              onPress={() => router.push(calc.route as any)}
              accessibilityLabel={calc.name}
            >
              <Text
                className="text-[15px] text-center mt-2"
                style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
              >
                {calc.name}
              </Text>
            </ThemedCard>
          ))}
        </View>
      </ScrollView>
    </ThemedBackground>
  );
}
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add "app/(tabs)/make/woodworking/_layout.tsx" "app/(tabs)/make/woodworking/index.tsx"
git commit -m "feat: apply woodworking craft theme with ThemedBackground and ThemedCard"
```

---

## Task 8: Apply Theme to Leather Module

**Files:**
- Modify: `app/(tabs)/make/leather/_layout.tsx`
- Modify: `app/(tabs)/make/leather/index.tsx`

- [ ] **Step 1: Update Leather layout to set active module**

Replace the entire file:

```tsx
// app/(tabs)/make/leather/_layout.tsx
import { useEffect } from "react";
import { Stack } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function LeatherLayout() {
  const { colors, setActiveModule } = useTheme();

  useEffect(() => {
    setActiveModule("leather");
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="leather-area" options={{ title: "Leather Area" }} />
      <Stack.Screen name="thread-stitch" options={{ title: "Thread & Stitch" }} />
    </Stack>
  );
}
```

- [ ] **Step 2: Update Leather home screen with ThemedBackground and ThemedCard**

Replace the entire file:

```tsx
// app/(tabs)/make/leather/index.tsx
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { ThemedBackground } from "../../../../src/design-system/components/ThemedBackground";
import { ThemedCard } from "../../../../src/design-system/components/ThemedCard";

const CALCULATORS = [
  { name: "Leather Area", route: "/make/leather/leather-area" },
  { name: "Thread & Stitch", route: "/make/leather/thread-stitch" },
];

export default function LeatherHome() {
  const router = useRouter();
  const { colors, moduleTheme } = useTheme();

  return (
    <ThemedBackground module="leather">
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Leatherworking
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: moduleTheme.accent }}
        >
          {CALCULATORS.length} calculators
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {CALCULATORS.map((calc) => (
            <ThemedCard
              key={calc.name}
              module="leather"
              onPress={() => router.push(calc.route as any)}
              accessibilityLabel={calc.name}
            >
              <Text
                className="text-[15px] text-center mt-2"
                style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
              >
                {calc.name}
              </Text>
            </ThemedCard>
          ))}
        </View>
      </ScrollView>
    </ThemedBackground>
  );
}
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add "app/(tabs)/make/leather/_layout.tsx" "app/(tabs)/make/leather/index.tsx"
git commit -m "feat: apply leather craft theme with ThemedBackground and ThemedCard"
```

---

## Task 9: Apply Theme to Resin Module

**Files:**
- Modify: `app/(tabs)/make/resin/_layout.tsx`
- Modify: `app/(tabs)/make/resin/index.tsx`

- [ ] **Step 1: Update Resin layout to set active module**

Replace the entire file:

```tsx
// app/(tabs)/make/resin/_layout.tsx
import { useEffect } from "react";
import { Stack } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function ResinLayout() {
  const { colors, setActiveModule } = useTheme();

  useEffect(() => {
    setActiveModule("resin");
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="resin-ratio" options={{ title: "Resin/Hardener Ratio" }} />
      <Stack.Screen name="mold-volume" options={{ title: "Mold Volume" }} />
      <Stack.Screen name="colorant-mix" options={{ title: "Colorant Mix" }} />
      <Stack.Screen name="cost-estimator" options={{ title: "Cost Estimator" }} />
      <Stack.Screen name="coating-coverage" options={{ title: "Coating Coverage" }} />
      <Stack.Screen name="pot-life" options={{ title: "Pot Life Timer" }} />
      <Stack.Screen name="pressure-pot" options={{ title: "Pressure Pot" }} />
    </Stack>
  );
}
```

- [ ] **Step 2: Update Resin home screen with ThemedBackground and ThemedCard**

Replace the entire file:

```tsx
// app/(tabs)/make/resin/index.tsx
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { ThemedBackground } from "../../../../src/design-system/components/ThemedBackground";
import { ThemedCard } from "../../../../src/design-system/components/ThemedCard";

const CALCULATORS = [
  { name: "Resin/Hardener Ratio", route: "/make/resin/resin-ratio" },
  { name: "Mold Volume", route: "/make/resin/mold-volume" },
  { name: "Colorant Mix", route: "/make/resin/colorant-mix" },
  { name: "Cost Estimator", route: "/make/resin/cost-estimator" },
  { name: "Coating Coverage", route: "/make/resin/coating-coverage" },
  { name: "Pot Life Timer", route: "/make/resin/pot-life" },
  { name: "Pressure Pot", route: "/make/resin/pressure-pot" },
];

export default function ResinHome() {
  const router = useRouter();
  const { colors, moduleTheme } = useTheme();

  return (
    <ThemedBackground module="resin">
      <ScrollView className="flex-1 p-4">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Resin Art
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: moduleTheme.accent }}
        >
          {CALCULATORS.length} calculators
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {CALCULATORS.map((calc) => (
            <ThemedCard
              key={calc.name}
              module="resin"
              onPress={() => router.push(calc.route as any)}
              accessibilityLabel={calc.name}
            >
              <Text
                className="text-[15px] text-center mt-2"
                style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
              >
                {calc.name}
              </Text>
            </ThemedCard>
          ))}
        </View>
        <View className="h-8" />
      </ScrollView>
    </ThemedBackground>
  );
}
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add "app/(tabs)/make/resin/_layout.tsx" "app/(tabs)/make/resin/index.tsx"
git commit -m "feat: apply resin craft theme with ThemedBackground and ThemedCard"
```

---

## Task 10: Dynamic Make Top Tabs

**Files:**
- Modify: `app/(tabs)/make/_layout.tsx`

- [ ] **Step 1: Update Make layout for dynamic top tab indicator tinting**

Replace the entire file:

```tsx
// app/(tabs)/make/_layout.tsx
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../src/design-system/hooks/useTheme";

const { Navigator } = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Navigator);

export default function MakeLayout() {
  const { colors, moduleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <TopTabs
      screenOptions={{
        tabBarScrollEnabled: true,
        tabBarStyle: { backgroundColor: colors.background, marginTop: insets.top },
        tabBarIndicatorStyle: { backgroundColor: moduleTheme.accent, height: 3 },
        tabBarActiveTintColor: moduleTheme.accent,
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

The only change from the original: `colors.primary` → `moduleTheme.accent` for `tabBarIndicatorStyle` and `tabBarActiveTintColor`. As the user swipes between module tabs, the `setActiveModule()` call in each module's `_layout.tsx` fires, and the Zustand store update causes this layout to re-render with the new accent color.

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/make/_layout.tsx"
git commit -m "feat: dynamic top tab indicator color based on active module theme"
```

---

## Task 11: Dynamic Bottom Tab Bar

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Update tab layout for dynamic accent color**

Replace the entire file:

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/design-system/hooks/useTheme";

export default function TabLayout() {
  const { colors, moduleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarActiveTintColor: moduleTheme.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="make"
        options={{
          title: "Make",
          tabBarLabel: "Make",
          tabBarIcon: ({ color, size }) => <Ionicons name="construct-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarLabel: "Shop",
          tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="utilities"
        options={{
          title: "Utilities",
          tabBarLabel: "Utilities",
          tabBarIcon: ({ color, size }) => <Ionicons name="calculator-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

Single change: `colors.primary` → `moduleTheme.accent` for `tabBarActiveTintColor`. When `activeModule` is `"home"`, the accent is amber `#f59e0b` (same as current `colors.primary`), so the default look is preserved.

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/_layout.tsx"
git commit -m "feat: dynamic bottom tab bar accent color based on active module"
```

---

## Task 12: Home Screen ThemedBackground

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Update Home screen to use ThemedBackground**

Make two targeted changes to `app/(tabs)/index.tsx`:

1. Add import at the top (after existing imports):

```tsx
import { ThemedBackground } from "../../src/design-system/components/ThemedBackground";
```

2. Replace the outer `SafeAreaView` wrapper. Change:

```tsx
<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
```

to:

```tsx
<ThemedBackground module="home">
```

3. Replace the matching closing tag. Change:

```tsx
    </SafeAreaView>
```

(the outermost closing tag at the end of the JSX return) to:

```tsx
    </ThemedBackground>
```

4. Remove the now-unused `SafeAreaView` import. Change the first import line:

```tsx
import { ScrollView, View, Text, Pressable } from "react-native";
```

from:

```tsx
import { ScrollView, View, Text, Pressable } from "react-native";
```

to:

```tsx
import { ScrollView, View, Text, Pressable } from "react-native";
```

(Actually `SafeAreaView` is imported from `react-native-safe-area-context` on line 2 — it's still used by `ThemedBackground` internally, but the import in this file can be removed since it's no longer directly referenced.)

Change line 2:

```tsx
import { SafeAreaView } from "react-native-safe-area-context";
```

Remove this import line entirely.

- [ ] **Step 2: Add setActiveModule("home") to home screen**

Add a `useEffect` to reset the active module when the home tab is focused. Add after existing hook calls at the top of `HomeScreen`:

```tsx
const { colors, setActiveModule } = useTheme();
```

(replacing `const { colors } = useTheme();`)

And add:

```tsx
import { useEffect } from "react";
```

(if not already imported — check existing imports)

And after the hook calls:

```tsx
useEffect(() => {
  setActiveModule("home");
}, []);
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 4: Test on device**

Run: `npx expo start`
Verify:
1. Home screen loads with amber accent (unchanged visual)
2. Navigate to Make → Woodworking — top tab indicator turns brown, bottom tab accent turns brown
3. Navigate to Make → Leather — indicator turns saddle tan
4. Navigate to Make → Resin — indicator turns blue
5. Navigate back to Home — accent reverts to amber
6. Module home screens show ThemedCard borders with module accent color

- [ ] **Step 5: Commit**

```bash
git add "app/(tabs)/index.tsx"
git commit -m "feat: apply ThemedBackground to home screen, reset module on home focus"
```
