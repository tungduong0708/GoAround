import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRecommendationStore, useAuthStore } from '@/stores'
import type { IPlacePublic } from '@/utils/interfaces'
import { useRouter } from 'vue-router'

export function useRecommendations(options: { autoLoad?: boolean } = { autoLoad: true }) {
  const router = useRouter()
  const store = useRecommendationStore()
  const authStore = useAuthStore()
  const { aiRecommendations, isLoadingAI: loading, aiError: error, hasLoaded } = storeToRefs(store)

  const loadRecommendations = async (force = false) => {
    // Only fetch if user is authenticated
    if (!authStore.user) {
      return
    }
    await store.fetchPersonalizedRecommendations(undefined, force)
  }

  const handleRecommendationSelect = (item: IPlacePublic) => {
    router.push({ name: 'details', params: { id: item.id } })
  }

  if (options.autoLoad !== false) {
    onMounted(() => {
      loadRecommendations()
    })
  }

  return {
    items: aiRecommendations,
    loading,
    error,
    hasLoaded,
    handleRecommendationSelect,
    loadRecommendations,
    refreshRecommendations: store.refreshRecommendations,
    clearError: store.clearAIError,
  }
}
