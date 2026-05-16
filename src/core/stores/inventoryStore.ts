import { create } from "zustand";
import type { InventoryItem } from "../types";
import { InventoryService, InventoryServiceError } from "../services/InventoryService";

interface InventoryStore {
  items: InventoryItem[];
  lowStockItems: InventoryItem[];
  loading: boolean;
  error: string | null;
  limitReached: boolean;
  load: () => void;
  loadLowStock: () => void;
  create: (data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => InventoryItem | null;
  update: (id: string, data: Partial<InventoryItem>) => void;
  deduct: (itemId: string, quantity: number, projectId?: string, notes?: string) => boolean;
  remove: (id: string) => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  items: [],
  lowStockItems: [],
  loading: false,
  error: null,
  limitReached: false,
  load: () => {
    set({ loading: true });
    try {
      const items = InventoryService.getAll();
      set({ items, loading: false, error: null });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  loadLowStock: () => {
    try {
      const lowStockItems = InventoryService.getLowStockItems();
      set({ lowStockItems });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
  create: (data) => {
    try {
      const item = InventoryService.create(data);
      set((state) => ({ items: [item, ...state.items], limitReached: false }));
      return item;
    } catch (e) {
      if (e instanceof InventoryServiceError && e.code === "LIMIT_REACHED") {
        set({ limitReached: true });
        return null;
      }
      throw e;
    }
  },
  update: (id, data) => {
    const updated = InventoryService.update(id, data);
    set((state) => ({ items: state.items.map((i) => (i.id === id ? updated : i)) }));
  },
  deduct: (itemId, quantity, projectId, notes) => {
    try {
      InventoryService.deduct(itemId, quantity, projectId, notes);
      const updated = InventoryService.getById(itemId);
      set((state) => ({
        items: state.items.map((i) => (i.id === itemId ? updated : i)),
        lowStockItems: InventoryService.getLowStockItems(),
      }));
      return true;
    } catch (e) {
      if (e instanceof InventoryServiceError && e.code === "INSUFFICIENT_STOCK") {
        set({ error: (e as Error).message });
        return false;
      }
      throw e;
    }
  },
  remove: (id) => {
    InventoryService.delete(id);
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
      lowStockItems: state.lowStockItems.filter((i) => i.id !== id),
    }));
  },
}));
