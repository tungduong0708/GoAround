import { ref } from "vue";
import { useTripStore } from "@/stores";
import type { IPlace } from "@/utils/interfaces";
import { useRouter } from "vue-router";

export interface PlanTripFormData {
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  places: IPlace[];
}

export function usePlanTrip() {
  const router = useRouter();
  const tripStore = useTripStore();

  // Modal state
  const showPlanTripModal = ref(false);

  // Form state for temporary places before trip creation
  const selectedPlaces = ref<IPlace[]>([]);

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
      // Create the trip first
      const newTrip = await tripStore.createTrip({
        tripName: formData.tripName,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      });

      // Add places to the trip if any
      if (formData.places.length > 0) {
        const addPlacePromises = formData.places.map((place, index) =>
          tripStore.addPlaceToTrip(newTrip.id, {
            placeId: place.id,
            stopOrder: index + 1,
            arrivalTime: formData.startDate || new Date().toISOString(),
            notes: `Visit ${place.name} in ${place.city}`,
          }),
        );

        await Promise.all(addPlacePromises);
      }

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
  const addPlaceToSelection = (place: IPlace) => {
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
