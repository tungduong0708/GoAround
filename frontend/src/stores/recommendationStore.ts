import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Recommendation } from '@/utils/types'
import { fetchRecommendations } from '@/services'

export const useRecommendationStore = defineStore('recommendations', () => {
  const items = ref<Recommendation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasLoaded = ref(false)

  const loadRecommendations = async (options?: { force?: boolean }) => {
    if (loading.value) return
    if (hasLoaded.value && !options?.force) return

    loading.value = true
    error.value = null

    try {
      items.value = await fetchRecommendations()
      hasLoaded.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load recommendations right now.'
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    items,
    loading,
    error,
    hasLoaded,
    loadRecommendations,
    clearError,
  }
})
