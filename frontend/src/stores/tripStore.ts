import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { ITrip } from "@/utils/interfaces";
import { TripService } from "@/services";
import { mockTrips } from "@/utils/constants/mockData";

export const useTripStore = defineStore("trip", () => {
  // State
  const trips = ref<ITrip[]>([]);
  const currentTrip = ref<ITrip | null>(null);
  const loading = ref(false);
  const planTripLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const tripCount = computed(() => trips.value.length);

  const hasTrips = computed(() => trips.value.length > 0);

  const sortedTrips = computed(() => {
    return [...trips.value].sort((a, b) => {
      if (!a.startDate) return 1;
      if (!b.startDate) return -1;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
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
      // Fallback to mock data on error
      console.warn("Failed to load trips from API, using mock data");
      trips.value = mockTrips;
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

  const createTrip = async (tripData: {
    tripName: string;
    startDate?: string;
    endDate?: string;
  }) => {
    planTripLoading.value = true;
    error.value = null;

    try {
      const newTrip = await TripService.createTrip(tripData);
      trips.value.unshift(newTrip);
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
      placeId: string;
      stopOrder?: number;
      arrivalTime?: string;
      notes?: string;
    },
  ) => {
    loading.value = true;
    error.value = null;

    try {
      // Ensure required fields are present
      const input = {
        placeId: placeData.placeId,
        arrivalTime: placeData.arrivalTime || new Date().toISOString(),
        notes: placeData.notes,
      };

      const newStop = await TripService.addPlaceToTrip(tripId, input);

      // Update the trip in the store
      const tripIndex = trips.value.findIndex((t) => t.id === tripId);
      if (tripIndex !== -1) {
        const trip = trips.value[tripIndex];
        if (trip) {
          if (trip.stops) {
            trip.stops.push(newStop);
          } else {
            trip.stops = [newStop];
          }
          trip.stopCount = (trip.stopCount || 0) + 1;
        }
      }

      return newStop;
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
      await TripService.removePlaceFromTrip(tripId, stopId);

      // Update the trip in the store
      const tripIndex = trips.value.findIndex((t) => t.id === tripId);
      if (tripIndex !== -1) {
        const trip = trips.value[tripIndex];
        if (trip && trip.stops) {
          trip.stops = trip.stops.filter((s) => s.id !== stopId);
          trip.stopCount = trip.stops.length;
        }
      }
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

  const getTripById = (id: string): Promise<ITrip | undefined> => {
    return TripService.getTripById(id).then((trip) => {
      if (trip) {
        trips.value.push(trip);
      }
      return trip;
    });
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
