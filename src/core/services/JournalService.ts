import { journalRepository, getDistinctDatesDesc } from "../database/repositories/JournalRepository";
import { ProjectService } from "./ProjectService";
import type { JournalEntry } from "../types";
import { FREE_LIMITS } from "../types";

export class JournalServiceError extends Error {
  constructor(message: string, public code: "LIMIT_REACHED" | "NOT_FOUND" | "INVALID") {
    super(message);
  }
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86400000;
  return Math.round((new Date(a).getTime() - new Date(b).getTime()) / msPerDay);
}

export const JournalService = {
  getAll(): JournalEntry[] {
    return journalRepository.getAll();
  },
  getById(id: string): JournalEntry {
    const entry = journalRepository.getById(id);
    if (!entry) throw new JournalServiceError("Journal entry not found", "NOT_FOUND");
    return entry;
  },
  getByDate(date: string): JournalEntry[] {
    return journalRepository.getAll("entry_date = ?", [date]);
  },
  getByProject(projectId: string): JournalEntry[] {
    return journalRepository.getAll("project_ids LIKE ?", [`%"${projectId}"%`]);
  },
  create(data: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">): JournalEntry {
    const count = journalRepository.count();
    if (count >= FREE_LIMITS.journalEntries) {
      throw new JournalServiceError(`Free tier limit of ${FREE_LIMITS.journalEntries} journal entries reached`, "LIMIT_REACHED");
    }
    const entry = journalRepository.create(data);

    // Roll up hours to linked projects
    if (data.hoursLogged && data.hoursLogged > 0 && data.projectIds && data.projectIds.length > 0) {
      const hoursPerProject = data.hoursLogged / data.projectIds.length;
      for (const projectId of data.projectIds) {
        try {
          ProjectService.updateActualHours(projectId, hoursPerProject);
        } catch {
          // Project may not exist; skip silently
        }
      }
    }

    return entry;
  },
  update(id: string, data: Partial<JournalEntry>): JournalEntry {
    const entry = journalRepository.update(id, data);
    if (!entry) throw new JournalServiceError("Journal entry not found", "NOT_FOUND");
    return entry;
  },
  delete(id: string): void {
    journalRepository.delete(id);
  },
  getStreak(): number {
    const dates = getDistinctDatesDesc();
    if (dates.length === 0) return 0;

    const today = new Date().toISOString().split("T")[0];
    const firstDate = dates[0];
    const gapFromToday = daysBetween(today, firstDate);

    // Streak must start from today or yesterday
    if (gapFromToday > 1) return 0;

    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const gap = daysBetween(dates[i - 1], dates[i]);
      if (gap === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },
};
