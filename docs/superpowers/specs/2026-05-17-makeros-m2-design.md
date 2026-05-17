# MakerOS — Milestone 2 Design Spec

**Date:** 2026-05-17
**Scope:** Laser Module + CNC Module
**Repository:** https://github.com/dlopez2392/MakerApp
**Prerequisite:** M1 complete (Foundation + Shop Core + Woodworking + Utilities)

---

## 1. Milestone Overview

M2 adds two new maker modules — Laser (CO2 focus) and CNC (hobby/prosumer routers) — each with 7 calculators/tools, comprehensive material databases, and full Shop Core integration. Both modules follow the established domain-driven hybrid architecture from M1.

### Delivery Order

Module-by-module vertical: Laser end-to-end first, then CNC. Each module is independently testable and shippable before the next begins.

### Success Criteria

- All 14 calculators produce correct results with test coverage
- Material databases seeded with full catalogs (80+ laser entries, 30+ CNC materials, 25+ CNC tools)
- Both modules navigable from Make tab top bar
- Full Shop Core integration (save to history, link to projects, inventory tracking)
- Zero TypeScript errors

---

## 2. Laser Module

### 2.1 Calculators (6 engines + 1 database)

#### Power & Speed Calculator
- **Input:** Material (from DB or manual), thickness (mm), operation (cut/engrave/score), laser wattage (40/60/80/100W)
- **Output:** Power %, speed (mm/s), passes, PPI/frequency, with min/max safe ranges
- **Logic:** Look up base settings from material DB, scale linearly for wattage differences, adjust passes for thickness beyond single-pass capacity
- **Edge cases:** Engrave-only materials (glass, metal) reject cut operation; extruded acrylic warns against engraving

#### Kerf Compensation Calculator
- **Input:** Design dimension (mm), measured kerf width (mm), joint type (inlay/press-fit/box-joint), number of kerf-affected edges
- **Output:** Adjusted cut dimension, total kerf offset applied, visual diagram showing original vs adjusted
- **Logic:** Inlay: subtract half-kerf from male, add half-kerf to female. Press-fit: subtract full kerf from male. Box-joint: subtract half-kerf per finger.

#### Engrave Time Estimator
- **Input:** Engrave area width × height (mm), LPI (lines per inch), speed (mm/s), bidirectional (yes/no)
- **Output:** Estimated engrave time (min:sec), total travel distance, line count
- **Logic:** lines = height_mm × (LPI / 25.4). Time = (lines × width_mm) / speed_mms. If bidirectional, no return-travel penalty; if unidirectional, add return time at max speed.

#### Material Cost Calculator
- **Input:** Sheet size (W × H mm), piece dimensions (w × h mm), quantity needed, sheet cost ($), kerf width (mm)
- **Output:** Pieces per sheet, sheets needed, cost per piece, waste %, total cost
- **Logic:** Simple grid nesting with kerf gap between pieces. pieces_per_sheet = floor((W + kerf) / (w + kerf)) × floor((H + kerf) / (h + kerf)). Try both orientations, pick the better fit.

#### Focus Offset Calculator
- **Input:** Material thickness (mm), lens focal length (mm, default 50.8 for 2" lens), operation type (cut/engrave/defocused-engrave)
- **Output:** Z-offset from material surface, focus point depth description
- **Logic:** Cut: focus at material midpoint (thickness / 2 below surface). Engrave: focus on surface (offset = 0). Defocused engrave: focus above surface by user-specified amount for wider/softer lines.

#### Ramp/Power Gradient Calculator
- **Input:** Start power %, end power %, ramp length (mm), material, number of steps (for stepped gradient)
- **Output:** Power at each step position, visual gradient preview, estimated depth variation
- **Logic:** Linear interpolation: power_at_position = start + (end - start) × (position / length). For stepped: divide into N equal segments, assign averaged power per segment.

#### Material Database (browse/search, not a calculator engine)
- Displays the full laser material catalog with search, category filtering, and wattage filtering
- Users can add custom entries that persist in SQLite
- Each entry shows all operation settings (cut/engrave/score) for that material at that thickness

### 2.2 Laser Material Database Schema

**Table: `laser_materials`**

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | Generated ID |
| category | TEXT NOT NULL | wood, acrylic, leather, paper, fabric, rubber, glass, metal, other |
| material_name | TEXT NOT NULL | e.g. "Baltic Birch Plywood" |
| brand | TEXT | e.g. "Proofgrade", null for generic |
| thickness_mm | REAL NOT NULL | Material thickness |
| operation | TEXT NOT NULL | cut, engrave, score |
| power_pct | REAL NOT NULL | Power percentage (0-100) |
| speed_mms | REAL NOT NULL | Speed in mm/s |
| passes | INTEGER NOT NULL DEFAULT 1 | Number of passes |
| ppi_frequency | INTEGER | Pulses per inch (null if N/A) |
| focus_offset_mm | REAL DEFAULT 0 | Z-offset from surface |
| air_assist | INTEGER NOT NULL DEFAULT 1 | 1 = on, 0 = off |
| laser_wattage | INTEGER NOT NULL | Reference wattage (40/60/80/100) |
| notes | TEXT | Tips, warnings |
| source | TEXT NOT NULL DEFAULT 'built-in' | built-in, user, brand |
| created_at | TEXT NOT NULL DEFAULT (datetime('now')) | |

**Unique constraint:** (material_name, brand, thickness_mm, operation, laser_wattage, source)

**Catalog scope (~80+ entries):**

| Category | Entries |
|----------|---------|
| Wood | Baltic birch ply (1/8", 1/4"), MDF (1/8", 1/4"), basswood (1/16", 1/8"), cherry, walnut, maple veneers |
| Acrylic | Cast clear (1/8", 1/4"), cast black, cast colors, extruded clear (cut only), mirror acrylic |
| Leather | Veg-tan 2-4oz, 5-6oz, 7-8oz; chrome-tan (engrave only) |
| Paper | Cardstock, corrugated cardboard, chipboard, matboard |
| Fabric | Cotton, denim, felt, canvas |
| Rubber | Stamp rubber, silicone sheet |
| Glass | Soda lime (engrave only), ceramic tile (engrave only) |
| Metal | Anodized aluminum (engrave only), Cermark-coated steel (engrave only) |
| Proofgrade | Medium Maple Ply, Thick Maple Ply, Medium Acrylic, Thick Acrylic, Medium Leather, Thin Plywood (~15 entries with exact Glowforge settings) |

All base settings calibrated for 40W CO2 laser. Power & Speed calculator scales for other wattages.

### 2.3 Laser UI Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Laser Hub | `make/laser/index.tsx` | Calculator grid (same pattern as Woodworking hub) |
| Power & Speed | `make/laser/power-speed.tsx` | Material picker + inputs → settings output |
| Kerf Compensation | `make/laser/kerf-comp.tsx` | Dimension + kerf inputs → adjusted dimensions |
| Engrave Time | `make/laser/engrave-time.tsx` | Area + LPI + speed → time estimate |
| Material Cost | `make/laser/material-cost.tsx` | Sheet + piece dimensions → cost breakdown |
| Focus Offset | `make/laser/focus-offset.tsx` | Thickness + lens → Z-offset |
| Ramp/Gradient | `make/laser/ramp-gradient.tsx` | Power range + length → stepped output |
| Material Database | `make/laser/materials-db.tsx` | Searchable/filterable catalog |

### 2.4 Shop Core Integration

- **Calculator history:** All results save via existing `CalculatorService.save()` with `module: "laser"`
- **Inventory:** Laser materials get `masterCategory: "laser"` in `inventory_items`. Metadata JSON stores sheet dimensions and material type for cost tracking.
- **Job costing:** Engrave Time output (minutes) × shop hourly rate = labor line item suggestion for quotes. Material Cost output → material line item.

---

## 3. CNC Module

### 3.1 Calculators (6 engines + 1 tool library)

#### Feeds & Speeds Calculator
- **Input:** Material (from DB), tool (from library), operation type (profile/pocket/slot/drill), depth of cut (optional override)
- **Output:** RPM, feed rate (in/min), plunge rate, DOC, WOC (width of cut), with safe min/max ranges
- **Logic:**
  - RPM = (SFM × 3.82) / tool_diameter
  - Feed rate = RPM × chipload × flutes
  - Plunge rate = feed_rate × 0.5 (default, adjustable)
  - DOC default = tool_diameter × material.max_doc_pct
  - WOC: profile = tool_diameter, pocket = tool_diameter × 0.4, slot = tool_diameter
- **Show Math toggle:** Reveals each step with labels: "SFM for [material] → RPM calculation → Chipload × flutes × RPM → Feed rate"
- **Edge cases:** Clamp RPM to router range (10,000–30,000 typical for hobby routers). Warn if calculated RPM is below minimum.

#### Stepover Calculator
- **Input:** Tool diameter, operation type (roughing/finishing/3D finishing), desired scallop height (for finishing)
- **Output:** Stepover % and distance, theoretical scallop height, surface finish quality rating
- **Logic:**
  - Roughing: stepover = 40-50% of tool diameter
  - 2D finishing: stepover = 10-15% of tool diameter
  - 3D finishing (ball nose): stepover = sqrt(8 × scallop_height × tool_radius - 4 × scallop_height²) — derived from ball geometry

#### Depth-of-Cut Planner
- **Input:** Total material depth, DOC per pass, operation (profile/pocket), finishing pass (yes/no), finishing DOC
- **Output:** Number of roughing passes, pass depth schedule, finishing pass depth, total passes, estimated total time (if feed rate provided)
- **Logic:** roughing_passes = ceil((total_depth - finishing_doc) / roughing_doc). Last roughing pass adjusted to hit exact depth. Finishing pass at user-specified lighter DOC.

#### V-Carve Calculator
- **Input:** V-bit angle (60°/90°/120°), desired cut width at surface, max depth limit (optional)
- **Output:** Required depth for target width, actual width at max depth (if depth-limited), flat-bottom width (if using flat-bottom V-bit with tip width input)
- **Logic:** depth = (width / 2) / tan(angle / 2). For flat-bottom V-bit: effective_width = tip_width + 2 × depth × tan(angle / 2).

#### Spoilboard Surfacing Calculator
- **Input:** Bed usable area (X × Y), surfacing bit diameter, stepover %, feed rate, DOC per pass, total skim depth
- **Output:** Number of Y-passes per layer, number of layers, total toolpath distance, estimated time
- **Logic:** passes_per_layer = ceil(Y / (diameter × stepover_pct)). Total passes include overlap on edges. Distance = passes × X_length. Time = distance / feed_rate. Layers = ceil(skim_depth / doc).

#### Tram Check Calculator
- **Input:** Indicator readings at 4 positions (front, back, left, right) relative to spindle center, indicator distance from center
- **Output:** Tilt direction (front-back and left-right), tilt amount (thou), adjustment instructions ("Lower front-left by 0.003"")
- **Logic:** front_back_tilt = (front - back) / 2. left_right_tilt = (left - right) / 2. Direction from sign. Magnitude is the raw difference at indicator radius.

#### Tool Library (browse/search/add, not a calculator engine)
- Displays built-in + user-added tools with specs and recommended parameters
- Users can add custom tools that persist in SQLite
- Each tool entry links to recommended chipload per material
- Optional wear tracking: hours used, job count (from `cnc_tool_usage` table)

### 3.2 CNC Database Schema

**Table: `cnc_materials`**

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | Generated ID |
| category | TEXT NOT NULL | softwood, hardwood, plywood_mdf, plastic, aluminum, composite |
| material_name | TEXT NOT NULL | e.g. "Hard Maple" |
| sfm_low | REAL NOT NULL | Surface feet per minute range low |
| sfm_high | REAL NOT NULL | Surface feet per minute range high |
| chipload_json | TEXT NOT NULL | JSON: chipload ranges keyed by tool diameter range |
| max_doc_pct | REAL NOT NULL | Max depth of cut as % of tool diameter (e.g. 1.0 = 100%) |
| coolant | TEXT NOT NULL DEFAULT 'none' | none, air, mist |
| notes | TEXT | Tips, warnings |
| source | TEXT NOT NULL DEFAULT 'built-in' | built-in, user |
| created_at | TEXT NOT NULL DEFAULT (datetime('now')) | |

`chipload_json` format:
```json
{
  "1/8": { "low": 0.001, "high": 0.003 },
  "1/4": { "low": 0.002, "high": 0.005 },
  "3/8": { "low": 0.003, "high": 0.007 },
  "1/2": { "low": 0.004, "high": 0.008 }
}
```

**Table: `cnc_tools`**

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | Generated ID |
| name | TEXT NOT NULL | e.g. "1/4\" 2-Flute Upcut Carbide" |
| tool_type | TEXT NOT NULL | endmill, vbit, ballnose, surfacing, drill |
| cut_direction | TEXT | upcut, downcut, compression, null for non-endmills |
| diameter_in | REAL NOT NULL | Cutting diameter in inches |
| shank_diameter_in | REAL | Shank diameter (null = same as cutting) |
| flutes | INTEGER NOT NULL | Number of flutes/cutting edges |
| tool_material | TEXT NOT NULL | hss, carbide, coated_carbide |
| max_doc_in | REAL | Max depth of cut in inches |
| vbit_angle | REAL | V-bit included angle (null for non-V-bits) |
| tip_width_in | REAL | Flat-bottom V-bit tip width (null for pointed) |
| notes | TEXT | |
| source | TEXT NOT NULL DEFAULT 'built-in' | built-in, user |
| created_at | TEXT NOT NULL DEFAULT (datetime('now')) | |

**Table: `cnc_tool_usage`**

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | Generated ID |
| tool_id | TEXT NOT NULL | FK to cnc_tools |
| project_id | TEXT | FK to projects (optional) |
| minutes_used | REAL NOT NULL | Cut time this session |
| notes | TEXT | |
| logged_at | TEXT NOT NULL DEFAULT (datetime('now')) | |

**CNC Material Catalog (~30 entries):**

| Category | Entries |
|----------|---------|
| Softwood | Pine, cedar, spruce, poplar, balsa |
| Hardwood | Red oak, white oak, hard maple, walnut, cherry, mahogany, ash, birch |
| Plywood/MDF | Baltic birch ply, MDF, HDF, particleboard, melamine |
| Plastic | HDPE, Delrin/acetal, polycarbonate, acrylic (cast), PVC foam (Sintra), UHMW, nylon |
| Aluminum | 6061-T6, cast aluminum |
| Composite | Carbon fiber, G10/FR4, Corian |

**CNC Tool Library (~25 built-in entries):**

| Type | Entries |
|------|---------|
| End mills | 1/8" 2F upcut, 1/8" 2F downcut, 1/4" 2F upcut, 1/4" 2F downcut, 1/4" 2F compression, 1/4" 3F upcut, 3/8" 2F upcut, 1/2" 2F upcut |
| V-bits | 60° 1/4" shank, 90° 1/4" shank, 90° 1/2" shank, 60° 1/4" flat-bottom (0.01" tip) |
| Ball nose | 1/8" 2F, 1/4" 2F, 3/8" 2F |
| Surfacing | 1" 2-insert, 1.5" 3-insert |
| Drill | 1/8" stub, 3/16" stub, 1/4" stub |
| Specialty | 1/8" single-flute O-flute (for plastics/aluminum) |

### 3.3 CNC UI Screens

| Screen | Route | Description |
|--------|-------|-------------|
| CNC Hub | `make/cnc/index.tsx` | Calculator grid |
| Feeds & Speeds | `make/cnc/feeds-speeds.tsx` | Material + tool picker → RPM/feed/DOC + show math |
| Stepover | `make/cnc/stepover.tsx` | Tool + operation → stepover recommendation |
| Depth-of-Cut | `make/cnc/depth-of-cut.tsx` | Total depth → pass schedule |
| V-Carve | `make/cnc/v-carve.tsx` | Bit angle + width → depth |
| Spoilboard | `make/cnc/spoilboard.tsx` | Bed size + bit → time estimate |
| Tram Check | `make/cnc/tram-check.tsx` | 4 readings → adjustment instructions |
| Tool Library | `make/cnc/tool-library.tsx` | Searchable tool catalog + add custom |

### 3.4 Shop Core Integration

- **Calculator history:** All results save via `CalculatorService.save()` with `module: "cnc"`
- **Inventory:** CNC tools get `masterCategory: "cnc"` in `inventory_items`. Metadata JSON stores tool specs.
- **Tool wear tracking:** After saving a feeds & speeds calculation, prompt to log cut time against the tool via `cnc_tool_usage`. Tool Library screen shows cumulative hours per tool.
- **Job costing:** Depth-of-Cut Planner total time + Spoilboard time → labor estimates for quotes.

---

## 4. Shared Components

### 4.1 ShowMath Component

**File:** `src/design-system/components/ShowMath.tsx`

A collapsible disclosure panel that reveals calculation steps. Used by CNC Feeds & Speeds, available to any calculator in future modules.

**Props:**
```typescript
interface ShowMathProps {
  steps: { label: string; formula: string; result: string }[];
  expanded?: boolean;
}
```

**Behavior:** Collapsed by default showing "Show math" link. Expands with Reanimated slide animation. Each step rendered as: label → formula → = result, using JetBrainsMono font for formulas.

### 4.2 MaterialPicker Component

**File:** `src/design-system/components/MaterialPicker.tsx`

A filterable dropdown/modal for selecting materials from a database. Used by both Laser Power & Speed and CNC Feeds & Speeds.

**Props:**
```typescript
interface MaterialPickerProps {
  module: "laser" | "cnc";
  onSelect: (material: LaserMaterial | CncMaterial) => void;
  selectedId?: string;
}
```

**Behavior:** Opens a bottom sheet with search bar + category filter tabs. Shows material name, category badge, and key parameter preview. Selecting a material calls onSelect and closes the picker.

### 4.3 ToolPicker Component

**File:** `src/design-system/components/ToolPicker.tsx`

CNC-specific tool selector with type filtering.

**Props:**
```typescript
interface ToolPickerProps {
  onSelect: (tool: CncTool) => void;
  selectedId?: string;
  toolType?: string; // Filter to specific type
}
```

---

## 5. Navigation Changes

### 5.1 Make Tab Top Bar

Add "Laser" and "CNC" entries to the scrollable top tab bar in `app/(tabs)/make/_layout.tsx`. Order: Woodworking | Laser | CNC | (remaining M3+ modules).

### 5.2 New Stack Layouts

**Laser:** `app/(tabs)/make/laser/_layout.tsx` — Stack with 8 screens (index + 7 tools).

**CNC:** `app/(tabs)/make/cnc/_layout.tsx` — Stack with 8 screens (index + 7 tools).

Both follow the exact same pattern as `app/(tabs)/make/woodworking/_layout.tsx`.

---

## 6. Database Schema Additions

Add 3 new tables and 4 new indexes to `src/core/database/schema.ts`:

**Tables:** `laser_materials`, `cnc_materials`, `cnc_tools`, `cnc_tool_usage` (schemas defined in sections 2.2 and 3.2).

**Indexes:**
```sql
CREATE INDEX IF NOT EXISTS idx_laser_materials_category ON laser_materials(category);
CREATE INDEX IF NOT EXISTS idx_laser_materials_operation ON laser_materials(operation);
CREATE INDEX IF NOT EXISTS idx_cnc_materials_category ON cnc_materials(category);
CREATE INDEX IF NOT EXISTS idx_cnc_tools_type ON cnc_tools(tool_type);
CREATE INDEX IF NOT EXISTS idx_cnc_tool_usage_tool ON cnc_tool_usage(tool_id);
```

Seed functions run at app startup (same pattern as `seedWoodSpecies`): `seedLaserMaterials()` and `seedCncData()`.

---

## 7. Phase Breakdown

### Phase 1: Laser Engines + Data
- 6 calculator engine files (pure functions) in `src/modules/laser/calculators/`
- Test suite for each engine
- Laser material database (`src/modules/laser/data/laserMaterials.ts`) with ~80+ entries
- Seed function (`src/modules/laser/data/seedLaserMaterials.ts`)
- DB schema additions (laser_materials table + indexes)
- **Exit criteria:** All engine tests pass, seed function creates table and populates data

### Phase 2: Laser UI Screens
- Laser Stack layout (`app/(tabs)/make/laser/_layout.tsx`)
- Laser hub screen with calculator grid
- 7 calculator/tool screens
- Make tab top bar updated with Laser entry
- MaterialPicker shared component
- Shop Core integration (save to history)
- **Exit criteria:** All screens navigable, calculations produce correct results on device, results save to history

### Phase 3: CNC Engines + Data
- 6 calculator engine files in `src/modules/cnc/calculators/`
- Test suite for each engine
- CNC material database (`src/modules/cnc/data/cncMaterials.ts`) with ~30 entries
- CNC tool library (`src/modules/cnc/data/cncTools.ts`) with ~25 entries
- Seed functions (`src/modules/cnc/data/seedCncData.ts`)
- DB schema additions (cnc_materials, cnc_tools, cnc_tool_usage tables + indexes)
- **Exit criteria:** All engine tests pass, seed functions populate data correctly

### Phase 4: CNC UI Screens
- CNC Stack layout (`app/(tabs)/make/cnc/_layout.tsx`)
- CNC hub screen with calculator grid
- 7 calculator/tool screens
- ShowMath shared component
- ToolPicker shared component
- Make tab top bar updated with CNC entry
- Shop Core integration (save to history, tool wear logging)
- **Exit criteria:** All screens navigable, feeds & speeds show math works, tool library browsable and user-addable

### Phase 5: Integration & Polish
- Inventory category extensions for laser materials + CNC tools
- Job costing helpers (engrave time → quote line item, cut time → quote line item)
- Cross-module integration tests
- TypeScript check pass (zero errors)
- **Exit criteria:** Inventory tracks laser sheets and CNC bits, job cost estimates flow to quotes, `npx tsc --noEmit` passes clean

---

## 8. File Inventory

### New Files (~45)

**Laser engines (6):**
- `src/modules/laser/calculators/powerSpeed.ts`
- `src/modules/laser/calculators/kerfComp.ts`
- `src/modules/laser/calculators/engraveTime.ts`
- `src/modules/laser/calculators/materialCost.ts`
- `src/modules/laser/calculators/focusOffset.ts`
- `src/modules/laser/calculators/rampGradient.ts`

**Laser data (2):**
- `src/modules/laser/data/laserMaterials.ts`
- `src/modules/laser/data/seedLaserMaterials.ts`

**Laser screens (8):**
- `app/(tabs)/make/laser/_layout.tsx`
- `app/(tabs)/make/laser/index.tsx`
- `app/(tabs)/make/laser/power-speed.tsx`
- `app/(tabs)/make/laser/kerf-comp.tsx`
- `app/(tabs)/make/laser/engrave-time.tsx`
- `app/(tabs)/make/laser/material-cost.tsx`
- `app/(tabs)/make/laser/focus-offset.tsx`
- `app/(tabs)/make/laser/ramp-gradient.tsx`
- `app/(tabs)/make/laser/materials-db.tsx`

**CNC engines (6):**
- `src/modules/cnc/calculators/feedsAndSpeeds.ts`
- `src/modules/cnc/calculators/stepover.ts`
- `src/modules/cnc/calculators/depthOfCut.ts`
- `src/modules/cnc/calculators/vCarve.ts`
- `src/modules/cnc/calculators/spoilboardSurfacing.ts`
- `src/modules/cnc/calculators/tramCheck.ts`

**CNC data (3):**
- `src/modules/cnc/data/cncMaterials.ts`
- `src/modules/cnc/data/cncTools.ts`
- `src/modules/cnc/data/seedCncData.ts`

**CNC screens (8):**
- `app/(tabs)/make/cnc/_layout.tsx`
- `app/(tabs)/make/cnc/index.tsx`
- `app/(tabs)/make/cnc/feeds-speeds.tsx`
- `app/(tabs)/make/cnc/stepover.tsx`
- `app/(tabs)/make/cnc/depth-of-cut.tsx`
- `app/(tabs)/make/cnc/v-carve.tsx`
- `app/(tabs)/make/cnc/spoilboard.tsx`
- `app/(tabs)/make/cnc/tram-check.tsx`
- `app/(tabs)/make/cnc/tool-library.tsx`

**Shared components (3):**
- `src/design-system/components/ShowMath.tsx`
- `src/design-system/components/MaterialPicker.tsx`
- `src/design-system/components/ToolPicker.tsx`

**Tests (~12):**
- `tests/laser/powerSpeed.test.ts`
- `tests/laser/kerfComp.test.ts`
- `tests/laser/engraveTime.test.ts`
- `tests/laser/materialCost.test.ts`
- `tests/laser/focusOffset.test.ts`
- `tests/laser/rampGradient.test.ts`
- `tests/cnc/feedsAndSpeeds.test.ts`
- `tests/cnc/stepover.test.ts`
- `tests/cnc/depthOfCut.test.ts`
- `tests/cnc/vCarve.test.ts`
- `tests/cnc/spoilboardSurfacing.test.ts`
- `tests/cnc/tramCheck.test.ts`

### Modified Files (~8)
- `src/core/database/schema.ts` — add 4 tables + 5 indexes
- `app/(tabs)/make/_layout.tsx` — add Laser + CNC to top tab bar
- `app/_layout.tsx` — call seedLaserMaterials() + seedCncData() at startup
- `src/core/types/index.ts` — add Laser/CNC type definitions
- `src/core/services/CalculatorService.ts` — no changes needed (already module-agnostic)
- `src/core/services/QuoteService.ts` — add job costing helper for time-based line items
- `src/core/hooks/useInventory.ts` — no changes needed (already category-agnostic)
