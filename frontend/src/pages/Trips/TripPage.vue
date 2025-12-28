<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTripDetails, useGenerateTrip } from "@/composables";
import TripService from "@/services/TripService";
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import SavedPlacesModal from "@/components/trip/SavedPlacesModal.vue";
import TripItinerary from "@/components/trip/TripItinerary.vue";
import AddPlaceToTripModal from "@/components/trip/AddPlaceToTripModal.vue";
import GenerateTripModal from "@/components/trip/GenerateTripModal.vue";
import {
  MapPin,
  Calendar,
  ArrowLeft,
  Plus,
  AlertCircle,
  Bookmark,
  Save,
  Globe,
  Lock,
  Sparkles,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const tripId = route.params.tripId as string;

const {
  trip,
  loading,
  error,
  isRemoving,
  removeError,
  hasStops,
  stopGroups,
  tripInfo,
  loadTrip,
  removeStop,
  navigateToPlace,
  navigateBack,
  clearErrors,
} = useTripDetails({ tripId, autoLoad: true });

const showSavedPlacesModal = ref(false);
const showAddPlaceModal = ref(false);
const selectedDayForPlace = ref<number>(0);
const isEditingDetails = ref(false);

const { 
  showGenerateTripModal, 
  openGenerateTripModal, 
  handleGenerateSubmit,
  aiGenerating,
  error: generateError
} = useGenerateTrip();

// Editable trip details
const editableTripName = ref("");
const editableStartDate = ref("");
const editableEndDate = ref("");

const handleAddFromSavedPlaces = () => {
  showSavedPlacesModal.value = true;
};

const handlePlaceAdded = async () => {
  // Reload trip to show newly added place
  await loadTrip(true);
};

const handleRemoveStop = async (stopId: string) => {
  if (confirm("Are you sure you want to remove this place from your trip?")) {
    try {
      await removeStop(stopId);
    } catch (err) {
      console.error("Failed to remove stop:", err);
    }
  }
};

const handleReorderStop = async (fromIndex: number, toIndex: number, dayIndex: number) => {
  if (!trip.value?.stops || !trip.value.start_date || !trip.value.end_date) return;
  
  try {
    // Calculate the date for the specific day
    const start = new Date(trip.value.start_date);
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + dayIndex);
    const dateString = targetDate.toISOString().split("T")[0];
    
    // Get stops for the specific day
    const dayStops = trip.value.stops.filter(stop => {
      if (!stop.arrival_time) return false;
      const stopDate = new Date(stop.arrival_time).toISOString().split("T")[0];
      return stopDate === dateString;
    });
    
    const movedStop = dayStops[fromIndex];
    if (!movedStop) return;
    
    // Create new stops array with updated order
    const updatedStops = [...trip.value.stops];
    const movedStopInFullArray = updatedStops.find(s => s.id === movedStop.id);
    if (!movedStopInFullArray) return;
    
    // Remove the stop from its original position
    const originalIndex = updatedStops.indexOf(movedStopInFullArray);
    updatedStops.splice(originalIndex, 1);
    
    // Calculate the new position in the full array
    const targetStopInDay = dayStops[toIndex];
    const targetIndexInFullArray = updatedStops.findIndex(s => s.id === targetStopInDay?.id);
    const newIndex = targetIndexInFullArray >= 0 ? targetIndexInFullArray : updatedStops.length;
    
    // Insert at new position
    updatedStops.splice(newIndex, 0, movedStopInFullArray);
    
    // Update stop_order for all stops
    const stopsPayload = updatedStops.map((stop, idx) => ({
      place_id: stop.place?.id || '',
      stop_order: idx,
      arrival_time: stop.arrival_time || '',
      notes: stop.notes || ''
    }));
    
    // Update trip with new stops order
    await TripService.updateTrip(trip.value.id, { stops: stopsPayload });
    await loadTrip(true);
  } catch (error) {
    console.error('Failed to reorder stop:', error);
  }
};

const handleMoveStopBetweenDays = async (
  stopId: string, 
  fromDayIndex: number, 
  toDayIndex: number, 
  toPosition: number
) => {
  if (!trip.value?.stops || !trip.value.start_date) return;
  
  try {
    const updatedStops = [...trip.value.stops];
    const stopToMove = updatedStops.find(s => s.id === stopId);
    if (!stopToMove) return;
    
    // Calculate new arrival_time based on target day
    const startDate = new Date(trip.value.start_date);
    const newArrivalDate = new Date(startDate);
    newArrivalDate.setDate(startDate.getDate() + toDayIndex);
    const newArrivalTime = newArrivalDate.toISOString();
    
    // Remove stop from original position
    const originalIndex = updatedStops.indexOf(stopToMove);
    updatedStops.splice(originalIndex, 1);
    
    // Find target position in the full array
    const targetDayStops = updatedStops.filter(stop => {
      if (!stop.arrival_time) return false;
      const stopDate = new Date(stop.arrival_time);
      const daysDiff = Math.floor((stopDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff === toDayIndex;
    });
    
    let insertIndex = updatedStops.length;
    if (toPosition < targetDayStops.length && targetDayStops[toPosition]) {
      insertIndex = updatedStops.indexOf(targetDayStops[toPosition]);
    } else if (targetDayStops.length > 0) {
      insertIndex = updatedStops.indexOf(targetDayStops[targetDayStops.length - 1]) + 1;
    }
    
    // Update stop with new arrival time
    stopToMove.arrival_time = newArrivalTime;
    
    // Insert at new position
    updatedStops.splice(insertIndex, 0, stopToMove);
    
    // Update stop_order for all stops
    const stopsPayload = updatedStops.map((stop, idx) => ({
      place_id: stop.place?.id || '',
      stop_order: idx,
      arrival_time: stop.arrival_time || '',
      notes: stop.notes || ''
    }));
    
    // Update trip with new stops order and arrival times
    await TripService.updateTrip(trip.value.id, { stops: stopsPayload });
    await loadTrip(true);
  } catch (error) {
    console.error('Failed to move stop between days:', error);
  }
};

const handleAddPlaceToDay = (dayIndex: number) => {
  selectedDayForPlace.value = dayIndex;
  showAddPlaceModal.value = true;
};

const handleAddPlace = (place: any) => {
  // TODO: Implement adding place to specific day
  console.log("Add place to day", selectedDayForPlace.value, place);
  showAddPlaceModal.value = false;
};

const startEditingDetails = () => {
  if (trip.value) {
    editableTripName.value = trip.value.trip_name;
    editableStartDate.value = trip.value.start_date || "";
    editableEndDate.value = trip.value.end_date || "";
    isEditingDetails.value = true;
  }
};

const saveEditedDetails = async () => {
  // TODO: Implement save trip details
  console.log("Save trip details");
  isEditingDetails.value = false;
};

const cancelEditingDetails = () => {
  isEditingDetails.value = false;
};

const togglePublic = () => {
  // TODO: Implement toggle public/private
  console.log("Toggle public/private");
};

const handleAIGenerate = () => {
  openGenerateTripModal();
};

onMounted(async () => {
  console.log("Mounted");
  await loadTrip(true);
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header Section -->
    <div class="bg-card border-b border-border/50 sticky top-0 z-40">
      <div class="max-w-full px-6 py-4">
        <div class="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            class="group hover:bg-coral-light transition-colors duration-200"
            @click="navigateBack"
          >
            <ArrowLeft
              :size="20"
              class="mr-2 transition-transform group-hover:-translate-x-1"
            />
            Back to My Trips
          </Button>

          <div class="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              class="flex items-center gap-2 border-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-coral-light transition-all"
              @click="handleAIGenerate"
            >
              <Sparkles :size="16" class="text-purple-600" />
              <span class="text-sm font-semibold bg-gradient-to-r from-purple-600 to-coral bg-clip-text text-transparent">
                AI Generate
              </span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              :class="[
                'flex items-center gap-2 transition-all',
                trip?.public
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300'
                  : 'border-2 hover:bg-muted/50'
              ]"
              @click="togglePublic"
            >
              <component :is="trip?.public ? Globe : Lock" :size="16" />
              {{ trip?.public ? 'Public' : 'Private' }}
            </Button>

            <Button
              v-if="!isEditingDetails"
              size="sm"
              class="bg-coral text-white hover:bg-coral-dark"
              @click="startEditingDetails"
            >
              Edit Details
            </Button>
            <template v-else>
              <Button
                size="sm"
                class="bg-coral text-white hover:bg-coral-dark flex items-center gap-2"
                @click="saveEditedDetails"
              >
                <Save :size="16" />
                Save Trip
              </Button>
              <Button
                size="sm"
                variant="outline"
                @click="cancelEditingDetails"
              >
                Cancel
              </Button>
            </template>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-16">
          <div class="text-center">
            <div
              class="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-coral border-t-transparent shadow-lg shadow-coral/20"
            ></div>
            <p class="mt-5 text-muted-foreground font-medium">
              Loading your trip...
            </p>
          </div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="rounded-2xl border border-destructive/30 bg-gradient-to-r from-destructive/5 to-destructive/10 p-6 backdrop-blur-sm"
        >
          <div class="flex items-center gap-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10"
            >
              <AlertCircle :size="24" class="text-destructive" />
            </div>
            <div class="flex-1">
              <p class="text-destructive font-semibold text-lg">
                Failed to load trip
              </p>
              <p class="text-sm text-destructive/80 mt-1">
                {{ error }}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="hover:bg-destructive/10"
              @click="clearErrors"
            >
              Dismiss
            </Button>
          </div>
        </div>

        <!-- Trip Details Form -->
        <div v-else-if="trip" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label class="block text-sm mb-2 text-muted-foreground">Trip Name</Label>
            <Input
              v-if="isEditingDetails"
              v-model="editableTripName"
              placeholder="e.g., Summer in Da Nang"
              class="h-11 rounded-xl"
            />
            <p v-else class="text-xl font-bold text-foreground">
              {{ trip.trip_name }}
            </p>
          </div>

          <div>
            <Label class="block text-sm mb-2 text-muted-foreground">Start Date</Label>
            <Input
              v-if="isEditingDetails"
              v-model="editableStartDate"
              type="date"
              class="h-11 rounded-xl"
            />
            <p v-else class="text-lg text-foreground">
              {{ trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set' }}
            </p>
          </div>

          <div>
            <Label class="block text-sm mb-2 text-muted-foreground">End Date</Label>
            <Input
              v-if="isEditingDetails"
              v-model="editableEndDate"
              type="date"
              class="h-11 rounded-xl"
            />
            <p v-else class="text-lg text-foreground">
              {{ trip.end_date ? new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set' }}
            </p>
          </div>
        </div>

        <!-- Remove Error Alert -->
        <div
          v-if="removeError"
          class="rounded-xl border border-destructive/30 bg-destructive/5 p-4 animate-in fade-in slide-in-from-top-2 duration-300 mt-4"
        >
          <div class="flex items-center gap-3">
            <AlertCircle :size="20" class="text-destructive shrink-0" />
            <p class="text-sm text-destructive flex-1">
              {{ removeError }}
            </p>
            <Button
              variant="ghost"
              size="sm"
              class="text-destructive hover:bg-destructive/10"
              @click="clearErrors"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content: Two-Column Layout -->
    <div v-if="!loading && !error && trip" class="flex h-[calc(100vh-200px)]">
      <!-- Left Panel: Timeline/Itinerary -->
      <div class="w-[400px] bg-card border-r border-border/50">
        <TripItinerary
          :start-date="trip.start_date"
          :end-date="trip.end_date"
          :stops="trip.stops"
          @add-place="handleAddPlaceToDay"
          @remove-stop="handleRemoveStop"
          @reorder-stop="handleReorderStop"
          @move-stop-between-days="handleMoveStopBetweenDays"
        />
      </div>

      <!-- Right Panel: Map Placeholder -->
      <div class="flex-1 relative bg-muted/20">
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="relative w-full h-full">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=800&fit=crop"
              alt="Map"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-black/10 flex items-center justify-center">
              <div class="bg-card/95 backdrop-blur-sm rounded-2xl p-8 text-center shadow-2xl border border-border/50 max-w-md">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral/10 mb-4">
                  <MapPin :size="32" class="text-coral" />
                </div>
                <h3 class="text-2xl font-bold mb-2 text-foreground">Interactive Map View</h3>
                <p class="text-muted-foreground mb-4">
                  {{ hasStops 
                    ? 'Map will display markers and routes for your trip'
                    : 'Add places to see them on the map'
                  }}
                </p>
                <div class="text-sm text-muted-foreground">
                  {{ trip.stops?.length || 0 }} stop{{ (trip.stops?.length || 0) !== 1 ? 's' : '' }} in this trip
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Floating Add Place Button -->
        <Button
          class="absolute right-6 bottom-6 w-14 h-14 rounded-full shadow-2xl bg-coral text-white hover:bg-coral-dark hover:scale-110 transition-all duration-200"
          @click="handleAddFromSavedPlaces"
        >
          <Plus :size="24" />
        </Button>
      </div>
    </div>

    <!-- Saved Places Modal -->
    <SavedPlacesModal
      v-model:open="showSavedPlacesModal"
      :trip-id="tripId"
      @success="handlePlaceAdded"
    />

    <!-- Add Place to Trip Modal -->
    <AddPlaceToTripModal
      v-model:open="showAddPlaceModal"
      :day-number="selectedDayForPlace + 1"
      @add-place="handleAddPlace"
    />

    <!-- Generate Trip Modal -->
    <GenerateTripModal
      v-model:open="showGenerateTripModal"
      :loading="aiGenerating"
      :error="generateError"
      @submit="handleGenerateSubmit"
    />
  </div>
</template>

<style scoped>
/* Responsive button for mobile */
@media (max-width: 640px) {
  .shrink-0.inline-flex {
    width: 100%;
    justify-content: center;
  }
}
</style>
