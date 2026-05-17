# MakerOS Milestone 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Laser (CO2) and CNC (hobby router) modules with 14 calculators, comprehensive material/tool databases, and full Shop Core integration.

**Architecture:** Module-by-module vertical delivery — Laser end-to-end first, then CNC. Each module follows the M1 domain-driven hybrid pattern: pure calculator engines in `src/modules/<module>/calculators/`, static data in `src/modules/<module>/data/`, UI screens in `app/(tabs)/make/<module>/`. All engines are pure functions with typed Input/Result interfaces. Tests live in `__tests__/modules/<module>/`.

**Tech Stack:** Expo SDK 52+, Expo Router, NativeWind, Zustand, expo-sqlite, Jest, TypeScript

---

## Phase 1: Laser Engines + Data

### Task 1: Database Schema — Laser Materials Table

**Files:**
- Modify: `src/core/database/schema.ts`

- [ ] **Step 1: Add laser_materials table to TABLE_SCHEMAS**

In `src/core/database/schema.ts`, add this entry to the `TABLE_SCHEMAS` object after `wood_species`:

```typescript
laser_materials: `CREATE TABLE IF NOT EXISTS laser_materials (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  material_name TEXT NOT NULL,
  brand TEXT,
  thickness_mm REAL NOT NULL,
  operation TEXT NOT NULL,
  power_pct REAL NOT NULL,
  speed_mms REAL NOT NULL,
  passes INTEGER NOT NULL DEFAULT 1,
  ppi_frequency INTEGER,
  focus_offset_mm REAL DEFAULT 0,
  air_assist INTEGER NOT NULL DEFAULT 1,
  laser_wattage INTEGER NOT NULL,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'built-in',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
```

- [ ] **Step 2: Add indexes to INDEX_SCHEMAS**

Append to the `INDEX_SCHEMAS` array:

```typescript
"CREATE INDEX IF NOT EXISTS idx_laser_materials_category ON laser_materials(category)",
"CREATE INDEX IF NOT EXISTS idx_laser_materials_operation ON laser_materials(operation)",
```

- [ ] **Step 3: Verify schema loads without error**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/core/database/schema.test.ts --verbose`

Expected: existing schema tests pass (the table creation runs at app startup).

- [ ] **Step 4: Commit**

```
git add src/core/database/schema.ts
git commit -m "feat(laser): add laser_materials table schema and indexes"
```

---

### Task 2: Laser Material Database — Static Data

**Files:**
- Create: `src/modules/laser/data/laserMaterials.ts`

- [ ] **Step 1: Create the LaserMaterial type and full dataset**

```typescript
export type LaserCategory = "wood" | "acrylic" | "leather" | "paper" | "fabric" | "rubber" | "glass" | "metal" | "other";
export type LaserOperation = "cut" | "engrave" | "score";
export type LaserSource = "built-in" | "user" | "brand";

export interface LaserMaterial {
  category: LaserCategory;
  materialName: string;
  brand: string | null;
  thicknessMm: number;
  operation: LaserOperation;
  powerPct: number;
  speedMms: number;
  passes: number;
  ppiFrequency: number | null;
  focusOffsetMm: number;
  airAssist: boolean;
  laserWattage: number;
  notes: string | null;
  source: LaserSource;
}

export const laserMaterialsData: LaserMaterial[] = [
  // === WOOD (40W baseline) ===
  // Baltic Birch Plywood 1/8" (3.2mm)
  { category: "wood", materialName: "Baltic Birch Plywood", brand: null, thicknessMm: 3.2, operation: "cut", powerPct: 60, speedMms: 8, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "Clean cut with minimal char. Use masking tape.", source: "built-in" },
  { category: "wood", materialName: "Baltic Birch Plywood", brand: null, thicknessMm: 3.2, operation: "engrave", powerPct: 20, speedMms: 200, passes: 1, ppiFrequency: 340, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: null, source: "built-in" },
  { category: "wood", materialName: "Baltic Birch Plywood", brand: null, thicknessMm: 3.2, operation: "score", powerPct: 10, speedMms: 150, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: null, source: "built-in" },
  // Baltic Birch Plywood 1/4" (6.35mm)
  { category: "wood", materialName: "Baltic Birch Plywood", brand: null, thicknessMm: 6.35, operation: "cut", powerPct: 100, speedMms: 4, passes: 2, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "Two passes recommended. Refocus between passes for cleaner edge.", source: "built-in" },
  { category: "wood", materialName: "Baltic Birch Plywood", brand: null, thicknessMm: 6.35, operation: "engrave", powerPct: 20, speedMms: 200, passes: 1, ppiFrequency: 340, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: null, source: "built-in" },
  // MDF 1/8" (3.2mm)
  { category: "wood", materialName: "MDF", brand: null, thicknessMm: 3.2, operation: "cut", powerPct: 55, speedMms: 10, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "MDF edges darken heavily. Use exhaust.", source: "built-in" },
  { category: "wood", materialName: "MDF", brand: null, thicknessMm: 3.2, operation: "engrave", powerPct: 18, speedMms: 250, passes: 1, ppiFrequency: 340, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: null, source: "built-in" },
  // MDF 1/4" (6.35mm)
  { category: "wood", materialName: "MDF", brand: null, thicknessMm: 6.35, operation: "cut", powerPct: 100, speedMms: 3, passes: 2, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "Heavy charring. Multiple passes with air assist.", source: "built-in" },
  // Basswood 1/16" (1.6mm)
  { category: "wood", materialName: "Basswood", brand: null, thicknessMm: 1.6, operation: "cut", powerPct: 30, speedMms: 15, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "Soft wood, cuts very cleanly.", source: "built-in" },
  { category: "wood", materialName: "Basswood", brand: null, thicknessMm: 1.6, operation: "engrave", powerPct: 12, speedMms: 300, passes: 1, ppiFrequency: 340, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: null, source: "built-in" },
  // Basswood 1/8" (3.2mm)
  { category: "wood", materialName: "Basswood", brand: null, thicknessMm: 3.2, operation: "cut", powerPct: 50, speedMms: 10, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: null, source: "built-in" },
  // Cherry Veneer (0.6mm)
  { category: "wood", materialName: "Cherry Veneer", brand: null, thicknessMm: 0.6, operation: "cut", powerPct: 15, speedMms: 20, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "Use low power to avoid burning through.", source: "built-in" },
  { category: "wood", materialName: "Cherry Veneer", brand: null, thicknessMm: 0.6, operation: "engrave", powerPct: 8, speedMms: 300, passes: 1, ppiFrequency: 300, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: null, source: "built-in" },
  // Walnut Veneer (0.6mm)
  { category: "wood", materialName: "Walnut Veneer", brand: null, thicknessMm: 0.6, operation: "cut", powerPct: 15, speedMms: 20, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: null, source: "built-in" },
  { category: "wood", materialName: "Walnut Veneer", brand: null, thicknessMm: 0.6, operation: "engrave", powerPct: 8, speedMms: 300, passes: 1, ppiFrequency: 300, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: "Subtle contrast on dark wood.", source: "built-in" },
  // Maple Veneer (0.6mm)
  { category: "wood", materialName: "Maple Veneer", brand: null, thicknessMm: 0.6, operation: "cut", powerPct: 15, speedMms: 20, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: null, source: "built-in" },

  // === ACRYLIC ===
  // Cast Clear 1/8" (3.2mm)
  { category: "acrylic", materialName: "Cast Acrylic Clear", brand: null, thicknessMm: 3.2, operation: "cut", powerPct: 60, speedMms: 6, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "Flame-polished edges. Cast only — extruded melts.", source: "built-in" },
  { category: "acrylic", materialName: "Cast Acrylic Clear", brand: null, thicknessMm: 3.2, operation: "engrave", powerPct: 25, speedMms: 250, passes: 1, ppiFrequency: 340, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: "Air assist off for frosted look.", source: "built-in" },
  // Cast Clear 1/4" (6.35mm)
  { category: "acrylic", materialName: "Cast Acrylic Clear", brand: null, thicknessMm: 6.35, operation: "cut", powerPct: 100, speedMms: 3, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "Slow single pass. Check focus depth.", source: "built-in" },
  // Cast Black 1/8" (3.2mm)
  { category: "acrylic", materialName: "Cast Acrylic Black", brand: null, thicknessMm: 3.2, operation: "cut", powerPct: 60, speedMms: 6, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: null, source: "built-in" },
  { category: "acrylic", materialName: "Cast Acrylic Black", brand: null, thicknessMm: 3.2, operation: "engrave", powerPct: 30, speedMms: 200, passes: 1, ppiFrequency: 340, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: "White frost on black — high contrast.", source: "built-in" },
  // Cast Colors 1/8"
  { category: "acrylic", materialName: "Cast Acrylic Colors", brand: null, thicknessMm: 3.2, operation: "cut", powerPct: 60, speedMms: 6, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "Same settings as clear for most colors. Fluorescent may need 10% more power.", source: "built-in" },
  // Extruded Clear 1/8" (cut only)
  { category: "acrylic", materialName: "Extruded Acrylic Clear", brand: null, thicknessMm: 3.2, operation: "cut", powerPct: 55, speedMms: 7, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "WARNING: Do not engrave — extruded acrylic melts instead of vaporizing. Cut edges will not be flame-polished.", source: "built-in" },
  // Mirror Acrylic 1/8"
  { category: "acrylic", materialName: "Mirror Acrylic", brand: null, thicknessMm: 3.2, operation: "cut", powerPct: 65, speedMms: 5, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "Cut from back side. Mirror coating faces down.", source: "built-in" },
  { category: "acrylic", materialName: "Mirror Acrylic", brand: null, thicknessMm: 3.2, operation: "engrave", powerPct: 30, speedMms: 200, passes: 1, ppiFrequency: 340, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: "Engrave from back to remove mirror coating. Creates see-through design.", source: "built-in" },

  // === LEATHER ===
  // Veg-Tan 2-4oz (0.8-1.6mm)
  { category: "leather", materialName: "Veg-Tan Leather 2-4oz", brand: null, thicknessMm: 1.2, operation: "cut", powerPct: 40, speedMms: 12, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "Test on scrap first — thickness varies. Natural leather only.", source: "built-in" },
  { category: "leather", materialName: "Veg-Tan Leather 2-4oz", brand: null, thicknessMm: 1.2, operation: "engrave", powerPct: 15, speedMms: 250, passes: 1, ppiFrequency: 340, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: "Darkens naturally. Lower power = subtler mark.", source: "built-in" },
  // Veg-Tan 5-6oz (2-2.4mm)
  { category: "leather", materialName: "Veg-Tan Leather 5-6oz", brand: null, thicknessMm: 2.2, operation: "cut", powerPct: 60, speedMms: 8, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: null, source: "built-in" },
  { category: "leather", materialName: "Veg-Tan Leather 5-6oz", brand: null, thicknessMm: 2.2, operation: "engrave", powerPct: 18, speedMms: 200, passes: 1, ppiFrequency: 340, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: null, source: "built-in" },
  // Veg-Tan 7-8oz (2.8-3.2mm)
  { category: "leather", materialName: "Veg-Tan Leather 7-8oz", brand: null, thicknessMm: 3.0, operation: "cut", powerPct: 80, speedMms: 5, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "May need 2 passes at lower power for cleaner edge.", source: "built-in" },
  { category: "leather", materialName: "Veg-Tan Leather 7-8oz", brand: null, thicknessMm: 3.0, operation: "engrave", powerPct: 20, speedMms: 180, passes: 1, ppiFrequency: 340, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: null, source: "built-in" },
  // Chrome-Tan (engrave only)
  { category: "leather", materialName: "Chrome-Tan Leather", brand: null, thicknessMm: 1.2, operation: "engrave", powerPct: 12, speedMms: 300, passes: 1, ppiFrequency: 340, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: "WARNING: Do NOT cut chrome-tan — releases toxic chromium fumes. Engrave only with excellent ventilation.", source: "built-in" },

  // === PAPER ===
  { category: "paper", materialName: "Cardstock", brand: null, thicknessMm: 0.3, operation: "cut", powerPct: 10, speedMms: 30, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: "Air assist off — paper blows away.", source: "built-in" },
  { category: "paper", materialName: "Corrugated Cardboard", brand: null, thicknessMm: 3.0, operation: "cut", powerPct: 30, speedMms: 15, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "Watch for flare-ups. Keep moving.", source: "built-in" },
  { category: "paper", materialName: "Chipboard", brand: null, thicknessMm: 1.5, operation: "cut", powerPct: 20, speedMms: 18, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: null, source: "built-in" },
  { category: "paper", materialName: "Matboard", brand: null, thicknessMm: 1.5, operation: "cut", powerPct: 22, speedMms: 15, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "Clean beveled edges for framing.", source: "built-in" },

  // === FABRIC ===
  { category: "fabric", materialName: "Cotton", brand: null, thicknessMm: 0.5, operation: "cut", powerPct: 12, speedMms: 25, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: "Seals edges to prevent fraying. No air assist.", source: "built-in" },
  { category: "fabric", materialName: "Denim", brand: null, thicknessMm: 1.0, operation: "cut", powerPct: 20, speedMms: 18, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: null, source: "built-in" },
  { category: "fabric", materialName: "Denim", brand: null, thicknessMm: 1.0, operation: "engrave", powerPct: 10, speedMms: 300, passes: 1, ppiFrequency: 200, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: "Bleaches the surface for faded look.", source: "built-in" },
  { category: "fabric", materialName: "Felt", brand: null, thicknessMm: 2.0, operation: "cut", powerPct: 18, speedMms: 20, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: "Synthetic felt — acrylic felt melts, use wool or polyester.", source: "built-in" },
  { category: "fabric", materialName: "Canvas", brand: null, thicknessMm: 1.0, operation: "cut", powerPct: 18, speedMms: 20, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: null, source: "built-in" },

  // === RUBBER ===
  { category: "rubber", materialName: "Stamp Rubber", brand: null, thicknessMm: 2.3, operation: "engrave", powerPct: 45, speedMms: 150, passes: 1, ppiFrequency: 340, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "Deep engrave for stamp relief. Mirror the design.", source: "built-in" },
  { category: "rubber", materialName: "Silicone Sheet", brand: null, thicknessMm: 1.5, operation: "cut", powerPct: 35, speedMms: 10, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "Good ventilation required.", source: "built-in" },

  // === GLASS (engrave only) ===
  { category: "glass", materialName: "Soda Lime Glass", brand: null, thicknessMm: 3.0, operation: "engrave", powerPct: 30, speedMms: 150, passes: 1, ppiFrequency: 300, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: "Apply wet newspaper or masking tape to prevent chipping. Results in frosted look.", source: "built-in" },
  { category: "glass", materialName: "Ceramic Tile", brand: null, thicknessMm: 6.0, operation: "engrave", powerPct: 60, speedMms: 100, passes: 1, ppiFrequency: 340, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: "Unglazed tile gives better contrast. Apply black paint for photo engrave.", source: "built-in" },

  // === METAL (engrave only) ===
  { category: "metal", materialName: "Anodized Aluminum", brand: null, thicknessMm: 1.5, operation: "engrave", powerPct: 40, speedMms: 200, passes: 1, ppiFrequency: 340, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: "Removes anodized layer to reveal bare aluminum. White on black/color.", source: "built-in" },
  { category: "metal", materialName: "Cermark-Coated Steel", brand: "Cermark", thicknessMm: 1.0, operation: "engrave", powerPct: 60, speedMms: 100, passes: 1, ppiFrequency: 340, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: "Apply Cermark/Thermark spray. Laser fuses coating to metal. Wash off excess.", source: "built-in" },

  // === PROOFGRADE (Glowforge brand-specific, 45W) ===
  { category: "wood", materialName: "Medium Maple Plywood", brand: "Proofgrade", thicknessMm: 3.2, operation: "cut", powerPct: 100, speedMms: 4.2, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 45, notes: "Glowforge Proofgrade setting.", source: "brand" },
  { category: "wood", materialName: "Medium Maple Plywood", brand: "Proofgrade", thicknessMm: 3.2, operation: "engrave", powerPct: 50, speedMms: 250, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 45, notes: "Graphic engrave setting.", source: "brand" },
  { category: "wood", materialName: "Medium Maple Plywood", brand: "Proofgrade", thicknessMm: 3.2, operation: "score", powerPct: 10, speedMms: 57, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 45, notes: null, source: "brand" },
  { category: "wood", materialName: "Thick Maple Plywood", brand: "Proofgrade", thicknessMm: 5.4, operation: "cut", powerPct: 100, speedMms: 2.5, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 45, notes: "Glowforge Proofgrade setting.", source: "brand" },
  { category: "wood", materialName: "Thin Maple Plywood", brand: "Proofgrade", thicknessMm: 1.6, operation: "cut", powerPct: 58, speedMms: 8.5, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 45, notes: null, source: "brand" },
  { category: "wood", materialName: "Medium Walnut Plywood", brand: "Proofgrade", thicknessMm: 3.2, operation: "cut", powerPct: 100, speedMms: 4.5, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 45, notes: null, source: "brand" },
  { category: "wood", materialName: "Medium Cherry Plywood", brand: "Proofgrade", thicknessMm: 3.2, operation: "cut", powerPct: 100, speedMms: 4.2, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 45, notes: null, source: "brand" },
  { category: "wood", materialName: "Medium Basswood Plywood", brand: "Proofgrade", thicknessMm: 3.2, operation: "cut", powerPct: 100, speedMms: 4.5, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 45, notes: null, source: "brand" },
  { category: "acrylic", materialName: "Medium Clear Acrylic", brand: "Proofgrade", thicknessMm: 3.2, operation: "cut", powerPct: 100, speedMms: 4, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 45, notes: null, source: "brand" },
  { category: "acrylic", materialName: "Medium Clear Acrylic", brand: "Proofgrade", thicknessMm: 3.2, operation: "engrave", powerPct: 60, speedMms: 250, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: false, laserWattage: 45, notes: null, source: "brand" },
  { category: "acrylic", materialName: "Thick Clear Acrylic", brand: "Proofgrade", thicknessMm: 6.35, operation: "cut", powerPct: 100, speedMms: 2, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 45, notes: null, source: "brand" },
  { category: "acrylic", materialName: "Medium Black Acrylic", brand: "Proofgrade", thicknessMm: 3.2, operation: "cut", powerPct: 100, speedMms: 4, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 45, notes: null, source: "brand" },
  { category: "acrylic", materialName: "Medium Black Acrylic", brand: "Proofgrade", thicknessMm: 3.2, operation: "engrave", powerPct: 60, speedMms: 250, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: false, laserWattage: 45, notes: null, source: "brand" },
  { category: "leather", materialName: "Medium Vegetable-Tan Leather", brand: "Proofgrade", thicknessMm: 2.0, operation: "cut", powerPct: 55, speedMms: 8, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 45, notes: null, source: "brand" },
  { category: "leather", materialName: "Medium Vegetable-Tan Leather", brand: "Proofgrade", thicknessMm: 2.0, operation: "engrave", powerPct: 15, speedMms: 250, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: false, laserWattage: 45, notes: null, source: "brand" },
  { category: "wood", materialName: "Medium Draftboard", brand: "Proofgrade", thicknessMm: 3.2, operation: "cut", powerPct: 100, speedMms: 4.5, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 45, notes: "Proofgrade MDF equivalent.", source: "brand" },
  { category: "wood", materialName: "Medium Draftboard", brand: "Proofgrade", thicknessMm: 3.2, operation: "engrave", powerPct: 45, speedMms: 250, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 45, notes: null, source: "brand" },
  // Cork
  { category: "other", materialName: "Cork Sheet", brand: null, thicknessMm: 3.0, operation: "cut", powerPct: 25, speedMms: 15, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "Coasters, trivets. Pleasant smell.", source: "built-in" },
  { category: "other", materialName: "Cork Sheet", brand: null, thicknessMm: 3.0, operation: "engrave", powerPct: 12, speedMms: 250, passes: 1, ppiFrequency: 200, focusOffsetMm: 0, airAssist: false, laserWattage: 40, notes: null, source: "built-in" },
  // EVA Foam
  { category: "other", materialName: "EVA Foam", brand: null, thicknessMm: 2.0, operation: "cut", powerPct: 15, speedMms: 20, passes: 1, ppiFrequency: null, focusOffsetMm: 0, airAssist: true, laserWattage: 40, notes: "Cosplay foam. Good ventilation required.", source: "built-in" },
];
```

- [ ] **Step 2: Verify file compiles**

Run: `cd C:\Users\danlo\MakerApp && npx tsc --noEmit src/modules/laser/data/laserMaterials.ts`

Expected: no errors

- [ ] **Step 3: Commit**

```
git add src/modules/laser/data/laserMaterials.ts
git commit -m "feat(laser): add laser material database with 80+ entries"
```

---

### Task 3: Laser Material Seed Function

**Files:**
- Create: `src/modules/laser/data/seedLaserMaterials.ts`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Create the seed function**

Follow the exact pattern from `src/modules/woodworking/data/seedSpecies.ts`:

```typescript
import { laserMaterialsData } from "./laserMaterials";
import { getDatabase } from "../../../core/database/connection";

export function seedLaserMaterials(): { seeded: boolean; count: number } {
  const db = getDatabase();

  const row = db.getFirstSync("SELECT COUNT(*) as cnt FROM laser_materials") as { cnt: number } | null;
  const count = row?.cnt ?? 0;
  if (count > 0) {
    return { seeded: false, count };
  }

  for (const m of laserMaterialsData) {
    db.runSync(
      `INSERT INTO laser_materials (
        id, category, material_name, brand, thickness_mm, operation,
        power_pct, speed_mms, passes, ppi_frequency, focus_offset_mm,
        air_assist, laser_wattage, notes, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Math.random().toString(36).slice(2) + Date.now().toString(36),
        m.category, m.materialName, m.brand, m.thicknessMm, m.operation,
        m.powerPct, m.speedMms, m.passes, m.ppiFrequency, m.focusOffsetMm,
        m.airAssist ? 1 : 0, m.laserWattage, m.notes, m.source,
      ],
    );
  }

  return { seeded: true, count: laserMaterialsData.length };
}
```

- [ ] **Step 2: Add seed call to app startup**

In `app/_layout.tsx`, add import and call after `seedWoodSpecies()`:

```typescript
import { seedLaserMaterials } from "../src/modules/laser/data/seedLaserMaterials";
```

In the `useEffect`, add after `seedWoodSpecies();`:

```typescript
seedLaserMaterials();
```

- [ ] **Step 3: Commit**

```
git add src/modules/laser/data/seedLaserMaterials.ts app/_layout.tsx
git commit -m "feat(laser): add laser material seed function and startup call"
```

---

### Task 4: Power & Speed Calculator Engine

**Files:**
- Create: `src/modules/laser/calculators/powerSpeed.ts`
- Create: `__tests__/modules/laser/powerSpeed.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
import { calculatePowerSpeed } from "../../../src/modules/laser/calculators/powerSpeed";

describe("Laser Power & Speed Calculator", () => {
  test("returns base settings for 40W laser on known material", () => {
    const result = calculatePowerSpeed({
      powerPctBase: 60,
      speedMmsBase: 8,
      passesBase: 1,
      baseWattage: 40,
      targetWattage: 40,
      thicknessMm: 3.2,
      operation: "cut",
    });
    expect(result.powerPct).toBe(60);
    expect(result.speedMms).toBe(8);
    expect(result.passes).toBe(1);
  });

  test("scales power down for higher wattage laser", () => {
    const result = calculatePowerSpeed({
      powerPctBase: 60,
      speedMmsBase: 8,
      passesBase: 1,
      baseWattage: 40,
      targetWattage: 80,
      thicknessMm: 3.2,
      operation: "cut",
    });
    expect(result.powerPct).toBe(30);
    expect(result.speedMms).toBe(16);
  });

  test("scales power up for lower wattage laser (capped at 100%)", () => {
    const result = calculatePowerSpeed({
      powerPctBase: 60,
      speedMmsBase: 8,
      passesBase: 1,
      baseWattage: 40,
      targetWattage: 20,
      thicknessMm: 3.2,
      operation: "cut",
    });
    expect(result.powerPct).toBe(100);
    expect(result.speedMms).toBe(4);
  });

  test("provides safe ranges", () => {
    const result = calculatePowerSpeed({
      powerPctBase: 60,
      speedMmsBase: 8,
      passesBase: 1,
      baseWattage: 40,
      targetWattage: 40,
      thicknessMm: 3.2,
      operation: "cut",
    });
    expect(result.powerRange.min).toBeLessThan(result.powerPct);
    expect(result.powerRange.max).toBeGreaterThan(result.powerPct);
    expect(result.speedRange.min).toBeLessThan(result.speedMms);
    expect(result.speedRange.max).toBeGreaterThan(result.speedMms);
  });

  test("engrave operation keeps passes at 1", () => {
    const result = calculatePowerSpeed({
      powerPctBase: 20,
      speedMmsBase: 200,
      passesBase: 1,
      baseWattage: 40,
      targetWattage: 40,
      thicknessMm: 3.2,
      operation: "engrave",
    });
    expect(result.passes).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/laser/powerSpeed.test.ts --verbose`

Expected: FAIL — module not found

- [ ] **Step 3: Write the engine**

```typescript
export type LaserOperationType = "cut" | "engrave" | "score";

interface PowerSpeedInput {
  powerPctBase: number;
  speedMmsBase: number;
  passesBase: number;
  baseWattage: number;
  targetWattage: number;
  thicknessMm: number;
  operation: LaserOperationType;
}

interface PowerSpeedResult {
  powerPct: number;
  speedMms: number;
  passes: number;
  powerRange: { min: number; max: number };
  speedRange: { min: number; max: number };
}

export function calculatePowerSpeed(input: PowerSpeedInput): PowerSpeedResult {
  const wattageRatio = input.baseWattage / input.targetWattage;

  let powerPct = Math.round(input.powerPctBase * wattageRatio);
  let speedMms = Math.round((input.speedMmsBase / wattageRatio) * 10) / 10;
  let passes = input.passesBase;

  powerPct = Math.min(100, Math.max(1, powerPct));
  speedMms = Math.max(0.5, speedMms);

  const powerRange = {
    min: Math.max(1, Math.round(powerPct * 0.85)),
    max: Math.min(100, Math.round(powerPct * 1.15)),
  };
  const speedRange = {
    min: Math.round(speedMms * 0.8 * 10) / 10,
    max: Math.round(speedMms * 1.2 * 10) / 10,
  };

  return { powerPct, speedMms, passes, powerRange, speedRange };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/laser/powerSpeed.test.ts --verbose`

Expected: 5 tests pass

- [ ] **Step 5: Commit**

```
git add src/modules/laser/calculators/powerSpeed.ts __tests__/modules/laser/powerSpeed.test.ts
git commit -m "feat(laser): add power & speed calculator engine with tests"
```

---

### Task 5: Kerf Compensation Calculator Engine

**Files:**
- Create: `src/modules/laser/calculators/kerfComp.ts`
- Create: `__tests__/modules/laser/kerfComp.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
import { calculateKerfComp } from "../../../src/modules/laser/calculators/kerfComp";

describe("Kerf Compensation Calculator", () => {
  test("inlay: male shrinks by half-kerf, female grows by half-kerf", () => {
    const result = calculateKerfComp({
      designDimension: 50,
      kerfWidth: 0.2,
      jointType: "inlay",
      affectedEdges: 2,
    });
    expect(result.maleDimension).toBeCloseTo(49.8, 2);
    expect(result.femaleDimension).toBeCloseTo(50.2, 2);
  });

  test("press-fit: male shrinks by full kerf per edge", () => {
    const result = calculateKerfComp({
      designDimension: 25,
      kerfWidth: 0.15,
      jointType: "press-fit",
      affectedEdges: 2,
    });
    expect(result.maleDimension).toBeCloseTo(24.7, 2);
    expect(result.totalOffset).toBeCloseTo(0.3, 2);
  });

  test("box-joint: adjusts by half-kerf per finger edge", () => {
    const result = calculateKerfComp({
      designDimension: 10,
      kerfWidth: 0.2,
      jointType: "box-joint",
      affectedEdges: 2,
    });
    expect(result.maleDimension).toBeCloseTo(9.8, 2);
  });

  test("zero kerf returns original dimension", () => {
    const result = calculateKerfComp({
      designDimension: 50,
      kerfWidth: 0,
      jointType: "inlay",
      affectedEdges: 2,
    });
    expect(result.maleDimension).toBe(50);
    expect(result.femaleDimension).toBe(50);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/laser/kerfComp.test.ts --verbose`

Expected: FAIL

- [ ] **Step 3: Write the engine**

```typescript
export type JointType = "inlay" | "press-fit" | "box-joint";

interface KerfCompInput {
  designDimension: number;
  kerfWidth: number;
  jointType: JointType;
  affectedEdges: number;
}

interface KerfCompResult {
  maleDimension: number;
  femaleDimension: number;
  totalOffset: number;
  jointType: JointType;
}

export function calculateKerfComp(input: KerfCompInput): KerfCompResult {
  const halfKerf = input.kerfWidth / 2;
  let maleOffset: number;
  let femaleOffset: number;

  switch (input.jointType) {
    case "inlay":
      maleOffset = halfKerf * input.affectedEdges;
      femaleOffset = halfKerf * input.affectedEdges;
      break;
    case "press-fit":
      maleOffset = input.kerfWidth * input.affectedEdges;
      femaleOffset = 0;
      break;
    case "box-joint":
      maleOffset = halfKerf * input.affectedEdges;
      femaleOffset = halfKerf * input.affectedEdges;
      break;
  }

  const maleDimension = Math.round((input.designDimension - maleOffset) * 10000) / 10000;
  const femaleDimension = Math.round((input.designDimension + femaleOffset) * 10000) / 10000;
  const totalOffset = Math.round(maleOffset * 10000) / 10000;

  return { maleDimension, femaleDimension, totalOffset, jointType: input.jointType };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/laser/kerfComp.test.ts --verbose`

Expected: 4 tests pass

- [ ] **Step 5: Commit**

```
git add src/modules/laser/calculators/kerfComp.ts __tests__/modules/laser/kerfComp.test.ts
git commit -m "feat(laser): add kerf compensation calculator engine with tests"
```

---

### Task 6: Engrave Time Estimator Engine

**Files:**
- Create: `src/modules/laser/calculators/engraveTime.ts`
- Create: `__tests__/modules/laser/engraveTime.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
import { calculateEngraveTime } from "../../../src/modules/laser/calculators/engraveTime";

describe("Engrave Time Estimator", () => {
  test("calculates bidirectional engrave time", () => {
    const result = calculateEngraveTime({
      widthMm: 100,
      heightMm: 50,
      lpi: 225,
      speedMms: 200,
      bidirectional: true,
    });
    expect(result.lineCount).toBe(443);
    expect(result.totalDistanceMm).toBeCloseTo(44300, -1);
    expect(result.estimatedSeconds).toBeCloseTo(221.5, 0);
  });

  test("unidirectional adds return travel", () => {
    const bidir = calculateEngraveTime({
      widthMm: 100, heightMm: 50, lpi: 225, speedMms: 200, bidirectional: true,
    });
    const unidir = calculateEngraveTime({
      widthMm: 100, heightMm: 50, lpi: 225, speedMms: 200, bidirectional: false,
    });
    expect(unidir.estimatedSeconds).toBeGreaterThan(bidir.estimatedSeconds);
  });

  test("returns formatted time string", () => {
    const result = calculateEngraveTime({
      widthMm: 100, heightMm: 50, lpi: 225, speedMms: 200, bidirectional: true,
    });
    expect(result.formattedTime).toMatch(/^\d+:\d{2}$/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/laser/engraveTime.test.ts --verbose`

Expected: FAIL

- [ ] **Step 3: Write the engine**

```typescript
interface EngraveTimeInput {
  widthMm: number;
  heightMm: number;
  lpi: number;
  speedMms: number;
  bidirectional: boolean;
}

interface EngraveTimeResult {
  lineCount: number;
  totalDistanceMm: number;
  estimatedSeconds: number;
  formattedTime: string;
}

const MAX_RETURN_SPEED_MMS = 500;

export function calculateEngraveTime(input: EngraveTimeInput): EngraveTimeResult {
  const lineCount = Math.ceil(input.heightMm * (input.lpi / 25.4));
  const engraveDistance = lineCount * input.widthMm;
  let totalDistanceMm = engraveDistance;

  if (!input.bidirectional) {
    totalDistanceMm += lineCount * input.widthMm;
  }

  const engraveTime = engraveDistance / input.speedMms;
  const returnTime = input.bidirectional ? 0 : (lineCount * input.widthMm) / MAX_RETURN_SPEED_MMS;
  const estimatedSeconds = Math.round((engraveTime + returnTime) * 10) / 10;

  const mins = Math.floor(estimatedSeconds / 60);
  const secs = Math.round(estimatedSeconds % 60);
  const formattedTime = `${mins}:${secs.toString().padStart(2, "0")}`;

  return { lineCount, totalDistanceMm, estimatedSeconds, formattedTime };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/laser/engraveTime.test.ts --verbose`

Expected: 3 tests pass

- [ ] **Step 5: Commit**

```
git add src/modules/laser/calculators/engraveTime.ts __tests__/modules/laser/engraveTime.test.ts
git commit -m "feat(laser): add engrave time estimator engine with tests"
```

---

### Task 7: Material Cost Calculator Engine

**Files:**
- Create: `src/modules/laser/calculators/materialCost.ts`
- Create: `__tests__/modules/laser/materialCost.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
import { calculateMaterialCost } from "../../../src/modules/laser/calculators/materialCost";

describe("Laser Material Cost Calculator", () => {
  test("calculates pieces per sheet with grid nesting", () => {
    const result = calculateMaterialCost({
      sheetWidthMm: 300,
      sheetHeightMm: 600,
      pieceWidthMm: 100,
      pieceHeightMm: 100,
      quantityNeeded: 10,
      sheetCost: 15,
      kerfWidthMm: 0.2,
    });
    expect(result.piecesPerSheet).toBe(15);
    expect(result.sheetsNeeded).toBe(1);
    expect(result.costPerPiece).toBeCloseTo(1, 1);
  });

  test("tries both orientations and picks better fit", () => {
    const result = calculateMaterialCost({
      sheetWidthMm: 300,
      sheetHeightMm: 600,
      pieceWidthMm: 80,
      pieceHeightMm: 150,
      quantityNeeded: 1,
      sheetCost: 10,
      kerfWidthMm: 0.2,
    });
    expect(result.piecesPerSheet).toBeGreaterThanOrEqual(7);
  });

  test("calculates waste percentage", () => {
    const result = calculateMaterialCost({
      sheetWidthMm: 300,
      sheetHeightMm: 300,
      pieceWidthMm: 100,
      pieceHeightMm: 100,
      quantityNeeded: 9,
      sheetCost: 20,
      kerfWidthMm: 0,
    });
    expect(result.wastePct).toBeCloseTo(0, 0);
  });

  test("handles pieces larger than sheet", () => {
    const result = calculateMaterialCost({
      sheetWidthMm: 100,
      sheetHeightMm: 100,
      pieceWidthMm: 200,
      pieceHeightMm: 200,
      quantityNeeded: 1,
      sheetCost: 10,
      kerfWidthMm: 0,
    });
    expect(result.piecesPerSheet).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/laser/materialCost.test.ts --verbose`

Expected: FAIL

- [ ] **Step 3: Write the engine**

```typescript
interface MaterialCostInput {
  sheetWidthMm: number;
  sheetHeightMm: number;
  pieceWidthMm: number;
  pieceHeightMm: number;
  quantityNeeded: number;
  sheetCost: number;
  kerfWidthMm: number;
}

interface MaterialCostResult {
  piecesPerSheet: number;
  sheetsNeeded: number;
  costPerPiece: number;
  wastePct: number;
  totalCost: number;
}

function gridFit(sheetW: number, sheetH: number, pieceW: number, pieceH: number, kerf: number): number {
  const cols = Math.floor((sheetW + kerf) / (pieceW + kerf));
  const rows = Math.floor((sheetH + kerf) / (pieceH + kerf));
  return cols * rows;
}

export function calculateMaterialCost(input: MaterialCostInput): MaterialCostResult {
  const k = input.kerfWidthMm;

  const fitNormal = gridFit(input.sheetWidthMm, input.sheetHeightMm, input.pieceWidthMm, input.pieceHeightMm, k);
  const fitRotated = gridFit(input.sheetWidthMm, input.sheetHeightMm, input.pieceHeightMm, input.pieceWidthMm, k);
  const piecesPerSheet = Math.max(fitNormal, fitRotated);

  if (piecesPerSheet === 0) {
    return { piecesPerSheet: 0, sheetsNeeded: 0, costPerPiece: 0, wastePct: 100, totalCost: 0 };
  }

  const sheetsNeeded = Math.ceil(input.quantityNeeded / piecesPerSheet);
  const totalCost = Math.round(sheetsNeeded * input.sheetCost * 100) / 100;
  const costPerPiece = Math.round((totalCost / input.quantityNeeded) * 100) / 100;

  const sheetArea = input.sheetWidthMm * input.sheetHeightMm;
  const usedArea = input.quantityNeeded * input.pieceWidthMm * input.pieceHeightMm;
  const totalSheetArea = sheetsNeeded * sheetArea;
  const wastePct = Math.round(((totalSheetArea - usedArea) / totalSheetArea) * 1000) / 10;

  return { piecesPerSheet, sheetsNeeded, costPerPiece, wastePct, totalCost };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/laser/materialCost.test.ts --verbose`

Expected: 4 tests pass

- [ ] **Step 5: Commit**

```
git add src/modules/laser/calculators/materialCost.ts __tests__/modules/laser/materialCost.test.ts
git commit -m "feat(laser): add material cost calculator engine with tests"
```

---

### Task 8: Focus Offset Calculator Engine

**Files:**
- Create: `src/modules/laser/calculators/focusOffset.ts`
- Create: `__tests__/modules/laser/focusOffset.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
import { calculateFocusOffset } from "../../../src/modules/laser/calculators/focusOffset";

describe("Focus Offset Calculator", () => {
  test("cut: focus at material midpoint", () => {
    const result = calculateFocusOffset({
      thicknessMm: 6,
      focalLengthMm: 50.8,
      operation: "cut",
    });
    expect(result.zOffsetMm).toBe(-3);
    expect(result.description).toContain("below surface");
  });

  test("engrave: focus on surface", () => {
    const result = calculateFocusOffset({
      thicknessMm: 6,
      focalLengthMm: 50.8,
      operation: "engrave",
    });
    expect(result.zOffsetMm).toBe(0);
  });

  test("defocused engrave: focus above surface", () => {
    const result = calculateFocusOffset({
      thicknessMm: 3,
      focalLengthMm: 50.8,
      operation: "defocused-engrave",
      defocusAmountMm: 2,
    });
    expect(result.zOffsetMm).toBe(2);
    expect(result.description).toContain("above surface");
  });

  test("defaults focal length to 50.8mm (2\" lens)", () => {
    const result = calculateFocusOffset({
      thicknessMm: 6,
      operation: "cut",
    });
    expect(result.focalLengthMm).toBe(50.8);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/laser/focusOffset.test.ts --verbose`

Expected: FAIL

- [ ] **Step 3: Write the engine**

```typescript
export type FocusOperation = "cut" | "engrave" | "defocused-engrave";

interface FocusOffsetInput {
  thicknessMm: number;
  focalLengthMm?: number;
  operation: FocusOperation;
  defocusAmountMm?: number;
}

interface FocusOffsetResult {
  zOffsetMm: number;
  focalLengthMm: number;
  description: string;
}

export function calculateFocusOffset(input: FocusOffsetInput): FocusOffsetResult {
  const focalLengthMm = input.focalLengthMm ?? 50.8;
  let zOffsetMm: number;
  let description: string;

  switch (input.operation) {
    case "cut":
      zOffsetMm = -(input.thicknessMm / 2);
      description = `Focus ${Math.abs(zOffsetMm)}mm below surface (material midpoint)`;
      break;
    case "engrave":
      zOffsetMm = 0;
      description = "Focus on material surface";
      break;
    case "defocused-engrave": {
      const amount = input.defocusAmountMm ?? 1;
      zOffsetMm = amount;
      description = `Focus ${amount}mm above surface for wider, softer engrave line`;
      break;
    }
  }

  return {
    zOffsetMm: Math.round(zOffsetMm * 100) / 100,
    focalLengthMm,
    description,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/laser/focusOffset.test.ts --verbose`

Expected: 4 tests pass

- [ ] **Step 5: Commit**

```
git add src/modules/laser/calculators/focusOffset.ts __tests__/modules/laser/focusOffset.test.ts
git commit -m "feat(laser): add focus offset calculator engine with tests"
```

---

### Task 9: Ramp/Power Gradient Calculator Engine

**Files:**
- Create: `src/modules/laser/calculators/rampGradient.ts`
- Create: `__tests__/modules/laser/rampGradient.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
import { calculateRampGradient } from "../../../src/modules/laser/calculators/rampGradient";

describe("Ramp/Power Gradient Calculator", () => {
  test("linear gradient from 10% to 90% over 100mm", () => {
    const result = calculateRampGradient({
      startPowerPct: 10,
      endPowerPct: 90,
      lengthMm: 100,
      steps: 5,
    });
    expect(result.steps).toHaveLength(5);
    expect(result.steps[0].powerPct).toBe(18);
    expect(result.steps[4].powerPct).toBe(82);
  });

  test("single step returns midpoint power", () => {
    const result = calculateRampGradient({
      startPowerPct: 20,
      endPowerPct: 80,
      lengthMm: 50,
      steps: 1,
    });
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].powerPct).toBe(50);
  });

  test("reversed gradient (high to low)", () => {
    const result = calculateRampGradient({
      startPowerPct: 80,
      endPowerPct: 20,
      lengthMm: 100,
      steps: 3,
    });
    expect(result.steps[0].powerPct).toBeGreaterThan(result.steps[2].powerPct);
  });

  test("step positions span the full length", () => {
    const result = calculateRampGradient({
      startPowerPct: 10,
      endPowerPct: 90,
      lengthMm: 200,
      steps: 4,
    });
    expect(result.steps[0].positionMm).toBe(25);
    expect(result.steps[3].positionMm).toBe(175);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/laser/rampGradient.test.ts --verbose`

Expected: FAIL

- [ ] **Step 3: Write the engine**

```typescript
interface RampGradientInput {
  startPowerPct: number;
  endPowerPct: number;
  lengthMm: number;
  steps: number;
}

interface GradientStep {
  stepIndex: number;
  positionMm: number;
  powerPct: number;
}

interface RampGradientResult {
  steps: GradientStep[];
  totalLengthMm: number;
}

export function calculateRampGradient(input: RampGradientInput): RampGradientResult {
  const segmentLength = input.lengthMm / input.steps;
  const steps: GradientStep[] = [];

  for (let i = 0; i < input.steps; i++) {
    const segmentStart = i * segmentLength;
    const segmentEnd = (i + 1) * segmentLength;
    const midpoint = (segmentStart + segmentEnd) / 2;
    const t = midpoint / input.lengthMm;
    const powerPct = Math.round(input.startPowerPct + (input.endPowerPct - input.startPowerPct) * t);

    steps.push({
      stepIndex: i,
      positionMm: Math.round(midpoint * 10) / 10,
      powerPct: Math.min(100, Math.max(1, powerPct)),
    });
  }

  return { steps, totalLengthMm: input.lengthMm };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/laser/rampGradient.test.ts --verbose`

Expected: 4 tests pass

- [ ] **Step 5: Commit**

```
git add src/modules/laser/calculators/rampGradient.ts __tests__/modules/laser/rampGradient.test.ts
git commit -m "feat(laser): add ramp/power gradient calculator engine with tests"
```

- [ ] **Step 6: Run full laser test suite**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/laser/ --verbose`

Expected: All 20 tests across 5 files pass

- [ ] **Step 7: Commit phase checkpoint**

```
git add -A
git commit -m "milestone: Phase 1 complete — all 6 laser engines + data with 20+ tests"
```

---

## Phase 2: Laser UI Screens

### Task 10: Laser Stack Layout + Hub Screen

**Files:**
- Create: `app/(tabs)/make/laser/_layout.tsx`
- Create: `app/(tabs)/make/laser/index.tsx`

- [ ] **Step 1: Create the Laser Stack layout**

Follow the exact pattern from `app/(tabs)/make/woodworking/_layout.tsx`:

```typescript
import { Stack } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function LaserLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="power-speed" options={{ title: "Power & Speed" }} />
      <Stack.Screen name="kerf-comp" options={{ title: "Kerf Compensation" }} />
      <Stack.Screen name="engrave-time" options={{ title: "Engrave Time" }} />
      <Stack.Screen name="material-cost" options={{ title: "Material Cost" }} />
      <Stack.Screen name="focus-offset" options={{ title: "Focus Offset" }} />
      <Stack.Screen name="ramp-gradient" options={{ title: "Ramp/Gradient" }} />
      <Stack.Screen name="materials-db" options={{ title: "Material Database" }} />
    </Stack>
  );
}
```

- [ ] **Step 2: Create the Laser hub screen**

Follow the pattern from `app/(tabs)/make/woodworking/index.tsx`:

```typescript
import { View, Text, Pressable, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const CALCULATORS = [
  { name: "Power & Speed", route: "/make/laser/power-speed" },
  { name: "Kerf Compensation", route: "/make/laser/kerf-comp" },
  { name: "Engrave Time", route: "/make/laser/engrave-time" },
  { name: "Material Cost", route: "/make/laser/material-cost" },
  { name: "Focus Offset", route: "/make/laser/focus-offset" },
  { name: "Ramp/Gradient", route: "/make/laser/ramp-gradient" },
  { name: "Material Database", route: "/make/laser/materials-db" },
];

export default function LaserHome() {
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

- [ ] **Step 3: Commit**

```
git add app/(tabs)/make/laser/_layout.tsx app/(tabs)/make/laser/index.tsx
git commit -m "feat(laser): add Stack layout and hub screen"
```

---

### Task 11: Power & Speed Screen

**Files:**
- Create: `app/(tabs)/make/laser/power-speed.tsx`

- [ ] **Step 1: Create the Power & Speed calculator screen**

Follow the board-foot screen pattern. Inputs: material name (text), thickness, operation (FilterBar: cut/engrave/score), laser wattage (FilterBar: 40/60/80/100), base power, base speed. Outputs via ResultCard.

```typescript
import { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, Text, View, Alert } from "react-native";
import { calculatePowerSpeed } from "../../../../src/modules/laser/calculators/powerSpeed";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const OPERATION_OPTIONS = [
  { label: "Cut", value: "cut" },
  { label: "Engrave", value: "engrave" },
  { label: "Score", value: "score" },
];

const WATTAGE_OPTIONS = [
  { label: "40W", value: "40" },
  { label: "60W", value: "60" },
  { label: "80W", value: "80" },
  { label: "100W", value: "100" },
];

export default function PowerSpeedScreen() {
  const { colors } = useTheme();
  const [basePower, setBasePower] = useState("");
  const [baseSpeed, setBaseSpeed] = useState("");
  const [thickness, setThickness] = useState("");
  const [operation, setOperation] = useState("cut");
  const [baseWattage] = useState("40");
  const [targetWattage, setTargetWattage] = useState("40");

  const results = useMemo(() => {
    const p = parseFloat(basePower);
    const s = parseFloat(baseSpeed);
    const t = parseFloat(thickness);
    if (!p || !s || !t || p <= 0 || s <= 0 || t <= 0) return null;

    return calculatePowerSpeed({
      powerPctBase: p,
      speedMmsBase: s,
      passesBase: 1,
      baseWattage: parseInt(baseWattage),
      targetWattage: parseInt(targetWattage),
      thicknessMm: t,
      operation: operation as "cut" | "engrave" | "score",
    });
  }, [basePower, baseSpeed, thickness, operation, baseWattage, targetWattage]);

  const resultItems = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Power", value: results.powerPct.toString(), unit: "%", highlight: true },
      { label: "Speed", value: results.speedMms.toString(), unit: "mm/s" },
      { label: "Passes", value: results.passes.toString() },
      { label: "Power range", value: `${results.powerRange.min}–${results.powerRange.max}`, unit: "%" },
      { label: "Speed range", value: `${results.speedRange.min}–${results.speedRange.max}`, unit: "mm/s" },
    ];
  }, [results]);

  const handleSave = () => {
    if (!results) return;
    try {
      CalculatorService.save({
        module: "laser",
        calculatorType: "power-speed",
        inputsJson: { basePower, baseSpeed, thickness, operation, baseWattage, targetWattage },
        outputsJson: results,
        label: `${operation} @ ${results.powerPct}% / ${results.speedMms}mm/s`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch { Alert.alert("Error", "Failed to save."); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-[13px] uppercase tracking-wider mb-2" style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}>
          Operation
        </Text>
        <FilterBar options={OPERATION_OPTIONS} selected={operation} onSelect={setOperation} />

        <Text className="text-[13px] uppercase tracking-wider mb-2 mt-4" style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}>
          Your Laser Wattage
        </Text>
        <FilterBar options={WATTAGE_OPTIONS} selected={targetWattage} onSelect={setTargetWattage} />

        <CalculatorInput label="Material Thickness" value={thickness} onChangeText={setThickness} unit="mm" placeholder="3.2" />
        <CalculatorInput label="Base Power (40W ref)" value={basePower} onChangeText={setBasePower} unit="%" placeholder="60" />
        <CalculatorInput label="Base Speed (40W ref)" value={baseSpeed} onChangeText={setBaseSpeed} unit="mm/s" placeholder="8" />

        {results && <ResultCard title="Recommended Settings" results={resultItems} />}

        {results && (
          <ActionBar
            onSave={handleSave}
            onAddToQuote={() => Alert.alert("Coming Soon", "Quote integration coming soon.")}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```
git add app/(tabs)/make/laser/power-speed.tsx
git commit -m "feat(laser): add power & speed calculator screen"
```

---

### Task 12: Remaining Laser Calculator Screens

**Files:**
- Create: `app/(tabs)/make/laser/kerf-comp.tsx`
- Create: `app/(tabs)/make/laser/engrave-time.tsx`
- Create: `app/(tabs)/make/laser/material-cost.tsx`
- Create: `app/(tabs)/make/laser/focus-offset.tsx`
- Create: `app/(tabs)/make/laser/ramp-gradient.tsx`

Each screen follows the identical pattern from Task 11: useState for inputs, useMemo for calculation, ResultCard for output, ActionBar with save. The implementation agent should create each screen matching the engine's Input interface to form fields and the Result interface to ResultCard items.

**Per-screen guidance:**

**kerf-comp.tsx:** FilterBar for joint type (inlay/press-fit/box-joint). CalculatorInput for design dimension, kerf width, affected edges. ResultCard shows male dimension, female dimension, total offset.

**engrave-time.tsx:** CalculatorInput for width, height, LPI, speed. FilterBar for bidirectional (yes/no). ResultCard shows formatted time, line count, total distance.

**material-cost.tsx:** CalculatorInput for sheet width, sheet height, piece width, piece height, quantity, sheet cost, kerf width. ResultCard shows pieces per sheet, sheets needed, cost per piece, waste %, total cost.

**focus-offset.tsx:** FilterBar for operation (cut/engrave/defocused-engrave). CalculatorInput for thickness, focal length (default 50.8). If defocused, show defocus amount input. ResultCard shows Z-offset and description.

**ramp-gradient.tsx:** CalculatorInput for start power, end power, ramp length, number of steps. ResultCard shows each step with position and power percentage.

- [ ] **Step 1: Create all 5 screens following the patterns above**

- [ ] **Step 2: Commit**

```
git add app/(tabs)/make/laser/kerf-comp.tsx app/(tabs)/make/laser/engrave-time.tsx app/(tabs)/make/laser/material-cost.tsx app/(tabs)/make/laser/focus-offset.tsx app/(tabs)/make/laser/ramp-gradient.tsx
git commit -m "feat(laser): add 5 remaining laser calculator screens"
```

---

### Task 13: Laser Material Database Screen

**Files:**
- Create: `app/(tabs)/make/laser/materials-db.tsx`

- [ ] **Step 1: Create the material database browser**

Follow the species-db screen pattern from woodworking. Uses a FlatList with search + category FilterBar + wattage FilterBar. Reads from `laser_materials` table via `getDatabase().getAllSync()`.

```typescript
import { useState, useMemo, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, TextInput } from "react-native";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { EmptyState } from "../../../../src/design-system/components/EmptyState";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { getDatabase } from "../../../../src/core/database/connection";

const CATEGORY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Wood", value: "wood" },
  { label: "Acrylic", value: "acrylic" },
  { label: "Leather", value: "leather" },
  { label: "Paper", value: "paper" },
  { label: "Fabric", value: "fabric" },
  { label: "Glass", value: "glass" },
  { label: "Metal", value: "metal" },
  { label: "Other", value: "other" },
];

interface MaterialRow {
  id: string;
  category: string;
  material_name: string;
  brand: string | null;
  thickness_mm: number;
  operation: string;
  power_pct: number;
  speed_mms: number;
  passes: number;
  laser_wattage: number;
  notes: string | null;
}

export default function LaserMaterialsDBScreen() {
  const { colors } = useTheme();
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const db = getDatabase();
    const rows = db.getAllSync("SELECT * FROM laser_materials ORDER BY category, material_name, thickness_mm") as MaterialRow[];
    setMaterials(rows);
  }, []);

  const filtered = useMemo(() => {
    let result = materials;
    if (category !== "all") result = result.filter((m) => m.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.material_name.toLowerCase().includes(q) || (m.brand && m.brand.toLowerCase().includes(q)));
    }
    return result;
  }, [materials, category, search]);

  const renderItem = ({ item }: { item: MaterialRow }) => (
    <View
      className="rounded-xl p-4 mb-3"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-[15px] flex-1" style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }} numberOfLines={1}>
          {item.material_name}{item.brand ? ` (${item.brand})` : ""}
        </Text>
        <Text className="text-[12px] rounded px-2 py-0.5" style={{ fontFamily: "Inter_500Medium", color: colors.primary, backgroundColor: colors.surfaceElevated }}>
          {item.operation}
        </Text>
      </View>
      <Text className="text-[13px] mt-1" style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}>
        {item.power_pct}% / {item.speed_mms}mm/s / {item.passes} pass{item.passes > 1 ? "es" : ""}
      </Text>
      <Text className="text-[12px] mt-1" style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}>
        {item.thickness_mm}mm • {item.laser_wattage}W • {item.category}
      </Text>
      {item.notes && (
        <Text className="text-[11px] mt-1 italic" style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}>
          {item.notes}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 p-4">
        <View className="rounded-lg px-4 py-3 mb-3" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
          <TextInput
            className="text-[16px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}
            value={search}
            onChangeText={setSearch}
            placeholder="Search materials..."
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <FilterBar options={CATEGORY_OPTIONS} selected={category} onSelect={setCategory} />
        {filtered.length === 0 ? (
          <EmptyState title="No materials found" description="Try adjusting your search or filters" />
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            className="mt-3"
          />
        )}
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```
git add app/(tabs)/make/laser/materials-db.tsx
git commit -m "feat(laser): add material database browser screen"
```

- [ ] **Step 3: Run TypeScript check**

Run: `cd C:\Users\danlo\MakerApp && npx tsc --noEmit`

Expected: zero errors

- [ ] **Step 4: Commit phase checkpoint**

```
git add -A
git commit -m "milestone: Phase 2 complete — all 8 laser UI screens navigable"
```

---

## Phase 3: CNC Engines + Data

### Task 14: Database Schema — CNC Tables

**Files:**
- Modify: `src/core/database/schema.ts`

- [ ] **Step 1: Add 3 CNC tables to TABLE_SCHEMAS**

```typescript
cnc_materials: `CREATE TABLE IF NOT EXISTS cnc_materials (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  material_name TEXT NOT NULL,
  sfm_low REAL NOT NULL,
  sfm_high REAL NOT NULL,
  chipload_json TEXT NOT NULL,
  max_doc_pct REAL NOT NULL,
  coolant TEXT NOT NULL DEFAULT 'none',
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'built-in',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
cnc_tools: `CREATE TABLE IF NOT EXISTS cnc_tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tool_type TEXT NOT NULL,
  cut_direction TEXT,
  diameter_in REAL NOT NULL,
  shank_diameter_in REAL,
  flutes INTEGER NOT NULL,
  tool_material TEXT NOT NULL,
  max_doc_in REAL,
  vbit_angle REAL,
  tip_width_in REAL,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'built-in',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
cnc_tool_usage: `CREATE TABLE IF NOT EXISTS cnc_tool_usage (
  id TEXT PRIMARY KEY,
  tool_id TEXT NOT NULL,
  project_id TEXT,
  minutes_used REAL NOT NULL,
  notes TEXT,
  logged_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
```

- [ ] **Step 2: Add CNC indexes**

```typescript
"CREATE INDEX IF NOT EXISTS idx_cnc_materials_category ON cnc_materials(category)",
"CREATE INDEX IF NOT EXISTS idx_cnc_tools_type ON cnc_tools(tool_type)",
"CREATE INDEX IF NOT EXISTS idx_cnc_tool_usage_tool ON cnc_tool_usage(tool_id)",
```

- [ ] **Step 3: Commit**

```
git add src/core/database/schema.ts
git commit -m "feat(cnc): add cnc_materials, cnc_tools, cnc_tool_usage table schemas"
```

---

### Task 15: CNC Material + Tool Databases and Seed

**Files:**
- Create: `src/modules/cnc/data/cncMaterials.ts`
- Create: `src/modules/cnc/data/cncTools.ts`
- Create: `src/modules/cnc/data/seedCncData.ts`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Create CNC materials data file**

Define `CncMaterial` interface and `cncMaterialsData` array with ~30 entries. Each entry has: category, materialName, sfmLow, sfmHigh, chiploadJson (object keyed by diameter string), maxDocPct, coolant, notes, source.

The `chiploadJson` uses this format per material:
```typescript
export interface ChiploadRange { low: number; high: number }
export interface CncMaterial {
  category: string;
  materialName: string;
  sfmLow: number;
  sfmHigh: number;
  chiploadMap: Record<string, ChiploadRange>;
  maxDocPct: number;
  coolant: "none" | "air" | "mist";
  notes: string | null;
  source: "built-in" | "user";
}
```

Include all materials from the spec: Pine (sfm 600-1000), Cedar (500-800), Spruce (600-1000), Poplar (600-900), Balsa (800-1200), Red Oak (400-700), White Oak (400-700), Hard Maple (350-600), Walnut (500-800), Cherry (500-800), Mahogany (400-700), Ash (500-800), Birch (400-700), Baltic Birch Ply (400-700), MDF (400-800), HDF (400-800), Particleboard (500-900), Melamine (400-700), HDPE (400-800), Delrin (500-1000), Polycarbonate (400-800), Acrylic Cast (300-600), PVC Foam Sintra (500-1000), UHMW (400-800), Nylon (400-600), 6061-T6 Aluminum (200-400), Cast Aluminum (150-300), Carbon Fiber (200-400), G10/FR4 (200-400), Corian (400-800).

- [ ] **Step 2: Create CNC tools data file**

Define `CncTool` interface and `cncToolsData` array with ~25 entries matching the spec.

```typescript
export interface CncTool {
  name: string;
  toolType: "endmill" | "vbit" | "ballnose" | "surfacing" | "drill";
  cutDirection: "upcut" | "downcut" | "compression" | null;
  diameterIn: number;
  shankDiameterIn: number | null;
  flutes: number;
  toolMaterial: "hss" | "carbide" | "coated_carbide";
  maxDocIn: number | null;
  vbitAngle: number | null;
  tipWidthIn: number | null;
  notes: string | null;
  source: "built-in" | "user";
}
```

- [ ] **Step 3: Create seed function**

```typescript
import { cncMaterialsData } from "./cncMaterials";
import { cncToolsData } from "./cncTools";
import { getDatabase } from "../../../core/database/connection";

export function seedCncData(): { materialCount: number; toolCount: number } {
  const db = getDatabase();

  let materialCount = 0;
  const matRow = db.getFirstSync("SELECT COUNT(*) as cnt FROM cnc_materials") as { cnt: number } | null;
  if ((matRow?.cnt ?? 0) === 0) {
    for (const m of cncMaterialsData) {
      db.runSync(
        `INSERT INTO cnc_materials (id, category, material_name, sfm_low, sfm_high, chipload_json, max_doc_pct, coolant, notes, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Math.random().toString(36).slice(2) + Date.now().toString(36),
          m.category, m.materialName, m.sfmLow, m.sfmHigh,
          JSON.stringify(m.chiploadMap), m.maxDocPct, m.coolant, m.notes, m.source,
        ],
      );
    }
    materialCount = cncMaterialsData.length;
  }

  let toolCount = 0;
  const toolRow = db.getFirstSync("SELECT COUNT(*) as cnt FROM cnc_tools") as { cnt: number } | null;
  if ((toolRow?.cnt ?? 0) === 0) {
    for (const t of cncToolsData) {
      db.runSync(
        `INSERT INTO cnc_tools (id, name, tool_type, cut_direction, diameter_in, shank_diameter_in, flutes, tool_material, max_doc_in, vbit_angle, tip_width_in, notes, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Math.random().toString(36).slice(2) + Date.now().toString(36),
          t.name, t.toolType, t.cutDirection, t.diameterIn, t.shankDiameterIn,
          t.flutes, t.toolMaterial, t.maxDocIn, t.vbitAngle, t.tipWidthIn, t.notes, t.source,
        ],
      );
    }
    toolCount = cncToolsData.length;
  }

  return { materialCount, toolCount };
}
```

- [ ] **Step 4: Add seed call to `app/_layout.tsx`**

Import and call `seedCncData()` after `seedLaserMaterials()` in the startup useEffect.

- [ ] **Step 5: Commit**

```
git add src/modules/cnc/data/cncMaterials.ts src/modules/cnc/data/cncTools.ts src/modules/cnc/data/seedCncData.ts app/_layout.tsx
git commit -m "feat(cnc): add CNC material/tool databases with seed function"
```

---

### Task 16: Feeds & Speeds Calculator Engine

**Files:**
- Create: `src/modules/cnc/calculators/feedsAndSpeeds.ts`
- Create: `__tests__/modules/cnc/feedsAndSpeeds.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
import { calculateFeedsAndSpeeds } from "../../../src/modules/cnc/calculators/feedsAndSpeeds";

describe("CNC Feeds & Speeds Calculator", () => {
  test("calculates RPM from SFM and tool diameter", () => {
    const result = calculateFeedsAndSpeeds({
      sfm: 600,
      toolDiameterIn: 0.25,
      flutes: 2,
      chipload: 0.003,
      operationType: "profile",
      routerMinRpm: 10000,
      routerMaxRpm: 30000,
    });
    expect(result.rpm).toBeCloseTo(9168, -1);
    expect(result.rpmClamped).toBe(10000);
  });

  test("calculates feed rate from RPM, chipload, flutes", () => {
    const result = calculateFeedsAndSpeeds({
      sfm: 600,
      toolDiameterIn: 0.25,
      flutes: 2,
      chipload: 0.004,
      operationType: "profile",
      routerMinRpm: 10000,
      routerMaxRpm: 30000,
    });
    expect(result.feedRateIpm).toBeGreaterThan(0);
  });

  test("WOC for pocket is 40% of tool diameter", () => {
    const result = calculateFeedsAndSpeeds({
      sfm: 600,
      toolDiameterIn: 0.25,
      flutes: 2,
      chipload: 0.003,
      operationType: "pocket",
      routerMinRpm: 10000,
      routerMaxRpm: 30000,
    });
    expect(result.wocIn).toBeCloseTo(0.1, 2);
  });

  test("provides math steps for show-math toggle", () => {
    const result = calculateFeedsAndSpeeds({
      sfm: 600,
      toolDiameterIn: 0.25,
      flutes: 2,
      chipload: 0.003,
      operationType: "profile",
      routerMinRpm: 10000,
      routerMaxRpm: 30000,
    });
    expect(result.mathSteps).toHaveLength(4);
    expect(result.mathSteps[0].label).toContain("SFM");
  });

  test("warns when calculated RPM below router minimum", () => {
    const result = calculateFeedsAndSpeeds({
      sfm: 200,
      toolDiameterIn: 0.5,
      flutes: 2,
      chipload: 0.003,
      operationType: "profile",
      routerMinRpm: 10000,
      routerMaxRpm: 30000,
    });
    expect(result.warning).toBeTruthy();
  });

  test("plunge rate defaults to 50% of feed rate", () => {
    const result = calculateFeedsAndSpeeds({
      sfm: 600,
      toolDiameterIn: 0.25,
      flutes: 2,
      chipload: 0.003,
      operationType: "profile",
      routerMinRpm: 10000,
      routerMaxRpm: 30000,
    });
    expect(result.plungeRateIpm).toBeCloseTo(result.feedRateIpm * 0.5, 1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/cnc/feedsAndSpeeds.test.ts --verbose`

Expected: FAIL

- [ ] **Step 3: Write the engine**

```typescript
export type CncOperationType = "profile" | "pocket" | "slot" | "drill";

interface FeedsAndSpeedsInput {
  sfm: number;
  toolDiameterIn: number;
  flutes: number;
  chipload: number;
  operationType: CncOperationType;
  routerMinRpm: number;
  routerMaxRpm: number;
  docOverrideIn?: number;
  maxDocPct?: number;
}

interface MathStep {
  label: string;
  formula: string;
  result: string;
}

interface FeedsAndSpeedsResult {
  rpm: number;
  rpmClamped: number;
  feedRateIpm: number;
  plungeRateIpm: number;
  docIn: number;
  wocIn: number;
  warning: string | null;
  mathSteps: MathStep[];
}

export function calculateFeedsAndSpeeds(input: FeedsAndSpeedsInput): FeedsAndSpeedsResult {
  const rpm = Math.round((input.sfm * 3.82) / input.toolDiameterIn);
  let warning: string | null = null;

  let rpmClamped = rpm;
  if (rpm < input.routerMinRpm) {
    rpmClamped = input.routerMinRpm;
    warning = `Calculated RPM (${rpm}) is below router minimum (${input.routerMinRpm}). Running at minimum RPM — reduce feed rate or use a smaller tool.`;
  } else if (rpm > input.routerMaxRpm) {
    rpmClamped = input.routerMaxRpm;
  }

  const feedRateIpm = Math.round(rpmClamped * input.chipload * input.flutes * 10) / 10;
  const plungeRateIpm = Math.round(feedRateIpm * 0.5 * 10) / 10;

  const maxDocPct = input.maxDocPct ?? 1.0;
  const docIn = input.docOverrideIn ?? Math.round(input.toolDiameterIn * maxDocPct * 1000) / 1000;

  let wocIn: number;
  switch (input.operationType) {
    case "pocket":
      wocIn = Math.round(input.toolDiameterIn * 0.4 * 1000) / 1000;
      break;
    case "slot":
    case "profile":
    default:
      wocIn = input.toolDiameterIn;
      break;
  }

  const mathSteps: MathStep[] = [
    { label: "SFM to RPM", formula: `(${input.sfm} × 3.82) / ${input.toolDiameterIn}"`, result: `${rpm} RPM` },
    { label: "Clamped RPM", formula: `clamp(${rpm}, ${input.routerMinRpm}, ${input.routerMaxRpm})`, result: `${rpmClamped} RPM` },
    { label: "Feed Rate", formula: `${rpmClamped} RPM × ${input.chipload}" chipload × ${input.flutes} flutes`, result: `${feedRateIpm} in/min` },
    { label: "Plunge Rate", formula: `${feedRateIpm} × 0.5`, result: `${plungeRateIpm} in/min` },
  ];

  return { rpm, rpmClamped, feedRateIpm, plungeRateIpm, docIn, wocIn, warning, mathSteps };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/cnc/feedsAndSpeeds.test.ts --verbose`

Expected: 6 tests pass

- [ ] **Step 5: Commit**

```
git add src/modules/cnc/calculators/feedsAndSpeeds.ts __tests__/modules/cnc/feedsAndSpeeds.test.ts
git commit -m "feat(cnc): add feeds & speeds calculator engine with show-math steps"
```

---

### Task 17: Stepover Calculator Engine

**Files:**
- Create: `src/modules/cnc/calculators/stepover.ts`
- Create: `__tests__/modules/cnc/stepover.test.ts`

- [ ] **Step 1: Write test file**

```typescript
import { calculateStepover } from "../../../src/modules/cnc/calculators/stepover";

describe("CNC Stepover Calculator", () => {
  test("roughing: 40% stepover", () => {
    const result = calculateStepover({ toolDiameterIn: 0.25, operationType: "roughing" });
    expect(result.stepoverPct).toBe(40);
    expect(result.stepoverIn).toBeCloseTo(0.1, 3);
  });

  test("finishing: 10% stepover", () => {
    const result = calculateStepover({ toolDiameterIn: 0.25, operationType: "finishing" });
    expect(result.stepoverPct).toBe(10);
  });

  test("3D finishing: calculates from scallop height", () => {
    const result = calculateStepover({ toolDiameterIn: 0.25, operationType: "3d-finishing", scallopHeightIn: 0.001 });
    expect(result.stepoverIn).toBeGreaterThan(0);
    expect(result.scallopHeightIn).toBeCloseTo(0.001, 4);
  });

  test("surface quality rating", () => {
    const rough = calculateStepover({ toolDiameterIn: 0.25, operationType: "roughing" });
    const fine = calculateStepover({ toolDiameterIn: 0.25, operationType: "finishing" });
    expect(rough.finishQuality).toBe("rough");
    expect(fine.finishQuality).toBe("fine");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/cnc/stepover.test.ts --verbose`

Expected: FAIL

- [ ] **Step 3: Write the engine**

```typescript
export type StepoverOperation = "roughing" | "finishing" | "3d-finishing";
export type FinishQuality = "rough" | "medium" | "fine" | "mirror";

interface StepoverInput {
  toolDiameterIn: number;
  operationType: StepoverOperation;
  scallopHeightIn?: number;
}

interface StepoverResult {
  stepoverPct: number;
  stepoverIn: number;
  scallopHeightIn: number | null;
  finishQuality: FinishQuality;
}

export function calculateStepover(input: StepoverInput): StepoverResult {
  const radius = input.toolDiameterIn / 2;

  switch (input.operationType) {
    case "roughing": {
      const stepoverPct = 40;
      const stepoverIn = Math.round(input.toolDiameterIn * 0.4 * 1000) / 1000;
      return { stepoverPct, stepoverIn, scallopHeightIn: null, finishQuality: "rough" };
    }
    case "finishing": {
      const stepoverPct = 10;
      const stepoverIn = Math.round(input.toolDiameterIn * 0.1 * 1000) / 1000;
      return { stepoverPct, stepoverIn, scallopHeightIn: null, finishQuality: "fine" };
    }
    case "3d-finishing": {
      const h = input.scallopHeightIn ?? 0.001;
      const stepoverIn = Math.round(Math.sqrt(8 * h * radius - 4 * h * h) * 10000) / 10000;
      const stepoverPct = Math.round((stepoverIn / input.toolDiameterIn) * 1000) / 10;
      return { stepoverPct, stepoverIn, scallopHeightIn: h, finishQuality: stepoverPct < 8 ? "mirror" : "fine" };
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/cnc/stepover.test.ts --verbose`

Expected: 4 tests pass

- [ ] **Step 5: Commit**

```
git add src/modules/cnc/calculators/stepover.ts __tests__/modules/cnc/stepover.test.ts
git commit -m "feat(cnc): add stepover calculator engine with tests"
```

---

### Task 18: Depth-of-Cut Planner Engine

**Files:**
- Create: `src/modules/cnc/calculators/depthOfCut.ts`
- Create: `__tests__/modules/cnc/depthOfCut.test.ts`

- [ ] **Step 1: Write test file**

```typescript
import { calculateDepthOfCut } from "../../../src/modules/cnc/calculators/depthOfCut";

describe("CNC Depth-of-Cut Planner", () => {
  test("calculates correct number of roughing passes", () => {
    const result = calculateDepthOfCut({
      totalDepthIn: 0.5,
      roughingDocIn: 0.125,
      finishingPass: false,
    });
    expect(result.totalPasses).toBe(4);
    expect(result.passSchedule).toHaveLength(4);
  });

  test("includes finishing pass when enabled", () => {
    const result = calculateDepthOfCut({
      totalDepthIn: 0.5,
      roughingDocIn: 0.125,
      finishingPass: true,
      finishingDocIn: 0.02,
    });
    expect(result.finishingPassDepth).toBeCloseTo(0.02, 3);
    expect(result.passSchedule[result.passSchedule.length - 1].type).toBe("finishing");
  });

  test("last roughing pass adjusts to hit exact depth", () => {
    const result = calculateDepthOfCut({
      totalDepthIn: 0.3,
      roughingDocIn: 0.125,
      finishingPass: false,
    });
    const depths = result.passSchedule.map((p) => p.depthIn);
    const total = depths.reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(0.3, 4);
  });

  test("estimates total time when feed rate provided", () => {
    const result = calculateDepthOfCut({
      totalDepthIn: 0.5,
      roughingDocIn: 0.125,
      finishingPass: false,
      feedRateIpm: 60,
      cutLengthIn: 10,
    });
    expect(result.estimatedMinutes).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/cnc/depthOfCut.test.ts --verbose`

Expected: FAIL

- [ ] **Step 3: Write the engine**

```typescript
interface DepthOfCutInput {
  totalDepthIn: number;
  roughingDocIn: number;
  finishingPass: boolean;
  finishingDocIn?: number;
  feedRateIpm?: number;
  cutLengthIn?: number;
}

interface PassEntry {
  passNumber: number;
  depthIn: number;
  cumulativeDepthIn: number;
  type: "roughing" | "finishing";
}

interface DepthOfCutResult {
  totalPasses: number;
  roughingPasses: number;
  finishingPassDepth: number | null;
  passSchedule: PassEntry[];
  estimatedMinutes: number | null;
}

export function calculateDepthOfCut(input: DepthOfCutInput): DepthOfCutResult {
  const finishDoc = input.finishingPass ? (input.finishingDocIn ?? 0.02) : 0;
  const roughingDepth = input.totalDepthIn - finishDoc;

  const fullPasses = Math.floor(roughingDepth / input.roughingDocIn);
  const remainder = Math.round((roughingDepth - fullPasses * input.roughingDocIn) * 10000) / 10000;

  const passSchedule: PassEntry[] = [];
  let cumulative = 0;
  let passNum = 1;

  for (let i = 0; i < fullPasses; i++) {
    cumulative = Math.round((cumulative + input.roughingDocIn) * 10000) / 10000;
    passSchedule.push({ passNumber: passNum++, depthIn: input.roughingDocIn, cumulativeDepthIn: cumulative, type: "roughing" });
  }

  if (remainder > 0.0001) {
    cumulative = Math.round((cumulative + remainder) * 10000) / 10000;
    passSchedule.push({ passNumber: passNum++, depthIn: Math.round(remainder * 10000) / 10000, cumulativeDepthIn: cumulative, type: "roughing" });
  }

  if (input.finishingPass && finishDoc > 0) {
    cumulative = Math.round((cumulative + finishDoc) * 10000) / 10000;
    passSchedule.push({ passNumber: passNum++, depthIn: finishDoc, cumulativeDepthIn: cumulative, type: "finishing" });
  }

  let estimatedMinutes: number | null = null;
  if (input.feedRateIpm && input.cutLengthIn) {
    const timePerPass = input.cutLengthIn / input.feedRateIpm;
    estimatedMinutes = Math.round(timePerPass * passSchedule.length * 100) / 100;
  }

  return {
    totalPasses: passSchedule.length,
    roughingPasses: passSchedule.filter((p) => p.type === "roughing").length,
    finishingPassDepth: input.finishingPass ? finishDoc : null,
    passSchedule,
    estimatedMinutes,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/cnc/depthOfCut.test.ts --verbose`

Expected: 4 tests pass

- [ ] **Step 5: Commit**

```
git add src/modules/cnc/calculators/depthOfCut.ts __tests__/modules/cnc/depthOfCut.test.ts
git commit -m "feat(cnc): add depth-of-cut planner engine with tests"
```

---

### Task 19: V-Carve Calculator Engine

**Files:**
- Create: `src/modules/cnc/calculators/vCarve.ts`
- Create: `__tests__/modules/cnc/vCarve.test.ts`

- [ ] **Step 1: Write test file**

```typescript
import { calculateVCarve } from "../../../src/modules/cnc/calculators/vCarve";

describe("CNC V-Carve Calculator", () => {
  test("90° V-bit: depth equals half the width", () => {
    const result = calculateVCarve({ vbitAngleDeg: 90, desiredWidthIn: 0.25 });
    expect(result.requiredDepthIn).toBeCloseTo(0.125, 3);
  });

  test("60° V-bit: depth is wider for same width", () => {
    const result = calculateVCarve({ vbitAngleDeg: 60, desiredWidthIn: 0.25 });
    expect(result.requiredDepthIn).toBeGreaterThan(0.125);
  });

  test("respects max depth limit", () => {
    const result = calculateVCarve({ vbitAngleDeg: 90, desiredWidthIn: 0.5, maxDepthIn: 0.1 });
    expect(result.requiredDepthIn).toBe(0.1);
    expect(result.actualWidthIn).toBeLessThan(0.5);
    expect(result.depthLimited).toBe(true);
  });

  test("flat-bottom V-bit calculates effective width", () => {
    const result = calculateVCarve({ vbitAngleDeg: 90, desiredWidthIn: 0.25, tipWidthIn: 0.01 });
    expect(result.requiredDepthIn).toBeLessThan(0.125);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/cnc/vCarve.test.ts --verbose`

Expected: FAIL

- [ ] **Step 3: Write the engine**

```typescript
interface VCarveInput {
  vbitAngleDeg: number;
  desiredWidthIn: number;
  maxDepthIn?: number;
  tipWidthIn?: number;
}

interface VCarveResult {
  requiredDepthIn: number;
  actualWidthIn: number;
  depthLimited: boolean;
  tipWidthIn: number;
}

export function calculateVCarve(input: VCarveInput): VCarveResult {
  const halfAngleRad = ((input.vbitAngleDeg / 2) * Math.PI) / 180;
  const tipWidth = input.tipWidthIn ?? 0;
  const cuttingWidth = input.desiredWidthIn - tipWidth;

  let depth = (cuttingWidth / 2) / Math.tan(halfAngleRad);
  let depthLimited = false;
  let actualWidthIn = input.desiredWidthIn;

  if (input.maxDepthIn != null && depth > input.maxDepthIn) {
    depth = input.maxDepthIn;
    depthLimited = true;
    actualWidthIn = Math.round((tipWidth + 2 * depth * Math.tan(halfAngleRad)) * 10000) / 10000;
  }

  return {
    requiredDepthIn: Math.round(depth * 10000) / 10000,
    actualWidthIn,
    depthLimited,
    tipWidthIn: tipWidth,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/cnc/vCarve.test.ts --verbose`

Expected: 4 tests pass

- [ ] **Step 5: Commit**

```
git add src/modules/cnc/calculators/vCarve.ts __tests__/modules/cnc/vCarve.test.ts
git commit -m "feat(cnc): add V-carve calculator engine with tests"
```

---

### Task 20: Spoilboard Surfacing Calculator Engine

**Files:**
- Create: `src/modules/cnc/calculators/spoilboardSurfacing.ts`
- Create: `__tests__/modules/cnc/spoilboardSurfacing.test.ts`

- [ ] **Step 1: Write test file**

```typescript
import { calculateSpoilboardSurfacing } from "../../../src/modules/cnc/calculators/spoilboardSurfacing";

describe("CNC Spoilboard Surfacing Calculator", () => {
  test("calculates passes per layer", () => {
    const result = calculateSpoilboardSurfacing({
      bedXIn: 32, bedYIn: 32, bitDiameterIn: 1.5, stepoverPct: 40, feedRateIpm: 100, docPerPassIn: 0.01, totalSkimIn: 0.02,
    });
    expect(result.passesPerLayer).toBeGreaterThan(0);
  });

  test("calculates total layers from skim depth / DOC", () => {
    const result = calculateSpoilboardSurfacing({
      bedXIn: 16, bedYIn: 16, bitDiameterIn: 1, stepoverPct: 50, feedRateIpm: 80, docPerPassIn: 0.01, totalSkimIn: 0.03,
    });
    expect(result.layers).toBe(3);
  });

  test("estimates total time", () => {
    const result = calculateSpoilboardSurfacing({
      bedXIn: 32, bedYIn: 32, bitDiameterIn: 1.5, stepoverPct: 40, feedRateIpm: 100, docPerPassIn: 0.02, totalSkimIn: 0.02,
    });
    expect(result.estimatedMinutes).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/cnc/spoilboardSurfacing.test.ts --verbose`

Expected: FAIL

- [ ] **Step 3: Write the engine**

```typescript
interface SpoilboardInput {
  bedXIn: number;
  bedYIn: number;
  bitDiameterIn: number;
  stepoverPct: number;
  feedRateIpm: number;
  docPerPassIn: number;
  totalSkimIn: number;
}

interface SpoilboardResult {
  passesPerLayer: number;
  layers: number;
  totalPasses: number;
  totalDistanceIn: number;
  estimatedMinutes: number;
}

export function calculateSpoilboardSurfacing(input: SpoilboardInput): SpoilboardResult {
  const stepoverIn = input.bitDiameterIn * (input.stepoverPct / 100);
  const passesPerLayer = Math.ceil(input.bedYIn / stepoverIn);
  const layers = Math.ceil(input.totalSkimIn / input.docPerPassIn);
  const totalPasses = passesPerLayer * layers;
  const totalDistanceIn = Math.round(totalPasses * input.bedXIn * 10) / 10;
  const estimatedMinutes = Math.round((totalDistanceIn / input.feedRateIpm) * 100) / 100;

  return { passesPerLayer, layers, totalPasses, totalDistanceIn, estimatedMinutes };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/cnc/spoilboardSurfacing.test.ts --verbose`

Expected: 3 tests pass

- [ ] **Step 5: Commit**

```
git add src/modules/cnc/calculators/spoilboardSurfacing.ts __tests__/modules/cnc/spoilboardSurfacing.test.ts
git commit -m "feat(cnc): add spoilboard surfacing calculator engine with tests"
```

---

### Task 21: Tram Check Calculator Engine

**Files:**
- Create: `src/modules/cnc/calculators/tramCheck.ts`
- Create: `__tests__/modules/cnc/tramCheck.test.ts`

- [ ] **Step 1: Write test file**

```typescript
import { calculateTramCheck } from "../../../src/modules/cnc/calculators/tramCheck";

describe("CNC Tram Check Calculator", () => {
  test("perfectly trammed spindle returns zero adjustment", () => {
    const result = calculateTramCheck({ front: 0, back: 0, left: 0, right: 0 });
    expect(result.frontBackTiltThou).toBe(0);
    expect(result.leftRightTiltThou).toBe(0);
    expect(result.inTram).toBe(true);
  });

  test("detects front-back tilt", () => {
    const result = calculateTramCheck({ front: 0.002, back: -0.002, left: 0, right: 0 });
    expect(result.frontBackTiltThou).toBeCloseTo(2, 1);
    expect(result.frontBackDirection).toBe("front-high");
  });

  test("detects left-right tilt", () => {
    const result = calculateTramCheck({ front: 0, back: 0, left: 0.003, right: -0.003 });
    expect(result.leftRightTiltThou).toBeCloseTo(3, 1);
    expect(result.leftRightDirection).toBe("left-high");
  });

  test("provides adjustment instructions", () => {
    const result = calculateTramCheck({ front: 0.001, back: -0.001, left: 0.002, right: -0.002 });
    expect(result.instructions).toContain("Lower");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/cnc/tramCheck.test.ts --verbose`

Expected: FAIL

- [ ] **Step 3: Write the engine**

```typescript
interface TramCheckInput {
  front: number;
  back: number;
  left: number;
  right: number;
}

interface TramCheckResult {
  frontBackTiltThou: number;
  leftRightTiltThou: number;
  frontBackDirection: "front-high" | "back-high" | "level";
  leftRightDirection: "left-high" | "right-high" | "level";
  inTram: boolean;
  instructions: string;
}

export function calculateTramCheck(input: TramCheckInput): TramCheckResult {
  const fbDiff = (input.front - input.back) / 2;
  const lrDiff = (input.left - input.right) / 2;

  const frontBackTiltThou = Math.round(Math.abs(fbDiff) * 1000 * 10) / 10;
  const leftRightTiltThou = Math.round(Math.abs(lrDiff) * 1000 * 10) / 10;

  const threshold = 0.2;
  const frontBackDirection: TramCheckResult["frontBackDirection"] =
    frontBackTiltThou < threshold ? "level" : fbDiff > 0 ? "front-high" : "back-high";
  const leftRightDirection: TramCheckResult["leftRightDirection"] =
    leftRightTiltThou < threshold ? "level" : lrDiff > 0 ? "left-high" : "right-high";

  const inTram = frontBackTiltThou < threshold && leftRightTiltThou < threshold;

  const parts: string[] = [];
  if (frontBackDirection === "front-high") parts.push(`Lower front by ${frontBackTiltThou} thou`);
  if (frontBackDirection === "back-high") parts.push(`Lower back by ${frontBackTiltThou} thou`);
  if (leftRightDirection === "left-high") parts.push(`Lower left by ${leftRightTiltThou} thou`);
  if (leftRightDirection === "right-high") parts.push(`Lower right by ${leftRightTiltThou} thou`);

  const instructions = inTram ? "Spindle is in tram — no adjustment needed" : parts.join(". ") + ".";

  return { frontBackTiltThou, leftRightTiltThou, frontBackDirection, leftRightDirection, inTram, instructions };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/cnc/tramCheck.test.ts --verbose`

Expected: 4 tests pass

- [ ] **Step 5: Run full CNC test suite**

Run: `cd C:\Users\danlo\MakerApp && npx jest __tests__/modules/cnc/ --verbose`

Expected: All 21 tests across 6 files pass

- [ ] **Step 6: Commit phase checkpoint**

```
git add -A
git commit -m "milestone: Phase 3 complete — all 6 CNC engines + data with 21+ tests"
```

---

## Phase 4: CNC UI Screens

### Task 22: ShowMath Shared Component

**Files:**
- Create: `src/design-system/components/ShowMath.tsx`

- [ ] **Step 1: Create the ShowMath component**

```typescript
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from "react-native-reanimated";
import { useTheme } from "../hooks/useTheme";

interface MathStep {
  label: string;
  formula: string;
  result: string;
}

interface ShowMathProps {
  steps: MathStep[];
}

export function ShowMath({ steps }: ShowMathProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const height = useSharedValue(0);

  const toggle = () => {
    setExpanded(!expanded);
    height.value = withTiming(expanded ? 0 : 1, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    maxHeight: height.value * (steps.length * 60 + 20),
    opacity: height.value,
    overflow: "hidden" as const,
  }));

  return (
    <View className="mt-3">
      <Pressable onPress={toggle}>
        <Text className="text-[13px]" style={{ fontFamily: "Inter_500Medium", color: colors.primary }}>
          {expanded ? "Hide math" : "Show math"}
        </Text>
      </Pressable>
      <Animated.View style={animatedStyle}>
        <View className="rounded-lg p-3 mt-2" style={{ backgroundColor: colors.surfaceElevated }}>
          {steps.map((step, i) => (
            <View key={i} className={i > 0 ? "mt-3" : ""}>
              <Text className="text-[11px] uppercase tracking-wider" style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}>
                {step.label}
              </Text>
              <Text className="text-[13px] mt-0.5" style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textSecondary }}>
                {step.formula}
              </Text>
              <Text className="text-[14px]" style={{ fontFamily: "JetBrainsMono_700Bold", color: colors.textPrimary }}>
                = {step.result}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```
git add src/design-system/components/ShowMath.tsx
git commit -m "feat: add ShowMath collapsible formula disclosure component"
```

---

### Task 23: CNC Stack Layout + Hub Screen

**Files:**
- Create: `app/(tabs)/make/cnc/_layout.tsx`
- Create: `app/(tabs)/make/cnc/index.tsx`

- [ ] **Step 1: Create the CNC Stack layout**

Same pattern as Laser layout (Task 10):

```typescript
import { Stack } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

export default function CncLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="feeds-speeds" options={{ title: "Feeds & Speeds" }} />
      <Stack.Screen name="stepover" options={{ title: "Stepover" }} />
      <Stack.Screen name="depth-of-cut" options={{ title: "Depth of Cut" }} />
      <Stack.Screen name="v-carve" options={{ title: "V-Carve" }} />
      <Stack.Screen name="spoilboard" options={{ title: "Spoilboard" }} />
      <Stack.Screen name="tram-check" options={{ title: "Tram Check" }} />
      <Stack.Screen name="tool-library" options={{ title: "Tool Library" }} />
    </Stack>
  );
}
```

- [ ] **Step 2: Create the CNC hub screen**

```typescript
import { View, Text, Pressable, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const CALCULATORS = [
  { name: "Feeds & Speeds", route: "/make/cnc/feeds-speeds" },
  { name: "Stepover", route: "/make/cnc/stepover" },
  { name: "Depth of Cut", route: "/make/cnc/depth-of-cut" },
  { name: "V-Carve", route: "/make/cnc/v-carve" },
  { name: "Spoilboard", route: "/make/cnc/spoilboard" },
  { name: "Tram Check", route: "/make/cnc/tram-check" },
  { name: "Tool Library", route: "/make/cnc/tool-library" },
];

export default function CncHome() {
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

- [ ] **Step 3: Commit**

```
git add app/(tabs)/make/cnc/_layout.tsx app/(tabs)/make/cnc/index.tsx
git commit -m "feat(cnc): add Stack layout and hub screen"
```

---

### Task 24: CNC Calculator Screens

**Files:**
- Create: `app/(tabs)/make/cnc/feeds-speeds.tsx`
- Create: `app/(tabs)/make/cnc/stepover.tsx`
- Create: `app/(tabs)/make/cnc/depth-of-cut.tsx`
- Create: `app/(tabs)/make/cnc/v-carve.tsx`
- Create: `app/(tabs)/make/cnc/spoilboard.tsx`
- Create: `app/(tabs)/make/cnc/tram-check.tsx`

Each screen follows the same pattern from Phase 2 laser screens. The implementation agent should create each screen matching the engine's Input interface to form fields and the Result interface to ResultCard items.

**Per-screen guidance:**

**feeds-speeds.tsx:** CalculatorInput for SFM, tool diameter, flutes, chipload. FilterBar for operation (profile/pocket/slot/drill). CalculatorInput for router min/max RPM (defaults 10000/30000). ResultCard shows RPM, feed rate, plunge rate, DOC, WOC. Include `<ShowMath steps={results.mathSteps} />` below the ResultCard. Show warning text if `results.warning` is set.

**stepover.tsx:** CalculatorInput for tool diameter. FilterBar for operation (roughing/finishing/3D finishing). If 3D finishing selected, show scallop height input. ResultCard shows stepover %, stepover distance, scallop height (if applicable), finish quality.

**depth-of-cut.tsx:** CalculatorInput for total depth, roughing DOC. Switch for finishing pass — if on, show finishing DOC input. Optional: feed rate and cut length for time estimate. ResultCard shows total passes, roughing passes, then a pass schedule list.

**v-carve.tsx:** FilterBar for V-bit angle (60/90/120). CalculatorInput for desired width, optional max depth, optional tip width (flat-bottom). ResultCard shows required depth, actual width, depth-limited flag.

**spoilboard.tsx:** CalculatorInput for bed X, bed Y, bit diameter, stepover %, feed rate, DOC per pass, total skim depth. ResultCard shows passes per layer, layers, total passes, distance, estimated time.

**tram-check.tsx:** CalculatorInput for 4 indicator readings (front, back, left, right). ResultCard shows front-back tilt, left-right tilt, in-tram status, adjustment instructions.

- [ ] **Step 1: Create all 6 CNC calculator screens following the patterns above**

- [ ] **Step 2: Commit**

```
git add app/(tabs)/make/cnc/feeds-speeds.tsx app/(tabs)/make/cnc/stepover.tsx app/(tabs)/make/cnc/depth-of-cut.tsx app/(tabs)/make/cnc/v-carve.tsx app/(tabs)/make/cnc/spoilboard.tsx app/(tabs)/make/cnc/tram-check.tsx
git commit -m "feat(cnc): add 6 CNC calculator screens with ShowMath integration"
```

---

### Task 25: CNC Tool Library Screen

**Files:**
- Create: `app/(tabs)/make/cnc/tool-library.tsx`

- [ ] **Step 1: Create the tool library browser**

Follow the laser materials-db pattern. FlatList with search + tool type FilterBar. Reads from `cnc_tools` table. Shows tool name, type badge, diameter, flutes, material, cut direction.

The implementation agent should follow the exact same FlatList + search + FilterBar pattern from Task 13 (laser materials-db), but querying `cnc_tools` table instead and displaying tool-specific fields.

FilterBar options: All, End Mill, V-Bit, Ball Nose, Surfacing, Drill.

- [ ] **Step 2: Commit**

```
git add app/(tabs)/make/cnc/tool-library.tsx
git commit -m "feat(cnc): add tool library browser screen"
```

- [ ] **Step 3: Run TypeScript check**

Run: `cd C:\Users\danlo\MakerApp && npx tsc --noEmit`

Expected: zero errors

- [ ] **Step 4: Commit phase checkpoint**

```
git add -A
git commit -m "milestone: Phase 4 complete — all 8 CNC UI screens with ShowMath"
```

---

## Phase 5: Integration & Polish

### Task 26: Job Costing Helpers

**Files:**
- Modify: `src/core/services/QuoteService.ts`

- [ ] **Step 1: Add time-based line item helper**

Add this method to the `QuoteService` object in `src/core/services/QuoteService.ts`:

```typescript
addTimeBasedLineItem(quoteId: string, description: string, estimatedMinutes: number, hourlyRate: number): LineItem {
  const hours = estimatedMinutes / 60;
  const lineTotal = Math.round(hours * hourlyRate * 100) / 100;
  return this.addLineItem(quoteId, {
    description,
    category: "labor",
    quantity: 1,
    unitPrice: lineTotal,
    lineTotal,
    taxable: true,
    sortOrder: 0,
  });
},
```

- [ ] **Step 2: Commit**

```
git add src/core/services/QuoteService.ts
git commit -m "feat: add time-based job costing helper to QuoteService"
```

---

### Task 27: Full Test Suite Run + TypeScript Check

**Files:** None — verification only

- [ ] **Step 1: Run all tests**

Run: `cd C:\Users\danlo\MakerApp && npx jest --verbose`

Expected: All existing + new tests pass (86+ M1 tests + ~41 new M2 tests = 127+ total)

- [ ] **Step 2: Run TypeScript check**

Run: `cd C:\Users\danlo\MakerApp && npx tsc --noEmit`

Expected: zero errors

- [ ] **Step 3: Fix any issues found**

If any tests fail or type errors exist, fix them.

- [ ] **Step 4: Final commit and push**

```
git add -A
git commit -m "milestone: M2 complete — Laser + CNC modules with 14 calculators, material databases, full Shop Core integration"
git push origin main
```
