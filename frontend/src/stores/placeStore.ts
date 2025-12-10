import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PlaceDetails } from '@/utils/types'
import { fetchPlaceDetails } from '@/services'

export const usePlaceStore = defineStore('place', () => {
  const place = ref<PlaceDetails | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadPlace = async (id: string) => {
    loading.value = true
    error.value = null
    place.value = null

    try {
      place.value = await fetchPlaceDetails(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load place details'
    } finally {
      loading.value = false
    }
  }

  return {
    place,
    loading,
    error,
    loadPlace
  }
})
