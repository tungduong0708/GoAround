import { defineStore } from "pinia";
import { ListService } from "@/services";
import type { ISavedListSchema, ISavedListDetailSchema, ISavedListCreate, IPagingQuery } from "@/utils/interfaces";

export const useListPlaceStore = defineStore("listPlace", {
  state: () => ({
    listLists: [] as ISavedListSchema[],
    listCurrentSelection: null as ISavedListDetailSchema | null,
  }),
  actions: {
    async fetchListPlaces(query?: IPagingQuery) {
      try {
        const response = await ListService.getLists(query || { page: 1, limit: 50 });
        console.log("Fetched lists:", response);
        // response is already { data: [...], meta: {...} }
        this.listLists = response.data;
      } catch (error) {
        console.error("Error fetching lists:", error);
        throw error;
      }
    },
    async fetchListCurrentSelection(id: string) {
      try {
        const response = await ListService.getListById(id);
        this.listCurrentSelection = response.data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async createListPlace(name: string) {
      try {
        const input: ISavedListCreate = { name };
        const newList = await ListService.createList(input);
        
        // Optimistically add to local state
        this.listLists.push({
          id: newList.id,
          name: newList.name,
          created_at: newList.created_at,
          item_count: 0,
        });
        
        return newList;
      } catch (error) {
        console.error(error);
        throw error;
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
