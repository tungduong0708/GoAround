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
  const aiGenerating = ref(false);
  const deletingTripId = ref<string | null>(null);
  const error = ref<string | null>(null);
  const tripPreviewImages = ref<Map<string, string>>(new Map());

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

  const upcomingTrips = computed(() => {
    const now = new Date();
    return trips.value.filter((trip) => {
      if (!trip.start_date) return false;
      return new Date(trip.start_date) > now;
    });
  });

  const pastTrips = computed(() => {
    const now = new Date();
    return trips.value.filter((trip) => {
      if (!trip.end_date) return false;
      return new Date(trip.end_date) < now;
    });
  });

  const tripStats = computed(() => ({
    total: trips.value.length,
    upcoming: upcomingTrips.value.length,
    completed: pastTrips.value.length,
  }));

  // Actions
  const loadTrips = async () => {
    loading.value = true;
    error.value = null;

    try {
      // Fetch from API
      const response = await TripService.getTrips();
      trips.value = response.data;
      
      // Fetch preview images for trips (non-blocking)
      trips.value.forEach(async (trip) => {
        if (!tripPreviewImages.value.has(trip.id)) {
          try {
            const fullTrip = await TripService.getTripById(trip.id);
            if (fullTrip.stops && fullTrip.stops.length > 0) {
              for (const stop of fullTrip.stops) {
                if (stop.place?.main_image_url) {
                  tripPreviewImages.value.set(trip.id, stop.place.main_image_url);
                  trip.preview_image_url = stop.place.main_image_url;
                  break;
                }
              }
            }
          } catch (err) {
            // Silently fail for preview image fetching
            console.warn(`Failed to load preview for trip ${trip.id}`);
          }
        } else {
          trip.preview_image_url = tripPreviewImages.value.get(trip.id);
        }
      });
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
      
      // Cache preview image if trip has stops with places
      if (newTrip.stops && newTrip.stops.length > 0) {
        for (const stop of newTrip.stops) {
          if (stop.place?.main_image_url) {
            tripPreviewImages.value.set(newTrip.id, stop.place.main_image_url);
            break;
          }
        }
      }
      
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
      // Optimistically update the UI by filtering out the stop
      if (currentTrip.value && currentTrip.value.id === tripId) {
        currentTrip.value = {
          ...currentTrip.value,
          stops: currentTrip.value.stops?.filter(stop => stop.id !== stopId) || []
        };
      }

      // Get current trip data from server
      const currentTripData = await TripService.getTripById(tripId);
      
      // Filter out the stop to remove and map to the required format
      const filteredStops = currentTripData.stops
        ?.filter(stop => stop.id !== stopId)
        .map(stop => {
          const placeId = stop.place_id || stop.place?.id || '';
          const arrivalTime = stop.arrival_time || new Date().toISOString();
          
          return {
            place_id: placeId,
            stop_order: stop.stop_order,
            arrival_time: arrivalTime,
            notes: stop.notes || undefined,
          };
        }) || [];
      
      // Update the trip with the filtered stops (this will replace all stops)
      const updatedTrip = await TripService.updateTrip(tripId, {
        trip_name: currentTripData.trip_name,
        start_date: currentTripData.start_date,
        end_date: currentTripData.end_date,
        tags: currentTripData.tags,
        stops: filteredStops,
      });

      // Reload the current trip to reflect changes from server
      await loadTripById(tripId);
      
      // Reload trips list to reflect changes
      await loadTrips();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to remove place from trip";
      // Reload trip to revert optimistic update on error
      await loadTripById(tripId);
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

  const deleteTrip = async (id: string) => {
    deletingTripId.value = id;
    error.value = null;

    try {
      await TripService.deleteTrip(id);
      // Remove from local state
      trips.value = trips.value.filter((trip) => trip.id !== id);
      
      // Clear current trip if it's the one being deleted
      if (currentTrip.value?.id === id) {
        currentTrip.value = null;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete trip";
      throw err;
    } finally {
      deletingTripId.value = null;
    }
  };

  const generateTrip = async (input: { destination: string; start_date: string; end_date: string }) => {
    aiGenerating.value = true;
    error.value = null;

    try {
      console.log('Calling generateTrip API with:', input);
      const generatedTrip = await TripService.generateTrip(input);
      console.log('Generated trip received:', generatedTrip);
      
      if (!generatedTrip || !generatedTrip.id) {
        throw new Error('Invalid trip data received from API');
      }
      
      // Cache preview image if trip has stops with places
      if (generatedTrip.stops && generatedTrip.stops.length > 0) {
        for (const stop of generatedTrip.stops) {
          if (stop.place?.main_image_url) {
            tripPreviewImages.value.set(generatedTrip.id, stop.place.main_image_url);
            break;
          }
        }
      }
      
      // Reload trips in the background (non-blocking for navigation)
      loadTrips().catch(err => console.warn('Failed to reload trips:', err));
      
      return generatedTrip;
    } catch (err) {
      console.error('Generate trip error in store:', err);
      error.value =
        err instanceof Error ? err.message : "Failed to generate trip";
      throw err;
    } finally {
      aiGenerating.value = false;
    }
  };

  return {
    // State
    trips,
    currentTrip,
    loading,
    planTripLoading,
    aiGenerating,
    deletingTripId,
    error,

    // Computed
    tripCount,
    hasTrips,
    sortedTrips,
    upcomingTrips,
    pastTrips,
    tripStats,

    // Actions
    loadTrips,
    loadTripById,
    createTrip,
    addPlaceToTrip,
    removePlaceFromTrip,
    deleteTrip,
    generateTrip,
    clearError,
    getTripById,
  };
});
