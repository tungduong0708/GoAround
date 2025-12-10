/**
 * Theme-related constants
 */

export const THEME_STORAGE_KEY = "theme-preference";

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
} as const;

export const DEFAULT_THEME = THEMES.LIGHT;

export const THEME_COLORS = {
  // Light theme colors
  light: {
    background: "oklch(1 0 0)",
    foreground: "oklch(0.141 0.005 285.823)",
  },
  // Dark theme colors
  dark: {
    background: "oklch(0.141 0.005 285.823)",
    foreground: "oklch(0.985 0 0)",
  },
} as const;
