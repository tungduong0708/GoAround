import { defineStore } from "pinia";
import { ListService } from "@/services";
import type { ISavedListSchema, ISavedListDetailedSchema, ISavedListCreate, IPagingQuery } from "@/utils/interfaces";

export const useListPlaceStore = defineStore("listPlace", {
  state: () => ({
    listLists: [] as ISavedListSchema[],
    listCurrentSelection: null as ISavedListDetailedSchema | null,
  }),
  actions: {
    async fetchListPlaces(query?: IPagingQuery) {
      try {
        const response = await ListService.getLists(query || { page: 1, limit: 10 });
        console.log(response.data);
        this.listLists = response.data;
      } catch (error) {
        console.error(error);
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
