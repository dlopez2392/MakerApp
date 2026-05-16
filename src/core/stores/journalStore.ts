import { create } from "zustand";
import type { JournalEntry } from "../types";
import { JournalService, JournalServiceError } from "../services/JournalService";

interface JournalStore {
  entries: JournalEntry[];
  streak: number;
  loading: boolean;
  error: string | null;
  limitReached: boolean;
  load: () => void;
  create: (data: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => JournalEntry | null;
  update: (id: string, data: Partial<JournalEntry>) => void;
  remove: (id: string) => void;
}

export const useJournalStore = create<JournalStore>((set) => ({
  entries: [],
  streak: 0,
  loading: false,
  error: null,
  limitReached: false,
  load: () => {
    set({ loading: true });
    try {
      const entries = JournalService.getAll();
      const streak = JournalService.getStreak();
      set({ entries, streak, loading: false, error: null });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  create: (data) => {
    try {
      const entry = JournalService.create(data);
      const streak = JournalService.getStreak();
      set((state) => ({ entries: [entry, ...state.entries], streak, limitReached: false }));
      return entry;
    } catch (e) {
      if (e instanceof JournalServiceError && e.code === "LIMIT_REACHED") {
        set({ limitReached: true });
        return null;
      }
      throw e;
    }
  },
  update: (id, data) => {
    const updated = JournalService.update(id, data);
    set((state) => ({ entries: state.entries.map((e) => (e.id === id ? updated : e)) }));
  },
  remove: (id) => {
    JournalService.delete(id);
    const streak = JournalService.getStreak();
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id), streak }));
  },
}));
