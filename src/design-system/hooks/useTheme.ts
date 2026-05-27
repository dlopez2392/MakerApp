import { create } from "zustand";
import { colors, type ThemeMode, type ThemeColors } from "../tokens/colors";
import { MODULE_THEMES, getModuleTheme, type ModuleId, type ModuleTheme } from "../tokens/moduleThemes";

interface ThemeStore {
  mode: ThemeMode;
  colors: ThemeColors;
  activeModule: ModuleId;
  moduleTheme: ModuleTheme;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
  setActiveModule: (id: ModuleId) => void;
}

export const useTheme = create<ThemeStore>((set) => ({
  mode: "dark",
  colors: colors.dark,
  activeModule: "home",
  moduleTheme: getModuleTheme("home"),
  toggle: () =>
    set((state) => {
      const next = state.mode === "dark" ? "light" : "dark";
      return { mode: next, colors: colors[next] };
    }),
  setMode: (mode) => set({ mode, colors: colors[mode] }),
  setActiveModule: (id) => set({ activeModule: id, moduleTheme: getModuleTheme(id) }),
}));
