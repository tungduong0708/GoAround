import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSearchStore } from '@/stores'
import type { SearchCategoryValue } from '@/stores/searchStore'
import { categories as search_categories } from '@/utils/constants/searchCate'

type SearchCategoriesEmit = {
  (event: 'update:modelValue', value: string): void
  (event: 'submit'): void
}

export function useSearchCategories(emit?: SearchCategoriesEmit) {
  const searchStore = useSearchStore()
  const { category } = storeToRefs(searchStore)

  const handleCategoryChange = (value: SearchCategoryValue) => {
    searchStore.setCategory(value)
  }

  const selectedCategory = computed<SearchCategoryValue>({
    get: () => category.value,
    set: handleCategoryChange,
  })

  const updateValue = (value: string) => {
    emit?.('update:modelValue', value)
  }

  const handleSubmit = () => {
    emit?.('submit')
  }

  return {
    categories: search_categories,
    selectedCategory,
    selectCategory: searchStore.setCategory,
    updateValue,
    handleSubmit,
  }
}
