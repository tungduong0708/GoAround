import { onMounted, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSearchStore } from '@/stores'
import type { IPlacePublic } from '@/utils/interfaces'
import { useRouter } from 'vue-router'

export interface UseSearchResultsOptions {
  autoLoad?: boolean
  searchOnCategoryChange?: boolean
}

export function useSearchResults(options: UseSearchResultsOptions = { autoLoad: true, searchOnCategoryChange: false }) {
  const router = useRouter()
  const store = useSearchStore()
  const { query, results, loading, error, hasSearched, hasResults, category } = storeToRefs(store)

  const performSearch = async () => {
    await store.search()
    router.push({ name: "search"})
  }

  const setQuery = (value: string) => {
    store.setQuery(value)
  }

  const searchTerm = computed({
    get: () => query.value,
    set: (value: string) => setQuery(value),
  })

  const selectResult = (result: IPlacePublic) => {
    // placeholder for navigation until routes are prepared
    console.info('Navigate to', result.id)
    router.push({ name: 'details', params: { id: result.id } })
  }

  if (options.autoLoad ?? true) {
    onMounted(() => {
      if (!hasSearched.value && !loading.value) {
        performSearch()
      }
    })
  }

  if (options.searchOnCategoryChange) {
    watch(category, () => {
      performSearch()
    })
  }

  return {
    query,
    searchTerm,
    results,
    loading,
    error,
    hasSearched,
    hasResults,
    performSearch,
    selectResult,
    setFilters: store.setFilters,
    clearResults: store.clearResults,
  }
}
