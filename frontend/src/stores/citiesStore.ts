import { defineStore } from "pinia";
import { ref } from "vue";
import PlacesService from "@/services/PlacesService";

export const useCitiesStore = defineStore("cities", () => {
  const cities = ref<string[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isFetched = ref(false);

  const fetchCities = async () => {
    if (isFetched.value) return; // Only fetch once
    
    isLoading.value = true;
    error.value = null;
    try {
      cities.value = await PlacesService.getCities();
      isFetched.value = true;
    } catch (err: any) {
      error.value = err?.message ?? "Failed to fetch cities";
      console.error("Failed to fetch cities:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const clearCities = () => {
    cities.value = [];
    isFetched.value = false;
    error.value = null;
  };

  return {
    cities,
    isLoading,
    error,
    isFetched,
    fetchCities,
    clearCities,
  };
});
