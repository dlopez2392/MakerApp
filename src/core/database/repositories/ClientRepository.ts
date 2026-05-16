import { BaseRepository } from "../BaseRepository";
import type { Client } from "../../types";

type Row = Record<string, unknown>;

function toModel(row: Row): Client {
  return {
    id: row.id as string,
    userId: row.user_id as string | undefined,
    fullName: row.full_name as string,
    company: row.company as string | undefined,
    email: row.email as string | undefined,
    phone: row.phone as string | undefined,
    preferredContact: row.preferred_contact as string | undefined,
    billingAddress: row.billing_address as string | undefined,
    shippingAddress: row.shipping_address as string | undefined,
    tags: JSON.parse((row.tags as string) || "[]"),
    source: row.source as Client["source"],
    notes: row.notes as string | undefined,
    internalRating: row.internal_rating as number | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toRow(model: Partial<Client>): Row {
  const row: Row = {};
  if (model.id !== undefined) row.id = model.id;
  if (model.fullName !== undefined) row.full_name = model.fullName;
  if (model.company !== undefined) row.company = model.company || null;
  if (model.email !== undefined) row.email = model.email || null;
  if (model.phone !== undefined) row.phone = model.phone || null;
  if (model.preferredContact !== undefined) row.preferred_contact = model.preferredContact || null;
  if (model.billingAddress !== undefined) row.billing_address = model.billingAddress || null;
  if (model.shippingAddress !== undefined) row.shipping_address = model.shippingAddress || null;
  if (model.tags !== undefined) row.tags = JSON.stringify(model.tags);
  if (model.source !== undefined) row.source = model.source || null;
  if (model.notes !== undefined) row.notes = model.notes || null;
  if (model.internalRating !== undefined) row.internal_rating = model.internalRating || null;
  return row;
}

export const clientRepository = new BaseRepository<Client>("clients", toModel, toRow);
