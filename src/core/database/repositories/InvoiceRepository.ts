import { BaseRepository } from "../BaseRepository";
import type { Invoice } from "../../types";

type Row = Record<string, unknown>;

function toModel(row: Row): Invoice {
  return {
    id: row.id as string,
    userId: row.user_id as string | undefined,
    quoteId: row.quote_id as string | undefined,
    clientId: row.client_id as string,
    projectId: row.project_id as string | undefined,
    invoiceNumber: row.invoice_number as string,
    issueDate: row.issue_date as string,
    dueDate: row.due_date as string | undefined,
    paymentTerms: row.payment_terms as Invoice["paymentTerms"],
    status: row.status as Invoice["status"],
    discountType: row.discount_type as Invoice["discountType"],
    discountValue: row.discount_value as number | undefined,
    taxRate: row.tax_rate as number | undefined,
    notesClient: row.notes_client as string | undefined,
    notesInternal: row.notes_internal as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toRow(model: Partial<Invoice>): Row {
  const row: Row = {};
  if (model.id !== undefined) row.id = model.id;
  if (model.quoteId !== undefined) row.quote_id = model.quoteId || null;
  if (model.clientId !== undefined) row.client_id = model.clientId;
  if (model.projectId !== undefined) row.project_id = model.projectId || null;
  if (model.invoiceNumber !== undefined) row.invoice_number = model.invoiceNumber;
  if (model.issueDate !== undefined) row.issue_date = model.issueDate;
  if (model.dueDate !== undefined) row.due_date = model.dueDate || null;
  if (model.paymentTerms !== undefined) row.payment_terms = model.paymentTerms;
  if (model.status !== undefined) row.status = model.status;
  if (model.discountType !== undefined) row.discount_type = model.discountType || null;
  if (model.discountValue !== undefined) row.discount_value = model.discountValue || null;
  if (model.taxRate !== undefined) row.tax_rate = model.taxRate || null;
  if (model.notesClient !== undefined) row.notes_client = model.notesClient || null;
  if (model.notesInternal !== undefined) row.notes_internal = model.notesInternal || null;
  return row;
}

export const invoiceRepository = new BaseRepository<Invoice>("invoices", toModel, toRow);
