import { create } from "zustand";
import type { Client } from "../types";
import { ClientService, ClientServiceError } from "../services/ClientService";

interface ClientStore {
  clients: Client[];
  loading: boolean;
  error: string | null;
  limitReached: boolean;
  load: () => void;
  create: (data: Omit<Client, "id" | "createdAt" | "updatedAt">) => Client | null;
  update: (id: string, data: Partial<Client>) => void;
  remove: (id: string) => void;
}

export const useClientStore = create<ClientStore>((set) => ({
  clients: [],
  loading: false,
  error: null,
  limitReached: false,
  load: () => {
    set({ loading: true });
    try {
      const clients = ClientService.getAll();
      set({ clients, loading: false, error: null });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  create: (data) => {
    try {
      const client = ClientService.create(data);
      set((state) => ({ clients: [client, ...state.clients], limitReached: false }));
      return client;
    } catch (e) {
      if (e instanceof ClientServiceError && e.code === "LIMIT_REACHED") {
        set({ limitReached: true });
        return null;
      }
      throw e;
    }
  },
  update: (id, data) => {
    const updated = ClientService.update(id, data);
    set((state) => ({ clients: state.clients.map((c) => (c.id === id ? updated : c)) }));
  },
  remove: (id) => {
    ClientService.delete(id);
    set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }));
  },
}));
