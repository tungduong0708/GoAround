import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSearchStore } from '@/stores'
import type { IPlaceSearchQuery } from '@/utils/interfaces'

export function useSearchFilters() {
  const store = useSearchStore()
  const { filters, loading } = storeToRefs(store)

  const currentFilters = computed({
    get: () => filters.value,
    set: (value: Partial<Omit<IPlaceSearchQuery, 'q'>>) => {
      store.setFilters(value)
    },
  })

  const applyFilters = () => {
    // Filters are already applied via the computed property
    // Search will only trigger when user clicks Search button
  }

  const clearFilters = () => {
    store.setFilters({})
  }

  const updateFilter = <K extends keyof Omit<IPlaceSearchQuery, 'q'>>(
    key: K,
    value: Omit<IPlaceSearchQuery, 'q'>[K]
  ) => {
    store.setFilters({
      ...filters.value,
      [key]: value,
    })
  }

  return {
    filters: currentFilters,
    loading,
    applyFilters,
    clearFilters,
    updateFilter,
  }
}
