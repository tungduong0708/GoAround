<script setup lang="ts">
import { ref, computed } from "vue";
import { Plus, Calendar, MapPin, Clock, GripVertical, Trash2 } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";
import type { ITripStopWithPlace } from "@/utils/interfaces";

interface DayItinerary {
  day: number;
  date: string;
  stops: ITripStopWithPlace[];
}

interface TripItineraryProps {
  startDate?: string | null;
  endDate?: string | null;
  stops?: ITripStopWithPlace[];
}

interface TripItineraryEmits {
  (e: "add-place", dayIndex: number): void;
  (e: "remove-stop", stopId: string): void;
  (e: "reorder-stop", fromIndex: number, toIndex: number, dayIndex: number): void;
}

const props = withDefaults(defineProps<TripItineraryProps>(), {
  stops: () => [],
});

const emit = defineEmits<TripItineraryEmits>();

const selectedDay = ref(0);
const draggedStop = ref<{ stopId: string; fromIndex: number; dayIndex: number } | null>(null);

// Compute days based on date range and populate with stops
const days = computed((): DayItinerary[] => {
  if (!props.startDate || !props.endDate) return [];

  const start = new Date(props.startDate);
  const end = new Date(props.endDate);
  const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const result: DayItinerary[] = [];
  for (let i = 0; i < dayCount; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateString = date.toISOString().split("T")[0];

    // Filter stops that belong to this day based on arrival_time
    const dayStops = (props.stops || []).filter(stop => {
      if (!stop.arrival_time) return false;
      const stopDate = new Date(stop.arrival_time).toISOString().split("T")[0];
      return stopDate === dateString;
    });

    result.push({
      day: i + 1,
      date: dateString,
      stops: dayStops,
    });
  }

  return result;
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { 
    weekday: "long", 
    month: "short", 
    day: "numeric" 
  });
};

const handleDragStart = (event: DragEvent, stopId: string, stopIndex: number, dayIndex: number) => {
  draggedStop.value = { stopId, fromIndex: stopIndex, dayIndex };
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
};

const handleDrop = (event: DragEvent, toIndex: number, dayIndex: number) => {
  event.preventDefault();
  
  if (!draggedStop.value) return;
  
  const { fromIndex, dayIndex: fromDayIndex } = draggedStop.value;
  
  // Only reorder within the same day for now
  if (fromDayIndex === dayIndex && fromIndex !== toIndex) {
    emit("reorder-stop", fromIndex, toIndex, dayIndex);
  }
  
  draggedStop.value = null;
};

const handleRemoveStop = (stopId: string) => {
  emit("remove-stop", stopId);
};

const handleAddPlace = (dayIndex: number) => {
  emit("add-place", dayIndex);
};
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="p-6 border-b border-border/50">
      <h2 class="text-xl font-bold text-foreground mb-1">Itinerary</h2>
      <p class="text-sm text-muted-foreground">
        {{ days.length > 0 ? `${days.length} day${days.length > 1 ? 's' : ''} planned` : 'Set trip dates to start planning' }}
      </p>
    </div>

    <div v-if="!startDate || !endDate || days.length === 0" class="flex-1 flex items-center justify-center p-6">
      <div class="text-center">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4"
        >
          <Calendar :size="32" class="text-muted-foreground" />
        </div>
        <p class="text-muted-foreground">Set trip dates to start planning</p>
      </div>
    </div>

    <div v-else class="flex-1 overflow-y-auto p-6">
      <div class="space-y-6">
        <div
          v-for="(day, dayIndex) in days"
          :key="day.day"
          class="border-l-4 pl-4 transition-all"
          :class="[
            selectedDay === dayIndex ? 'border-coral' : 'border-border/30',
          ]"
        >
          <div class="flex items-center justify-between mb-3">
            <button
              @click="selectedDay = dayIndex"
              class="text-left flex-1 group"
            >
              <h3 class="font-semibold text-foreground group-hover:text-coral transition-colors">
                Day {{ day.day }}
              </h3>
              <p class="text-sm text-muted-foreground">
                {{ formatDate(day.date) }}
              </p>
            </button>
            <Button
              size="sm"
              class="bg-coral text-white hover:bg-coral-dark rounded-lg px-3 py-1.5 text-sm"
              @click="handleAddPlace(dayIndex)"
            >
              <Plus :size="16" class="mr-1" />
              Add Place
            </Button>
          </div>

          <div
            class="space-y-2"
            @dragover="handleDragOver"
          >
            <div
              v-for="(stop, stopIndex) in day.stops"
              :key="stop.id"
              draggable="true"
              @dragstart="handleDragStart($event, stop.id, stopIndex, dayIndex)"
              @drop="handleDrop($event, stopIndex, dayIndex)"
              class="bg-card border border-border/60 rounded-lg p-3 group hover:border-coral/50 hover:shadow-md transition-all cursor-move"
            >
              <div class="flex gap-3">
                <div class="flex items-center">
                  <GripVertical :size="16" class="text-muted-foreground" />
                </div>
                
                <img
                  v-if="stop.place?.main_image_url"
                  :src="stop.place.main_image_url"
                  :alt="stop.place?.name"
                  class="w-12 h-12 object-cover rounded-lg shrink-0 bg-muted"
                />

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="font-medium text-foreground text-sm">
                      {{ stop.place?.name }}
                    </h4>
                    <Button
                      size="icon"
                      variant="ghost"
                      class="w-8 h-8 shrink-0 opacity-0 group-hover:opacity-100 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all"
                      @click="handleRemoveStop(stop.id)"
                    >
                      <Trash2 :size="14" />
                    </Button>
                  </div>
                  
                  <div class="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin :size="12" />
                    <span>{{ stop.place?.city }}, {{ stop.place?.country }}</span>
                  </div>

                  <div v-if="stop.arrival_time" class="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock :size="12" />
                    <span>{{ new Date(stop.arrival_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }}</span>
                  </div>

                  <p v-if="stop.notes" class="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {{ stop.notes }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="day.stops.length === 0"
              class="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border/50 rounded-lg"
            >
              No places added yet
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cursor-move {
  cursor: grab;
}

.cursor-move:active {
  cursor: grabbing;
}
</style>
