import type { Theme } from '@/utils/types/theme'
import { THEME_STORAGE_KEY, DEFAULT_THEME } from '@/utils/constants/theme'

/**
 * Get theme from localStorage
 */
export function getStoredTheme(): Theme | null {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return null
}

/**
 * Save theme to localStorage
 */
export function saveTheme(theme: Theme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

/**
 * Get initial theme (from storage or default)
 */
export function getInitialTheme(): Theme {
  return getStoredTheme() ?? DEFAULT_THEME
}

/**
 * Apply theme class to document
 */
export function applyThemeClass(theme: Theme): void {
  const root = document.documentElement

  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

/**
 * Toggle theme between light and dark
 */
export function getToggledTheme(currentTheme: Theme): Theme {
  return currentTheme === 'dark' ? 'light' : 'dark'
}

