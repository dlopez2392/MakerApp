import { steelData } from "./steelDatabase";
import { getDatabase } from "../../../core/database/connection";

export function seedKnifeSteels(): { count: number } {
  const db = getDatabase();
  const row = db.getFirstSync("SELECT COUNT(*) as cnt FROM knife_steels") as { cnt: number } | null;
  if ((row?.cnt ?? 0) > 0) return { count: steelData.length };

  for (const s of steelData) {
    db.runSync(
      `INSERT INTO knife_steels (
        id, name, category, harden_temp_f, soak_minutes, quench_medium,
        temper_low_f, temper_high_f, rockwell_low, rockwell_high,
        normalize_temp_f, normalize_cycles, notes, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Math.random().toString(36).slice(2) + Date.now().toString(36),
        s.name, s.category, s.hardenTempF, s.soakMinutes, s.quenchMedium,
        s.temperLowF, s.temperHighF, s.rockwellLow, s.rockwellHigh,
        s.normalizeTempF, s.normalizeCycles, s.notes, s.source,
      ],
    );
  }
  return { count: steelData.length };
}
