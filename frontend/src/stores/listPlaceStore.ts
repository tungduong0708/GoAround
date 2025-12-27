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
      }
    },
    async createListPlace(name: string) {
      try {
        const input: ISavedListCreate = { name };
        await ListService.createList(input);
        await this.fetchListPlaces();
      } catch (error) {
        console.error(error);
      }
    },
  },
});
