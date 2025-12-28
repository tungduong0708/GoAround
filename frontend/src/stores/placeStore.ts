import { defineStore } from "pinia";
import { ref } from "vue";
import type { 
  IPlaceDetail, 
  IPlacePublic,
} from "@/utils/interfaces";
import { PlacesService } from "@/services";

export const usePlaceStore = defineStore("place", () => {
  // Single place detail state
  const place = ref<IPlaceDetail | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // AI-powered recommendations
  const aiRecommendations = ref<IPlacePublic[]>([])
  const isLoadingAI = ref(false)
  const aiError = ref<string | null>(null)

  const loadPlace = async (id: string) => {
    loading.value = true;
    error.value = null;
    place.value = null;

    try {
      place.value = await PlacesService.getPlaceById(id);
      console.log("Place loaded:", place.value);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load place details";
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch AI-powered personalized recommendations
   * @param query - Natural language search query (e.g., "romantic dinner spots")
   * @param city - Optional city filter
   * @param maxResults - Maximum number of results (default: 10)
   */
  const fetchAIRecommendations = async (
    query?: string, 
    city?: string, 
    maxResults?: number
  ) => {
    isLoadingAI.value = true
    aiError.value = null

    try {
      const places = await PlacesService.getAIRecommendations({
        query,
        city,
        maxResults: maxResults || 10
      })

      aiRecommendations.value = places
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
  const fetchPersonalizedRecommendations = async (maxResults?: number) => {
    return fetchAIRecommendations(undefined, undefined, maxResults)
  }

  /**
   * Search for places matching a query with AI understanding
   */
  const searchWithAI = async (query: string, city?: string, maxResults?: number) => {
    return fetchAIRecommendations(query, city, maxResults)
  }

  const clearError = () => {
    error.value = null
    recommendationsError.value = null
  }

  const clearAIError = () => {
    aiError.value = null
  }

  const clearAIRecommendations = () => {
    aiRecommendations.value = []
  }

  return {
    // Single place detail
    place,
    loading,
    error,
    loadPlace,
    clearError,
    
    // AI recommendation state
    aiRecommendations,
    isLoadingAI,
    aiError,
    
    // AI recommendation actions
    fetchAIRecommendations,
    fetchPersonalizedRecommendations,
    searchWithAI,
    clearAIError,
    clearAIRecommendations,
  };
});
