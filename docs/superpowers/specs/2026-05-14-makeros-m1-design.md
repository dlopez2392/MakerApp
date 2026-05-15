# MakerOS — Milestone 1 Design Spec

**Date:** 2026-05-14
**Scope:** Foundation + Unified Shop Core + Woodworking Module + Utilities Module
**Repository:** https://github.com/dlopez2392/MakerApp

---

## 1. Project Overview

MakerOS is a unified companion app for modern makers — a production-grade React Native (Expo) mobile application spanning 9 maker disciplines: Woodworking, Laser Cutting, CNC Routing, 3D Printing, Resin Art, Knife Making, Leatherworking, Candle Making, and Soap Making.

The app is built around the **Unified Shop Core** — a module-agnostic platform layer for Projects, Inventory, Clients, Shop Journal, Quotes/Invoicing, and Revenue tracking. Every maker module is a consumer of the Shop Core. No module owns it.

### Milestone Roadmap

| Milestone | Scope | Status |
|-----------|-------|--------|
| **M1** | Foundation + Shop Core + Woodworking + Utilities | Current |
| M2 | Laser + CNC modules | Planned |
| M3 | 3D Printing + Craft modules (Resin, Knife, Leather, Candle, Soap) | Planned |
| M4 | AI Assistant (DeepSeek) + Monetization (RevenueCat) | Planned |
| M5 | Polish: Timers, Machine Registry, Recipes, Widgets, Onboarding, Accessibility audit | Planned |

### Monetization (implemented in M4, designed now)

- **Free tier:** All calculators, reference databases, local storage only (SQLite), capped limits (10 projects, 50 inventory items, 30 journal entries, 5 clients, 3 active quotes/invoices, 10 calculator results per module). No AI, no cloud sync, no push notifications.
- **Pro tier ($6.99/mo or $59.99/yr):** Unlimited everything, Supabase cloud sync, AI assistant, professional PDF export (no watermark), revenue dashboard, push notifications. Managed via RevenueCat.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo SDK 52+) |
| Navigation | Expo Router (file-based) |
| Styling | NativeWind (Tailwind CSS for RN) |
| State management | Zustand |
| Local database | expo-sqlite |
| Cloud database | Supabase (PostgreSQL, auth, real-time) |
| Animations | React Native Reanimated |
| Haptics | expo-haptics |
| Audio (decibel meter) | expo-av |
| PDF generation | react-native-html-to-pdf or expo-print |
| Target platforms | iOS and Android |

---

## 3. Architecture

### 3.1 Domain-Driven Hybrid

Shop Core is a **horizontal platform layer** — data, services, and shared components that every module consumes. Each maker module is a **vertical slice** — screens plus module-specific logic that calls Shop Core through a defined API boundary.

```
src/
  core/                    # Shop Core platform layer
    database/              # SQLite schema, repositories, migrations
    services/              # ProjectService, InventoryService, ClientService, etc.
    components/            # Shared UI (ProjectPicker, InventoryDeductModal, etc.)
    hooks/                 # useProjects(), useInventory(), useClients()
    types/                 # Shared TypeScript types
    stores/                # Zustand stores for Shop Core state
  modules/
    woodworking/           # Vertical slice: screens, calculators, species DB
    laser/                 # (M2)
    cnc/                   # (M2)
    printing/              # (M3)
    resin/                 # (M3)
    knife/                 # (M3)
    leather/               # (M3)
    candle/                # (M3)
    soap/                  # (M3)
    utilities/             # Standalone tools, no Shop Core dependency
  app/                     # Expo Router file-based routes
  design-system/           # Theme, tokens, base components
```

Modules may only import from `src/core/` and `src/design-system/`. Modules never import from other modules.

### 3.2 Storage Architecture

A `StorageProvider` interface abstracts the database backend. Two implementations:

- **`SqliteStorage`** — Free tier primary. All data in local SQLite. Schema mirrors Supabase tables.
- **`SupabaseStorage`** — Pro tier primary. Supabase as source of truth, SQLite as offline cache.

A `StorageContext` at the app root provides the active implementation. The rest of the app calls service hooks (`useProjects()`, `useInventory()`, etc.) and never knows which backend is active.

**Offline-first behavior:** All writes go to SQLite immediately (optimistic). Pro tier queues a Supabase sync in the background. If offline, the sync queue persists and flushes when connectivity returns.

**Pro upgrade migration:** Create Supabase account, bulk-upload all SQLite rows, swap the storage provider.

**Photo storage:** Free tier stores photos in the app's local filesystem via `expo-file-system`. Photos are referenced by local URI in database records. On Pro upgrade, photos are uploaded to Supabase Storage and URIs are updated to remote URLs. Pro tier stores new photos directly to Supabase Storage with local cache.

### 3.3 Auth Model

- **Free tier:** No account required. Fully anonymous, local-only. Zero friction to first calculator use.
- **Pro tier:** Supabase email/password auth. Account created at upgrade time.
- User profile (stored locally for free, Supabase for Pro): name, shop name, preferred units (imperial/metric), hourly rate, tax rate, markup %, shop logo.

---

## 4. Navigation

### 4.1 Bottom Tab Bar (5 tabs)

| Tab | Icon | Destination |
|-----|------|-------------|
| Home | house | Smart dashboard with widgets |
| Make | hammer | Scrollable top tab bar with 9 module sub-tabs |
| Shop | briefcase | Shop Core hub (6 subsystem cards) |
| Utilities | wrench | Standalone maker tools |
| Profile | user | Settings, account, units, shop info, data export |

### 4.2 Make Tab

Scrollable horizontal top tab bar:

`Woodworking | Laser | CNC | 3D Print | Resin | Knife | Leather | Candle | Soap`

Each sub-tab opens that module's home screen — a grid of that module's calculators and reference tools. Tapping a calculator pushes a new screen onto the navigation stack.

### 4.3 Shop Tab

Hub screen with 6 tappable cards: Projects, Inventory, Clients, Journal, Quotes & Invoices, Revenue Dashboard. Each card pushes into its own stack navigator.

### 4.4 Expo Router File Structure

```
app/
  (tabs)/
    index.tsx                # Home dashboard
    make/
      _layout.tsx            # Top tab navigator for 9 modules
      woodworking/
        index.tsx            # Module home (calculator grid)
        board-foot.tsx
        fraction-calc.tsx
        cut-list.tsx
        wood-movement.tsx
        finishing.tsx
        epoxy.tsx
        species-db.tsx
        pricing.tsx
      laser/                 # (M2)
      cnc/                   # (M2)
      printing/              # (M3)
      resin/                 # (M3)
      knife/                 # (M3)
      leather/               # (M3)
      candle/                # (M3)
      soap/                  # (M3)
    shop/
      _layout.tsx            # Stack navigator
      index.tsx              # Hub screen (6 cards)
      projects/
        index.tsx            # List/Kanban/Calendar views
        [id].tsx             # Project detail (6 tabs)
        new.tsx
      inventory/
        index.tsx            # List with category filters
        [id].tsx             # Item detail + consumption history
        new.tsx
      clients/
        index.tsx
        [id].tsx             # Client detail (6 sections)
        new.tsx
      journal/
        index.tsx            # Chronological/calendar views
        [id].tsx
        new.tsx
      quotes/
        index.tsx
        [id].tsx
        new.tsx
      invoices/
        index.tsx
        [id].tsx
        new.tsx
      revenue.tsx            # Revenue dashboard (Pro only)
    utilities/
      index.tsx              # Tool grid
      unit-converter.tsx
      fraction-calc.tsx
      decibel-meter.tsx
      golden-ratio.tsx
      circle-arc.tsx
      drill-tap.tsx
      emc.tsx
    profile/
      index.tsx              # Settings, account, data export
```

---

## 5. Unified Shop Core

The platform layer in `src/core/`. Six subsystems, each with a service, repository, Zustand store, and shared components.

### 5.1 Projects

**Service API:** `createProject()`, `updateProject()`, `deleteProject()`, `linkCalculatorResult()`, `linkInventoryDeduction()`, `getProjectMaterials()`, `getProjectFinancials()`, `getProjectsByStatus()`, `getProjectsByDiscipline()`

**Status flow:** Idea → Design → In Progress → Finishing → Complete → Delivered → Archived

**Project card fields:**
- Name, cover photo, description
- Client (FK nullable — allows personal projects)
- Status (enum)
- Discipline tags (multi-select array): Woodworking | Laser | CNC | 3D Print | Resin | Knife | Leather | Candle | Soap | Mixed
- Start date, target completion date, actual completion date
- Estimated hours, actual hours (auto-summed from journal entries)
- Budget, actual spend (auto-summed from linked inventory deductions)
- Project notes (rich text)
- Photo gallery (camera roll or camera)

**Project detail screen tabs:**
1. **Overview** — card fields above
2. **Materials** — all inventory items consumed, from any module, via `InventoryService.getConsumptionByProject()`
3. **Calculators** — linked saved calculator results from any module, via `CalculatorService.getByProject()`
4. **Journal** — filtered journal entries tagged to this project, via `JournalService.getByProject()`
5. **Financials** — quote, invoice, material cost, labor cost, profit margin (auto-calculated from linked data)
6. **Files** — photos, exported PDFs, attachments

**Views:**
- Kanban board (columns = status stages, drag to reorder via Reanimated gesture handler)
- List view (sortable by date, status, client, discipline)
- Calendar view (projects plotted by target date)
- Filter by: discipline, client, status, date range

**Free tier limit:** 10 projects. Enforced in service layer — UI calls `createProject()` and receives either a project or a limit-reached error that triggers `UpgradeModal`.

### 5.2 Inventory

Single table, category-driven. Unified across all maker disciplines.

**M1 master categories:** Woodworking, General Shop.
Additional categories (Laser, CNC, 3D Printing, Resin, Knife, Leather, Candle, Soap) added in M2/M3.

**Woodworking subcategories:** Lumber, Sheet Goods, Hardware, Finishes, Epoxy Resin, Sandpaper/Abrasives.

**General Shop subcategories:** Safety/PPE, Finishing Supplies, Packaging, Miscellaneous.

**Item fields:**
- Name, master category, subcategory
- SKU / part number (optional)
- Supplier name + URL
- Quantity on hand + unit (board feet, sheets, grams, mL, count, sq ft)
- Unit cost, total value (auto-calculated)
- Location in shop (free text)
- Low-stock threshold + alert flag
- Notes, photo
- `metadata` (JSONB) — extensible field for module-specific rich data
- Date added, last updated

**Service API:** `createItem()`, `updateItem()`, `deductInventory(itemId, quantity, projectId?)`, `getItemsBelowThreshold()`, `getConsumptionHistory(itemId)`, `getConsumptionByProject(projectId)`, `getInventoryValue(category?)`, `searchItems(query)`

**Key behaviors:**
- **Quick Deduct:** Always prompts "Which project is this for?" (dropdown of active projects + "No project / personal use") before committing. Creates an `inventory_deductions` record.
- **Calculator Integration:** When a calculator produces a materials result, a "Log to Inventory" button appears — one tap deducts with quantity pre-filled.
- **Low Stock Dashboard:** Card on Home screen showing items below threshold, sorted by severity.
- **Reorder Links:** Tap low-stock item → opens supplier URL in browser.
- **Inventory Value Report:** Total value by category. Exportable as CSV.
- **Consumption History:** Per item, timeline of deductions linked to projects.

**Free tier limit:** 50 items.

### 5.3 Clients

**Fields:**
- Full name, company/organization
- Email, phone, preferred contact method
- Billing address, shipping address
- Tags (array): Residential | Commercial | Wholesale | Repeat | VIP | Lead
- Source: Referral | Instagram | Etsy | Website | Word of mouth | Other
- Notes (free text, private)
- Internal rating (1-5 stars, private)

**Client detail sections:**
1. Overview (fields above)
2. Projects (all linked, any discipline/status)
3. Quotes (all quotes sent to this client)
4. Invoices (all invoices, paid/outstanding summary)
5. Revenue (total lifetime revenue, by discipline)
6. Communication Log (timestamped notes)

**Service API:** `createClient()`, `updateClient()`, `getClientProjects()`, `getClientRevenue()`, `getClientQuotes()`, `getClientInvoices()`, `addCommunicationLog()`, `searchClients(query)`

**Free tier limit:** 5 clients.

### 5.4 Shop Journal

**Entry fields:**
- Date (defaults to today)
- Title (optional — auto-generated from tags if blank)
- Body (rich text with bold, bullets, inline photos)
- Discipline tags (multi-select array)
- Linked project(s) (multi-select)
- Hours logged (decimal) — feeds into linked project's `actual_hours`
- Mood: Great | Good | Okay | Rough
- Photos (up to 10)
- Machine used (optional free text)

**Views:**
- Chronological scroll (default)
- Calendar grid (tap a day to see entries)
- Filter by: discipline, project, date range, machine

**Streak tracker:** Consecutive days with at least one entry. Displayed on Home dashboard.

**Service API:** `createEntry()`, `updateEntry()`, `getStreak()`, `searchEntries(fullText)`, `getEntriesByProject()`, `getEntriesByDiscipline()`, `getEntriesByDateRange()`

Hours logged automatically update linked project's `actual_hours` via service-layer logic (not a DB trigger — keeps it portable between SQLite and Supabase).

**Free tier limit:** 30 entries.

### 5.5 Quotes & Invoices

**Quote fields:**
- Client (FK required), Project (FK optional)
- Quote number (auto-incremented, user-configurable prefix)
- Valid-until date
- Line items (unlimited): description, category (Labor | Material | Laser Work | CNC Work | 3D Printing | Finishing | Design | Delivery | Other), quantity, unit, unit price, line total (auto-calculated), taxable toggle, sort order
- Subtotal, tax (configurable rate from Settings), total
- Discount: percentage or flat dollar
- Notes to client (shown on PDF), internal notes (not on PDF)
- Terms & conditions (from Settings, auto-appended to PDF)
- Status: Draft | Sent | Viewed | Accepted | Rejected | Expired

**Invoice fields (all quote fields plus):**
- Invoice number (separate auto-increment sequence)
- Issue date, due date
- Payment terms: Due on receipt | Net 7 | Net 15 | Net 30 | Net 60
- Status: Draft | Sent | Viewed | Partial | Paid | Overdue | Void
- Payments log: amount, payment method (Cash | Check | Venmo | Zelle | PayPal | Card | Other), date, notes
- Balance due (auto-calculated)

**Key behaviors:**
- "Convert to Invoice" — one tap, copies all quote line items to a new invoice.
- Calculator integration: `[Add to Quote]` button on every calculator result pre-fills a line item.
- "Pull from project materials" on invoice creation: auto-populates line items from linked project's inventory consumption log.
- PDF generation: shop logo, shop info, client info, itemized table, subtotal/tax/total, terms, signature line. Free tier PDFs have a subtle watermark.
- Overdue alert: push notification when invoice passes due date (Pro only).

**Service API:** `createQuote()`, `updateQuote()`, `convertToInvoice()`, `createInvoice()`, `recordPayment()`, `getOverdueInvoices()`, `addLineItemFromCalculator()`, `generatePDF()`

**Free tier limit:** 3 active quotes/invoices at a time. Watermarked PDF.

### 5.6 Revenue Dashboard (Pro Only)

Aggregation queries across invoices:

- Total revenue by period (MTD, YTD, all time) — tab selector
- Outstanding receivables with aging buckets (Current | 1-30 days | 31-60 | 60+)
- Revenue by discipline (bar chart)
- Top 5 clients by revenue (current period)
- Invoice volume: sent, paid, outstanding
- Average job value
- Profit estimate: revenue minus inventory consumption cost

All charts tappable — drill into underlying invoices/projects. CSV export.

### 5.7 Cross-Module Integration Rules

1. Every calculator result screen shows three action buttons: `[Save to History]` `[Add to Quote]` `[Log to Project]`. These are shared components from `src/core/components/ActionBar`.

2. Every inventory deduction prompts "Which project is this for?" before committing.

3. Journal entry screen always offers project link and discipline tag before save.

4. Invoice creation offers "Pull from project materials" to auto-populate line items from inventory consumption.

---

## 6. Home Dashboard

Vertically stacked scrollable sections:

1. **Greeting card:** "Good morning, [name]. [Date]."
2. **Active Projects widget:** 3 most recently updated projects with status badge. "See all" link.
3. **Outstanding Invoices widget:** Count and total dollar amount unpaid. Red badge if any overdue. Tap → Revenue Dashboard.
4. **Low Stock Alerts widget:** Items below threshold with quick-deduct or reorder link.
5. **Recent Journal Entries:** Last 2 entries, discipline tag, date, first line. "Add today's entry" shortcut.
6. **Quick Calculators:** Icon grid of 6 user-configurable favorite calculators (set in Settings).
7. **Shop Streak:** Consecutive journal days. E.g., "14-day streak. Keep it going."

**Global Search:** Search bar at top. Queries across projects, clients, inventory items, journal entries, calculator results. Results grouped by type with section headers.

---

## 7. Woodworking Module

Vertical slice in `src/modules/woodworking/`. Consumes Shop Core services, owns its own calculators and reference data.

### 7.1 Board Foot Calculator

**Formula:** `(thickness_in × width_in × length_in) / 144 = board_feet`

**Surfacing adjustment toggle:**
- Rough: no adjustment
- S2S: subtract 1/4" from thickness
- S3S: subtract 1/4" thickness + 1/4" width
- S4S: subtract 1/4" thickness + 1/2" width

**Inputs:** Thickness, width, length, quantity, price per BF. Real-time calculation on every keystroke.

**Output card:** BF per piece, total BF, total cost. ActionBar at bottom.

### 7.2 Fraction Calculator

Custom fraction-aware keypad: digits, `/`, mixed number entry (e.g., `3 5/8`), operators (+, -, ×, ÷).

**Running tape mode:** Sequential add/subtract with scrollable operation tape and running total.

**Decimal ↔ fraction toggle.** Fractions auto-reduced to lowest terms.

**Imperial chaining:** `2 ft + 7 3/16 in` → result in feet-inches-fractions and decimal inches.

### 7.3 Cut List Optimizer

**Linear mode (1D bin packing):**
- Algorithm: First-Fit Decreasing
- Inputs: stock lengths, required cut lengths with quantities, kerf width (default 1/8")
- Output: optimal assignment of cuts to stock pieces, waste per piece, total waste %
- Visual: bar chart showing each stock piece with colored cut segments

**Sheet goods mode (2D bin packing):**
- Algorithm: Guillotine-cut with best-area-fit heuristic. All cuts go edge-to-edge (matches table saw reality). Tries both orientations per part unless grain-locked.
- Inputs: sheet dimensions (default 48×96"), part dimensions with quantities, kerf width, grain direction constraint toggle
- Output: SVG visual layout per sheet, number of sheets needed, waste %, cut sequence annotations
- Export: PDF

### 7.4 Wood Movement Calculator

**Species database:** 60+ species with tangential and radial shrinkage coefficients (stored in SQLite `wood_species` table).

**Formula:** `movement = width × (target_MC% - current_MC%) / 100 × shrinkage_coefficient`

Uses tangential coefficient for flat-sawn, radial for quarter-sawn.

**Output:** Movement in decimal inches and nearest fraction. Warning flag if movement exceeds 1/8".

### 7.5 Finishing Calculator

**Finish types and calculations:**
- Oil (Danish, tung, linseed): coverage rate × area × coats = volume needed
- Shellac: pound-cut calculator — `flake_oz = (pound_cut × alcohol_oz) / 16`. Ratio table for 1-lb through 3-lb cut.
- Lacquer / Polyurethane / Water-based: coverage rate × area × coats = volume needed
- Wax: coverage rate × area
- Stain: separate (lower) coverage rate

**Dry time estimator:** Base dry time adjusted by temperature/humidity multiplier curve.

**Mixing ratio calculator:** For shellac and custom blends.

### 7.6 Epoxy Resin Calculator (Woodworking-focused)

Distinct from the Resin Art module (M3). Focused on river tables, crack fills, bar tops, casting.

**Volume calculation:** Rectangle (L×W×D). Irregular shapes via water displacement guide (weight × 0.91 for resin).

**Mix ratio split:** User-set ratio (2:1, 1:1, 100:44, etc.) → Part A volume, Part B volume.

**Weight:** Total volume × density (default 1.1 g/mL, adjustable).

**Cost:** Volume × user-set price per oz.

**Multi-pour planner:** If depth exceeds max safe pour depth (configurable, default 1.5" table top / 2-4" deep pour), auto-split into N pours with 4-6 hour recommended wait.

**Colorant sub-calculator:** Pigment % by weight → grams needed.

**Save recipes:** Named pour configs stored in `saved_recipes` table.

### 7.7 Wood Species Database

60+ species in SQLite. Fields: common name, botanical name, Janka hardness, density (lbs/ft³), tangential shrinkage %, radial shrinkage %, typical uses, finishing notes, toxicity warnings, price tier.

Searchable list with filters: hardness range, use case, price tier, domestic/exotic.

"Use in Calculator" button on species detail pre-fills Wood Movement calculator.

### 7.8 Project Pricing & Quoting

Woodworking-specific workflow screen that composes Shop Core services:

1. Pull materials from linked project's inventory consumption (`InventoryService`)
2. Add labor phases: hours × hourly rate (from Settings)
3. Apply overhead % and markup % (from Settings)
4. Display: itemized breakdown (materials, labor, overhead, markup, total), suggested retail price, profit margin, profit dollars
5. "Create Quote" → calls `QuoteService.createFromPricing()` with pre-filled line items

Lives in `src/modules/woodworking/` but delegates all persistence to Shop Core.

---

## 8. Utilities Module

Standalone tools in `src/modules/utilities/`. No Shop Core dependencies. All work fully offline.

### 8.1 Unit Converter

9 category tabs (scrollable horizontal picker):

| Category | Key Conversions |
|----------|----------------|
| Length | in (fractional + decimal) ↔ ft ↔ mm ↔ cm ↔ m |
| Area | in² ↔ ft² ↔ mm² ↔ cm² ↔ m² |
| Volume | in³ ↔ ft³ ↔ gal ↔ L ↔ fl oz ↔ mL |
| Weight | oz ↔ lbs ↔ g ↔ kg |
| Temperature | °F ↔ °C ↔ K |
| Pressure | PSI ↔ bar ↔ kPa |
| Speed | IPM ↔ mm/min ↔ mm/s |
| Torque | in-lb ↔ ft-lb ↔ N-m |
| Hardness | Janka ↔ Brinell ↔ Rockwell C (lookup table) |

UI: Two input fields (from/to) with unit selectors. Typing in either instantly updates the other. Fraction toggle on length shows nearest equivalent to 1/64".

**Tape measure helper:** Sub-mode within Length for ft-in-fraction format with sequential add/subtract.

### 8.2 Decibel Meter

`expo-av` Audio API → RMS amplitude → dBA approximation.

**Display:** Large numeric dBA reading, color-coded circular gauge (green < 70, yellow 70-85, red 85-100, flashing red > 100). OSHA thresholds as tick marks.

**Features:** Peak hold, log with timestamp + machine label, hearing protection recommendation, calibration disclaimer.

### 8.3 Golden Ratio / Proportion Calculator

Input one dimension. Output table: golden ratio (1:1.618), rule of thirds, √2 (A-series), 1:2.

Live-updating proportional rectangle preview.

### 8.4 Circle / Arc Calculator

Input: radius OR diameter (auto-fills the other). Output: circumference, area. Optional angle input → arc length, chord length. Dual imperial/metric output.

### 8.5 Drill / Tap Size Reference

Two tabs: Imperial (#0 through 1/2"-13) and Metric (M1 through M16).

Columns: tap drill size, clearance drill, tap drill decimal, 75% thread drill, counterbore, countersink. Searchable. Expandable detail rows.

### 8.6 EMC Calculator

Hailwood-Horrobin formula implementation.

**Inputs:** Relative humidity (% slider), temperature (°F or °C).

**Output:** EMC % with guidance text and directional indicator (if user enters current MC). "Calculate movement" button links to Wood Movement calculator with EMC as target MC.

---

## 9. Design System

### 9.1 Color Tokens

**Dark theme (default):**
```
background:       #0f0f1a
surface:          #1e1e2e
surfaceElevated:  #282840
border:           #2e2e3e
primary:          #f59e0b  (amber)
primaryMuted:     #92610a
success:          #10b981  (emerald)
danger:           #ef4444
warning:          #f97316
textPrimary:      #f8fafc
textSecondary:    #94a3b8
textMuted:        #64748b
```

**Light theme:** Inverted surface scale (white/gray backgrounds), same accent colors, adjusted for WCAG AA contrast.

### 9.2 Typography

| Role | Font | Size | Weight |
|------|------|------|--------|
| Calculator values / results | JetBrains Mono | 32-40px | 700 |
| Input values | JetBrains Mono | 18px | 500 |
| Section headings | Inter | 18px | 600 |
| Body text | Inter | 15px | 400 |
| Labels / captions | Inter | 13px | 400 |
| Small / metadata | Inter | 11px | 400 |

### 9.3 Shared Component Library

Located in `src/design-system/`:

- `CalculatorInput` — numeric input with unit suffix, inline label, native numeric keyboard, optional fraction mode
- `ResultCard` — animated slide-up card with large mono numbers, unit label, copy-to-clipboard
- `ActionBar` — three-button bar (Save to History, Add to Quote, Log to Project)
- `StepIndicator` — progress dots for wizard flows
- `WizardStep` — full-screen step container with back/next
- `SafetyWarning` — red-bordered banner with icon
- `StatusBadge` — colored pill for status values
- `SearchableSelect` — searchable dropdown for species, materials, clients, projects
- `EmptyState` — illustration + CTA for empty lists
- `UpgradeModal` — Pro tier upsell, triggered by service-layer limit checks
- `FilterBar` — horizontal scrollable chip filters

### 9.4 Animations

- Calculator results: slide up 20px + fade in, 200ms, ease-out
- Card press: scale to 0.97, spring back on release
- Kanban drag: spring physics with shadow elevation
- Tab transitions: shared element between module home and calculator screen
- Haptics: light impact on result update, medium on save confirmation

### 9.5 Accessibility

- All touch targets minimum 48×48pt
- Color-coded indicators always paired with icons (colorblind-safe)
- Dynamic Type (iOS) / font scaling (Android) with flex-wrap layouts
- VoiceOver/TalkBack labels on all inputs and outputs
- High contrast mode: increased border weights, pure white on pure black

### 9.6 Onboarding (3 screens)

1. Welcome — app name, tagline, amber workshop illustration
2. Set units — Imperial / Metric toggle
3. Add first machine — optional, skip-able

Lands on Home dashboard after completion.

---

## 10. SQLite Schema (M1)

### Core Tables

```sql
-- Projects
CREATE TABLE projects (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT,
  name TEXT NOT NULL,
  client_id TEXT REFERENCES clients(id),
  status TEXT NOT NULL DEFAULT 'idea',
  discipline_tags TEXT NOT NULL DEFAULT '[]', -- JSON array
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
);

-- Inventory Items
CREATE TABLE inventory_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
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
  metadata TEXT DEFAULT '{}', -- JSON blob for module-specific fields
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Inventory Deductions
CREATE TABLE inventory_deductions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id),
  project_id TEXT REFERENCES projects(id),
  quantity_deducted REAL NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  deducted_at TEXT NOT NULL DEFAULT (datetime('now')),
  user_id TEXT
);

-- Clients
CREATE TABLE clients (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT,
  full_name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  preferred_contact TEXT,
  billing_address TEXT,
  shipping_address TEXT,
  tags TEXT NOT NULL DEFAULT '[]', -- JSON array
  source TEXT,
  notes TEXT,
  internal_rating INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Journal Entries
CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT,
  entry_date TEXT NOT NULL DEFAULT (date('now')),
  title TEXT,
  body_rich_text TEXT,
  discipline_tags TEXT NOT NULL DEFAULT '[]', -- JSON array
  project_ids TEXT NOT NULL DEFAULT '[]', -- JSON array of FK refs
  hours_logged REAL,
  mood TEXT,
  machine_used TEXT,
  photo_urls TEXT NOT NULL DEFAULT '[]', -- JSON array
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Quotes
CREATE TABLE quotes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT,
  client_id TEXT NOT NULL REFERENCES clients(id),
  project_id TEXT REFERENCES projects(id),
  quote_number TEXT NOT NULL,
  valid_until TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  discount_type TEXT, -- 'percentage' or 'flat'
  discount_value REAL,
  tax_rate REAL,
  notes_client TEXT,
  notes_internal TEXT,
  terms TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Quote Line Items
CREATE TABLE quote_line_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT,
  quantity REAL NOT NULL DEFAULT 1,
  unit TEXT,
  unit_price REAL NOT NULL DEFAULT 0,
  line_total REAL NOT NULL DEFAULT 0,
  taxable INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Invoices
CREATE TABLE invoices (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT,
  quote_id TEXT REFERENCES quotes(id),
  client_id TEXT NOT NULL REFERENCES clients(id),
  project_id TEXT REFERENCES projects(id),
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
);

-- Invoice Line Items
CREATE TABLE invoice_line_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT,
  quantity REAL NOT NULL DEFAULT 1,
  unit TEXT,
  unit_price REAL NOT NULL DEFAULT 0,
  line_total REAL NOT NULL DEFAULT 0,
  taxable INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Invoice Payments
CREATE TABLE invoice_payments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  payment_method TEXT,
  payment_date TEXT NOT NULL DEFAULT (date('now')),
  notes TEXT
);

-- Calculator Results
CREATE TABLE calculator_results (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT,
  project_id TEXT REFERENCES projects(id),
  module TEXT NOT NULL, -- 'woodworking', 'laser', 'cnc', etc.
  calculator_type TEXT NOT NULL,
  inputs_json TEXT NOT NULL, -- JSON blob
  outputs_json TEXT NOT NULL, -- JSON blob
  label TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Saved Recipes (epoxy pours, finishing formulas, etc.)
CREATE TABLE saved_recipes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT,
  module TEXT NOT NULL,
  recipe_type TEXT NOT NULL,
  name TEXT NOT NULL,
  config_json TEXT NOT NULL, -- JSON blob
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Wood Species Reference Data
CREATE TABLE wood_species (
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
  price_tier TEXT, -- 'budget', 'moderate', 'premium', 'exotic'
  domestic INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- User Settings (local)
CREATE TABLE user_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### Indexes

```sql
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_inventory_category ON inventory_items(master_category);
CREATE INDEX idx_inventory_low_stock ON inventory_items(quantity, low_stock_threshold);
CREATE INDEX idx_deductions_project ON inventory_deductions(project_id);
CREATE INDEX idx_deductions_item ON inventory_deductions(inventory_item_id);
CREATE INDEX idx_journal_date ON journal_entries(entry_date);
CREATE INDEX idx_quotes_client ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due ON invoices(due_date);
CREATE INDEX idx_calc_results_module ON calculator_results(module);
CREATE INDEX idx_calc_results_project ON calculator_results(project_id);
```

---

## 11. Additional Requirements

- **Offline-first:** All calculators work 100% offline. Sync is background-only for Pro.
- **Push notifications (Pro):** Low stock, invoice overdue, journal streak reminder, cure/dry timers.
- **Dark mode default + light mode option:** Toggle in Settings. System preference auto-detect.
- **Data export:** All personal data as JSON or CSV from Settings. Generates zip: projects.csv, inventory.csv, clients.csv, journal.csv, quotes.csv, invoices.csv, calculator_history.csv.
- **Haptic feedback:** Light on calculator result update, medium on save confirmation.
- **Unit tests:** All core calculation functions (board foot, wood movement, finishing coverage, epoxy volume, bin packing, fraction arithmetic, unit conversions, EMC) must have unit tests with real-world validated inputs/outputs.
