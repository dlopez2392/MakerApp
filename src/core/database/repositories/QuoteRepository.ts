import { BaseRepository } from "../BaseRepository";
import type { Quote } from "../../types";

type Row = Record<string, unknown>;

function toModel(row: Row): Quote {
  return {
    id: row.id as string,
    userId: row.user_id as string | undefined,
    clientId: row.client_id as string,
    projectId: row.project_id as string | undefined,
    quoteNumber: row.quote_number as string,
    validUntil: row.valid_until as string | undefined,
    status: row.status as Quote["status"],
    discountType: row.discount_type as Quote["discountType"],
    discountValue: row.discount_value as number | undefined,
    taxRate: row.tax_rate as number | undefined,
    notesClient: row.notes_client as string | undefined,
    notesInternal: row.notes_internal as string | undefined,
    terms: row.terms as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toRow(model: Partial<Quote>): Row {
  const row: Row = {};
  if (model.id !== undefined) row.id = model.id;
  if (model.clientId !== undefined) row.client_id = model.clientId;
  if (model.projectId !== undefined) row.project_id = model.projectId || null;
  if (model.quoteNumber !== undefined) row.quote_number = model.quoteNumber;
  if (model.validUntil !== undefined) row.valid_until = model.validUntil || null;
  if (model.status !== undefined) row.status = model.status;
  if (model.discountType !== undefined) row.discount_type = model.discountType || null;
  if (model.discountValue !== undefined) row.discount_value = model.discountValue || null;
  if (model.taxRate !== undefined) row.tax_rate = model.taxRate || null;
  if (model.notesClient !== undefined) row.notes_client = model.notesClient || null;
  if (model.notesInternal !== undefined) row.notes_internal = model.notesInternal || null;
  if (model.terms !== undefined) row.terms = model.terms || null;
  return row;
}

export const quoteRepository = new BaseRepository<Quote>("quotes", toModel, toRow);
