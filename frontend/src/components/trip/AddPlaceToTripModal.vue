<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Card from "@/components/ui/card/Card.vue";
import { Search, MapPin, X, Star, Loader2 } from "lucide-vue-next";
import { PlacesService } from "@/services";
import type { IPlacePublic } from "@/utils/interfaces";

interface AddPlaceToTripModalProps {
  open?: boolean;
  dayNumber?: number;
}

interface AddPlaceToTripModalEmits {
  (e: "update:open", value: boolean): void;
  (e: "add-place", place: IPlacePublic): void;
}

const props = withDefaults(defineProps<AddPlaceToTripModalProps>(), {
  open: false,
  dayNumber: 1,
});

const emit = defineEmits<AddPlaceToTripModalEmits>();

const searchQuery = ref("");
const searchSuggestions = ref<IPlacePublic[]>([]);
const isSearching = ref(false);
const showSuggestions = ref(false);
const searchTimeoutId = ref<number | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const dropdownPosition = ref({ top: 0, left: 0, width: 0 });

// Calculate dropdown position relative to input
const updateDropdownPosition = async () => {
  await nextTick();
  if (!inputRef.value) return;
  
  const element = (inputRef.value as any).$el || inputRef.value;
  const rect = element.getBoundingClientRect();
  
  dropdownPosition.value = {
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width
  };
};

// Watch for input changes and search
watch(searchQuery, (value) => {
  if (searchTimeoutId.value) {
    clearTimeout(searchTimeoutId.value);
  }

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

  searchTimeoutId.value = window.setTimeout(async () => {
    isSearching.value = true;
    try {
      const response = await PlacesService.getPlaces({
        q: value,
        limit: 20,
      });
      searchSuggestions.value = response.data?.places || [];
      showSuggestions.value = searchSuggestions.value.length > 0;
      if (showSuggestions.value) {
        await nextTick();
        updateDropdownPosition();
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

const handlePositionUpdate = () => {
  if (showSuggestions.value) {
    updateDropdownPosition();
  }
};

onMounted(() => {
  window.addEventListener('resize', handlePositionUpdate);
  window.addEventListener('scroll', handlePositionUpdate, true);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handlePositionUpdate);
  window.removeEventListener('scroll', handlePositionUpdate, true);
});

const handleOpenChange = (value: boolean) => {
  emit("update:open", value);
  if (!value) {
    searchSuggestions.value = [];
    showSuggestions.value = false;
    searchQuery.value = "";
  }
};

const handleAddPlace = (place: IPlacePublic) => {
  emit("add-place", place);
  emit("update:open", false);
  searchQuery.value = "";
  showSuggestions.value = false;
};

const formatLocation = (place: IPlacePublic) => {
  const parts = [place.city, place.country].filter(Boolean);
  return parts.join(", ");
};
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent
      class="max-w-2xl max-h-[85vh] p-0 flex flex-col gap-0 overflow-hidden rounded-2xl"
    >
      <DialogHeader class="px-6 py-4 border-b border-border/50">
        <DialogTitle class="text-xl font-bold">
          Search Places for Day {{ dayNumber }}
        </DialogTitle>
        <p class="text-sm text-muted-foreground mt-0.5">
          Search and add places to your itinerary
        </p>
      </DialogHeader>

      <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div class="p-6 border-b border-border/50 flex-shrink-0">
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              :size="18"
            />
            <Input
              ref="inputRef"
              v-model="searchQuery"
              placeholder="Search for places..."
              class="pl-10 h-11 rounded-xl"
              @focus="updateDropdownPosition"
            />
            <Loader2
              v-if="isSearching"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin"
              :size="18"
            />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-6 pb-6">
          <div v-if="!searchQuery.trim()" class="text-center py-12">
            <div
              class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4"
            >
              <Search :size="32" class="text-muted-foreground" />
            </div>
            <p class="text-muted-foreground">
              Start typing to search for places
            </p>
          </div>

          <div v-else-if="!isSearching && searchSuggestions.length === 0" class="text-center py-12">
            <p class="text-muted-foreground">No places found</p>
            <p class="text-sm text-muted-foreground mt-2">
              Try a different search term
            </p>
          </div>

          <div v-else-if="searchSuggestions.length > 0" class="space-y-3 py-4">
            <Card
              v-for="place in searchSuggestions"
              :key="place.id"
              class="cursor-pointer transition-all hover:border-coral/50 hover:shadow-md"
              @click="handleAddPlace(place)"
            >
              <div class="p-3">
                <div class="flex gap-3">
                  <img
                    v-if="place.main_image_url"
                    :src="place.main_image_url"
                    :alt="place.name"
                    class="w-20 h-20 rounded-lg object-cover shrink-0 bg-muted"
                  />
                  <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-foreground mb-1 truncate">
                      {{ place.name }}
                    </h4>
                    <div class="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <MapPin :size="12" />
                      <span class="truncate">{{ formatLocation(place) }}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <Star :size="12" class="text-amber fill-amber" />
                      <span class="text-xs font-semibold">{{ place.average_rating }}</span>
                      <span class="text-xs text-muted-foreground">
                        ({{ place.review_count }} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
