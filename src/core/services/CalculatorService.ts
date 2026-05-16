import { getDatabase, generateId } from "../database/connection";
import type { CalculatorResult } from "../types";
import { FREE_LIMITS } from "../types";

type Row = Record<string, unknown>;

function toModel(row: Row): CalculatorResult {
  return {
    id: row.id as string,
    userId: row.user_id as string | undefined,
    projectId: row.project_id as string | undefined,
    module: row.module as string,
    calculatorType: row.calculator_type as string,
    inputsJson: JSON.parse(row.inputs_json as string),
    outputsJson: JSON.parse(row.outputs_json as string),
    label: row.label as string | undefined,
    createdAt: row.created_at as string,
  };
}

export const CalculatorService = {
  save(data: Omit<CalculatorResult, "id" | "createdAt">): CalculatorResult {
    const db = getDatabase();
    const count = db.getFirstSync(
      "SELECT COUNT(*) as cnt FROM calculator_results WHERE module = ?",
      [data.module],
    ) as { cnt: number };

    if (count.cnt >= FREE_LIMITS.calculatorResultsPerModule) {
      const oldest = db.getFirstSync(
        "SELECT id FROM calculator_results WHERE module = ? ORDER BY created_at ASC LIMIT 1",
        [data.module],
      ) as { id: string } | null;
      if (oldest) {
        db.runSync("DELETE FROM calculator_results WHERE id = ?", [oldest.id]);
      }
    }

    const id = generateId();
    db.runSync(
      `INSERT INTO calculator_results (id, user_id, project_id, module, calculator_type, inputs_json, outputs_json, label)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.userId || null, data.projectId || null, data.module, data.calculatorType,
       JSON.stringify(data.inputsJson), JSON.stringify(data.outputsJson), data.label || null],
    );

    const row = db.getFirstSync("SELECT * FROM calculator_results WHERE id = ?", [id]) as Row;
    return toModel(row);
  },
  getByModule(module: string): CalculatorResult[] {
    const db = getDatabase();
    const rows = db.getAllSync("SELECT * FROM calculator_results WHERE module = ? ORDER BY created_at DESC", [module]) as Row[];
    return rows.map(toModel);
  },
  getByProject(projectId: string): CalculatorResult[] {
    const db = getDatabase();
    const rows = db.getAllSync("SELECT * FROM calculator_results WHERE project_id = ? ORDER BY created_at DESC", [projectId]) as Row[];
    return rows.map(toModel);
  },
  linkToProject(resultId: string, projectId: string): void {
    const db = getDatabase();
    db.runSync("UPDATE calculator_results SET project_id = ? WHERE id = ?", [projectId, resultId]);
  },
};
