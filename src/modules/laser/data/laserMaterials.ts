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
