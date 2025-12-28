import { ref } from "vue";
import { useTripStore } from "@/stores";
import type { IPlacePublic } from "@/utils/interfaces";
import { useRouter } from "vue-router";

export interface PlanTripFormData {
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  places: IPlacePublic[];
  isPublic?: boolean;
}

export function usePlanTrip() {
  const router = useRouter();
  const tripStore = useTripStore();

  // Modal state
  const showPlanTripModal = ref(false);

  // Form state for temporary places before trip creation
  const selectedPlaces = ref<IPlacePublic[]>([]);

  // Get loading and error state from store
  const { planTripLoading, error } = tripStore;

  // Open modal
  const openPlanTripModal = () => {
    showPlanTripModal.value = true;
  };

  // Close modal
  const closePlanTripModal = () => {
    showPlanTripModal.value = false;
    selectedPlaces.value = [];
  };

  // Handle trip submission
  const handleTripSubmit = async (formData: PlanTripFormData) => {
    try {
      // Prepare stops array from places
      const stops = formData.places.map((place, index) => ({
        place_id: place.id,
        stop_order: index + 1,
        arrival_time: formData.startDate || new Date().toISOString(),
        notes: `Visit ${place.name} in ${place.city || 'unknown location'}`,
      }));

      // Create the trip with stops
      const newTrip = await tripStore.createTrip({
        trip_name: formData.tripName,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        public: formData.isPublic ?? false,
        stops: stops.length > 0 ? stops : undefined,
      });

      // Close modal
      closePlanTripModal();

      // Navigate to the new trip details page
      router.push({ name: "trip-details", params: { tripId: newTrip.id } });

      return newTrip;
    } catch (error) {
      console.error("Failed to create trip:", error);
      throw error;
    }
  };

  // Add a place to the temporary selection
  const addPlaceToSelection = (place: IPlacePublic) => {
    if (!selectedPlaces.value.find((p) => p.id === place.id)) {
      selectedPlaces.value.push(place);
    }
  };

  // Remove a place from the temporary selection
  const removePlaceFromSelection = (placeId: string) => {
    selectedPlaces.value = selectedPlaces.value.filter((p) => p.id !== placeId);
  };

  // Clear selected places
  const clearSelectedPlaces = () => {
    selectedPlaces.value = [];
  };

  return {
    // State
    showPlanTripModal,
    selectedPlaces,
    planTripLoading,
    error,

    // Actions
    openPlanTripModal,
    closePlanTripModal,
    handleTripSubmit,
    addPlaceToSelection,
    removePlaceFromSelection,
    clearSelectedPlaces,
  };
}
