import { defineStore } from "pinia";
import { ListService } from "@/services";
import type { ISavedListSchema, ISavedListDetailSchema, IPagingQuery } from "@/utils/interfaces";

export const useListPlaceStore = defineStore("listPlace", {
  state: () => ({
    listLists: [] as ISavedListSchema[],
    listCurrentSelection: null as ISavedListDetailSchema | null,
    // Request deduplication - track in-flight requests
    pendingRequests: new Map<string, Promise<any>>() as Map<string, Promise<any>>,
    // Granular loading states
    isFetching: false,
    isCreating: false,
    isDeleting: false,
    isUpdating: false,
    error: null as string | null,
  }),
  actions: {
    // Helper method for request deduplication
    async dedupedRequest<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
      // If there's already a pending request for this key, return it
      if (this.pendingRequests.has(key)) {
        return this.pendingRequests.get(key) as Promise<T>;
      }

      // Create new request
      const promise = fetcher().finally(() => {
        // Cleanup after request completes
        this.pendingRequests.delete(key);
      });

      this.pendingRequests.set(key, promise);
      return promise;
    },

    async fetchListPlaces(query?: IPagingQuery) {
      return this.dedupedRequest('fetchListPlaces', async () => {
        this.isFetching = true;
        this.error = null;
        try {
          const response = await ListService.getLists(query || { page: 1, limit: 50 });
          console.log("Fetched lists:", response);
          // response is already { data: [...], meta: {...} }
          this.listLists = response.data;
          return response;
        } catch (error: any) {
          this.error = error.message || "Failed to fetch lists";
          console.error("Error fetching lists:", error);
          throw error;
        } finally {
          this.isFetching = false;
        }
      });
    },
    async fetchListCurrentSelection(id: string) {
      return this.dedupedRequest(`fetchListCurrentSelection-${id}`, async () => {
        this.isFetching = true;
        this.error = null;
        try {
          const response = await ListService.getListById(id);
          this.listCurrentSelection = response.data;
          return response;
        } catch (error: any) {
          this.error = error.message || "Failed to fetch list details";
          console.error(error);
          throw error;
        } finally {
          this.isFetching = false;
        }
      });
    },
    async createListPlace(name: string) {
      this.isCreating = true;
      this.error = null;
      
      // Generate temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempList: ISavedListSchema = {
        id: tempId,
        name,
        created_at: new Date().toISOString(),
        item_count: 0,
      };
      
      // Optimistically add to local state
      this.listLists.unshift(tempList);
      
      try {
        const newList = await ListService.createList({ name });
        
        // Replace temp with real data
        const index = this.listLists.findIndex(l => l.id === tempId);
        if (index !== -1) {
          this.listLists[index] = {
            id: newList.id,
            name: newList.name,
            created_at: newList.created_at,
            item_count: 0,
          };
        }
        
        return newList;
      } catch (error: any) {
        // Rollback on error
        this.listLists = this.listLists.filter(l => l.id !== tempId);
        this.error = error.message || "Failed to create list";
        console.error(error);
        throw error;
      } finally {
        this.isCreating = false;
      }
    },

    async deleteListPlace(listId: string) {
      this.isDeleting = true;
      this.error = null;
      
      // Store for rollback
      const index = this.listLists.findIndex(l => l.id === listId);
      const deletedList = index !== -1 ? { ...this.listLists[index] } : null;
      const wasCurrentSelection = this.listCurrentSelection?.id === listId;
      const previousSelection = wasCurrentSelection ? { ...this.listCurrentSelection } : null;
      
      // Optimistically remove from state
      if (index !== -1) {
        this.listLists.splice(index, 1);
      }
      if (wasCurrentSelection) {
        this.listCurrentSelection = null;
      }
      
      try {
        await ListService.deleteList(listId);
      } catch (error: any) {
        // Rollback on error
        if (deletedList) {
          if (index !== -1) {
            this.listLists.splice(index, 0, deletedList as ISavedListSchema);
          } else {
            this.listLists.push(deletedList as ISavedListSchema);
          }
        }
        if (previousSelection) {
          this.listCurrentSelection = previousSelection as ISavedListDetailSchema;
        }
        this.error = error.message || "Failed to delete list";
        console.error(error);
        throw error;
      } finally {
        this.isDeleting = false;
      }
    },

    async renameListPlace(listId: string, newName: string) {
      this.isUpdating = true;
      this.error = null;
      
      // Store old name for rollback
      const list = this.listLists.find(l => l.id === listId);
      const oldName = list?.name;
      const wasCurrentSelection = this.listCurrentSelection?.id === listId;
      const oldSelectionName = wasCurrentSelection ? this.listCurrentSelection?.name : null;
      
      // Optimistically update name
      if (list) {
        list.name = newName;
      }
      if (wasCurrentSelection && this.listCurrentSelection) {
        this.listCurrentSelection.name = newName;
      }
      
      try {
        const updatedList = await ListService.renameList(listId, newName);
        
        // Update with backend response (in case backend modified the name)
        if (list) {
          list.name = updatedList.name;
        }
        if (wasCurrentSelection && this.listCurrentSelection) {
          this.listCurrentSelection.name = updatedList.name;
        }
        
        return updatedList;
      } catch (error: any) {
        // Rollback on error
        if (list && oldName) {
          list.name = oldName;
        }
        if (wasCurrentSelection && this.listCurrentSelection && oldSelectionName) {
          this.listCurrentSelection.name = oldSelectionName;
        }
        this.error = error.message || "Failed to rename list";
        console.error(error);
        throw error;
      } finally {
        this.isUpdating = false;
      }
    },

    async addPlaceToListOptimistic(listId: string, placeId: string, placeData?: any) {
      this.isUpdating = true;
      this.error = null;
      
      // Store state for rollback
      const list = this.listLists.find(l => l.id === listId);
      const oldCount = list?.item_count || 0;
      const wasCurrentSelection = this.listCurrentSelection?.id === listId;
      const oldItems = wasCurrentSelection && this.listCurrentSelection?.items
        ? [...this.listCurrentSelection.items] 
        : null;
      
      // Optimistically update count
      if (list) {
        list.item_count = (list.item_count || 0) + 1;
      }
      
      // If this list is currently selected and we have place data, add to items
      if (wasCurrentSelection && this.listCurrentSelection?.items && placeData) {
        this.listCurrentSelection.items.push({
          place: placeData,
          saved_at: new Date().toISOString(),
        });
      }
      
      try {
        await ListService.addPlaceToList(listId, { place_id: placeId });
        
        // If we don't have place data and this is the current selection, fetch updated list
        if (wasCurrentSelection && !placeData) {
          await this.fetchListCurrentSelection(listId);
        }
      } catch (error: any) {
        // Rollback on error
        if (list) {
          list.item_count = oldCount;
        }
        if (wasCurrentSelection && this.listCurrentSelection && oldItems) {
          this.listCurrentSelection.items = oldItems;
        }
        this.error = error.message || "Failed to add place to list";
        console.error(error);
        throw error;
      } finally {
        this.isUpdating = false;
      }
    },

    async removePlaceFromListOptimistic(listId: string, placeId: string) {
      this.isUpdating = true;
      this.error = null;
      
      // Store state for rollback
      const list = this.listLists.find(l => l.id === listId);
      const oldCount = list?.item_count || 0;
      const wasCurrentSelection = this.listCurrentSelection?.id === listId;
      
      let removedItem = null;
      let removedIndex = -1;
      
      // Optimistically update count
      if (list && list.item_count !== undefined && list.item_count > 0) {
        list.item_count -= 1;
      }
      
      // If this list is currently selected, remove from items
      if (wasCurrentSelection && this.listCurrentSelection?.items) {
        removedIndex = this.listCurrentSelection.items.findIndex(
          item => item.place.id === placeId
        );
        if (removedIndex !== -1) {
          removedItem = this.listCurrentSelection.items[removedIndex];
          this.listCurrentSelection.items.splice(removedIndex, 1);
        }
      }
      
      try {
        await ListService.removePlaceFromList(listId, placeId);
      } catch (error: any) {
        // Rollback on error
        if (list) {
          list.item_count = oldCount;
        }
        if (wasCurrentSelection && this.listCurrentSelection?.items && removedItem && removedIndex !== -1) {
          this.listCurrentSelection.items.splice(removedIndex, 0, removedItem);
        }
        this.error = error.message || "Failed to remove place from list";
        console.error(error);
        throw error;
      } finally {
        this.isUpdating = false;
      }
    },
    // Optimistic update for incrementing item count
    incrementListItemCount(listId: string) {
      const list = this.listLists.find(l => l.id === listId);
      if (list && list.item_count !== undefined) {
        list.item_count += 1;
      }
    },
    // Optimistic update for decrementing item count
    decrementListItemCount(listId: string) {
      const list = this.listLists.find(l => l.id === listId);
      if (list && list.item_count !== undefined && list.item_count > 0) {
        list.item_count -= 1;
      }
    },
  },
});
