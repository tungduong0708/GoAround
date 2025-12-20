import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { PlacesService } from "@/services";
import type {
  IPlacePublic,
  IPlaceSearchQuery,
  IPaginatedResponse,
} from "@/utils/interfaces";
export const SEARCH_CATEGORY_VALUES = [
  "all",
  "hotel",
  "restaurant",
  "cafe",
  "landmark",
] as const;
export type SearchCategoryValue = (typeof SEARCH_CATEGORY_VALUES)[number];

export const useSearchStore = defineStore("search", () => {
  const query = ref("");
  const filters = ref<Partial<Omit<IPlaceSearchQuery, "q">>>({});
  const results = ref<IPaginatedResponse<IPlacePublic[]>>();
  const loading = ref(false);
  const error = ref<string | null>(null);
  const hasSearched = ref(false);
  const category = ref<SearchCategoryValue>("all");

  const hasResults = computed(
    () =>
      !error.value &&
      results.value?.data &&
      Array.isArray(results.value.data) &&
      results.value.data.length > 0,
  );

  const buildFilters = (): Partial<Omit<IPlaceSearchQuery, "q">> => {
    const base: Partial<Omit<IPlaceSearchQuery, "q">> = { ...filters.value };
    if (category.value === "all") {
      delete base.category;
      delete base.place_type;
    } else {
      base.place_type = (category.value as string);
      delete base.category;
    }
    return base;
  };

  const setQuery = (value: string) => {
    query.value = value;
  };

  const setFilters = (value: Partial<Omit<IPlaceSearchQuery, "q">>) => {
    filters.value = value;
  };

  const setCategory = (value: SearchCategoryValue) => {
    category.value = value;
  };

  const clearResults = () => {
    results.value = undefined;
    hasSearched.value = false;
  };

  const search = async () => {
    const normalizedQuery = query.value.trim();
    if (!normalizedQuery) {
      clearResults();
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const effectiveFilters = buildFilters();
      const payload: IPlaceSearchQuery = {
        q: normalizedQuery,
        ...effectiveFilters,
      };
      results.value = await PlacesService.getPlaces(payload);
      console.log(results.value);
      hasSearched.value = true;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Unable to complete search right now.";
    } finally {
      loading.value = false;
    }
  };

  return {
    query,
    filters,
    results,
    loading,
    error,
    hasSearched,
    category,
    hasResults,
    setQuery,
    setFilters,
    setCategory,
    clearResults,
    search,
  };
});
