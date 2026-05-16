import { create } from "zustand";
import { colors, type ThemeMode, type ThemeColors } from "../tokens/colors";

interface ThemeStore {
  mode: ThemeMode;
  colors: ThemeColors;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useTheme = create<ThemeStore>((set) => ({
  mode: "dark",
  colors: colors.dark,
  toggle: () =>
    set((state) => {
      const next = state.mode === "dark" ? "light" : "dark";
      return { mode: next, colors: colors[next] };
    }),
  setMode: (mode) => set({ mode, colors: colors[mode] }),
}));
