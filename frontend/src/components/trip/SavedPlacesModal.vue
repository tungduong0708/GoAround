<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useListPlaceStore } from "@/stores/listPlaceStore";
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
import { MapPin, Bookmark, Plus, Loader2, Star, CheckCircle2, Check } from "lucide-vue-next";
import type { IPlacePublic } from "@/utils/interfaces";

const props = defineProps<{
  open: boolean;
  tripId?: string; // If provided, directly add places to this trip
  selectedDayIndex?: number; // If provided, add to specific day
  tripStartDate?: string | null; // Required for day calculation
  destinationCity?: string; // If provided, filter places by this city
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  success: [];
  "places-selected": [places: IPlacePublic[], dayIndex?: number];
}>();

const listPlaceStore = useListPlaceStore();

const loading = ref(false);
const selectedListId = ref<string | null>(null);
const selectedPlaceIds = ref<Set<string>>(new Set());
const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const listFilteredCounts = ref<Map<string, number>>(new Map());

const lists = computed(() => listPlaceStore.listLists);
const currentList = computed(() => listPlaceStore.listCurrentSelection);
const allPlaces = computed(() => currentList.value?.items || []);

// Filter places by destination city if provided
const places = computed(() => {
  if (!props.destinationCity) {
    return allPlaces.value;
  }
  return allPlaces.value.filter(item => 
    item.place.city?.toLowerCase() === props.destinationCity?.toLowerCase()
  );
});

const handleOpenChange = async (open: boolean) => {
  emit("update:open", open);
  
  if (open) {
    selectedListId.value = null;
    selectedPlaceIds.value.clear();
    successMessage.value = null;
    errorMessage.value = null;
    listFilteredCounts.value.clear();
    
    // Load lists first
    await loadLists();
    
    // Then preload filtered counts if destination filter is active
    if (props.destinationCity) {
      await preloadFilteredCounts();
    }
  }
};

const loadLists = async () => {
  loading.value = true;
  try {
    await listPlaceStore.fetchListPlaces({ page: 1, limit: 50 });
  } catch (error: any) {
    errorMessage.value = error?.message || "Failed to load lists";
  } finally {
    loading.value = false;
  }
};

const preloadFilteredCounts = async () => {
  if (!props.destinationCity || lists.value.length === 0) {
    console.log('[SavedPlacesModal] Skipping preload - destinationCity:', props.destinationCity, 'lists:', lists.value.length);
    return;
  }
  
  console.log('[SavedPlacesModal] Preloading filtered counts for', lists.value.length, 'lists with destination:', props.destinationCity);
  
  // Load each list and count filtered places
  const countPromises = lists.value.map(async (list) => {
    try {
      await listPlaceStore.fetchListCurrentSelection(list.id);
      const items = listPlaceStore.listCurrentSelection?.items || [];
      const filteredCount = items.filter(item => 
        item.place.city?.toLowerCase() === props.destinationCity?.toLowerCase()
      ).length;
      console.log('[SavedPlacesModal] List', list.name, '- Total:', items.length, 'Filtered:', filteredCount);
      listFilteredCounts.value.set(list.id, filteredCount);
    } catch (error) {
      console.error(`Failed to load list ${list.id}:`, error);
      listFilteredCounts.value.set(list.id, 0);
    }
  });
  
  await Promise.all(countPromises);
  console.log('[SavedPlacesModal] Preload complete. Filtered counts:', Array.from(listFilteredCounts.value.entries()));
};

const handleSelectList = async (listId: string) => {
  selectedListId.value = listId;
  selectedPlaceIds.value.clear();
  loading.value = true;
  errorMessage.value = null;
  
  try {
    await listPlaceStore.fetchListCurrentSelection(listId);
    
    // Update cached count for this list if destination filter is active
    if (props.destinationCity) {
      listFilteredCounts.value.set(listId, places.value.length);
    }
  } catch (error: any) {
    errorMessage.value = error?.message || "Failed to load list details";
  } finally {
    loading.value = false;
  }
};

const togglePlaceSelection = (placeId: string) => {
  if (selectedPlaceIds.value.has(placeId)) {
    selectedPlaceIds.value.delete(placeId);
  } else {
    selectedPlaceIds.value.add(placeId);
  }
  // Force reactivity
  selectedPlaceIds.value = new Set(selectedPlaceIds.value);
};

const isPlaceSelected = (placeId: string) => {
  return selectedPlaceIds.value.has(placeId);
};

const handleBulkAddPlaces = () => {
  if (selectedPlaceIds.value.size === 0) return;

  // Get selected places
  const selectedPlaces = places.value
    .filter(item => selectedPlaceIds.value.has(item.place.id))
    .map(item => item.place);

  // Emit places to parent component
  emit("places-selected", selectedPlaces, props.selectedDayIndex);
  
  // Clear selection
  selectedPlaceIds.value.clear();
  
  // Note: Parent component will close modal if places are successfully added
};

const handleAddPlaceToTrip = (place: IPlacePublic) => {
  // Emit single place to parent component
  emit("places-selected", [place], props.selectedDayIndex);
  
  // Note: Parent component will close modal if place is successfully added
};

const formatLocation = (place: IPlacePublic) => {
  const parts = [place.city, place.country].filter(Boolean);
  return parts.join(", ") || place.address || "Location not specified";
};

const hasNoLists = computed(() => !loading.value && lists.value.length === 0);
const hasNoPlaces = computed(() => selectedListId.value && !loading.value && places.value.length === 0);
const selectedCount = computed(() => selectedPlaceIds.value.size);

// Compute filtered place count for each list when destination filter is active
const getListPlaceCount = (listId: string) => {
  if (!props.destinationCity) {
    // No filter, return original count
    const list = lists.value.find(l => l.id === listId);
    return list?.item_count || 0;
  }
  
  // Return cached filtered count if available
  if (listFilteredCounts.value.has(listId)) {
    return listFilteredCounts.value.get(listId) || 0;
  }
  
  // If this is the currently selected list, count filtered places
  if (listId === selectedListId.value) {
    const count = places.value.length;
    listFilteredCounts.value.set(listId, count);
    return count;
  }
  
  // Fallback to original count while loading
  const list = lists.value.find(l => l.id === listId);
  return list?.item_count || 0;
};

// Watch for modal open and load lists
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    selectedListId.value = null;
    selectedPlaceIds.value.clear();
    successMessage.value = null;
    errorMessage.value = null;
    loadLists();
  }
});
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
      <DialogHeader class="shrink-0">
        <DialogTitle class="text-2xl">
          {{ selectedDayIndex !== undefined ? `Add to Day ${selectedDayIndex + 1}` : 'Saved Places' }}
        </DialogTitle>
        <DialogDescription>
          {{ tripId ? `Select a place from your saved lists to add to your trip${selectedDayIndex !== undefined ? ` on Day ${selectedDayIndex + 1}` : ''}` : 'Browse your saved places' }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto">
        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 flex items-center gap-2 mb-4"
        >
          <CheckCircle2 class="h-5 w-5" />
          {{ successMessage }}
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 mb-4"
        >
          {{ errorMessage }}
        </div>

        <!-- Loading State -->
        <div v-if="loading && !selectedListId" class="flex items-center justify-center py-12">
          <Loader2 class="h-8 w-8 animate-spin text-coral" />
        </div>

        <!-- Empty State -->
        <div v-else-if="hasNoLists" class="text-center py-12">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral/10 mb-4"
          >
            <Bookmark class="h-8 w-8 text-coral" />
          </div>
          <h3 class="text-lg font-semibold mb-2">No saved lists yet</h3>
          <p class="text-muted-foreground">
            Start saving places by clicking the bookmark icon on any place
          </p>
        </div>

        <!-- Lists and Places View -->
        <ScrollArea v-else class="h-[400px]">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px] pr-4">
            <!-- Lists Sidebar -->
            <div class="md:col-span-1 border-r pr-4">
              <h3 class="font-semibold mb-3">Your Lists</h3>
              <div class="space-y-2">
                <Card
                  v-for="list in lists"
                  :key="list.id"
                  class="cursor-pointer transition-all"
                :class="{
                  'border-coral bg-coral/5': selectedListId === list.id,
                  'hover:border-coral/40': selectedListId !== list.id,
                }"
                @click="handleSelectList(list.id)"
              >
                <CardContent class="p-3">
                  <div class="flex items-center gap-2">
                    <Bookmark class="h-4 w-4 text-coral shrink-0" />
                    <div class="flex-1 min-w-0">
                      <p class="font-medium truncate">{{ list.name }}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <!-- Places Content -->
          <div class="md:col-span-2">
            <div v-if="!selectedListId" class="flex items-center justify-center h-full text-muted-foreground">
              Select a list to view places
            </div>

            <div v-else-if="loading" class="flex items-center justify-center h-full">
              <Loader2 class="h-8 w-8 animate-spin text-coral" />
            </div>

            <div v-else-if="hasNoPlaces" class="flex flex-col items-center justify-center h-full text-center">
              <p class="text-muted-foreground">This list is empty</p>
            </div>

            <div v-else>
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold">{{ currentList?.name }}</h3>
                <span v-if="selectedDayIndex !== undefined && selectedCount > 0" class="text-sm text-coral font-medium">
                  {{ selectedCount }} selected
                </span>
              </div>
              <div class="grid grid-cols-1 gap-2" :class="{ 'pb-4': selectedDayIndex === undefined, 'pb-24': selectedDayIndex !== undefined }">
                <Card
                  v-for="item in places"
                  :key="item.place.id"
                  class="group hover:shadow-md transition-all cursor-pointer relative"
                  :class="{
                    'border-2 border-coral bg-coral/5': selectedDayIndex !== undefined && isPlaceSelected(item.place.id),
                    'border-transparent': selectedDayIndex === undefined || !isPlaceSelected(item.place.id),
                  }"
                  @click="selectedDayIndex !== undefined ? togglePlaceSelection(item.place.id) : handleAddPlaceToTrip(item.place)"
                >
                  <CardContent class="p-3">
                    <div class="flex gap-3">
                      <!-- Checkbox for multi-select mode (when day is selected) -->
                      <div v-if="selectedDayIndex !== undefined" class="flex items-center">
                        <div 
                          class="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                          :class="{
                            'bg-coral border-coral': isPlaceSelected(item.place.id),
                            'border-gray-300': !isPlaceSelected(item.place.id),
                          }"
                          @click.stop="togglePlaceSelection(item.place.id)"
                        >
                          <Check 
                            v-if="isPlaceSelected(item.place.id)" 
                            :size="12" 
                            class="text-white"
                          />
                        </div>
                      </div>

                      <!-- Place Image -->
                      <div class="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                        <img
                          v-if="item.place.main_image_url"
                          :src="item.place.main_image_url"
                          :alt="item.place.name"
                          class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full bg-muted flex items-center justify-center">
                          <MapPin class="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>

                      <!-- Place Info -->
                      <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-sm truncate">{{ item.place.name }}</h4>
                        <div class="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin class="h-3 w-3" />
                          <span class="truncate">{{ formatLocation(item.place) }}</span>
                        </div>
                        <div class="flex items-center gap-1 text-xs mt-0.5">
                          <Star class="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span>{{ item.place.average_rating.toFixed(1) }}</span>
                        </div>
                      </div>

                      <!-- Add Button (only in single-add mode) -->
                      <Button
                        v-if="tripId && selectedDayIndex === undefined"
                        size="sm"
                        class="bg-coral hover:bg-coral-dark text-white shrink-0 self-center text-xs px-2 py-1 h-7"
                        @click.stop="handleAddPlaceToTrip(item.place)"
                      >
                        <Plus class="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        </ScrollArea>
      </div>

      <!-- Floating Add Button (for multi-select mode) -->
      <Button
        v-if="selectedDayIndex !== undefined && selectedCount > 0"
        class="absolute bottom-6 right-6 h-14 px-6 rounded-full shadow-2xl bg-coral text-white hover:bg-coral-dark hover:scale-110 transition-all duration-200 flex items-center gap-2 z-50"
        @click="handleBulkAddPlaces"
      >
        <Plus :size="20" />
        <span class="font-semibold">Add {{ selectedCount }} Place{{ selectedCount > 1 ? 's' : '' }}</span>
      </Button>
    </DialogContent>
  </Dialog>
</template>
