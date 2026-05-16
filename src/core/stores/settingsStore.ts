import { create } from "zustand";
import type { UserSettings, UnitSystem } from "../types";
import { getDatabase } from "../database/connection";

interface SettingsStore extends UserSettings {
  loaded: boolean;
  load: () => void;
  set: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
}

function readSetting(key: string): string | null {
  try {
    const db = getDatabase();
    const row = db.getFirstSync("SELECT value FROM user_settings WHERE key = ?", [key]) as { value: string } | null;
    return row?.value ?? null;
  } catch {
    return null;
  }
}

function writeSetting(key: string, value: string): void {
  const db = getDatabase();
  db.runSync(
    "INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)",
    [key, value],
  );
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  unitSystem: "imperial",
  shopName: undefined,
  shopLogoUrl: undefined,
  hourlyRate: undefined,
  taxRate: undefined,
  markupPercent: undefined,
  quotePrefix: "Q",
  invoicePrefix: "INV",
  terms: undefined,
  loaded: false,

  load: () => {
    const unitSystem = (readSetting("unitSystem") as UnitSystem) || "imperial";
    const shopName = readSetting("shopName") || undefined;
    const hourlyRate = readSetting("hourlyRate") ? parseFloat(readSetting("hourlyRate")!) : undefined;
    const taxRate = readSetting("taxRate") ? parseFloat(readSetting("taxRate")!) : undefined;
    const markupPercent = readSetting("markupPercent") ? parseFloat(readSetting("markupPercent")!) : undefined;
    const quotePrefix = readSetting("quotePrefix") || "Q";
    const invoicePrefix = readSetting("invoicePrefix") || "INV";
    const terms = readSetting("terms") || undefined;

    set({
      unitSystem, shopName, hourlyRate, taxRate, markupPercent,
      quotePrefix, invoicePrefix, terms, loaded: true,
    });
  },

  set: (key, value) => {
    writeSetting(key, String(value ?? ""));
    set({ [key]: value } as Partial<SettingsStore>);
  },
}));
