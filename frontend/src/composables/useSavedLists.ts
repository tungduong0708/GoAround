import { onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import { useListPlaceStore } from "@/stores";

export interface UseSavedListsOptions {
  autoLoad?: boolean;
}

export function useSavedLists(options: UseSavedListsOptions = {}) {
  const { autoLoad = true } = options;

  const store = useListPlaceStore();

  // Reactive state from store
  const { listLists, listCurrentSelection, isFetching, isCreating, isDeleting, isUpdating, error } = storeToRefs(store);

  // Computed properties
  const lists = computed(() => listLists.value);
  const currentList = computed(() => listCurrentSelection.value);
  const hasLists = computed(() => lists.value.length > 0);
  const listCount = computed(() => lists.value.length);
  const isLoading = computed(() => isFetching.value || isCreating.value || isDeleting.value || isUpdating.value);

  // Actions
  const loadLists = async (force = false) => {
    // Only fetch if forced OR if we have no lists yet
    if (force || lists.value.length === 0) {
      await store.fetchListPlaces();
    }
  };

  const loadListById = async (id: string) => {
    await store.fetchListCurrentSelection(id);
  };

  const createList = async (name: string) => {
    await store.createListPlace(name);
    return true;
  };

  const deleteList = async (listId: string) => {
    try {
      // Use optimistic delete from store
      await store.deleteListPlace(listId);
      return true;
    } catch (error) {
      console.error("Error deleting list:", error);
      return false;
    }
  };

  const updateList = async (listId: string, name?: string, placeIds?: string[]) => {
    try {
      // If only updating name, use optimistic rename
      if (name && !placeIds) {
        await store.renameListPlace(listId, name);
      } else if (placeIds !== undefined) {
        // If updating places, use the full update endpoint and reload
        const { default: ListService } = await import("@/services/ListService");
        await ListService.updateList(listId, {
          name: name || null,
          place_ids: placeIds || null,
        });
        // Only reload this specific list
        await loadListById(listId);
      }
      
      return true;
    } catch (error) {
      console.error("Error updating list:", error);
      return false;
    }
  };

  const removePlaceFromList = async (listId: string, placeId: string) => {
    try {
      // Use optimistic remove from store
      await store.removePlaceFromListOptimistic(listId, placeId);
      return true;
    } catch (error) {
      console.error("Error removing place from list:", error);
      return false;
    }
  };

  const addPlaceToList = async (listId: string, placeId: string, placeData?: any) => {
    try {
      // Use optimistic add from store
      await store.addPlaceToListOptimistic(listId, placeId, placeData);
      return true;
    } catch (error) {
      console.error("Error adding place to list:", error);
      return false;
    }
  };

  // Initialize - load lists on mount if autoLoad is true
  if (autoLoad) {
    onMounted(() => {
      loadLists();
    });
  }

  return {
    // State
    lists,
    currentList,
    hasLists,
    listCount,
    isLoading,
    isFetching,
    isCreating,
    isDeleting,
    isUpdating,
    error,

    // Actions
    loadLists,
    loadListById,
    createList,
    deleteList,
    updateList,
    removePlaceFromList,
    addPlaceToList,
  };
}
