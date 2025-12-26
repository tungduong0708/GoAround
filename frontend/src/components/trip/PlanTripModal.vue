<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import { MapPin, Calendar, Trash2, Star, Sparkles } from "lucide-vue-next";
import type { IPlacePublic } from "@/utils/interfaces";

interface PlanTripModalProps {
  open?: boolean;
}

interface PlanTripModalEmits {
  (e: "update:open", value: boolean): void;
  (e: "submit", data: TripFormData): void;
}

interface TripFormData {
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  places: IPlacePublic[];
}

const props = withDefaults(defineProps<PlanTripModalProps>(), {
  open: false,
});

const emit = defineEmits<PlanTripModalEmits>();

// Form data
const tripName = ref("");
const destination = ref("");
const startDate = ref("");
const endDate = ref("");
const places = ref<IPlacePublic[]>([]);
const newPlaceInput = ref("");

const isFormValid = computed(() => {
  return tripName.value.trim() !== "" && destination.value.trim() !== "";
});

const handleOpenChange = (value: boolean) => {
  emit("update:open", value);
};

const handleSubmit = () => {
  if (!isFormValid.value) return;

  emit("submit", {
    tripName: tripName.value,
    destination: destination.value,
    startDate: startDate.value,
    endDate: endDate.value,
    places: places.value,
  });

  handleCancel();
};

const handleCancel = () => {
  // Reset form
  tripName.value = "";
  destination.value = "";
  startDate.value = "";
  endDate.value = "";
  places.value = [];
  newPlaceInput.value = "";
  emit("update:open", false);
};

const removePlace = (id: string) => {
  places.value = places.value.filter((place) => place.id !== id);
};

const addPlaceFromInput = () => {
  if (newPlaceInput.value.trim()) {
    // In a real implementation, this would search for places
    // For now, just show the input as a placeholder
    newPlaceInput.value = "";
  }
};
</script>

<template>
  <Dialog :open="props.open" @update:open="handleOpenChange">
    <DialogContent
      class="max-w-[520px] max-h-[85vh] p-0 flex flex-col gap-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl"
    >
      <!-- Header with gradient accent -->
      <div
        class="h-1.5 bg-gradient-to-r from-coral via-coral-dark to-coral-darker"
      />

      <DialogHeader class="px-6 pt-5 pb-2">
        <div class="flex items-center gap-3">
          <div
            class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-coral/20 to-coral/5"
          >
            <Sparkles :size="20" class="text-coral" />
          </div>
          <div>
            <DialogTitle
              class="text-xl font-bold text-foreground tracking-tight"
            >
              Plan a New Trip
            </DialogTitle>
            <p class="text-sm text-muted-foreground mt-0.5">
              Create and organize your perfect itinerary
            </p>
          </div>
        </div>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        <!-- Trip Name -->
        <div class="flex flex-col gap-2">
          <Label for="trip-name" class="text-sm font-semibold text-foreground">
            Trip Name
          </Label>
          <Input
            id="trip-name"
            v-model="tripName"
            type="text"
            placeholder="e.g. Summer in Italy"
            class="h-11 text-sm rounded-xl border-border/80 focus:border-coral focus:ring-coral/20"
          />
        </div>

        <!-- Destination -->
        <div class="flex flex-col gap-2">
          <Label
            for="destination"
            class="text-sm font-semibold text-foreground flex items-center gap-2"
          >
            <MapPin :size="16" class="text-coral" />
            Destination
          </Label>
          <Input
            id="destination"
            v-model="destination"
            type="text"
            placeholder="Where are you going?"
            class="h-11 text-sm rounded-xl border-border/80 focus:border-coral focus:ring-coral/20"
          />
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <Label
              for="start-date"
              class="text-sm font-semibold text-foreground flex items-center gap-2"
            >
              <Calendar :size="16" class="text-coral" />
              Start Date
            </Label>
            <Input
              id="start-date"
              v-model="startDate"
              type="text"
              placeholder="mm/dd/yyyy"
              class="h-11 text-sm rounded-xl border-border/80 focus:border-coral focus:ring-coral/20"
            />
          </div>

          <div class="flex flex-col gap-2">
            <Label for="end-date" class="text-sm font-semibold text-foreground">
              End Date
            </Label>
            <Input
              id="end-date"
              v-model="endDate"
              type="text"
              placeholder="mm/dd/yyyy"
              class="h-11 text-sm rounded-xl border-border/80 focus:border-coral focus:ring-coral/20"
            />
          </div>
        </div>

        <!-- Add Places Section -->
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <Label class="text-sm font-semibold text-foreground">
              Add Places to Trip
            </Label>
            <Button
              variant="link"
              size="sm"
              class="text-coral hover:text-coral-dark text-sm font-medium px-2 py-1 h-auto hover:bg-coral-light rounded-lg transition-colors"
              type="button"
            >
              Add from Saved List
            </Button>
          </div>

          <!-- Places List with ScrollArea -->
          <ScrollArea
            v-if="places.length > 0"
            class="h-[200px] border border-border/80 rounded-xl bg-muted/20"
          >
            <div class="p-2 space-y-2">
              <div
                v-for="place in places"
                :key="place.id"
                class="flex items-center gap-3 p-3 border border-border/80 rounded-xl bg-background hover:border-coral/50 hover:shadow-sm transition-all duration-200 group"
              >
                <img
                  v-if="place.main_image_url != null"
                  :src="place.main_image_url"
                  :alt="place.name"
                  class="w-14 h-14 rounded-lg object-cover shrink-0 bg-muted ring-1 ring-border/50 group-hover:ring-coral/30 transition-all"
                />
                <div class="flex-1 min-w-0 space-y-1">
                  <h4 class="text-sm font-semibold text-foreground truncate">
                    {{ place.name }}
                  </h4>
                  <div
                    class="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <MapPin :size="12" class="shrink-0" />
                    <span class="truncate">
                      {{ place.city }}, {{ place.country }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1.5 text-xs">
                    <Star :size="12" class="text-amber fill-amber" />
                    <span class="font-semibold text-foreground">
                      {{ place.average_rating }}
                    </span>
                    <span class="text-muted-foreground">
                      {{ place.review_count }} reviews
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="w-9 h-9 shrink-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  type="button"
                  @click="removePlace(place.id)"
                  aria-label="Remove place"
                >
                  <Trash2 :size="16" />
                </Button>
              </div>
            </div>
          </ScrollArea>

          <!-- Add Place Input -->
          <div class="mt-2">
            <Input
              v-model="newPlaceInput"
              type="text"
              placeholder="e.g. Colosseum, Rome, Italy"
              class="h-11 text-sm rounded-xl border-border/80 focus:border-coral focus:ring-coral/20"
              @keyup.enter="addPlaceFromInput"
            />
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex gap-3 px-6 py-4 border-t border-border/50 bg-muted/20">
        <Button
          type="button"
          class="flex-1 h-11 bg-coral text-white font-semibold rounded-xl shadow-md shadow-coral/20 hover:bg-coral-dark hover:shadow-lg hover:shadow-coral/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200"
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          Create Trip
        </Button>
        <Button
          type="button"
          variant="outline"
          class="flex-1 h-11 font-semibold rounded-xl border-border/80 hover:bg-muted/50 transition-colors"
          @click="handleCancel"
        >
          Cancel
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* Responsive adjustments for mobile */
@media (max-width: 640px) {
  .max-w-\[520px\] {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .flex.gap-3.px-6.py-4 {
    flex-direction: column-reverse;
  }
}
</style>
