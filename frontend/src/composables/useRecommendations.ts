import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRecommendationStore } from '@/stores'
import type { IPlace } from '@/utils/interfaces'

export function useRecommendations(options: { autoLoad?: boolean } = { autoLoad: true }) {
  const store = useRecommendationStore()
  const { items, loading, error, hasLoaded } = storeToRefs(store)

  const loadRecommendations = async (force = false) => {
    await store.loadRecommendations({ force })
  }

  const handleRecommendationSelect = (item: IPlace) => {
    // TODO: implement navigation to recommendation detail page
    // placeholder navigation logic
    console.info('Selected recommendation:', item.id)
  }

  if (options.autoLoad !== false) {
    onMounted(() => {
      if (!hasLoaded.value) {
        loadRecommendations()
      }
    })
  }

  return {
    items,
    loading,
    error,
    hasLoaded,
    handleRecommendationSelect,
    loadRecommendations,
    clearError: store.clearError,
  }
}
