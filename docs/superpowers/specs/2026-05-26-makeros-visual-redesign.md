# MakerOS Visual Redesign — Per-Module Craft Themes

**Date:** 2026-05-26
**Status:** Approved
**Scope:** Full app redesign with per-module visual identities, dynamic navigation theming, AI-generated background textures

---

## Overview

Transform MakerOS from a flat, uniform dark UI into an immersive craft companion where each module has its own visual identity — unique background textures, accent colors, and card treatments. Navigation dynamically adapts to the active module.

## Design Decisions

- **Background technique:** Static image assets (AI-generated textures, WebP format)
- **Theming scope:** Per-module craft themes with dynamic tab bar
- **Asset sourcing:** AI-generated custom textures, unique to the app
- **Phased rollout:** Theme system + 2-3 modules first, then remaining modules, then polish

---

## 1. Module Theme Registry

Central configuration mapping each craft module to its visual identity.

| Module | Background Texture | Accent Color | Card Style |
|---|---|---|---|
| **Home** | Workshop/workbench | Amber `#f59e0b` | Frosted dark |
| **Woodworking** | Oak wood grain | Warm brown `#a0714f` | Wood-toned borders |
| **Leather** | Saddle leather texture | Saddle tan `#c2956b` | Stitched-edge feel |
| **Resin** | Glossy pour/swirl | Ocean blue `#3b82f6` | Glass/translucent |
| **Soap** | Soft lather/bubbles | Lavender `#a78bfa` | Soft rounded, pastel |
| **CNC** | Brushed aluminum/grid | Steel gray `#6b7280` | Sharp corners, precision |
| **Knife** | Forge/carbon fiber | Forge red `#dc5a34` | Bold, angular |
| **Candle** | Warm wax drip | Flame amber `#e8a030` | Warm glow borders |
| **Laser** | Tech grid/scan lines | Electric blue `#06b6d4` | Neon-edge cards |
| **Printing** | Paper/ink splatter | Ink black `#374151` | Clean paper-white cards |

---

## 2. New Files

### `src/design-system/tokens/moduleThemes.ts`

Theme registry exporting a `MODULE_THEMES` map:

```ts
export type ModuleId = 'home' | 'woodworking' | 'leather' | 'resin' | 'soap' | 'cnc' | 'knife' | 'candle' | 'laser' | 'printing';

export interface ModuleTheme {
  id: ModuleId;
  label: string;
  accent: string;          // primary accent color for this module
  accentMuted: string;     // low-opacity variant for backgrounds
  backgroundAsset: any;    // require() reference to texture image
  cardBorderColor: string; // themed card border
  cardStyle: 'frosted' | 'solid' | 'glass' | 'soft' | 'sharp' | 'bold' | 'warm' | 'neon' | 'clean';
}

export const MODULE_THEMES: Record<ModuleId, ModuleTheme> = { ... };
```

### `src/design-system/components/ThemedBackground.tsx`

Wrapper component providing module-specific background:

```tsx
interface ThemedBackgroundProps {
  module: ModuleId;
  children: React.ReactNode;
}
```

- Renders `ImageBackground` with module texture at 8-12% opacity (dark) / 5-8% (light)
- Includes `SafeAreaView` with flex: 1
- Falls back to solid background color if image not loaded
- Accepts optional `opacity` override

### `src/design-system/components/ThemedCard.tsx`

Card component that adopts module accent:

```tsx
interface ThemedCardProps {
  module?: ModuleId;  // optional — falls back to current active module
  children: React.ReactNode;
  highlight?: boolean;
}
```

- Uses module accent for border color when `highlight` is true
- Applies card style variant (frosted, glass, sharp, etc.) from theme
- Replaces raw `View` cards throughout the app

### `assets/textures/`

10 AI-generated background textures:
- `home-workshop.webp`
- `woodworking-oak.webp`
- `leather-saddle.webp`
- `resin-pour.webp`
- `soap-lather.webp`
- `cnc-aluminum.webp`
- `knife-forge.webp`
- `candle-wax.webp`
- `laser-grid.webp`
- `printing-ink.webp`

**Texture specs:**
- Size: 750 x 1334px (iPhone-optimized, scales on other devices)
- Format: WebP
- Style: Dark-toned, low contrast, designed for ~10% opacity overlay
- Estimated total bundle impact: ~2-3MB

---

## 3. Modified Files

### `src/design-system/hooks/useTheme.ts`

Extend the Zustand store:

```ts
interface ThemeStore {
  mode: ThemeMode;
  colors: ThemeColors;
  activeModule: ModuleId;      // NEW
  moduleTheme: ModuleTheme;    // NEW — derived from activeModule
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
  setActiveModule: (id: ModuleId) => void;  // NEW
}
```

`setActiveModule` updates `activeModule` and derives `moduleTheme` from the registry.

### `app/(tabs)/_layout.tsx`

- Read `activeModule` from theme store
- Set tab bar `activeTintColor` to `moduleTheme.accent`
- Apply subtle background tint on tab bar matching module
- Animate color transitions when switching modules

### All module `_layout.tsx` files

- Call `setActiveModule(moduleId)` when the module stack mounts
- Wrap stack in module context so child screens inherit the theme

### All module `index.tsx` (home screens)

- Replace `SafeAreaView` with `ThemedBackground` component
- Use `ThemedCard` for calculator grid items instead of raw `Pressable` + `View`

### Design system components (optional accent support)

- `CalculatorInput.tsx` — optional `accentColor` prop for focused border
- `ResultCard.tsx` — optional `accentColor` for highlight items
- `ActionBar.tsx` — optional `accentColor` for primary button tint

---

## 4. Dynamic Tab Bar

- Detects active module from current route path (e.g., `/make/leather/*` → leather)
- Maps route segments to `ModuleId` for theme lookup
- Active tab icon tint = module accent color
- Tab bar background gets subtle module tint (accent at ~5% opacity)
- Smooth animated transition when navigating between modules

Route-to-module mapping:
```
/make/woodworking/* → woodworking
/make/leather/*     → leather
/make/resin/*       → resin
/make/soap/*        → soap
/make/cnc/*         → cnc
/make/knife/*       → knife
/make/candle/*      → candle
/make/laser/*       → laser
/make/printing/*    → printing
/*                  → home (default)
```

---

## 5. Light Mode Support

- Same textures but rendered at lower opacity (5-8%)
- Accent colors darkened ~15% for contrast on light backgrounds
- Cards use white/light surface with accent-colored left border or top accent stripe
- Tab bar uses light background with module accent tint

---

## 6. Phased Rollout

### Phase 1: Foundation + 3 Modules
- Module theme registry (`moduleThemes.ts`)
- `ThemedBackground` component
- `ThemedCard` component
- `useTheme` store extension
- Theme 3 modules: Woodworking, Leather, Resin
- Generate 4 textures (home + 3 modules)
- Verify performance on Android

### Phase 2: Remaining Modules + Dynamic Nav
- Theme remaining 6 modules: Soap, CNC, Knife, Candle, Laser, Printing
- Generate 6 remaining textures
- Dynamic tab bar implementation
- Route-to-module detection

### Phase 3: Polish
- ThemedCard variants (frosted, glass, sharp, etc.)
- Component accent support (CalculatorInput, ResultCard, ActionBar)
- Light mode refinements
- Transition animations
- Performance optimization (texture preloading, caching)

---

## 7. Performance Considerations

- Textures loaded via `require()` — bundled, not fetched at runtime
- `ImageBackground` uses `resizeMode="cover"` for consistent display
- Low opacity overlay means texture compression artifacts are invisible — aggressive WebP compression is fine
- Consider `react-native-fast-image` if default `Image` shows loading flicker
- Test on low-end Android devices for memory impact of 10 loaded textures

---

## 8. Dependencies

- No new npm dependencies required for core implementation
- `react-native-svg` already available if needed for supplementary pattern overlays
- `expo-linear-gradient` already available for card gradient effects
- Optional: `react-native-fast-image` for texture preloading (evaluate in Phase 1)
