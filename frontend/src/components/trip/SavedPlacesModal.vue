<script setup lang="ts">
import { ref, computed } from "vue";
import { useListPlaceStore } from "@/stores/listPlaceStore";
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
import { MapPin, Bookmark, Plus, Loader2, Star, CheckCircle2 } from "lucide-vue-next";
import type { IPlacePublic } from "@/utils/interfaces";

const props = defineProps<{
  open: boolean;
  tripId?: string; // If provided, directly add places to this trip
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  success: [];
}>();

const listPlaceStore = useListPlaceStore();
const { addPlaceToTrip } = useTrips({ autoLoad: false });

const loading = ref(false);
const adding = ref(false);
const selectedListId = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

const lists = computed(() => listPlaceStore.listLists);
const currentList = computed(() => listPlaceStore.listCurrentSelection);
const places = computed(() => currentList.value?.items || []);

const handleOpenChange = async (open: boolean) => {
  emit("update:open", open);
  
  if (open) {
    selectedListId.value = null;
    successMessage.value = null;
    errorMessage.value = null;
    await loadLists();
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

const handleSelectList = async (listId: string) => {
  selectedListId.value = listId;
  loading.value = true;
  errorMessage.value = null;
  
  try {
    await listPlaceStore.fetchListCurrentSelection(listId);
  } catch (error: any) {
    errorMessage.value = error?.message || "Failed to load list details";
  } finally {
    loading.value = false;
  }
};

const handleAddPlaceToTrip = async (place: IPlacePublic) => {
  if (!props.tripId || adding.value) return;

  adding.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  try {
    await addPlaceToTrip(props.tripId, {
      place_id: place.id,
      stop_order: 0, // Backend will handle ordering
      arrival_time: new Date().toISOString(),
      notes: "",
    });

    successMessage.value = `Added "${place.name}" to your trip!`;
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

const formatLocation = (place: IPlacePublic) => {
  const parts = [place.city, place.country].filter(Boolean);
  return parts.join(", ") || place.address || "Location not specified";
};

const hasNoLists = computed(() => !loading.value && lists.value.length === 0);
const hasNoPlaces = computed(() => selectedListId.value && !loading.value && places.value.length === 0);
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-4xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle class="text-2xl">Saved Places</DialogTitle>
        <DialogDescription>
          {{ tripId ? 'Select a place from your saved lists to add to your trip' : 'Browse your saved places' }}
        </DialogDescription>
      </DialogHeader>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 flex items-center gap-2"
      >
        <CheckCircle2 class="h-5 w-5" />
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
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px]">
        <!-- Lists Sidebar -->
        <div class="md:col-span-1 border-r pr-4">
          <h3 class="font-semibold mb-3">Your Lists</h3>
          <ScrollArea class="h-[400px]">
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
                      <p class="text-xs text-muted-foreground">
                        {{ list.item_count || 0 }} places
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
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
            <h3 class="font-semibold mb-3">{{ currentList?.name }}</h3>
            <ScrollArea class="h-[400px]">
              <div class="grid grid-cols-1 gap-3">
                <Card
                  v-for="item in places"
                  :key="item.place.id"
                  class="group hover:shadow-md transition-all"
                  :class="{
                    'opacity-50 pointer-events-none': adding,
                  }"
                >
                  <CardContent class="p-4">
                    <div class="flex gap-4">
                      <!-- Place Image -->
                      <div class="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                        <img
                          v-if="item.place.main_image_url"
                          :src="item.place.main_image_url"
                          :alt="item.place.name"
                          class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full bg-muted flex items-center justify-center">
                          <MapPin class="h-8 w-8 text-muted-foreground" />
                        </div>
                      </div>

                      <!-- Place Info -->
                      <div class="flex-1 min-w-0">
                        <h4 class="font-semibold truncate">{{ item.place.name }}</h4>
                        <div class="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin class="h-3 w-3" />
                          <span class="truncate">{{ formatLocation(item.place) }}</span>
                        </div>
                        <div class="flex items-center gap-1 text-sm mt-1">
                          <Star class="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span>{{ item.place.average_rating.toFixed(1) }}</span>
                        </div>
                      </div>

                      <!-- Add Button (only if tripId provided) -->
                      <Button
                        v-if="tripId"
                        size="sm"
                        class="bg-coral hover:bg-coral-dark text-white shrink-0 self-center"
                        :disabled="adding"
                        @click="handleAddPlaceToTrip(item.place)"
                      >
                        <Plus class="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
