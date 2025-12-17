import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useTripStore } from "@/stores";
import type { ITrip } from "@/utils/interfaces";
import { useRouter } from "vue-router";
import {
  getLocationDisplay,
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

  // Actions
  const loadTrips = async (force = false) => {
    if (force || trips.value.length === 0) {
      await store.loadTrips();
    }
  };

  const loadTripById = async (id: string) => {
    await store.loadTripById(id);
  };

  const createTrip = async (tripData: {
    tripName: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return await store.createTrip(tripData);
  };

  const addPlaceToTrip = async (
    tripId: string,
    placeData: {
      placeId: string;
      stopOrder?: number;
      arrivalTime?: string;
      notes?: string;
    },
  ) => {
    return await store.addPlaceToTrip(tripId, placeData);
  };

  const removePlaceFromTrip = async (tripId: string, stopId: string) => {
    await store.removePlaceFromTrip(tripId, stopId);
  };

  const getTripById = (id: string): Promise<ITrip | undefined> => {
    return store.getTripById(id);
  };

  const handleTripSelect = (trip: ITrip) => {
    console.log("Trip {trip.id} was selected");
    router.push({ name: "trip-details", params: { tripId: trip.id } });
  };

  const clearError = () => {
    store.clearError();
  };

  // Helper functions for display formatting
  const formatTripLocation = (trip: ITrip): string => {
    return getLocationDisplay(trip);
  };

  const formatTripDate = (dateString?: string): string => {
    return formatDate(dateString);
  };

  const formatTripDateRange = (trip: ITrip): string => {
    return formatDateRange(trip.startDate, trip.endDate);
  };

  const formatTripPlaceCount = (trip: ITrip): string => {
    return getPlaceCountText(trip.stopCount);
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
    formatTripLocation,
    formatTripDate,
    formatTripDateRange,
    formatTripPlaceCount,
  };
}
