<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import { MapPin, Calendar, Trash2, Star, Sparkles, Globe, Lock, Search, Loader2 } from "lucide-vue-next";
import type { IPlacePublic } from "@/utils/interfaces";
import { PlacesService } from "@/services";
import { useCitiesStore } from '@/stores';
import { storeToRefs } from 'pinia';

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
  isPublic?: boolean;
}

const props = withDefaults(defineProps<PlanTripModalProps>(), {
  open: false,
});

const emit = defineEmits<PlanTripModalEmits>();

// Cities store
const citiesStore = useCitiesStore();
const { cities } = storeToRefs(citiesStore);

// Form data
const tripName = ref("");
const destination = ref("");
const startDate = ref("");
const endDate = ref("");
const isPublic = ref(false);
const places = ref<IPlacePublic[]>([]);
const newPlaceInput = ref("");

// Destination autocomplete
const filteredCities = ref<string[]>([]);
const showCitiesDropdown = ref(false);
const destinationInputRef = ref<HTMLInputElement | null>(null);
const citiesDropdownRef = ref<HTMLElement | null>(null);
const isDestinationValid = ref(false);

// Extract city name from "city, country" format
const getDestinationCity = computed(() => {
  if (!destination.value) return "";
  const parts = destination.value.split(',');
  return parts[0]?.trim() || "";
});

// Search suggestions
const searchSuggestions = ref<IPlacePublic[]>([]);
const isSearching = ref(false);
const showSuggestions = ref(false);
const searchTimeoutId = ref<number | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const dropdownPosition = ref({ top: 0, left: 0, width: 0 });

const isFormValid = computed(() => {
  return (
    tripName.value.trim() !== "" &&
    isDestinationValid.value &&
    startDate.value !== "" &&
    endDate.value !== "" &&
    !isEndDateBeforeStartDate.value
  );
});

const isEndDateBeforeStartDate = computed(() => {
  if (!startDate.value || !endDate.value) return false;
  return new Date(endDate.value) < new Date(startDate.value);
});

const canAddPlaces = computed(() => {
  return isDestinationValid.value;
});

// Filter cities based on destination input
const filterCities = () => {
  const query = destination.value.toLowerCase().trim();
  if (!query) {
    filteredCities.value = cities.value;
  } else {
    filteredCities.value = cities.value.filter(city =>
      city.toLowerCase().includes(query)
    );
  }
};

const handleDestinationInput = () => {
  filterCities();
  showCitiesDropdown.value = true;
  // Mark as invalid when user types
  isDestinationValid.value = false;
};

const handleDestinationFocus = () => {
  filterCities();
  showCitiesDropdown.value = true;
};

const selectCity = (city: string) => {
  destination.value = city;
  showCitiesDropdown.value = false;
  isDestinationValid.value = true;
  // Clear places when destination changes
  places.value = [];
};

const handleDestinationBlur = () => {
  // Use setTimeout to allow click event on dropdown to fire first
  setTimeout(() => {
    // If destination doesn't match any city in the list, mark as invalid
    if (destination.value && !cities.value.includes(destination.value)) {
      isDestinationValid.value = false;
    }
    showCitiesDropdown.value = false;
  }, 200);
};

// Calculate dropdown position relative to input
const updateDropdownPosition = async () => {
  await nextTick();
  if (!inputRef.value) return;
  
  // Input component wraps native input - access via $el
  const element = (inputRef.value as any).$el || inputRef.value;
  const rect = element.getBoundingClientRect();
  
  dropdownPosition.value = {
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width
  };
};

// Watch for input changes and search
watch(newPlaceInput, (value) => {
  // Clear previous timeout
  if (searchTimeoutId.value) {
    clearTimeout(searchTimeoutId.value);
  }

  // Hide suggestions if input is empty or too short
  if (!value || value.trim().length === 0) {
    searchSuggestions.value = [];
    showSuggestions.value = false;
    return;
  }
  
  if (value.trim().length < 2) {
    searchSuggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  // Debounce search
  searchTimeoutId.value = window.setTimeout(async () => {
    isSearching.value = true;
    try {
      const cityName = getDestinationCity.value;
      const response = await PlacesService.getPlaces({
        q: value,
        limit: 20,
      });
      // Filter results to only show places from the selected destination city
      const allPlaces = response.data?.places || [];
      searchSuggestions.value = allPlaces.filter(place => 
        place.city?.toLowerCase() === cityName.toLowerCase()
      );
      
      if (searchSuggestions.value.length > 0) {
        await nextTick();
        await updateDropdownPosition();
        showSuggestions.value = true;
        console.log('[PlanTripModal] Showing suggestions:', searchSuggestions.value.length, 'at position:', dropdownPosition.value);
      } else {
        showSuggestions.value = false;
        console.log('[PlanTripModal] No suggestions found for city:', cityName);
      }
    } catch (error) {
      console.error("Search failed:", error);
      searchSuggestions.value = [];
      showSuggestions.value = false;
    } finally {
      isSearching.value = false;
    }
  }, 300);
});

// Watch destination changes to clear places if destination changes
watch(destination, (newValue, oldValue) => {
  // If destination changed and we have places, clear them
  if (oldValue && newValue !== oldValue && places.value.length > 0) {
    places.value = [];
    isDestinationValid.value = false;
  }
});

// Update position on window resize/scroll
const handlePositionUpdate = () => {
  if (showSuggestions.value) {
    updateDropdownPosition();
  }
};

onMounted(() => {
  window.addEventListener('resize', handlePositionUpdate);
  window.addEventListener('scroll', handlePositionUpdate, true);
  // Load cities for destination autocomplete
  if (cities.value.length === 0) {
    citiesStore.fetchCities();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handlePositionUpdate);
  window.removeEventListener('scroll', handlePositionUpdate, true);
});

const handleOpenChange = (value: boolean) => {
  emit("update:open", value);
  if (!value) {
    // Clear suggestions when closing
    searchSuggestions.value = [];
    showSuggestions.value = false;
  }
};

const handleSubmit = () => {
  if (!isFormValid.value) return;

  emit("submit", {
    tripName: tripName.value,
    destination: destination.value,
    startDate: startDate.value,
    endDate: endDate.value,
    places: places.value,
    isPublic: isPublic.value,
  });

  handleCancel();
};

const handleCancel = () => {
  // Reset form
  tripName.value = "";
  destination.value = "";
  isDestinationValid.value = false;
  startDate.value = "";
  endDate.value = "";
  isPublic.value = false;
  places.value = [];
  newPlaceInput.value = "";
  searchSuggestions.value = [];
  showSuggestions.value = false;
  showCitiesDropdown.value = false;
  emit("update:open", false);
};

const removePlace = (id: string) => {
  places.value = places.value.filter((place) => place.id !== id);
};

const addPlaceFromSuggestion = (place: IPlacePublic, event?: Event) => {
  // Stop event from bubbling
  if (event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
  
  // Check if destination is selected
  if (!canAddPlaces.value) {
    console.warn('Cannot add place: No destination selected');
    return;
  }
  
  // Check if place matches the destination city
  const cityName = getDestinationCity.value;
  if (place.city?.toLowerCase() !== cityName.toLowerCase()) {
    console.warn('Cannot add place: Place is not from the selected destination');
    return;
  }
  
  // Check if place is already added
  if (places.value.some(p => p.id === place.id)) {
    return;
  }
  
  // Add place at the end (bottom of the list)
  places.value.push(place);
  
  // Hide suggestions and clear input for clean UX
  showSuggestions.value = false;
  searchSuggestions.value = [];
  newPlaceInput.value = "";
  
  // Refocus the input and scroll it into view
  nextTick(() => {
    const input = (inputRef.value as any)?.$el || inputRef.value;
    if (input) {
      input.focus();
      // Scroll the input into view smoothly
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
};

const addPlaceFromInput = () => {
  if (searchSuggestions.value.length > 0 && searchSuggestions.value[0]) {
    addPlaceFromSuggestion(searchSuggestions.value[0]);
  }
};

const togglePublic = () => {
  isPublic.value = !isPublic.value;
};

// Handle clicks outside to close dropdown
const handleClickOutside = (e: MouseEvent) => {
  const dropdown = dropdownRef.value;
  const input = (inputRef.value as any)?.$el || inputRef.value;
  
  // Don't close if clicking inside the dropdown or input
  if (
    dropdown &&
    dropdown.contains(e.target as Node)
  ) {
    return;
  }
  
  if (
    dropdown &&
    !dropdown.contains(e.target as Node) &&
    input &&
    !input.contains(e.target as Node)
  ) {
    showSuggestions.value = false;
  }
  
  // Close cities dropdown if clicking outside
  const target = e.target as HTMLElement;
  if (!target.closest('.destination-autocomplete')) {
    showCitiesDropdown.value = false;
  }
};

onMounted(() => {
  window.addEventListener('resize', handlePositionUpdate);
  window.addEventListener('scroll', handlePositionUpdate, true);
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handlePositionUpdate);
  window.removeEventListener('scroll', handlePositionUpdate, true);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <Dialog :open="props.open" @update:open="handleOpenChange">
    <DialogContent
      class="max-w-[520px] max-h-[85vh] p-0 flex flex-col gap-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl"
      @pointer-down-outside="(e: Event) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-dropdown-container]')) {
          e.preventDefault();
        }
      }"
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
        <div class="flex flex-col gap-2 relative destination-autocomplete">
          <Label
            for="destination"
            class="text-sm font-semibold text-foreground flex items-center gap-2"
          >
            <MapPin :size="16" class="text-coral" />
            Destination
          </Label>
          <Input
            ref="destinationInputRef"
            id="destination"
            v-model="destination"
            type="text"
            placeholder="Select a destination (e.g., Nha Trang, Vietnam)"
            :class="[
              'h-11 text-sm rounded-xl border-border/80 focus:border-coral focus:ring-coral/20',
              !isDestinationValid && destination ? 'border-red-500' : ''
            ]"
            autocomplete="off"
            @input="handleDestinationInput"
            @focus="handleDestinationFocus"
            @blur="handleDestinationBlur"
          />
          <p v-if="!isDestinationValid && destination" class="text-xs text-red-500 mt-1">
            Please select a valid destination from the dropdown list
          </p>
          
          <!-- Cities Dropdown -->
          <div
            v-if="showCitiesDropdown && filteredCities.length > 0"
            ref="citiesDropdownRef"
            class="absolute z-50 w-full mt-1 top-full bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div
              v-for="city in filteredCities"
              :key="city"
              class="px-4 py-2 hover:bg-accent cursor-pointer transition-colors text-sm"
              @mousedown.prevent="selectCity(city)"
            >
              {{ city }}
            </div>
          </div>
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
              type="date"
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
              type="date"
              :min="startDate"
              :class="[
                'h-11 text-sm rounded-xl border-border/80 focus:border-coral focus:ring-coral/20',
                isEndDateBeforeStartDate ? 'border-red-500' : ''
              ]"
            />
          </div>
        </div>
        
        <!-- Date validation error message -->
        <div v-if="isEndDateBeforeStartDate" class="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-700 dark:text-red-400">
          <p class="font-medium">End date cannot be before start date</p>
          <p class="text-xs mt-1">Please select an end date that is on or after {{ startDate }}.</p>
        </div>

        <!-- Public/Private Toggle -->
        <div class="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-muted/20">
          <div class="flex-1">
            <Label class="text-sm font-semibold text-foreground mb-1 block">
              Trip Visibility
            </Label>
            <p class="text-xs text-muted-foreground">
              {{ isPublic ? 'Anyone can view this trip' : 'Only you can view this trip' }}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            :variant="isPublic ? 'default' : 'outline'"
            :class="[
              'flex items-center gap-2 min-w-[100px] transition-all',
              isPublic 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'border-2 hover:bg-muted/50'
            ]"
            @click="togglePublic"
          >
            <component :is="isPublic ? Globe : Lock" :size="16" />
            {{ isPublic ? 'Public' : 'Private' }}
          </Button>
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

          <!-- Selected Places List (full display, no scroll) -->
          <div
            v-if="places.length > 0"
            class="space-y-2"
          >
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

          <!-- Add Place Input with Suggestions (at bottom) -->
          <div class="relative">
            <!-- Warning when no destination selected -->
            <div
              v-if="!canAddPlaces"
              class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-700 dark:text-amber-400 mb-3"
            >
              <p class="font-medium">Please select a destination first</p>
              <p class="text-xs mt-1">You can only add places from the destination you've selected above.</p>
            </div>
            
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" :size="16" />
              <Input
                ref="inputRef"
                v-model="newPlaceInput"
                type="text"
                :placeholder="canAddPlaces ? `Search places in ${getDestinationCity}` : 'Select a destination first'"
                :disabled="!canAddPlaces"
                class="h-11 text-sm rounded-xl border-border/80 focus:border-coral focus:ring-coral/20 pl-10 pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                @keyup.enter="addPlaceFromInput"
                @focus="async () => {
                  if (canAddPlaces && searchSuggestions.length > 0) {
                    showSuggestions.value = true;
                    await updateDropdownPosition();
                  }
                }"
              />
              <Loader2 
                v-if="isSearching" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-coral animate-spin" 
                :size="16" 
              />
            </div>
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

  <!-- Search Suggestions (rendered outside modal with Teleport) -->
  <Teleport to="body">
    <div
      v-if="showSuggestions && searchSuggestions.length > 0"
      ref="dropdownRef"
      data-dropdown-container
      :style="{
        position: 'absolute',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 100000,
      }"
      class="bg-card border border-border/80 rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
      @mousedown.stop
    >
      <div class="max-h-[300px] overflow-y-auto p-2">
        <button
          v-for="suggestion in searchSuggestions"
          :key="suggestion.id"
          type="button"
          class="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors text-left cursor-pointer"
          @mousedown.prevent.stop="addPlaceFromSuggestion(suggestion, $event)"
        >
          <img
            v-if="suggestion.main_image_url"
            :src="suggestion.main_image_url"
            :alt="suggestion.name"
            class="w-12 h-12 rounded-lg object-cover shrink-0 bg-muted"
          />
          <div v-else class="w-12 h-12 rounded-lg bg-muted shrink-0 flex items-center justify-center">
            <MapPin :size="20" class="text-muted-foreground" />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold text-foreground truncate">
              {{ suggestion.name }}
            </h4>
            <div class="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <MapPin :size="12" class="shrink-0" />
              <span class="truncate">
                {{ suggestion.city }}, {{ suggestion.country }}
              </span>
            </div>
            <div v-if="suggestion.average_rating" class="flex items-center gap-1.5 text-xs mt-1">
              <Star :size="12" class="text-amber fill-amber" />
              <span class="font-semibold text-foreground">
                {{ suggestion.average_rating }}
              </span>
              <span class="text-muted-foreground">
                ({{ suggestion.review_count }})
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  </Teleport>
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
