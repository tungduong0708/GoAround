import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlaceStore } from '@/stores'
import { useRoute } from 'vue-router'

export function usePlaceDetails() {
  const route = useRoute()
  const store = usePlaceStore()
  const { place, loading, error } = storeToRefs(store)

  const fetchPlace = (id: string) => {
    if (id) {
      store.loadPlace(id)
    }
  }

  onMounted(() => {
    const placeId = route.params.id as string
    fetchPlace(placeId)
  })

  watch(
    () => route.params.id,
    (newId) => {
      if (newId) {
        fetchPlace(newId as string)
      }
    }
  )

  return {
    place,
    loading,
    error,
    fetchPlace
  }
}
