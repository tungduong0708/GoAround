import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Theme } from '@/utils/types/theme'
import { getInitialTheme, saveTheme, applyThemeClass, getToggledTheme } from '@/utils/helpers/theme'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>(getInitialTheme())

  // Set theme
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    saveTheme(newTheme)
    applyThemeClass(newTheme)
  }

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(getToggledTheme(theme.value))
  }

  // Initialize theme
  const initTheme = () => {
    applyThemeClass(theme.value)
  }

  return {
    theme,
    setTheme,
    toggleTheme,
    initTheme,
  }
})

