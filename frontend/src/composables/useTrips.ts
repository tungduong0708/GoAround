import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore, useTripStore } from "@/stores";
import type { ITripListSchema, ITripSchema, ITripCreate } from "@/utils/interfaces";
import { useRouter } from "vue-router";
import {
  formatDate,
  formatDateRange,
  getPlaceCountText,
} from "@/utils/helpers";

export interface UseTripOptions {
  autoLoad?: boolean;
}

export function useTrips(options: UseTripOptions = {}) {
  const { autoLoad = true } = options;

  const router = useRouter();
  const store = useTripStore();
  const authStore = useAuthStore();

  // Reactive state from store
  const {
    trips,
    currentTrip,
    loading,
    error,
    tripCount,
    hasTrips,
    sortedTrips,
  } = storeToRefs(store);

  // Computed property for authentication status
  const isAuthenticated = authStore.isAuthenticated;

  // Actions
  const loadTrips = async (force = false) => {
    if (force || trips.value.length === 0) {
      await store.loadTrips();
    }
  };

  const loadTripById = async (id: string) => {
    await store.loadTripById(id);
  };

  const createTrip = async (tripData: ITripCreate) => {
    return await store.createTrip(tripData);
  };

  const addPlaceToTrip = async (
    tripId: string,
    placeData: {
      place_id: string;
      stop_order: number;
      arrival_time: string;
      notes: string;
    },
  ) => {
    return await store.addPlaceToTrip(tripId, placeData);
  };

  const removePlaceFromTrip = async (tripId: string, stopId: string) => {
    await store.removePlaceFromTrip(tripId, stopId);
  };

  const getTripById = (id: string): Promise<ITripSchema | undefined> => {
    return store.getTripById(id);
  };

  const handleTripSelect = (trip: ITripListSchema) => {
    console.log(`Trip ${trip.id} was selected`);
    router.push({ name: "trip-details", params: { tripId: trip.id } });
  };

  const clearError = () => {
    store.clearError();
  };

  // Helper functions for display formatting
  const formatTripDate = (dateString?: string): string => {
    return formatDate(dateString);
  };

  const formatTripDateRange = (trip: ITripListSchema): string => {
    return formatDateRange(trip.start_date, trip.end_date);
  };

  const formatTripPlaceCount = (trip: ITripListSchema): string => {
    return getPlaceCountText(trip.stop_count || 0);
  };

  const formatTripLocation = (trip: ITripListSchema): string => {
    // For trip list view, we don't have detailed location info
    // Return a generic message or could be enhanced to fetch first stop location
    return trip.stop_count && trip.stop_count > 0 
      ? `${trip.stop_count} destination${trip.stop_count > 1 ? 's' : ''}`
      : 'No destinations yet';
  };

  // Initialize
  if (autoLoad) {
    onMounted(async () => {
      await loadTrips();
    });
  }

  return {
    // State
    trips,
    currentTrip,
    loading,
    isAuthenticated,
    error,
    tripCount,
    hasTrips,
    sortedTrips,

    // Actions
    loadTrips,
    loadTripById,
    createTrip,
    addPlaceToTrip,
    removePlaceFromTrip,
    getTripById,
    handleTripSelect,
    clearError,

    // Formatters
    formatTripDate,
    formatTripDateRange,
    formatTripPlaceCount,
    formatTripLocation,
  };
}
