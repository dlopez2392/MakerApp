import { create } from "zustand";
import type { Invoice, PaymentMethod } from "../types";
import { InvoiceService, InvoiceServiceError } from "../services/InvoiceService";

interface InvoiceStore {
  invoices: Invoice[];
  overdueInvoices: Invoice[];
  loading: boolean;
  error: string | null;
  limitReached: boolean;
  load: () => void;
  loadOverdue: () => void;
  create: (data: Omit<Invoice, "id" | "createdAt" | "updatedAt" | "invoiceNumber">, prefix?: string) => Invoice | null;
  convertFromQuote: (quoteId: string, prefix?: string) => Invoice | null;
  update: (id: string, data: Partial<Invoice>) => void;
  recordPayment: (invoiceId: string, amount: number, method?: PaymentMethod, date?: string) => void;
  remove: (id: string) => void;
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  invoices: [],
  overdueInvoices: [],
  loading: false,
  error: null,
  limitReached: false,
  load: () => {
    set({ loading: true });
    try {
      const invoices = InvoiceService.getAll();
      set({ invoices, loading: false, error: null });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  loadOverdue: () => {
    try {
      const overdueInvoices = InvoiceService.getOverdue();
      set({ overdueInvoices });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
  create: (data, prefix) => {
    try {
      const invoice = InvoiceService.create(data, prefix);
      set((state) => ({ invoices: [invoice, ...state.invoices], limitReached: false }));
      return invoice;
    } catch (e) {
      if (e instanceof InvoiceServiceError && e.code === "LIMIT_REACHED") {
        set({ limitReached: true });
        return null;
      }
      throw e;
    }
  },
  convertFromQuote: (quoteId, prefix) => {
    try {
      const invoice = InvoiceService.convertFromQuote(quoteId, prefix);
      set((state) => ({ invoices: [invoice, ...state.invoices], limitReached: false }));
      return invoice;
    } catch (e) {
      if (e instanceof InvoiceServiceError && e.code === "LIMIT_REACHED") {
        set({ limitReached: true });
        return null;
      }
      throw e;
    }
  },
  update: (id, data) => {
    const updated = InvoiceService.update(id, data);
    set((state) => ({ invoices: state.invoices.map((i) => (i.id === id ? updated : i)) }));
  },
  recordPayment: (invoiceId, amount, method, date) => {
    InvoiceService.recordPayment(invoiceId, amount, method, date);
    const updated = InvoiceService.getById(invoiceId);
    set((state) => ({
      invoices: state.invoices.map((i) => (i.id === invoiceId ? updated : i)),
      overdueInvoices: InvoiceService.getOverdue(),
    }));
  },
  remove: (id) => {
    InvoiceService.delete(id);
    set((state) => ({
      invoices: state.invoices.filter((i) => i.id !== id),
      overdueInvoices: state.overdueInvoices.filter((i) => i.id !== id),
    }));
  },
}));
