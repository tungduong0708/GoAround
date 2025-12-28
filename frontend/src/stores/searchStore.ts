import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { PlacesService } from "@/services";
import type {
  IPlaceSearchQuery,
  IPaginatedResponse,
  IPlaceSearchResponse,
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
  const results = ref<IPaginatedResponse<IPlaceSearchResponse>>();
  const loading = ref(false);
  const error = ref<string | null>(null);
  const hasSearched = ref(false);
  const category = ref<SearchCategoryValue>("all");
  const currentPage = ref(1);
  const pageSize = ref(12);

  const hasResults = computed(
    () =>
      !error.value &&
      results.value?.data &&
      (results.value.data.places.length > 0 ||
        results.value.data.posts.length > 0 ||
        results.value.data.trips.length > 0)
  );

  const totalPages = computed(() => {
    if (!results.value?.meta) return 1;
    console.log('Pagination debug:', {
      total_items: results.value.meta.total_items,
      limit: results.value.meta.limit,
      pageSize: pageSize.value,
      calculated_pages: Math.ceil(results.value.meta.total_items / pageSize.value)
    });
    return Math.ceil(results.value.meta.total_items / pageSize.value);
  });

  const pagination = computed(() => results.value?.meta);

  const buildFilters = (): Partial<IPlaceSearchQuery> => {
    const base: Partial<IPlaceSearchQuery> = { ...filters.value };
    
    // Handle category-based place_type
    if (category.value === "all") {
      delete base.place_type;
    } else {
      base.place_type = category.value;
    }
    
    // Convert radius from meters to kilometers for the backend
    if (base.radius !== undefined && base.radius !== null) {
      base.radius = base.radius / 1000;
    }
    
    // Clean up null/undefined values (but keep objects like location)
    Object.keys(base).forEach(key => {
      const value = base[key as keyof IPlaceSearchQuery];
      // Keep objects (like location), only remove null/undefined/empty strings
      if (value === null || value === undefined || value === '') {
        delete base[key as keyof IPlaceSearchQuery];
      }
    });
    
    return base;
  };

  const setQuery = (value: string) => {
    query.value = value;
  };

  const setFilters = (value: Partial<Omit<IPlaceSearchQuery, "q">>) => {
    filters.value = value;
    console.log("Filters updated:", filters.value);
  };

  const setCategory = (value: SearchCategoryValue) => {
    category.value = value;
  };

  const clearResults = () => {
    results.value = undefined;
    hasSearched.value = false;
  };

  const resetSearch = () => {
    query.value = "";
    filters.value = {};
    results.value = undefined;
    loading.value = false;
    error.value = null;
    hasSearched.value = false;
    category.value = "all";
    currentPage.value = 1;
  };

  const search = async (page?: number, isNewSearch: boolean = true) => {
    const normalizedQuery = query.value.trim();
    
    // Always rebuild filters on each search
    const effectiveFilters = buildFilters();
    
    // Allow search if we have either a query OR filters (like location, rating, etc.)
    const hasFilters = Object.keys(effectiveFilters).length > 0;
    
    if (!normalizedQuery && !hasFilters) {
      clearResults();
      return;
    }

    // Reset to page 1 for new searches, otherwise use provided page
    if (isNewSearch) {
      currentPage.value = 1;
    } else if (page !== undefined) {
      currentPage.value = page;
    }

    loading.value = true;
    error.value = null;

    try {
      const payload: IPlaceSearchQuery = {
        ...(normalizedQuery && { q: normalizedQuery }),
        ...effectiveFilters,
        page: currentPage.value,
        limit: pageSize.value,
      };
      console.log("Search payload:", payload);
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

  const goToPage = async (page: number) => {
    if (page < 1 || page > totalPages.value) return;
    await search(page, false);
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
    currentPage,
    pageSize,
    totalPages,
    pagination,
    setQuery,
    setFilters,
    setCategory,
    clearResults,
    resetSearch,
    search,
    goToPage,
  };
});
