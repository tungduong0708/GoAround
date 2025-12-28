<script setup lang="ts">
import { ref, computed } from "vue";
import { useTrips } from "@/composables";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Calendar, Plus, Loader2 } from "lucide-vue-next";
import type { IPlacePublic } from "@/utils/interfaces";

const props = defineProps<{
  open: boolean;
  place: IPlacePublic | null;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  success: [];
}>();

const {
  trips,
  loading: tripsLoading,
  loadTrips,
  addPlaceToTrip,
  formatTripDateRange,
  formatTripLocation,
} = useTrips({ autoLoad: false });

const adding = ref(false);
const selectedTripId = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

// Load trips when modal opens
const handleOpenChange = async (open: boolean) => {
  emit("update:open", open);
  
  if (open) {
    selectedTripId.value = null;
    successMessage.value = null;
    errorMessage.value = null;
    await loadTrips(true); // Force reload
  }
};

const handleSelectTrip = async (tripId: string) => {
  if (!props.place || adding.value) return;

  adding.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  try {
    // Get current trip to determine next stop order
    const currentTrip = trips.value.find(t => t.id === tripId);
    const stopOrder = (currentTrip?.stop_count || 0) + 1;

    await addPlaceToTrip(tripId, {
      place_id: props.place.id,
      stop_order: stopOrder,
      arrival_time: new Date().toISOString(),
      notes: "",
    });

    successMessage.value = `Added "${props.place.name}" to your trip!`;
    emit("success");
    
    // Close modal after a short delay
    setTimeout(() => {
      emit("update:open", false);
    }, 1500);
  } catch (error: any) {
    errorMessage.value = error?.message || "Failed to add place to trip";
  } finally {
    adding.value = false;
  }
};

const hasNoTrips = computed(() => !tripsLoading.value && trips.value.length === 0);
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle class="text-2xl">Add to Trip</DialogTitle>
        <DialogDescription v-if="place">
          Select a trip to add <strong>{{ place.name }}</strong>
        </DialogDescription>
      </DialogHeader>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800"
      >
        {{ successMessage }}
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800"
      >
        {{ errorMessage }}
      </div>

      <!-- Loading State -->
      <div v-if="tripsLoading" class="flex items-center justify-center py-12">
        <Loader2 class="h-8 w-8 animate-spin text-coral" />
      </div>

      <!-- Empty State -->
      <div v-else-if="hasNoTrips" class="text-center py-12">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral/10 mb-4"
        >
          <MapPin class="h-8 w-8 text-coral" />
        </div>
        <h3 class="text-lg font-semibold mb-2">No trips yet</h3>
        <p class="text-muted-foreground mb-6">
          Create your first trip to start adding places
        </p>
        <Button
          as="a"
          href="/trips"
          class="bg-coral hover:bg-coral-dark text-white"
        >
          <Plus class="mr-2 h-4 w-4" />
          Create a Trip
        </Button>
      </div>

      <!-- Trips List -->
      <ScrollArea v-else class="h-[400px] pr-4">
        <div class="space-y-3">
          <Card
            v-for="trip in trips"
            :key="trip.id"
            class="cursor-pointer transition-all hover:shadow-md hover:border-coral/40"
            :class="{
              'opacity-50 pointer-events-none': adding,
            }"
            @click="handleSelectTrip(trip.id)"
          >
            <CardContent class="p-4">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 space-y-2">
                  <h3 class="font-semibold text-lg">{{ trip.trip_name }}</h3>
                  
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin class="h-4 w-4" />
                    <span>{{ formatTripLocation(trip) }}</span>
                  </div>
                  
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar class="h-4 w-4" />
                    <span>{{ formatTripDateRange(trip) }}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  class="bg-coral hover:bg-coral-dark text-white shrink-0"
                  :disabled="adding"
                >
                  <Plus class="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>
