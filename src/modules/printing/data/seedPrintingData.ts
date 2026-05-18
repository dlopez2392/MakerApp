import { filamentData } from "./filamentDatabase";
import { getDatabase } from "../../../core/database/connection";

export function seedPrintingData(): { filamentCount: number } {
  const db = getDatabase();

  const row = db.getFirstSync("SELECT COUNT(*) as cnt FROM printing_filaments") as { cnt: number } | null;
  const count = row?.cnt ?? 0;

  if (count === 0) {
    for (const f of filamentData) {
      db.runSync(
        `INSERT INTO printing_filaments (
          id, category, name, print_temp_low, print_temp_high,
          bed_temp_low, bed_temp_high, max_flow_rate, density,
          retraction_dist_bowden, retraction_dist_direct, retraction_speed,
          cost_per_kg, notes, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Math.random().toString(36).slice(2) + Date.now().toString(36),
          f.category,
          f.name,
          f.printTempLow,
          f.printTempHigh,
          f.bedTempLow,
          f.bedTempHigh,
          f.maxFlowRate,
          f.density,
          f.retractionDistBowden,
          f.retractionDistDirect,
          f.retractionSpeed,
          f.costPerKg,
          f.notes,
          f.source,
        ],
      );
    }
  }

  return { filamentCount: filamentData.length };
}
