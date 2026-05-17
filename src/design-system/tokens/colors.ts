export const colors = {
  dark: {
    background: "#0f0f1a",
    surface: "#1e1e2e",
    surfaceElevated: "#282840",
    border: "#2e2e3e",
    primary: "#f59e0b",
    primaryMuted: "#92610a",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f97316",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
  },
  light: {
    background: "#f8fafc",
    surface: "#ffffff",
    surfaceElevated: "#f1f5f9",
    border: "#e2e8f0",
    primary: "#d97706",
    primaryMuted: "#fef3c7",
    success: "#059669",
    danger: "#dc2626",
    warning: "#ea580c",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
  },
} as const;

export type ThemeColors = {
  [K in keyof typeof colors.dark]: string;
};
export type ThemeMode = "dark" | "light";
