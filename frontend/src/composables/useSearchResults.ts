import { onMounted, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSearchStore } from '@/stores'
import type { SearchResult } from '@/utils/types'

export interface UseSearchResultsOptions {
  autoLoad?: boolean
  searchOnCategoryChange?: boolean
}

export function useSearchResults(options: UseSearchResultsOptions = { autoLoad: true, searchOnCategoryChange: false }) {
  const store = useSearchStore()
  const { query, results, loading, error, hasSearched, hasResults, category } = storeToRefs(store)

  const performSearch = async () => {
    await store.search()
  }

  const setQuery = (value: string) => {
    store.setQuery(value)
  }

  const searchTerm = computed({
    get: () => query.value,
    set: (value: string) => setQuery(value),
  })

  const selectResult = (result: SearchResult) => {
    // placeholder for navigation until routes are prepared
    console.info('Navigate to', result.id)
  }

  if (options.autoLoad !== false) {
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
    setQuery,
    selectResult,
    setFilters: store.setFilters,
    clearResults: store.clearResults,
  }
}
