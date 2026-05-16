import { create } from "zustand";
import type { Quote, LineItem } from "../types";
import { QuoteService, QuoteServiceError } from "../services/QuoteService";

interface QuoteStore {
  quotes: Quote[];
  loading: boolean;
  error: string | null;
  limitReached: boolean;
  load: () => void;
  create: (data: Omit<Quote, "id" | "createdAt" | "updatedAt" | "quoteNumber">, prefix?: string) => Quote | null;
  update: (id: string, data: Partial<Quote>) => void;
  remove: (id: string) => void;
  addLineItem: (quoteId: string, data: Omit<LineItem, "id" | "parentId">) => LineItem;
  removeLineItem: (lineItemId: string) => void;
}

export const useQuoteStore = create<QuoteStore>((set) => ({
  quotes: [],
  loading: false,
  error: null,
  limitReached: false,
  load: () => {
    set({ loading: true });
    try {
      const quotes = QuoteService.getAll();
      set({ quotes, loading: false, error: null });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  create: (data, prefix) => {
    try {
      const quote = QuoteService.create(data, prefix);
      set((state) => ({ quotes: [quote, ...state.quotes], limitReached: false }));
      return quote;
    } catch (e) {
      if (e instanceof QuoteServiceError && e.code === "LIMIT_REACHED") {
        set({ limitReached: true });
        return null;
      }
      throw e;
    }
  },
  update: (id, data) => {
    const updated = QuoteService.update(id, data);
    set((state) => ({ quotes: state.quotes.map((q) => (q.id === id ? updated : q)) }));
  },
  remove: (id) => {
    QuoteService.delete(id);
    set((state) => ({ quotes: state.quotes.filter((q) => q.id !== id) }));
  },
  addLineItem: (quoteId, data) => {
    return QuoteService.addLineItem(quoteId, data);
  },
  removeLineItem: (lineItemId) => {
    QuoteService.removeLineItem(lineItemId);
  },
}));
