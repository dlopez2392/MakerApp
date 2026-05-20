export interface KnifeSteel {
  name: string;
  category: "carbon" | "tool" | "stainless";
  hardenTempF: number;
  soakMinutes: number;
  quenchMedium: "oil" | "water" | "air" | "plate";
  temperLowF: number;
  temperHighF: number;
  rockwellLow: number;
  rockwellHigh: number;
  normalizeTempF: number | null;
  normalizeCycles: number;
  notes: string | null;
  source: "built-in" | "user";
}

export const steelData: KnifeSteel[] = [
  { name: "1095", category: "carbon", hardenTempF: 1475, soakMinutes: 5, quenchMedium: "oil", temperLowF: 350, temperHighF: 450, rockwellLow: 57, rockwellHigh: 60, normalizeTempF: 1600, normalizeCycles: 3, notes: "Classic high-carbon. Forgiving, great edge. Oil quench preferred.", source: "built-in" },
  { name: "1084", category: "carbon", hardenTempF: 1475, soakMinutes: 5, quenchMedium: "oil", temperLowF: 350, temperHighF: 450, rockwellLow: 58, rockwellHigh: 62, normalizeTempF: 1600, normalizeCycles: 3, notes: "Beginner-friendly. Simple heat treat, excellent toughness.", source: "built-in" },
  { name: "1080", category: "carbon", hardenTempF: 1475, soakMinutes: 5, quenchMedium: "oil", temperLowF: 350, temperHighF: 450, rockwellLow: 56, rockwellHigh: 60, normalizeTempF: 1600, normalizeCycles: 3, notes: "Similar to 1084. Good toughness, slightly lower carbon.", source: "built-in" },
  { name: "O1", category: "tool", hardenTempF: 1475, soakMinutes: 10, quenchMedium: "oil", temperLowF: 300, temperHighF: 400, rockwellLow: 60, rockwellHigh: 64, normalizeTempF: 1550, normalizeCycles: 2, notes: "Oil-hardening tool steel. Fine grain, good wear resistance.", source: "built-in" },
  { name: "W2", category: "tool", hardenTempF: 1475, soakMinutes: 5, quenchMedium: "water", temperLowF: 350, temperHighF: 450, rockwellLow: 62, rockwellHigh: 65, normalizeTempF: 1600, normalizeCycles: 3, notes: "Water quench. Produces hamon. Very high hardness possible.", source: "built-in" },
  { name: "5160", category: "carbon", hardenTempF: 1525, soakMinutes: 10, quenchMedium: "oil", temperLowF: 375, temperHighF: 450, rockwellLow: 56, rockwellHigh: 60, normalizeTempF: 1650, normalizeCycles: 3, notes: "Spring steel. Outstanding toughness for choppers and swords.", source: "built-in" },
  { name: "80CrV2", category: "carbon", hardenTempF: 1500, soakMinutes: 8, quenchMedium: "oil", temperLowF: 350, temperHighF: 425, rockwellLow: 58, rockwellHigh: 62, normalizeTempF: 1600, normalizeCycles: 3, notes: "European spring steel. Fine grain, excellent toughness.", source: "built-in" },
  { name: "D2", category: "tool", hardenTempF: 1850, soakMinutes: 30, quenchMedium: "air", temperLowF: 400, temperHighF: 500, rockwellLow: 59, rockwellHigh: 62, normalizeTempF: null, normalizeCycles: 0, notes: "Semi-stainless tool steel. Wear resistant but tough to grind.", source: "built-in" },
  { name: "A2", category: "tool", hardenTempF: 1775, soakMinutes: 20, quenchMedium: "air", temperLowF: 350, temperHighF: 450, rockwellLow: 60, rockwellHigh: 63, normalizeTempF: null, normalizeCycles: 0, notes: "Air-hardening. More toughness than D2, less wear resistance.", source: "built-in" },
  { name: "M2", category: "tool", hardenTempF: 2200, soakMinutes: 5, quenchMedium: "air", temperLowF: 1000, temperHighF: 1050, rockwellLow: 63, rockwellHigh: 66, normalizeTempF: null, normalizeCycles: 0, notes: "High-speed steel. Triple temper required. Excellent wear.", source: "built-in" },
  { name: "S30V", category: "stainless", hardenTempF: 1900, soakMinutes: 20, quenchMedium: "plate", temperLowF: 350, temperHighF: 500, rockwellLow: 58, rockwellHigh: 61, normalizeTempF: null, normalizeCycles: 0, notes: "Premium stainless. Good balance of toughness/edge retention.", source: "built-in" },
  { name: "S35VN", category: "stainless", hardenTempF: 1900, soakMinutes: 20, quenchMedium: "plate", temperLowF: 350, temperHighF: 500, rockwellLow: 58, rockwellHigh: 61, normalizeTempF: null, normalizeCycles: 0, notes: "Improved S30V. Better toughness, easier to sharpen.", source: "built-in" },
  { name: "440C", category: "stainless", hardenTempF: 1875, soakMinutes: 30, quenchMedium: "air", temperLowF: 300, temperHighF: 450, rockwellLow: 57, rockwellHigh: 60, normalizeTempF: null, normalizeCycles: 0, notes: "High-chromium stainless. Good corrosion resistance.", source: "built-in" },
  { name: "AEB-L", category: "stainless", hardenTempF: 1975, soakMinutes: 15, quenchMedium: "plate", temperLowF: 300, temperHighF: 400, rockwellLow: 60, rockwellHigh: 63, normalizeTempF: null, normalizeCycles: 0, notes: "Fine-grain stainless. Excellent for razors and kitchen knives.", source: "built-in" },
  { name: "154CM", category: "stainless", hardenTempF: 1900, soakMinutes: 20, quenchMedium: "plate", temperLowF: 350, temperHighF: 500, rockwellLow: 58, rockwellHigh: 61, normalizeTempF: null, normalizeCycles: 0, notes: "American equivalent of ATS-34. Good wear and corrosion resistance.", source: "built-in" },
];
