import { getDatabase, generateId } from "../connection";
import type { InventoryDeduction } from "../../types";

type Row = Record<string, unknown>;

function toModel(row: Row): InventoryDeduction {
  return {
    id: row.id as string,
    inventoryItemId: row.inventory_item_id as string,
    projectId: row.project_id as string | undefined,
    quantityDeducted: row.quantity_deducted as number,
    unit: row.unit as string,
    notes: row.notes as string | undefined,
    deductedAt: row.deducted_at as string,
    userId: row.user_id as string | undefined,
  };
}

export function createDeduction(data: Omit<InventoryDeduction, "id" | "deductedAt">): InventoryDeduction {
  const db = getDatabase();
  const id = generateId();
  db.runSync(
    `INSERT INTO inventory_deductions (id, inventory_item_id, project_id, quantity_deducted, unit, notes, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, data.inventoryItemId, data.projectId || null, data.quantityDeducted, data.unit, data.notes || null, data.userId || null],
  );
  const row = db.getFirstSync("SELECT * FROM inventory_deductions WHERE id = ?", [id]) as Row;
  return toModel(row);
}

export function getDeductionsByProject(projectId: string): InventoryDeduction[] {
  const db = getDatabase();
  const rows = db.getAllSync(
    "SELECT * FROM inventory_deductions WHERE project_id = ? ORDER BY deducted_at DESC",
    [projectId],
  ) as Row[];
  return rows.map(toModel);
}

export function getDeductionsByItem(itemId: string): InventoryDeduction[] {
  const db = getDatabase();
  const rows = db.getAllSync(
    "SELECT * FROM inventory_deductions WHERE inventory_item_id = ? ORDER BY deducted_at DESC",
    [itemId],
  ) as Row[];
  return rows.map(toModel);
}
