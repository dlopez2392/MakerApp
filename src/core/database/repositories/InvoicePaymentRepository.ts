import { getDatabase, generateId } from "../connection";
import type { InvoicePayment, PaymentMethod } from "../../types";

type Row = Record<string, unknown>;

function toModel(row: Row): InvoicePayment {
  return {
    id: row.id as string,
    invoiceId: row.invoice_id as string,
    amount: row.amount as number,
    paymentMethod: row.payment_method as PaymentMethod | undefined,
    paymentDate: row.payment_date as string,
    notes: row.notes as string | undefined,
  };
}

export const InvoicePaymentRepository = {
  getByInvoice(invoiceId: string): InvoicePayment[] {
    const db = getDatabase();
    const rows = db.getAllSync(
      "SELECT * FROM invoice_payments WHERE invoice_id = ? ORDER BY payment_date DESC",
      [invoiceId],
    ) as Row[];
    return rows.map(toModel);
  },
  create(data: Omit<InvoicePayment, "id">): InvoicePayment {
    const db = getDatabase();
    const id = generateId();
    db.runSync(
      `INSERT INTO invoice_payments (id, invoice_id, amount, payment_method, payment_date, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.invoiceId, data.amount, data.paymentMethod || null, data.paymentDate, data.notes || null],
    );
    const row = db.getFirstSync("SELECT * FROM invoice_payments WHERE id = ?", [id]) as Row;
    return toModel(row);
  },
  getTotalPaid(invoiceId: string): number {
    const db = getDatabase();
    const row = db.getFirstSync(
      "SELECT SUM(amount) as total FROM invoice_payments WHERE invoice_id = ?",
      [invoiceId],
    ) as { total: number | null } | null;
    return row?.total ?? 0;
  },
};
