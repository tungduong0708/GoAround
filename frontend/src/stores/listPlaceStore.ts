import { defineStore } from "pinia";
import { ListService } from "@/services";
import type { ISavedList } from "@/utils/interfaces";
import { ArrowUpWideNarrow } from "lucide-vue-next";

export const useListPlaceStore = defineStore("listPlace", {
  state: () => ({
    listLists: [] as ISavedList[],
    listCurrentSelection: null as ISavedList | null,
  }),
  actions: {
    async fetchListPlaces() {
      try {
        const response = await ListService.getLists();
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
        await ListService.createList({ name });
        await this.fetchListPlaces();
      } catch (error) {
        console.error(error);
      }
    },
  },
});
