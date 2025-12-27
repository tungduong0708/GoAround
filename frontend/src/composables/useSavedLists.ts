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
  const { listLists, listCurrentSelection } = storeToRefs(store);

  // Computed properties
  const lists = computed(() => listLists.value);
  const currentList = computed(() => listCurrentSelection.value);
  const hasLists = computed(() => lists.value.length > 0);
  const listCount = computed(() => lists.value.length);

  // Actions
  const loadLists = async (force = false) => {
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
      // Call delete API through service
      const { default: ListService } = await import("@/services/ListService");
      await ListService.deleteList(listId);
      // Reload lists after deletion
      await loadLists(true);
      return true;
    } catch (error) {
      console.error("Error deleting list:", error);
      return false;
    }
  };

  const updateList = async (listId: string, name?: string, placeIds?: string[]) => {
    try {
      const { default: ListService } = await import("@/services/ListService");
      
      // Use the efficient rename endpoint if only updating name
      if (name && !placeIds) {
        await ListService.renameList(listId, name);
      } else if (placeIds !== undefined) {
        // If updating places, use the full update endpoint
        await ListService.updateList(listId, {
          name: name || null,
          place_ids: placeIds || null,
        });
      }
      
      // Only reload the specific list, not all lists (for performance)
      await loadListById(listId);
      return true;
    } catch (error) {
      console.error("Error updating list:", error);
      return false;
    }
  };

  const removePlaceFromList = async (listId: string, placeId: string) => {
    try {
      // Use the efficient remove endpoint
      const { default: ListService } = await import("@/services/ListService");
      await ListService.removePlaceFromList(listId, placeId);
      
      // Only reload the specific list, not all lists
      await loadListById(listId);
      return true;
    } catch (error) {
      console.error("Error removing place from list:", error);
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

    // Actions
    loadLists,
    loadListById,
    createList,
    deleteList,
    updateList,
    removePlaceFromList,
  };
}
