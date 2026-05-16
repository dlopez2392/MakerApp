import { BaseRepository } from "../BaseRepository";
import { getDatabase } from "../connection";
import type { JournalEntry } from "../../types";

type Row = Record<string, unknown>;

function toModel(row: Row): JournalEntry {
  return {
    id: row.id as string,
    userId: row.user_id as string | undefined,
    entryDate: row.entry_date as string,
    title: row.title as string | undefined,
    bodyRichText: row.body_rich_text as string | undefined,
    disciplineTags: JSON.parse((row.discipline_tags as string) || "[]"),
    projectIds: JSON.parse((row.project_ids as string) || "[]"),
    hoursLogged: row.hours_logged as number | undefined,
    mood: row.mood as JournalEntry["mood"],
    machineUsed: row.machine_used as string | undefined,
    photoUrls: JSON.parse((row.photo_urls as string) || "[]"),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toRow(model: Partial<JournalEntry>): Row {
  const row: Row = {};
  if (model.id !== undefined) row.id = model.id;
  if (model.entryDate !== undefined) row.entry_date = model.entryDate;
  if (model.title !== undefined) row.title = model.title || null;
  if (model.bodyRichText !== undefined) row.body_rich_text = model.bodyRichText || null;
  if (model.disciplineTags !== undefined) row.discipline_tags = JSON.stringify(model.disciplineTags);
  if (model.projectIds !== undefined) row.project_ids = JSON.stringify(model.projectIds);
  if (model.hoursLogged !== undefined) row.hours_logged = model.hoursLogged || null;
  if (model.mood !== undefined) row.mood = model.mood || null;
  if (model.machineUsed !== undefined) row.machine_used = model.machineUsed || null;
  if (model.photoUrls !== undefined) row.photo_urls = JSON.stringify(model.photoUrls);
  return row;
}

export const journalRepository = new BaseRepository<JournalEntry>("journal_entries", toModel, toRow);

export function getDistinctDatesDesc(): string[] {
  const db = getDatabase();
  const rows = db.getAllSync(
    "SELECT DISTINCT entry_date FROM journal_entries ORDER BY entry_date DESC",
  ) as { entry_date: string }[];
  return rows.map((r) => r.entry_date);
}
