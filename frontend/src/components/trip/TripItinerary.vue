<script setup lang="ts">
import { ref, computed } from "vue";
import { Plus, Calendar, MapPin, GripVertical, Trash2 } from "lucide-vue-next";
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
  (e: "move-stop-between-days", stopId: string, fromDayIndex: number, toDayIndex: number, toPosition: number): void;
  (e: "day-selected", dayIndex: number): void;
}

const props = withDefaults(defineProps<TripItineraryProps>(), {
  stops: () => [],
});

const emit = defineEmits<TripItineraryEmits>();

const selectedDay = ref(0);
const draggedStop = ref<{ 
  stopId: string; 
  stopIndex: number; 
  dayIndex: number;
  stop: ITripStopWithPlace;
} | null>(null);

const selectDay = (dayIndex: number) => {
  selectedDay.value = dayIndex;
  emit('day-selected', dayIndex);
};
const dragOverDayIndex = ref<number | null>(null);
const dragOverStopIndex = ref<number | null>(null);
const dropPosition = ref<{ dayIndex: number; position: number } | null>(null);

// Compute days based on date range and populate with stops
const days = computed((): DayItinerary[] => {
  console.log('[TripItinerary] days computed - recalculating with', props.stops?.length, 'stops');
  
  if (!props.startDate || !props.endDate) return [];

  const start = new Date(props.startDate);
  const end = new Date(props.endDate);
  const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const result: DayItinerary[] = [];
  for (let i = 0; i < dayCount; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateString = date.toISOString().split("T")[0] || "";

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
  
  console.log('[TripItinerary] days computed result:', result.map(d => ({
    day: d.day,
    stopCount: d.stops.length,
    stopNames: d.stops.map(s => s.place?.name)
  })));

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

const handleDragStart = (event: DragEvent, stop: ITripStopWithPlace, stopIndex: number, dayIndex: number) => {
  draggedStop.value = { stopId: stop.id, stopIndex, dayIndex, stop };
  console.log('[TripItinerary] Drag started:', {
    stopId: stop.id,
    stopName: stop.place?.name,
    fromIndex: stopIndex,
    fromDay: dayIndex
  });
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", stop.id);
  }
  // Add dragging class to the element
  (event.target as HTMLElement).classList.add('opacity-50');
};

const handleDragEnd = (event: DragEvent) => {
  console.log('[TripItinerary] Drag ended');
  (event.target as HTMLElement).classList.remove('opacity-50');
  draggedStop.value = null;
  dragOverDayIndex.value = null;
  dragOverStopIndex.value = null;
  dropPosition.value = null;
};

const handleDragOver = (event: DragEvent, dayIndex?: number, stopIndex?: number) => {
  event.preventDefault();
  event.stopPropagation();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
  if (dayIndex !== undefined) {
    dragOverDayIndex.value = dayIndex;
    
    // Calculate drop position based on mouse position
    if (stopIndex !== undefined) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const mouseY = event.clientY;
      const targetMiddle = rect.top + rect.height / 2;
      
      // Determine if dropping before or after this stop
      const position = mouseY > targetMiddle ? stopIndex + 1 : stopIndex;
      dropPosition.value = { dayIndex, position };
    } else {
      // Dragging over empty day - position at start
      const dayStops = days.value[dayIndex]?.stops || [];
      if (dayStops.length === 0) {
        dropPosition.value = { dayIndex, position: 0 };
      }
    }
  }
  if (stopIndex !== undefined) {
    dragOverStopIndex.value = stopIndex;
  }
};

const handleDragLeave = () => {
  dragOverDayIndex.value = null;
  dragOverStopIndex.value = null;
  dropPosition.value = null;
};

const handleDropOnStop = (event: DragEvent, toIndex: number, dayIndex: number) => {
  event.preventDefault();
  event.stopPropagation();
  
  console.log('[TripItinerary] Drop on stop:', { toIndex, dayIndex });
  
  if (!draggedStop.value) {
    console.warn('[TripItinerary] No dragged stop - drop ignored');
    return;
  }
  
  const { stopId, stopIndex: fromIndex, dayIndex: fromDayIndex } = draggedStop.value;
  
  // Determine drop position based on mouse Y position within the target element
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const mouseY = event.clientY;
  const targetMiddle = rect.top + rect.height / 2;
  const mouseInBottomHalf = mouseY > targetMiddle;
  
  // If mouse is in bottom half, insert after (toIndex + 1), otherwise insert at toIndex
  let adjustedToIndex = toIndex;
  if (mouseInBottomHalf) {
    adjustedToIndex = toIndex + 1;
  }
  
  console.log('[TripItinerary] Drop details:', {
    fromIndex,
    toIndex,
    adjustedToIndex,
    fromDay: fromDayIndex,
    toDay: dayIndex,
    mousePosition: mouseInBottomHalf ? 'bottom' : 'top',
    rectTop: rect.top,
    rectBottom: rect.bottom,
    rectHeight: rect.height,
    mouseY: mouseY,
    targetMiddle: targetMiddle
  });
  
  // Moving within the same day
  if (fromDayIndex === dayIndex) {
    console.log('[TripItinerary] Same-day reorder:', {
      beforeAdjustment: { fromIndex, adjustedToIndex }
    });
    
    // Only adjust if we're moving forward AND the adjusted position is after the original
    // When moving backward, no adjustment needed
    // When moving forward, we need to account for the item being removed first
    let finalToIndex = adjustedToIndex;
    if (fromIndex < adjustedToIndex) {
      finalToIndex = adjustedToIndex - 1;
    }
    
    console.log('[TripItinerary] After adjustment:', {
      finalFromIndex: fromIndex,
      finalToIndex: finalToIndex,
      willEmit: fromIndex !== finalToIndex
    });
    
    if (fromIndex !== finalToIndex) {
      console.log('[TripItinerary] Emitting reorder-stop event');
      emit("reorder-stop", fromIndex, finalToIndex, dayIndex);
    } else {
      console.log('[TripItinerary] No change - same position');
    }
  } else {
    // Moving between different days
    console.log('[TripItinerary] Cross-day move:', { stopId, fromDayIndex, dayIndex, adjustedToIndex });
    emit("move-stop-between-days", stopId, fromDayIndex, dayIndex, adjustedToIndex);
  }
  
  draggedStop.value = null;
  dragOverDayIndex.value = null;
  dragOverStopIndex.value = null;
  dropPosition.value = null;
};

const handleDropOnDay = (event: DragEvent, dayIndex: number) => {
  event.preventDefault();
  event.stopPropagation();
  
  if (!draggedStop.value) return;
  
  const { stopId, dayIndex: fromDayIndex } = draggedStop.value;
  const dayStops = days.value[dayIndex]?.stops || [];
  
  // If dropping on a day, add to the end
  if (fromDayIndex !== dayIndex) {
    emit("move-stop-between-days", stopId, fromDayIndex, dayIndex, dayStops.length);
  }
  
  draggedStop.value = null;
  dragOverDayIndex.value = null;
  dragOverStopIndex.value = null;
  dropPosition.value = null;
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
              @click="selectDay(dayIndex)"
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
            class="rounded-lg transition-colors"
            :class="[
              dragOverDayIndex === dayIndex && day.stops.length === 0 
                ? 'bg-coral/10 border-2 border-dashed border-coral min-h-[60px]' 
                : 'min-h-[60px]'
            ]"
            @dragover="handleDragOver($event, dayIndex)"
            @dragleave="handleDragLeave"
            @drop="handleDropOnDay($event, dayIndex)"
          >
            <div
              v-if="day.stops.length === 0"
              class="p-4 text-center text-muted-foreground text-sm rounded-lg border-2 border-dashed border-border/50"
            >
              No places added yet
            </div>

            <!-- Drop indicator at the beginning -->
            <div
              v-if="day.stops.length > 0 && dropPosition?.dayIndex === dayIndex && dropPosition?.position === 0"
              class="h-1 bg-coral rounded-full mb-2 shadow-lg shadow-coral/50 animate-pulse"
            ></div>

            <template v-for="(stop, stopIndex) in day.stops" :key="stop.id">
              <div
              draggable="true"
              @dragstart="handleDragStart($event, stop, stopIndex, dayIndex)"
              @dragend="handleDragEnd"
              @dragover.stop="handleDragOver($event, dayIndex, stopIndex)"
              @drop="handleDropOnStop($event, stopIndex, dayIndex)"
              class="bg-card border-2 rounded-lg p-3 group hover:border-coral/50 hover:shadow-md transition-all cursor-move relative"
              :class="[
                dragOverDayIndex === dayIndex && dragOverStopIndex === stopIndex 
                  ? 'border-coral ring-2 ring-coral/20' 
                  : 'border-border/60'
              ]"
            >
              <div class="flex gap-3">
                <div class="flex flex-col items-center gap-1">
                  <div class="flex items-center justify-center w-6 h-6 rounded-full bg-coral/10 text-coral text-xs font-semibold">
                    {{ stopIndex + 1 }}
                  </div>
                  <GripVertical :size="14" class="text-muted-foreground" />
                </div>
                
                <img
                  v-if="stop.place?.main_image_url"
                  :src="stop.place.main_image_url"
                  :alt="stop.place?.name"
                  class="w-12 h-12 object-cover rounded-lg shrink-0 bg-muted"
                  crossorigin="anonymous"
                  loading="lazy"
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

                  <p v-if="stop.notes" class="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {{ stop.notes }}
                  </p>
                </div>
              </div>
              </div>

              <!-- Drop indicator after this card -->
              <div
                v-if="dropPosition?.dayIndex === dayIndex && dropPosition?.position === stopIndex + 1"
                class="h-1 bg-coral rounded-full my-2 shadow-lg shadow-coral/50 animate-pulse"
              ></div>
            </template>
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
