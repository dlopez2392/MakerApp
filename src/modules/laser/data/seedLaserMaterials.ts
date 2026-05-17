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
