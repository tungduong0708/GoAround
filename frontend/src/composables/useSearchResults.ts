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
  const { query, results, loading, error, hasSearched, hasResults, category, currentPage, totalPages, pagination } = storeToRefs(store)

  const performSearch = async () => {
    console.log('Performing search for', query.value)
    await store.search(undefined, true) // Always pass true to indicate new search and rebuild filters
    router.push({ name: "search"})
  }

  const goToPage = async (page: number) => {
    await store.goToPage(page)
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
    currentPage,
    totalPages,
    pagination,
    performSearch,
    selectResult,
    goToPage,
    setFilters: store.setFilters,
    clearResults: store.clearResults,
  }
}
