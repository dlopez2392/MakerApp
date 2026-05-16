import { getDatabase, generateId } from "../connection";
import type { LineItem } from "../../types";

type Row = Record<string, unknown>;

function toModel(row: Row): LineItem {
  return {
    id: row.id as string,
    parentId: row.invoice_id as string,
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

export const InvoiceLineItemRepository = {
  getByInvoice(invoiceId: string): LineItem[] {
    const db = getDatabase();
    const rows = db.getAllSync(
      "SELECT * FROM invoice_line_items WHERE invoice_id = ? ORDER BY sort_order ASC",
      [invoiceId],
    ) as Row[];
    return rows.map(toModel);
  },
  create(invoiceId: string, data: Omit<LineItem, "id" | "parentId">): LineItem {
    const db = getDatabase();
    const id = generateId();
    db.runSync(
      `INSERT INTO invoice_line_items (id, invoice_id, description, category, quantity, unit, unit_price, line_total, taxable, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, invoiceId, data.description, data.category || null, data.quantity, data.unit || null,
       data.unitPrice, data.lineTotal, data.taxable ? 1 : 0, data.sortOrder],
    );
    const row = db.getFirstSync("SELECT * FROM invoice_line_items WHERE id = ?", [id]) as Row;
    return toModel(row);
  },
  delete(id: string): void {
    const db = getDatabase();
    db.runSync("DELETE FROM invoice_line_items WHERE id = ?", [id]);
  },
  deleteByInvoice(invoiceId: string): void {
    const db = getDatabase();
    db.runSync("DELETE FROM invoice_line_items WHERE invoice_id = ?", [invoiceId]);
  },
};
