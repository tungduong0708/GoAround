import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PlacesService } from '@/services'
import type { IPlacePublic } from '@/utils/interfaces'

export const useRecommendationStore = defineStore('recommendations', () => {
  // AI-powered recommendations state
  const aiRecommendations = ref<IPlacePublic[]>([])
  const isLoadingAI = ref(false)
  const aiError = ref<string | null>(null)
  const hasLoaded = ref(false)

  /**
   * Fetch AI-powered personalized recommendations
   * @param query - Natural language search query (e.g., "romantic dinner spots")
   * @param city - Optional city filter
   * @param maxResults - Maximum number of results (default: 10)
   * @param force - Force reload even if already loaded
   */
  const fetchAIRecommendations = async (
    query?: string, 
    city?: string, 
    maxResults?: number,
    force = false
  ) => {
    // Skip if already loading
    if (isLoadingAI.value) return aiRecommendations.value
    
    // Skip if already loaded and not forcing
    if (hasLoaded.value && !force && aiRecommendations.value.length > 0) {
      return aiRecommendations.value
    }

    isLoadingAI.value = true
    aiError.value = null

    try {
      const places = await PlacesService.getAIRecommendations({
        query,
        city,
        maxResults: maxResults || 10
      })

      aiRecommendations.value = places
      hasLoaded.value = true
      return places
    } catch (err) {
      aiError.value = err instanceof Error ? err.message : 'Failed to load AI recommendations'
      throw err
    } finally {
      isLoadingAI.value = false
    }
  }

  /**
   * Get personalized recommendations without a specific query
   * Uses only user preferences and history
   */
  const fetchPersonalizedRecommendations = async (maxResults?: number, force = false) => {
    return fetchAIRecommendations(undefined, undefined, maxResults, force)
  }

  /**
   * Search for places matching a query with AI understanding
   */
  const searchWithAI = async (query: string, city?: string, maxResults?: number, force = false) => {
    return fetchAIRecommendations(query, city, maxResults, force)
  }

  const clearAIError = () => {
    aiError.value = null
  }

  const clearAIRecommendations = () => {
    aiRecommendations.value = []
    hasLoaded.value = false
  }

  const refreshRecommendations = async () => {
    return fetchPersonalizedRecommendations(undefined, true)
  }

  return {
    // AI recommendation state
    aiRecommendations,
    isLoadingAI,
    aiError,
    hasLoaded,
    
    // AI recommendation actions
    fetchAIRecommendations,
    fetchPersonalizedRecommendations,
    searchWithAI,
    clearAIError,
    clearAIRecommendations,
    refreshRecommendations,
  }
})
