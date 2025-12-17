import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore, useTripStore } from "@/stores";
import type { ITripStop } from "@/utils/interfaces";
import { useRouter } from "vue-router";
import {
  formatDate,
  formatDateRange,
  getPlaceCountText,
} from "@/utils/helpers";

export interface StopGroup {
  id: string;
  title: string;
  date?: string;
  stops: ITripStop[];
}

export interface UseTripDetailsOptions {
  tripId: string;
  autoLoad?: boolean;
  useMockData?: boolean;
}

export function useTripDetails(options: UseTripDetailsOptions) {
  const { tripId, autoLoad = true } = options;

  const router = useRouter();
  const store = useTripStore();
  const authStore = useAuthStore();

  // Reactive state from store
  const { currentTrip, loading, error } = storeToRefs(store);
  
  const isAuthenticated = authStore.isAuthenticated;

  // Local state
  const isRemoving = ref(false);
  const removeError = ref<string | null>(null);

  // Computed properties
  const hasStops = computed(
    () => currentTrip.value?.stops && currentTrip.value.stops.length > 0,
  );

  const sortedStops = computed(() => {
    if (!currentTrip.value?.stops) return [];
    return [...currentTrip.value.stops].sort(
      (a, b) => a.stop_order - b.stop_order,
    );
  });

  // Group stops by date
  const stopGroups = computed((): StopGroup[] => {
    if (!hasStops.value || !currentTrip.value) return [];

    const stops = sortedStops.value;
    const groups: StopGroup[] = [];

    // Group stops by arrival date
    const groupedByDate = new Map<string, ITripStop[]>();

    stops.forEach((stop) => {
      const dateKey = stop.arrival_time
        ? new Date(stop.arrival_time).toLocaleDateString()
        : "unscheduled";

      if (!groupedByDate.has(dateKey)) {
        groupedByDate.set(dateKey, []);
      }
      groupedByDate.get(dateKey)!.push(stop);
    });

    // Convert to array of groups
    let groupIndex = 0;
    groupedByDate.forEach((groupStops, dateKey) => {
      const isUnscheduled = dateKey === "unscheduled";
      const groupDate = isUnscheduled ? undefined : groupStops[0]?.arrival_time;

      groups.push({
        id: `group-${groupIndex++}`,
        title: isUnscheduled
          ? "Unscheduled Places"
          : formatDate(groupDate) || "Unknown Date",
        date: groupDate,
        stops: groupStops,
      });
    });

    // If no date-based groups, create a single group with trip name
    if (groups.length === 0 && stops.length > 0) {
      groups.push({
        id: "main",
        title: currentTrip.value.trip_name,
        stops: stops,
      });
    }

    return groups;
  });

  const tripInfo = computed(() => {
    if (!currentTrip.value) return null;

    return {
      name: currentTrip.value.trip_name,
      dateRange: formatDateRange(
        currentTrip.value.start_date,
        currentTrip.value.end_date,
      ),
      placeCount: getPlaceCountText(currentTrip.value.stop_count),
      hasDateRange: !!(
        currentTrip.value.start_date || currentTrip.value.end_date
      ),
    };
  });

  // Actions
  const loadTrip = async (force = false) => {
    if (!tripId) return;

    if (force || !currentTrip.value || currentTrip.value.id !== tripId) {
      await store.loadTripById(tripId);
    }
  };

  const removeStop = async (stopId: string) => {
    if (!tripId || !stopId) return;

    isRemoving.value = true;
    removeError.value = null;

    try {
      await store.removePlaceFromTrip(tripId, stopId);
    } catch (err) {
      removeError.value =
        err instanceof Error ? err.message : "Failed to remove place";
      throw err;
    } finally {
      isRemoving.value = false;
    }
  };

  const navigateToPlace = (placeId: string) => {
    router.push({ name: "details", params: { id: placeId } });
  };

  const navigateBack = () => {
    router.push({ name: "trip" });
  };

  const navigateToAddPlace = () => {
    // TODO: Implement add place flow
    console.log("Navigate to add place");
  };

  const clearErrors = () => {
    store.clearError();
    removeError.value = null;
  };

  // Helper functions
  const formatArrivalTime = (arrivalTime: string): string => {
    const date = new Date(arrivalTime);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatArrivalDateTime = (arrivalTime: string): string => {
    const date = new Date(arrivalTime);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStopOrder = (stopId: string): number => {
    const stop = currentTrip.value?.stops?.find((s) => s.id === stopId);
    return stop?.stop_order || 0;
  };

  // Initialize
  if (autoLoad) {
    loadTrip();
  }

  // Watch for tripId changes
  watch(
    () => options.tripId,
    (newTripId) => {
      if (newTripId && newTripId !== currentTrip.value?.id) {
        loadTrip(true);
      }
    },
  );

  return {
    // State
    trip: currentTrip,
    isAuthenticated, 
    loading,
    error,
    isRemoving,
    removeError,

    // Computed
    hasStops,
    sortedStops,
    stopGroups,
    tripInfo,

    // Actions
    loadTrip,
    removeStop,
    navigateToPlace,
    navigateBack,
    navigateToAddPlace,
    clearErrors,

    // Helpers
    formatArrivalTime,
    formatArrivalDateTime,
    getStopOrder,
  };
}
