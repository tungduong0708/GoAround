import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { ITripSchema, ITripListSchema, ITripCreate } from "@/utils/interfaces";
import { TripService } from "@/services";

export const useTripStore = defineStore("trip", () => {
  // State
  const trips = ref<ITripListSchema[]>([]);
  const currentTrip = ref<ITripSchema | null>(null);
  const loading = ref(false);
  const planTripLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const tripCount = computed(() => trips.value.length);

  const hasTrips = computed(() => trips.value.length > 0);

  const sortedTrips = computed(() => {
    return [...trips.value].sort((a, b) => {
      if (!a.start_date) return 1;
      if (!b.start_date) return -1;
      return (
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      );
    });
  });

  // Actions
  const loadTrips = async () => {
    loading.value = true;
    error.value = null;

    try {
      // Fetch from API
      const response = await TripService.getTrips();
      trips.value = response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load trips";
    } finally {
      loading.value = false;
    }
  };

  const loadTripById = async (id: string) => {
    loading.value = true;
    error.value = null;
    currentTrip.value = null;

    try {
      // Fetch from API
      currentTrip.value = await TripService.getTripById(id);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load trip details";
    } finally {
      loading.value = false;
    }
  };

  const createTrip = async (tripData: ITripCreate) => {
    planTripLoading.value = true;
    error.value = null;

    try {
      const newTrip = await TripService.createTrip(tripData);
      await loadTrips(); // Reload the list to get the latest
      return newTrip;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create trip";
      throw err;
    } finally {
      planTripLoading.value = false;
    }
  };

  const addPlaceToTrip = async (
    tripId: string,
    placeData: {
      place_id: string;
      stop_order: number;
      arrival_time: string;
      notes: string;
    }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      // Get current trip data
      const currentTripData = await TripService.getTripById(tripId);
      
      // Create new stops array with the new place
      const newStop: ITripCreate["stops"][0] = {
        place_id: placeData.place_id,
        stop_order: placeData.stop_order,
        arrival_time: placeData.arrival_time,
        notes: placeData.notes,
      };
      
      // Map existing stops to the create format (without the place object)
      const existingStops: ITripCreate["stops"] = currentTripData.stops.map((stop) => ({
        place_id: stop.place.id,
        stop_order: stop.stop_order,
        arrival_time: stop.arrival_time,
        notes: stop.notes,
      }));
      
      const updatedStops = [...existingStops, newStop];
      
      // Update with new stops by recreating the trip data
      const updatedTrip = await TripService.updateTrip(tripId, {
        trip_name: currentTripData.trip_name,
        start_date: currentTripData.start_date,
        end_date: currentTripData.end_date,
        tags: currentTripData.tags,
      });

      // Reload trips list to reflect changes
      await loadTrips();
      
      return updatedTrip;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to add place to trip";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const removePlaceFromTrip = async (tripId: string, stopId: string) => {
    loading.value = true;
    error.value = null;

    try {
      // Get current trip data
      const currentTripData = await TripService.getTripById(tripId);
      
      // Filter out the stop to remove and convert to create format
      const updatedStops: ITripCreate["stops"] = currentTripData.stops
        .filter((s) => s.id !== stopId)
        .map((stop) => ({
          place_id: stop.place.id,
          stop_order: stop.stop_order,
          arrival_time: stop.arrival_time,
          notes: stop.notes,
        }));
      
      // Update the trip with the filtered stops
      await TripService.updateTrip(tripId, {
        trip_name: currentTripData.trip_name,
        start_date: currentTripData.start_date,
        end_date: currentTripData.end_date,
        tags: currentTripData.tags,
      });

      // Reload trips list to reflect changes
      await loadTrips();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to remove place from trip";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const getTripById = async (id: string): Promise<ITripSchema | undefined> => {
    try {
      const trip = await TripService.getTripById(id);
      return trip;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to get trip";
      return undefined;
    }
  };

  return {
    // State
    trips,
    currentTrip,
    loading,
    planTripLoading,
    error,

    // Computed
    tripCount,
    hasTrips,
    sortedTrips,

    // Actions
    loadTrips,
    loadTripById,
    createTrip,
    addPlaceToTrip,
    removePlaceFromTrip,
    clearError,
    getTripById,
  };
});
