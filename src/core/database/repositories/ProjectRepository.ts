import { BaseRepository } from "../BaseRepository";
import type { Project } from "../../types";

type Row = Record<string, unknown>;

function toModel(row: Row): Project {
  return {
    id: row.id as string,
    userId: row.user_id as string | undefined,
    name: row.name as string,
    clientId: row.client_id as string | undefined,
    status: row.status as Project["status"],
    disciplineTags: JSON.parse((row.discipline_tags as string) || "[]"),
    startDate: row.start_date as string | undefined,
    targetDate: row.target_date as string | undefined,
    completedDate: row.completed_date as string | undefined,
    estimatedHours: row.estimated_hours as number | undefined,
    actualHours: (row.actual_hours as number) || 0,
    budget: row.budget as number | undefined,
    notes: row.notes as string | undefined,
    coverPhotoUrl: row.cover_photo_url as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toRow(model: Partial<Project>): Row {
  const row: Row = {};
  if (model.id !== undefined) row.id = model.id;
  if (model.name !== undefined) row.name = model.name;
  if (model.clientId !== undefined) row.client_id = model.clientId || null;
  if (model.status !== undefined) row.status = model.status;
  if (model.disciplineTags !== undefined) row.discipline_tags = JSON.stringify(model.disciplineTags);
  if (model.startDate !== undefined) row.start_date = model.startDate || null;
  if (model.targetDate !== undefined) row.target_date = model.targetDate || null;
  if (model.completedDate !== undefined) row.completed_date = model.completedDate || null;
  if (model.estimatedHours !== undefined) row.estimated_hours = model.estimatedHours || null;
  if (model.actualHours !== undefined) row.actual_hours = model.actualHours;
  if (model.budget !== undefined) row.budget = model.budget || null;
  if (model.notes !== undefined) row.notes = model.notes || null;
  if (model.coverPhotoUrl !== undefined) row.cover_photo_url = model.coverPhotoUrl || null;
  return row;
}

export const projectRepository = new BaseRepository<Project>("projects", toModel, toRow);
