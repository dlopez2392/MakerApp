import { getDatabase, generateId } from "../connection";
import type { LineItem } from "../../types";

type Row = Record<string, unknown>;

function toModel(row: Row): LineItem {
  return {
    id: row.id as string,
    parentId: row.quote_id as string,
    description: row.description as string,
    category: row.category as LineItem["category"],
    quantity: row.quantity as number,
    unit: row.unit as string | undefined,
    unitPrice: row.unit_price as number,
    lineTotal: row.line_total as number,
    taxable: Boolean(row.taxable),
    sortOrder: row.sort_order as number,
  };
}

export const QuoteLineItemRepository = {
  getByQuote(quoteId: string): LineItem[] {
    const db = getDatabase();
    const rows = db.getAllSync(
      "SELECT * FROM quote_line_items WHERE quote_id = ? ORDER BY sort_order ASC",
      [quoteId],
    ) as Row[];
    return rows.map(toModel);
  },
  create(quoteId: string, data: Omit<LineItem, "id" | "parentId">): LineItem {
    const db = getDatabase();
    const id = generateId();
    db.runSync(
      `INSERT INTO quote_line_items (id, quote_id, description, category, quantity, unit, unit_price, line_total, taxable, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, quoteId, data.description, data.category || null, data.quantity, data.unit || null,
       data.unitPrice, data.lineTotal, data.taxable ? 1 : 0, data.sortOrder],
    );
    const row = db.getFirstSync("SELECT * FROM quote_line_items WHERE id = ?", [id]) as Row;
    return toModel(row);
  },
  update(id: string, data: Partial<LineItem>): LineItem | null {
    const db = getDatabase();
    const sets: string[] = [];
    const values: unknown[] = [];
    if (data.description !== undefined) { sets.push("description = ?"); values.push(data.description); }
    if (data.category !== undefined) { sets.push("category = ?"); values.push(data.category || null); }
    if (data.quantity !== undefined) { sets.push("quantity = ?"); values.push(data.quantity); }
    if (data.unit !== undefined) { sets.push("unit = ?"); values.push(data.unit || null); }
    if (data.unitPrice !== undefined) { sets.push("unit_price = ?"); values.push(data.unitPrice); }
    if (data.lineTotal !== undefined) { sets.push("line_total = ?"); values.push(data.lineTotal); }
    if (data.taxable !== undefined) { sets.push("taxable = ?"); values.push(data.taxable ? 1 : 0); }
    if (data.sortOrder !== undefined) { sets.push("sort_order = ?"); values.push(data.sortOrder); }
    if (sets.length === 0) return null;
    values.push(id);
    db.runSync(`UPDATE quote_line_items SET ${sets.join(", ")} WHERE id = ?`, values as any[]);
    const row = db.getFirstSync("SELECT * FROM quote_line_items WHERE id = ?", [id]) as Row;
    return row ? toModel(row) : null;
  },
  delete(id: string): void {
    const db = getDatabase();
    db.runSync("DELETE FROM quote_line_items WHERE id = ?", [id]);
  },
};
