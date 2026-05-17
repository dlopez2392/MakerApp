import { cncMaterialsData } from "./cncMaterials";
import { cncToolsData } from "./cncTools";
import { getDatabase } from "../../../core/database/connection";

export function seedCncData(): { materialCount: number; toolCount: number } {
  const db = getDatabase();

  // Seed materials
  const matRow = db.getFirstSync("SELECT COUNT(*) as cnt FROM cnc_materials") as { cnt: number } | null;
  const matCount = matRow?.cnt ?? 0;

  if (matCount === 0) {
    for (const m of cncMaterialsData) {
      db.runSync(
        `INSERT INTO cnc_materials (
          id, category, material_name, sfm_low, sfm_high,
          chipload_json, max_doc_pct, coolant, notes, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Math.random().toString(36).slice(2) + Date.now().toString(36),
          m.category,
          m.materialName,
          m.sfmLow,
          m.sfmHigh,
          JSON.stringify(m.chiploadMap),
          m.maxDocPct,
          m.coolant,
          m.notes,
          m.source,
        ],
      );
    }
  }

  // Seed tools
  const toolRow = db.getFirstSync("SELECT COUNT(*) as cnt FROM cnc_tools") as { cnt: number } | null;
  const toolCount = toolRow?.cnt ?? 0;

  if (toolCount === 0) {
    for (const t of cncToolsData) {
      db.runSync(
        `INSERT INTO cnc_tools (
          id, name, tool_type, cut_direction, diameter_in,
          shank_diameter_in, flutes, tool_material, max_doc_in,
          vbit_angle, tip_width_in, notes, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Math.random().toString(36).slice(2) + Date.now().toString(36),
          t.name,
          t.toolType,
          t.cutDirection,
          t.diameterIn,
          t.shankDiameterIn,
          t.flutes,
          t.toolMaterial,
          t.maxDocIn,
          t.vbitAngle,
          t.tipWidthIn,
          t.notes,
          t.source,
        ],
      );
    }
  }

  return {
    materialCount: cncMaterialsData.length,
    toolCount: cncToolsData.length,
  };
}
