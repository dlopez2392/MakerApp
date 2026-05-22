import { create } from "zustand";
import { getDatabase } from "../database/connection";
import type { SubscriptionTier } from "../types";

interface SubscriptionStore {
  tier: SubscriptionTier;
  loaded: boolean;
  load: () => void;
  upgrade: () => void;
  downgrade: () => void;
}

function readSubscription(key: string): string | null {
  try {
    const db = getDatabase();
    const row = db.getFirstSync("SELECT value FROM subscription WHERE key = ?", [key]) as {
      value: string;
    } | null;
    return row?.value ?? null;
  } catch {
    return null;
  }
}

function writeSubscription(key: string, value: string): void {
  const db = getDatabase();
  db.runSync("INSERT OR REPLACE INTO subscription (key, value) VALUES (?, ?)", [key, value]);
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  tier: "free",
  loaded: false,

  load: () => {
    const tier = (readSubscription("tier") as SubscriptionTier) || "free";
    set({ tier, loaded: true });
  },

  upgrade: () => {
    writeSubscription("tier", "pro");
    set({ tier: "pro" });
  },

  downgrade: () => {
    writeSubscription("tier", "free");
    set({ tier: "free" });
  },
}));
