import { BaseRepository } from "../BaseRepository";
import { getDatabase } from "../connection";
import type { InventoryItem, InventoryCategory } from "../../types";

type Row = Record<string, unknown>;

function toModel(row: Row): InventoryItem {
  return {
    id: row.id as string,
    userId: row.user_id as string | undefined,
    name: row.name as string,
    masterCategory: row.master_category as InventoryCategory,
    subCategory: row.sub_category as string | undefined,
    sku: row.sku as string | undefined,
    supplierName: row.supplier_name as string | undefined,
    supplierUrl: row.supplier_url as string | undefined,
    quantity: row.quantity as number,
    unit: row.unit as string,
    unitCost: row.unit_cost as number | undefined,
    location: row.location as string | undefined,
    lowStockThreshold: row.low_stock_threshold as number | undefined,
    notes: row.notes as string | undefined,
    photoUrl: row.photo_url as string | undefined,
    metadata: JSON.parse((row.metadata as string) || "{}"),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toRow(model: Partial<InventoryItem>): Row {
  const row: Row = {};
  if (model.id !== undefined) row.id = model.id;
  if (model.name !== undefined) row.name = model.name;
  if (model.masterCategory !== undefined) row.master_category = model.masterCategory;
  if (model.subCategory !== undefined) row.sub_category = model.subCategory || null;
  if (model.sku !== undefined) row.sku = model.sku || null;
  if (model.supplierName !== undefined) row.supplier_name = model.supplierName || null;
  if (model.supplierUrl !== undefined) row.supplier_url = model.supplierUrl || null;
  if (model.quantity !== undefined) row.quantity = model.quantity;
  if (model.unit !== undefined) row.unit = model.unit;
  if (model.unitCost !== undefined) row.unit_cost = model.unitCost || null;
  if (model.location !== undefined) row.location = model.location || null;
  if (model.lowStockThreshold !== undefined) row.low_stock_threshold = model.lowStockThreshold || null;
  if (model.notes !== undefined) row.notes = model.notes || null;
  if (model.photoUrl !== undefined) row.photo_url = model.photoUrl || null;
  if (model.metadata !== undefined) row.metadata = JSON.stringify(model.metadata);
  return row;
}

export const inventoryRepository = new BaseRepository<InventoryItem>("inventory_items", toModel, toRow);

export function getItemsBelowThreshold(): InventoryItem[] {
  const db = getDatabase();
  const rows = db.getAllSync(
    "SELECT * FROM inventory_items WHERE low_stock_threshold IS NOT NULL AND quantity <= low_stock_threshold ORDER BY quantity ASC",
  ) as Row[];
  return rows.map(toModel);
}

export function getInventoryValue(category?: InventoryCategory): number {
  const db = getDatabase();
  const sql = category
    ? "SELECT SUM(quantity * COALESCE(unit_cost, 0)) as total FROM inventory_items WHERE master_category = ?"
    : "SELECT SUM(quantity * COALESCE(unit_cost, 0)) as total FROM inventory_items";
  const params = category ? [category] : [];
  const row = db.getFirstSync(sql, params) as { total: number | null } | null;
  return row?.total ?? 0;
}
