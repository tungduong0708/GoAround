import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'

export function useTheme() {
  const themeStore = useThemeStore()

  const theme = computed(() => themeStore.theme)
  const isDark = computed(() => themeStore.theme === 'dark')
  const isLight = computed(() => themeStore.theme === 'light')

  return {
    theme,
    isDark,
    isLight,
    setTheme: themeStore.setTheme,
    toggleTheme: themeStore.toggleTheme,
  }
}

